/*
 * jobrun — runs one program inside a Windows Job Object with hard limits.
 *
 *   jobrun --mem MB --cpu MS --wall MS --procs N [--low] --report FILE -- program [args...]
 *
 * Limits enforced by the OS (not by cooperation from the program):
 *   - job memory limit (allocations fail beyond it)
 *   - active process limit (N = 1 means the program cannot start any other process: no fork bombs,
 *     no system("...") / shell escapes)
 *   - job CPU time limit and a wall-clock limit (infinite loops are terminated)
 *   - kill-on-job-close: if jobrun itself is killed (e.g. output limit exceeded), the program dies too
 *   - UI restrictions (no clipboard, desktop switching, global atoms, system parameters)
 *   - --low: runs with a restricted, privilege-less token at LOW integrity, so it cannot write to
 *     the user's files or registry.
 * Not provided: network isolation. This backend is for local development only (see docs/execution.md).
 *
 * stdin/stdout/stderr are inherited, so the caller (the Node worker) feeds input and caps output.
 * A one-line JSON report is written to --report.
 */
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <sddl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void write_report(const char *path, const char *status, DWORD exitCode, ULONGLONG cpuMs, ULONGLONG wallMs,
                         SIZE_T peakBytes, int procLimitHit, const char *error) {
  FILE *f = fopen(path, "wb");
  if (!f) return;
  fprintf(f, "{\"status\":\"%s\",\"exitCode\":%lu,\"cpuMs\":%llu,\"wallMs\":%llu,\"peakMemKb\":%llu,\"procLimitHit\":%s,\"error\":\"%s\"}",
          status, (unsigned long)exitCode, cpuMs, wallMs, (unsigned long long)(peakBytes / 1024),
          procLimitHit ? "true" : "false", error ? error : "");
  fclose(f);
}

static void append_quoted(char *dst, size_t cap, const char *arg) {
  size_t len = strlen(dst);
  if (len + strlen(arg) + 4 >= cap) return;
  strcat(dst, "\"");
  strcat(dst, arg);
  strcat(dst, "\" ");
}

