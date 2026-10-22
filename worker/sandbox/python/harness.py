"""CodeMentor Python harness: runs ONE learner program inside the sandbox.

    python -S -B -X utf8 harness.py check <box>   syntax check only (the "compile" step)
    python -S -B -X utf8 harness.py run   <box>   run <box>/main.py
    python -S -B -X utf8 harness.py trace <box>   run with a line tracer and print a JSON trace

The current directory is the program's private, writable scratch folder. <box> holds main.py and
optional seed files (box/files/*), which are copied into the scratch folder first.

IMPORTANT: the audit hook below is defence in depth, NOT the security boundary (PEP 578: audit
hooks can't stop a determined attacker). The boundary is the OS layer around this process: a Job
Object with a low-integrity token on the development machine, a locked-down container (no
network, read-only root, gVisor) in production. The hook narrows what a program can touch and
turns refusals into one clear message instead of a confusing OS error.
"""
import builtins
import io
import json
import linecache
import os
import shutil
import sys
import traceback
import types

MODE = sys.argv[1] if len(sys.argv) > 1 else "run"
BOX = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else ".")
WORK = os.path.abspath(os.getcwd())
FILENAME = "main.py"
MAX_TRACE_STEPS = 250

with open(os.path.join(BOX, FILENAME), "rb") as _f:
    SOURCE = _f.read().decode("utf-8", "replace")


def _clean(text):
    """Hide machine-specific paths from messages the learner sees."""
    for root in {sys.base_prefix, sys.prefix}:
        for variant in {root, root.replace("\\", "/")}:
            text = text.replace(variant, "<python>")
    for variant in {WORK + os.sep, WORK.replace("\\", "/") + "/", WORK}:
        text = text.replace(variant, "")
    return text


def _format(exc):
    """The traceback the learner sees: the harness's own frames (exec, audit hook) are removed."""
    te = traceback.TracebackException.from_exception(exc)
    seen = set()

    def strip(t):
        if t is None or id(t) in seen:
            return
        seen.add(id(t))
        t.stack = traceback.StackSummary.from_list([f for f in t.stack if os.path.basename(f.filename) != "harness.py"])
        strip(t.__cause__)
        strip(t.__context__)
        for sub in getattr(t, "exceptions", None) or []:
            strip(sub)

    strip(te)
    return _clean("".join(te.format()))


# ── "compile": syntax check only ──────────────────────────────────────────────────────────────
if MODE == "check":
    try:
        compile(SOURCE, FILENAME, "exec", dont_inherit=True)
    except (SyntaxError, ValueError) as e:
        sys.stderr.write(_clean("".join(traceback.format_exception_only(type(e), e))))
        sys.exit(1)
    sys.exit(0)

# ── Prepare the program's world ───────────────────────────────────────────────────────────────
seed = os.path.join(BOX, "files")
if os.path.isdir(seed):
    for name in os.listdir(seed):
        if name.startswith("."):
            continue
        src = os.path.join(seed, name)
        if os.path.isdir(src):
            shutil.copytree(src, os.path.join(WORK, name), dirs_exist_ok=True)
        else:
            shutil.copyfile(src, os.path.join(WORK, name))

for key in ("TMP", "TEMP", "TMPDIR"):
    os.environ[key] = WORK
sys.path[0] = WORK  # the program can import its own helper modules from the scratch folder
sys.argv[:] = [FILENAME]
linecache.cache[FILENAME] = (len(SOURCE), None, SOURCE.splitlines(True), FILENAME)


class _Quitter:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Use {self.name}() to exit"

    def __call__(self, code=None):
        raise SystemExit(code)


builtins.exit = _Quitter("exit")
builtins.quit = _Quitter("quit")


def _help(*_args, **_kwargs):
    print("help() isn't available in CodeMentor's sandbox. Try the Quick Reference, or print(obj.__doc__).")


builtins.help = _help

# ── Audit hook (defence in depth) ─────────────────────────────────────────────────────────────
_norm = os.path.normcase
_WORK = _norm(os.path.realpath(WORK))
_STD = tuple({_norm(os.path.realpath(p)) for p in (sys.base_prefix, sys.prefix, sys.base_exec_prefix, sys.exec_prefix)})
_LOOPBACK = {"127.0.0.1", "::1", "localhost"}
_BLOCKED_IMPORTS = {
    "ctypes": "raw memory access",
    "_ctypes": "raw memory access",
    "winreg": "the Windows registry",
    "_winreg": "the Windows registry",
    "tkinter": "desktop windows (run GUI programs on your own computer)",
    "_tkinter": "desktop windows (run GUI programs on your own computer)",
    "turtle": "desktop windows (run turtle programs on your own computer)",
    "idlelib": "the IDLE editor",
}
_DENIED_EVENTS = {
    "os.system": "running shell commands",
    "os.exec": "starting other programs",
    "os.spawn": "starting other programs",
    "os.posix_spawn": "starting other programs",
    "os.fork": "starting other processes",
    "os.forkpty": "starting other processes",
    "os.startfile": "opening other programs",
    "os.kill": "stopping other processes",
    "os.killpg": "stopping other processes",
    "subprocess.Popen": "starting other programs",
    "_winapi.CreateProcess": "starting other processes",
    "pty.spawn": "starting other programs",
    "webbrowser.open": "opening a web browser",
    "sqlite3.enable_load_extension": "loading SQLite extensions",
    "sqlite3.load_extension": "loading SQLite extensions",
    "os.add_dll_directory": "loading native libraries",
}
_MUTATING = {
    "os.mkdir", "os.rmdir", "os.remove", "os.rename", "os.truncate", "os.chmod", "os.chown", "os.utime",
    "os.link", "os.symlink", "os.chdir", "shutil.copyfile", "shutil.copymode", "shutil.copystat",
    "shutil.copytree", "shutil.rmtree", "shutil.move", "shutil.chown", "shutil.make_archive", "shutil.unpack_archive",
}
_LISTING = {"os.listdir", "os.scandir", "glob.glob", "glob.glob/2"}
_bound = []
_busy = [False]


class SandboxError(PermissionError):
    pass


def _deny(what):
    raise SandboxError(f"{what} isn't available in CodeMentor's sandbox")


def _within(path, roots):
    if isinstance(path, int):
        return True  # an already-open file descriptor
    try:
        p = _norm(os.path.realpath(os.path.join(WORK, os.fsdecode(path))))
    except Exception:
        return False
    return any(p == r or p.startswith(r + os.sep) for r in roots)


def _pathlike(a):
    return isinstance(a, (str, bytes, os.PathLike))


def _hook(event, args):
    if _busy[0]:
        return
    _busy[0] = True
    try:
        _check(event, args)
    finally:
        _busy[0] = False


def _check(event, args):
    if event == "import":
        top = (args[0] or "").split(".")[0]
        if top in _BLOCKED_IMPORTS:
            _deny(f"Importing {top} ({_BLOCKED_IMPORTS[top]})")
        return
    for prefix, why in _DENIED_EVENTS.items():
        if event == prefix or event.startswith(prefix + "."):
            _deny(why[0].upper() + why[1:])
    if event.startswith("ctypes.") or event.startswith("winreg."):
        _deny("Low-level system access")
    if event == "open":
        path, mode, flags = (list(args) + [None, None, None])[:3]
        if path is None:
            return
        writing = bool(mode and any(c in mode for c in "wax+"))
        if flags and not writing:
            writing = bool(flags & (os.O_WRONLY | os.O_RDWR | os.O_APPEND | os.O_CREAT | os.O_TRUNC))
        if not _within(path, (_WORK,) if writing else (_WORK,) + _STD):
            _deny(f"Opening {os.fsdecode(path)!r} (programs can only use files in their own folder)")
        return
    if event in _MUTATING:
        for a in args:
            if _pathlike(a) and not _within(a, (_WORK,)):
                _deny("Changing files outside the program's own folder")
        return
    if event in _LISTING:
        for a in args[:1]:
            if _pathlike(a) and not _within(a, (_WORK,) + _STD):
                _deny("Looking at folders outside the program's own folder")
        return
    if event.startswith("socket."):
        _check_socket(event, args)