int main(int argc, char **argv) {
  ULONGLONG memMb = 256, cpuMs = 2000, wallMs = 5000;
  DWORD procs = 1;
  int low = 0, i;
  const char *report = NULL;
  int progIdx = -1;

  for (i = 1; i < argc; i++) {
    if (!strcmp(argv[i], "--mem") && i + 1 < argc) memMb = _strtoui64(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--cpu") && i + 1 < argc) cpuMs = _strtoui64(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--wall") && i + 1 < argc) wallMs = _strtoui64(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--procs") && i + 1 < argc) procs = (DWORD)strtoul(argv[++i], NULL, 10);
    else if (!strcmp(argv[i], "--low")) low = 1;
    else if (!strcmp(argv[i], "--report") && i + 1 < argc) report = argv[++i];
    else if (!strcmp(argv[i], "--")) { progIdx = i + 1; break; }
  }
  if (!report || progIdx < 0 || progIdx >= argc) {
    fprintf(stderr, "usage: jobrun --mem MB --cpu MS --wall MS --procs N [--low] --report FILE -- program [args]\n");
    return 2;
  }

  HANDLE job = CreateJobObjectA(NULL, NULL);
  if (!job) { write_report(report, "error", 0, 0, 0, 0, 0, "CreateJobObject failed"); return 3; }

  JOBOBJECT_EXTENDED_LIMIT_INFORMATION eli;
  ZeroMemory(&eli, sizeof eli);
  eli.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE | JOB_OBJECT_LIMIT_ACTIVE_PROCESS |
                                         JOB_OBJECT_LIMIT_JOB_MEMORY | JOB_OBJECT_LIMIT_DIE_ON_UNHANDLED_EXCEPTION |
                                         JOB_OBJECT_LIMIT_JOB_TIME;
  eli.BasicLimitInformation.ActiveProcessLimit = procs;
  eli.BasicLimitInformation.PerJobUserTimeLimit.QuadPart = (LONGLONG)cpuMs * 10000LL;
  eli.JobMemoryLimit = (SIZE_T)(memMb * 1024ULL * 1024ULL);
  if (!SetInformationJobObject(job, JobObjectExtendedLimitInformation, &eli, sizeof eli)) {
    write_report(report, "error", 0, 0, 0, 0, 0, "SetInformationJobObject(limits) failed");
    return 3;
  }

  JOBOBJECT_BASIC_UI_RESTRICTIONS ui;
  ui.UIRestrictionsClass = JOB_OBJECT_UILIMIT_DESKTOP | JOB_OBJECT_UILIMIT_DISPLAYSETTINGS | JOB_OBJECT_UILIMIT_EXITWINDOWS |
                           JOB_OBJECT_UILIMIT_GLOBALATOMS | JOB_OBJECT_UILIMIT_HANDLES | JOB_OBJECT_UILIMIT_READCLIPBOARD |
                           JOB_OBJECT_UILIMIT_SYSTEMPARAMETERS | JOB_OBJECT_UILIMIT_WRITECLIPBOARD;
  SetInformationJobObject(job, JobObjectBasicUIRestrictions, &ui, sizeof ui);

  HANDLE port = CreateIoCompletionPort(INVALID_HANDLE_VALUE, NULL, 0, 1);
  JOBOBJECT_ASSOCIATE_COMPLETION_PORT acp;
  acp.CompletionKey = job;
  acp.CompletionPort = port;
  SetInformationJobObject(job, JobObjectAssociateCompletionPortInformation, &acp, sizeof acp);

  HANDLE token = NULL;
  if (low) {
    HANDLE self = NULL, restricted = NULL;
    PSID lowSid = NULL;
    if (!OpenProcessToken(GetCurrentProcess(), TOKEN_DUPLICATE | TOKEN_QUERY | TOKEN_ADJUST_DEFAULT | TOKEN_ASSIGN_PRIMARY, &self) ||
        !CreateRestrictedToken(self, DISABLE_MAX_PRIVILEGE, 0, NULL, 0, NULL, 0, NULL, &restricted) ||
        !ConvertStringSidToSidA("S-1-16-4096", &lowSid)) {
      write_report(report, "error", 0, 0, 0, 0, 0, "could not create restricted token");
      return 3;
    }
    TOKEN_MANDATORY_LABEL tml;
    ZeroMemory(&tml, sizeof tml);
    tml.Label.Attributes = SE_GROUP_INTEGRITY;
    tml.Label.Sid = lowSid;
    if (!SetTokenInformation(restricted, TokenIntegrityLevel, &tml, sizeof tml + GetLengthSid(lowSid))) {
      write_report(report, "error", 0, 0, 0, 0, 0, "could not lower integrity level");
      return 3;
    }
    LocalFree(lowSid);
    CloseHandle(self);
    token = restricted;
  }

  char cmd[32768];
  cmd[0] = 0;
  for (i = progIdx; i < argc; i++) append_quoted(cmd, sizeof cmd, argv[i]);

  HANDLE hin = GetStdHandle(STD_INPUT_HANDLE), hout = GetStdHandle(STD_OUTPUT_HANDLE), herr = GetStdHandle(STD_ERROR_HANDLE);
  SetHandleInformation(hin, HANDLE_FLAG_INHERIT, HANDLE_FLAG_INHERIT);
  SetHandleInformation(hout, HANDLE_FLAG_INHERIT, HANDLE_FLAG_INHERIT);
  SetHandleInformation(herr, HANDLE_FLAG_INHERIT, HANDLE_FLAG_INHERIT);

  STARTUPINFOA si;
  ZeroMemory(&si, sizeof si);
  si.cb = sizeof si;
  si.dwFlags = STARTF_USESTDHANDLES;
  si.hStdInput = hin;
  si.hStdOutput = hout;
  si.hStdError = herr;
  PROCESS_INFORMATION pi;
  ZeroMemory(&pi, sizeof pi);

  /* The child inherits jobrun's environment; the Node worker already passes a minimal one. */
  DWORD flags = CREATE_SUSPENDED | CREATE_NO_WINDOW;
  BOOL ok = token ? CreateProcessAsUserA(token, NULL, cmd, NULL, NULL, TRUE, flags, NULL, NULL, &si, &pi)
                  : CreateProcessA(NULL, cmd, NULL, NULL, TRUE, flags, NULL, NULL, &si, &pi);
  if (!ok) {
    char msg[96];
    snprintf(msg, sizeof msg, "CreateProcess failed (%lu)", (unsigned long)GetLastError());
    write_report(report, "error", 0, 0, 0, 0, 0, msg);
    return 3;
  }
  if (!AssignProcessToJobObject(job, pi.hProcess)) {
    TerminateProcess(pi.hProcess, 1);
    write_report(report, "error", 0, 0, 0, 0, 0, "AssignProcessToJobObject failed");
    return 3;
  }
  ULONGLONG start = GetTickCount64();
  ResumeThread(pi.hThread);
  CloseHandle(pi.hThread);

  const char *status = "ok";
  int procLimitHit = 0, memHit = 0, done = 0;
  while (!done) {
    ULONGLONG elapsed = GetTickCount64() - start;
    if (elapsed >= wallMs) {
      TerminateJobObject(job, 0xC0000102); /* STATUS_TIMEOUT-ish marker */
      status = "wall_timeout";
      break;
    }
    DWORD code = 0;
    ULONG_PTR key = 0;
    LPOVERLAPPED ov = NULL;
    if (!GetQueuedCompletionStatus(port, &code, &key, &ov, (DWORD)(wallMs - elapsed))) continue;
    switch (code) {
      case JOB_OBJECT_MSG_ACTIVE_PROCESS_ZERO: done = 1; break;
      case JOB_OBJECT_MSG_END_OF_JOB_TIME: status = "cpu_timeout"; done = 1; break;
      case JOB_OBJECT_MSG_JOB_MEMORY_LIMIT:
      case JOB_OBJECT_MSG_PROCESS_MEMORY_LIMIT: memHit = 1; break;
      case JOB_OBJECT_MSG_ACTIVE_PROCESS_LIMIT: procLimitHit = 1; break;
      default: break;
    }
  }
  WaitForSingleObject(pi.hProcess, 2000);
  ULONGLONG wall = GetTickCount64() - start;

  DWORD exitCode = 0;
  GetExitCodeProcess(pi.hProcess, &exitCode);
  JOBOBJECT_BASIC_ACCOUNTING_INFORMATION acct;
  ZeroMemory(&acct, sizeof acct);
  QueryInformationJobObject(job, JobObjectBasicAccountingInformation, &acct, sizeof acct, NULL);
  JOBOBJECT_EXTENDED_LIMIT_INFORMATION after;
  ZeroMemory(&after, sizeof after);
  QueryInformationJobObject(job, JobObjectExtendedLimitInformation, &after, sizeof after, NULL);
  if (!strcmp(status, "ok") && memHit) status = "memory_limit";

  write_report(report, status, exitCode, (ULONGLONG)acct.TotalUserTime.QuadPart / 10000ULL, wall,
               after.PeakJobMemoryUsed, procLimitHit, NULL);
  CloseHandle(pi.hProcess);
  CloseHandle(job);
  return 0;
}