def _check_socket(event, args):
    if event == "socket.__new__":
        return
    if event == "socket.bind":
        sock, addr = args[0], args[1]
        # asyncio's self-pipe on Windows binds a loopback socket to a free port; nothing else may.
        if isinstance(addr, tuple) and addr[0] in _LOOPBACK and addr[1] == 0:
            _bound.append(sock)
            return
        _deny("Opening network ports")
    if event == "socket.connect":
        sock, addr = args[0], args[1]
        if isinstance(addr, tuple) and addr[0] in _LOOPBACK:
            ports = set()
            for s in _bound:
                try:
                    ports.add(s.getsockname()[1])
                except OSError:
                    pass
            if addr[1] in ports:
                return  # connecting to its own socket (asyncio's socketpair)
        _deny("Network access")
    _deny("Network access")


# Every module the harness itself needs is imported above, before the hook goes in.
sys.addaudithook(_hook)


# ── Run ───────────────────────────────────────────────────────────────────────────────────────
def _globals():
    """A real `__main__` module for the program, so doctest, pickle, dataclasses and
    `typing.get_type_hints` find the program's own definitions (not the harness's)."""
    mod = types.ModuleType("__main__")
    mod.__file__ = os.path.join(WORK, FILENAME)
    mod.__builtins__ = builtins
    sys.modules["__main__"] = mod
    return mod.__dict__


def _run():
    code = compile(SOURCE, FILENAME, "exec", dont_inherit=True)
    try:
        exec(code, _globals())
    except SystemExit:
        raise
    except BaseException as e:  # noqa: BLE001 — every learner error becomes a clean traceback
        sys.stdout.flush()
        sys.stderr.write(_format(e))
        sys.stderr.flush()
        os._exit(1)


def _short(value, limit=60):
    if isinstance(value, type):
        return f"<class {value.__name__}>"
    if callable(value) and hasattr(value, "__code__"):
        return f"<function {value.__name__}>"
    try:
        text = repr(value)
    except Exception:  # noqa: BLE001
        text = f"<{type(value).__name__}>"
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _visible(name, value):
    if name.startswith("__") or name in ("_Quitter",):
        return False
    return not isinstance(value, type(sys))  # hide imported modules


def _trace():
    out = io.StringIO()
    real_stdout = sys.stdout
    sys.stdout = out
    steps = []
    stack = []
    state = {"truncated": False}

    def snapshot(frame):
        f_locals = frame.f_locals
        items = [(k, v) for k, v in f_locals.items() if _visible(k, v)]
        return {k: _short(v) for k, v in items[:14]}

    def record(frame, event, extra=None):
        if len(steps) >= MAX_TRACE_STEPS:
            state["truncated"] = True
            sys.settrace(None)
            return False
        step = {
            "line": frame.f_lineno, "event": event, "func": frame.f_code.co_name,
            "depth": len(stack), "vars": snapshot(frame), "out": out.tell(),
        }
        if extra:
            step.update(extra)
        steps.append(step)
        return True

    def tracer(frame, event, arg):
        if frame.f_code.co_filename != FILENAME:
            return None
        if event == "call":
            stack.append(frame.f_code.co_name)
            if frame.f_code.co_name != "<module>":
                record(frame, "call")
            return tracer
        if event == "line":
            record(frame, "line")
        elif event == "return":
            if frame.f_code.co_name != "<module>":
                record(frame, "return", {"value": _short(arg)})
            if stack:
                stack.pop()
        elif event == "exception":
            record(frame, "exception", {"value": f"{arg[0].__name__}: {_short(arg[1], 120)}"})
        return tracer

    error = None
    code = compile(SOURCE, FILENAME, "exec", dont_inherit=True)
    sys.settrace(tracer)
    try:
        exec(code, _globals())
    except SystemExit:
        pass
    except BaseException as e:  # noqa: BLE001
        error = _format(e)
    finally:
        sys.settrace(None)
        sys.stdout = real_stdout
    printed = out.getvalue()
    json.dump({"steps": steps, "stdout": printed[:65536], "error": error, "truncated": state["truncated"]}, real_stdout)
    real_stdout.flush()


if MODE == "trace":
    _trace()
else:
    _run()
