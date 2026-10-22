import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 41 — Game development (specialist path). */
export const M41: PyModuleDef = {
  id: "py-games",
  number: 41,
  level: 5,
  title: "Game Development",
  summary: "The game loop (input, update, render); frames, delta time and fixed time steps; game state; vectors and simple physics; collision detection; grids and boards; win detection; pathfinding for enemies (BFS); game AI with minimax; seeded randomness for levels; pygame overview.",
  track: "specialist",
  optionalNote: "For anyone who wants to make games — and a fun way to practise loops, classes and algorithms. The sandbox has no screen or keyboard, so you'll drive the game logic with recorded inputs; the pygame window code runs on your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-games-loop",
      title: "The game loop, movement and collisions",
      minutes: 18,
      difficulty: 3,
      objectives: [
        "Structure a game as input → update → render each frame",
        "Move objects with velocities and fixed time steps",
        "Detect and resolve collisions with axis-aligned boxes",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "A game moves the player 5 pixels every frame. What happens on a computer that runs at 120 frames per second instead of 60?",
        options: [
          { text: "Nothing changes", why: "Twice the frames means twice the movement per second." },
          { text: "The player moves twice as fast", why: "Correct: movement should depend on time, not frames." },
          { text: "The player moves half as fast", why: "More frames → more moves, not fewer." },
        ],
        answer: 1,
        hint: "Count the pixels per second.",
        explain: "Scale movement by elapsed time (speed × dt) or use a fixed time step, so speed is the same on every machine.",
      },
      why: "Every game — from Snake to open-world 3D — runs the same loop many times per second: read input, update the world, draw it. Getting the loop, timing and collisions right is what makes a game feel solid instead of glitchy.",
      concept: [
        {
          title: "The loop",
          body: `\`\`\`python
while running:
    dt = clock.tick(60) / 1000      # seconds since last frame (pygame)
    handle_input()                  # keys, mouse, quit
    update(dt)                      # move things, collisions, rules
    render()                        # draw the current state
\`\`\`

Keep **state** (positions, scores) separate from **drawing**. Many games use a **fixed time step** for physics (e.g. always update in 1/60 s steps) so results are identical on every machine — and testable.`,
        },
        {
          title: "Movement and collisions",
          body: `- Position += velocity × dt; velocity += acceleration × dt (gravity!).
- **AABB** (axis-aligned bounding box) collision: two rectangles overlap if they overlap on **both** the x and y axes:
  \`a.x < b.x + b.w and b.x < a.x + a.w and a.y < b.y + b.h and b.y < a.y + a.h\`
- Resolve by pushing the object back out (or bouncing: flip the velocity component).
- Very fast objects can **tunnel** through thin walls between frames; use smaller steps or sweep tests.`,
        },
      ],
      example: {
        title: "A bouncing ball, simulated frame by frame",
        code: r`from dataclasses import dataclass

@dataclass
class Box:
    x: float
    y: float
    w: float
    h: float
    def overlaps(self, other):
        return (self.x < other.x + other.w and other.x < self.x + self.w and
                self.y < other.y + other.h and other.y < self.y + self.h)

WIDTH, HEIGHT, DT = 200, 100, 1 / 60
ball = Box(10, 10, 8, 8)
vx, vy, gravity = 120.0, 0.0, 300.0
paddle = Box(60, 70, 40, 6)
events = []

for frame in range(1, 121):
    vy += gravity * DT
    ball.x += vx * DT
    ball.y += vy * DT
    if ball.x < 0 or ball.x + ball.w > WIDTH:
        vx = -vx
        ball.x = max(0, min(ball.x, WIDTH - ball.w))
        events.append(f"frame {frame}: wall bounce")
    if ball.overlaps(paddle) and vy > 0:
        vy = -vy * 0.8
        ball.y = paddle.y - ball.h
        events.append(f"frame {frame}: paddle hit at x={ball.x:.0f}")
    if ball.y > HEIGHT:
        events.append(f"frame {frame}: ball lost")
        break

print("\n".join(events))
print(f"final position ({ball.x:.1f}, {ball.y:.1f})")`,
        output: "frame 35: paddle hit at x=80\nframe 92: wall bounce\nframe 104: ball lost\nfinal position (168.0, 102.2)\n",
        lines: [
          [4, "Game objects as simple data: position and size."],
          [9, "AABB overlap: boxes intersect only if they overlap on both axes."],
          [13, "A fixed time step of 1/60 s makes the simulation identical on every run."],
          [19, "Each frame: update velocity (gravity), then position."],
          [23, "Bounce off the side walls by flipping the x velocity — and push the ball back inside."],
          [27, "Hitting the paddle while falling: bounce up, losing some energy."],
          [29, "Resolve the collision by placing the ball on top of the paddle."],
          [31, "Falling off the bottom ends the round."],
        ],
      },
      mistakes: [
        { title: "Frame-rate-dependent movement", body: "Move by speed × dt (or a fixed step), not a fixed amount per frame." },
        { title: "Detecting but not resolving collisions", body: "If you flip velocity but leave the object inside the wall, it flips again next frame and gets stuck. Push it out." },
        { title: "Mixing drawing and logic", body: "Logic inside draw code is hard to test and depends on frame rate. Update state first, then draw it." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`def overlaps(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return ax < bx + bw and bx < ax + aw and ay < by + bh and by < ay + ah
print(overlaps((0, 0, 10, 10), (5, 5, 10, 10)), overlaps((0, 0, 10, 10), (10, 0, 5, 5)), overlaps((0, 0, 10, 10), (3, 20, 2, 2)))`,
          answer: "True False False\n",
          hint: "Touching edges don't count as overlapping here (strict <).",
          explain: "The first pair overlaps; the second only touches at x = 10; the third is far below.",
        },
        {
          id: "f1", kind: "fill", difficulty: 2,
          prompt: "Move by speed × elapsed time so speed is the same at any frame rate.",
          code: r`x, speed = 0.0, 120.0
for dt in [1 / 60] * 60:
    x += speed * ___
print(round(x, 6))`,
          blanks: [["dt"]],
          output: "120.0\n",
          hint: "Elapsed seconds per frame.",
          explain: "60 frames × (120 px/s × 1/60 s) = 120 px after one second.",
        },
        {
          id: "b1", kind: "bug", difficulty: 3,
          prompt: "On the bounce frame the ball ends up 8 px inside the right wall (x = 200) because its direction flips but its position isn't corrected. It should sit exactly at the wall (x = 192). Which line should also clamp the position?",
          code: r`x, vx, width, size = 195.0, 300.0, 200, 8
trace = []
for _ in range(4):
    x += vx / 60
    if x + size > width:
        vx = -vx
    trace.append(round(x, 1))
print(trace)`,
          line: 6,
          fix: r`x, vx, width, size = 195.0, 300.0, 200, 8
trace = []
for _ in range(4):
    x += vx / 60
    if x + size > width:
        vx = -vx
        x = width - size
    trace.append(round(x, 1))
print(trace)`,
          output: "[192, 187.0, 182.0, 177.0]\n",
          hint: "After bouncing, where should the ball be?",
          explain: "Without clamping, the ball can stay past the wall and flip direction every frame. Putting it back at the wall makes the bounce clean.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A bullet moving 3000 px/s sometimes passes through a 5-px wall without colliding. What's happening?",
          options: [
            { text: "Tunnelling: it jumps from one side to the other between frames", why: "Correct." },
            { text: "The collision code is too slow", why: "Speed of code isn't the issue." },
            { text: "AABB doesn't work for walls", why: "It does — if positions are sampled often enough." },
          ],
          answer: 0,
          hint: "How far does it move per frame?",
          explain: "At 60 fps it moves 50 px per frame — past a 5-px wall. Use sub-steps or a swept (ray) test.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Platformer jump", difficulty: 3,
          prompt: `Simulate a jump with a fixed time step of 1/60 s. The player starts on the ground (y = 0, up is positive) and jumps with vy = 9 m/s; gravity is −25 m/s². Each frame: vy += g·dt, then y += vy·dt; if y ≤ 0, set y = 0 and land. Read jump speeds (one per line) until \`end\`; for each print \`jump v: peak h m at frame f, lands on frame n\` (h with 2 decimals; f = first frame where the height is greatest).`,
          starter: r`DT, G = 1 / 60, -25.0
`,
          tests: [
            { label: "Jumps", input: "9\n5\nend\n", output: "jump 9: peak 1.55 m at frame 21, lands on frame 43\njump 5: peak 0.46 m at frame 11, lands on frame 23" },
          ],
          hints: [
            "Loop frames from 1, updating vy then y.",
            "Track the highest y and its frame (only update on strictly greater).",
            "Stop when y <= 0 after frame 1.",
            "Format with :g for the speed and :.2f for the height.",
          ],
          solution: r`DT, G = 1 / 60, -25.0

def jump(v0):
    y, vy, frame = 0.0, v0, 0
    peak, peak_frame = 0.0, 0
    while True:
        frame += 1
        vy += G * DT
        y += vy * DT
        if y <= 0:
            return peak, peak_frame, frame
        if y > peak:
            peak, peak_frame = y, frame

while (line := input()) != "end":
    v = float(line)
    peak, peak_frame, landed = jump(v)
    print(f"jump {v:g}: peak {peak:.2f} m at frame {peak_frame}, lands on frame {landed}")`,
          notes: "The exact physics peak for 9 m/s is 9²/(2·25) = 1.62 m; the frame-by-frame value differs slightly — that's the discretisation error of a fixed step. Game designers tune jump feel in frames, not formulas.",
        },
        {
          id: "stretch", kind: "task", title: "Coin collector", difficulty: 4,
          prompt: `A 10×10 player box starts at (0, 0) in a 100×60 arena. Coins are 4×4 boxes (lines \`x y\` until \`---\`). Then key states per frame until \`end\` (letters among \`L R U D\`, or \`-\` for none). Each frame, the player moves 2 units per pressed direction (U is −y), clamped to the arena; then any coin overlapping the player (AABB, strict) is collected. Print \`frame f: coin at (x, y)\` when collected, then \`score S/T, player at (x, y)\`.`,
          starter: r`SPEED, W, H, SIZE = 2, 100, 60, 10
`,
          tests: [
            { label: "Run", input: "15 3\n30 30\n2 50\n---\nR\nR\nR\nR\nRD\nRD\nRD\nD\nD\nD\nD\n-\nRD\nRD\nRD\nRD\nRD\nRD\nend\n", output: "frame 3: coin at (15, 3)\nframe 16: coin at (30, 30)\nscore 2/3, player at (26, 26)" },
          ],
          hints: [
            "dx = 2·('R' in keys) − 2·('L' in keys); same for y with D/U.",
            "Clamp: `x = max(0, min(x + dx, W - SIZE))`.",
            "Remove collected coins from the list (iterate over a copy).",
            "Use the overlap test from the lesson.",
          ],
          solution: r`SPEED, W, H, SIZE = 2, 100, 60, 10

def overlaps(ax, ay, aw, ah, bx, by, bw, bh):
    return ax < bx + bw and bx < ax + aw and ay < by + bh and by < ay + ah

coins = []
while (line := input()) != "---":
    cx, cy = map(int, line.split())
    coins.append((cx, cy))
total = len(coins)
x = y = 0
frame = 0
while (keys := input()) != "end":
    frame += 1
    dx = SPEED * (("R" in keys) - ("L" in keys))
    dy = SPEED * (("D" in keys) - ("U" in keys))
    x = max(0, min(x + dx, W - SIZE))
    y = max(0, min(y + dy, H - SIZE))
    for coin in list(coins):
        if overlaps(x, y, SIZE, SIZE, coin[0], coin[1], 4, 4):
            coins.remove(coin)
            print(f"frame {frame}: coin at {coin}")
print(f"score {total - len(coins)}/{total}, player at ({x}, {y})")`,
          notes: "Recorded key presses make the game deterministic, which is exactly how many games implement replays and how their logic is unit-tested.",
        },
      ],
      realWorld: "pygame powers countless indie and educational games; Godot (GDScript is Python-like) and Ren'Py (visual novels, written in Python) ship commercial games; physics engines use fixed time steps for determinism and online multiplayer.",
      reteach: "A game is a flip-book. Each page (frame) you look at the controller, nudge every character a little according to their speed (update), and draw the page (render). If you draw more pages per second you must nudge less per page — that's dt. A collision is two drawings overlapping on the same page; you erase and redraw them just touching.",
      summary: [
        "Loop: input → update → render; keep state separate from drawing.",
        "Move with speed × dt or a fixed time step for consistent, testable physics.",
        "AABB overlap on both axes; resolve by pushing out and/or flipping velocity; beware tunnelling.",
      ],
      libraryCode: [{
        title: "The same ball in a pygame window",
        code: `import pygame

pygame.init()
screen = pygame.display.set_mode((400, 300))
clock = pygame.time.Clock()
ball = pygame.Rect(20, 20, 16, 16)
vx, vy = 240.0, 0.0
running = True
while running:
    dt = clock.tick(60) / 1000
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
    vy += 600 * dt
    ball.x += round(vx * dt); ball.y += round(vy * dt)
    if ball.left < 0 or ball.right > 400: vx = -vx
    if ball.bottom > 300: ball.bottom, vy = 300, -vy * 0.8
    screen.fill((20, 24, 40))
    pygame.draw.ellipse(screen, (250, 200, 60), ball)
    pygame.display.flip()
pygame.quit()`,
        note: "`pip install pygame` (or pygame-ce) and run on your own computer — it opens a window.",
      }],
    },

    {
      id: "py-games-logic",
      title: "Boards, pathfinding and game AI",
      minutes: 19,
      difficulty: 4,
      objectives: [
        "Represent boards and detect wins",
        "Move enemies along shortest paths with breadth-first search",
        "Build an unbeatable tic-tac-toe player with minimax, and generate levels from seeds",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "An enemy must reach the player through a maze using the fewest steps. Which algorithm fits a grid where every step costs the same?",
        options: [
          { text: "Breadth-first search (BFS)", why: "Correct: it explores in order of distance." },
          { text: "Move straight towards the player", why: "Gets stuck behind walls." },
          { text: "Random moves", why: "Slow and unpredictable." },
        ],
        answer: 0,
        hint: "Explore level by level.",
        explain: "BFS visits cells in increasing distance, so the first time it reaches the target it has found a shortest path.",
      },
      why: "Puzzle games, board games and enemies that chase you all need the same few ideas: a board in a data structure, rules that check it, a search to find paths, and an AI that looks ahead. These are also classic interview topics — games make them fun.",
      concept: [
        {
          title: "Boards",
          body: `A grid is a list of strings or lists: \`board[row][col]\`. Neighbours are (r±1, c) and (r, c±1); check bounds and walls. For win detection, list every **line** (rows, columns, diagonals) once and test each.`,
        },
        {
          title: "BFS pathfinding",
          body: `\`\`\`python
queue = deque([start]); came_from = {start: None}
while queue:
    cell = queue.popleft()
    if cell == goal: break
    for nxt in neighbours(cell):
        if nxt not in came_from:
            came_from[nxt] = cell
            queue.append(nxt)
\`\`\`

Walk \`came_from\` back from the goal to get the path. With different step costs use **Dijkstra**; with a distance hint use **A\\*** (Module 44).`,
        },
        {
          title: "Minimax and seeded levels",
          body: `**Minimax**: the AI tries every move, assumes the opponent then plays their best reply, and so on to the end; it scores wins +1, losses −1, draws 0, and picks the move with the best guaranteed score. Fine for tic-tac-toe; bigger games need depth limits, heuristics and alpha-beta pruning.

**Procedural generation** with \`random.Random(seed)\`: the same seed always builds the same level — great for sharing levels and reproducing bugs.`,
        },
      ],
      example: {
        title: "Chasing enemy and unbeatable tic-tac-toe",
        code: r`from collections import deque
from functools import lru_cache

MAZE = ["#########",
        "#P..#...#",
        "#.#.#.#.#",
        "#.#...#E#",
        "#########"]

def find(ch):
    return next((r, c) for r, row in enumerate(MAZE) for c, v in enumerate(row) if v == ch)

def bfs(start, goal):
    came_from, queue = {start: None}, deque([start])
    while queue:
        cell = queue.popleft()
        if cell == goal:
            break
        r, c = cell
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if MAZE[nr][nc] != "#" and (nr, nc) not in came_from:
                came_from[(nr, nc)] = cell
                queue.append((nr, nc))
    path, cell = [], goal
    while cell is not None:
        path.append(cell)
        cell = came_from[cell]
    return path[::-1]

path = bfs(find("E"), find("P"))
print("enemy path length", len(path) - 1, "next step", path[1])

LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
def winner(b):
    return next((b[i] for i, j, k in LINES if b[i] != "." and b[i] == b[j] == b[k]), None)

@lru_cache(maxsize=None)
def minimax(board, player):
    w = winner(board)
    if w:
        return (1 if w == "X" else -1), None
    if "." not in board:
        return 0, None
    results = []
    for i, cell in enumerate(board):
        if cell == ".":
            score, _ = minimax(board[:i] + player + board[i + 1:], "O" if player == "X" else "X")
            results.append((score, i))
    best = max if player == "X" else min
    return best(results, key=lambda t: t[0])

print("X to move on XX.OO....:", minimax("XX.OO....", "X"))
print("empty board value:", minimax("." * 9, "X")[0], "(perfect play is a draw)")`,
        output: "enemy path length 12 next step (2, 7)\nX to move on XX.OO....: (1, 2)\nempty board value: 0 (perfect play is a draw)\n",
        lines: [
          [4, "The maze as a list of strings: # walls, P player, E enemy."],
          [13, "BFS: the queue explores cells in order of distance from the start."],
          [21, "Visit each open neighbour once, remembering where we came from."],
          [24, "Walk back through came_from to rebuild the path."],
          [30, "The enemy's next move is the second cell of the shortest path."],
          [33, "Every winning line of tic-tac-toe, listed once."],
          [37, "Boards are strings so lru_cache can remember positions it has already solved."],
          [45, "Try every empty square, letting the opponent reply perfectly."],
          [49, "X maximises the score, O minimises it (the first best move wins ties)."],
          [52, "X wins immediately by completing the top row (square 2)."],
        ],
      },
      mistakes: [
        { title: "Marking cells visited too late", body: "Mark a cell when you add it to the queue, not when you pop it — otherwise it's queued many times." },
        { title: "Checking bounds after indexing", body: "`grid[r][c]` with r = −1 silently wraps to the last row in Python. Check bounds (or surround the grid with walls) first." },
        { title: "Exploring everything in big games", body: "Minimax on chess without depth limits never finishes. Limit depth, use heuristics and alpha-beta pruning." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
def winner(b):
    for i, j, k in LINES:
        if b[i] != "." and b[i] == b[j] == b[k]:
            return b[i]
    return None
print(winner("XOX.O..O."), winner("XXXOO...."), winner("O.XOX.X.."))`,
          answer: "O X X\n",
          hint: "Check the middle column, the top row and the anti-diagonal.",
          explain: "O fills the middle column (1, 4, 7); X fills the top row; X fills the diagonal (2, 4, 6).",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Take the next cell from the front of the BFS queue.",
          code: r`from collections import deque
queue = deque([(0, 0), (0, 1), (1, 0)])
cell = queue.___()
print(cell, len(queue))`,
          blanks: [["popleft"]],
          output: "(0, 0) 2\n",
          hint: "First in, first out.",
          explain: "BFS needs a FIFO queue: append to the right, popleft from the left.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This flood-fill counts reachable cells but negative indexes wrap around to the other side of the grid, so it 'escapes' through the left edge. Which line needs a bounds check?",
          code: r`GRID = ["...",
        "..#",
        "###"]
def reachable(start):
    seen, stack = {start}, [start]
    while stack:
        r, c = stack.pop()
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if (nr, nc) not in seen and GRID[nr % 3][nc % 3] == ".":
                seen.add((nr, nc))
                stack.append((nr, nc))
        if len(seen) > 20:
            return "escaped!"
    return len(seen)
print(reachable((0, 0)))`,
          line: 9,
          fix: r`GRID = ["...",
        "..#",
        "###"]
def reachable(start):
    seen, stack = {start}, [start]
    while stack:
        r, c = stack.pop()
        for nr, nc in ((r - 1, c), (r + 1, c), (r, c - 1), (r, c + 1)):
            if 0 <= nr < 3 and 0 <= nc < 3 and (nr, nc) not in seen and GRID[nr][nc] == ".":
                seen.add((nr, nc))
                stack.append((nr, nc))
        if len(seen) > 20:
            return "escaped!"
    return len(seen)
print(reachable((0, 0)))`,
          output: "5\n",
          hint: "Index arithmetic that wraps hides out-of-bounds moves.",
          explain: "Check 0 <= row < rows and 0 <= col < cols before using the cell; wrapping (or Python's negative indexes) silently connects opposite edges.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "Why does the example store tic-tac-toe boards as strings like `\"XX.OO....\"`?",
          options: [
            { text: "Strings are hashable, so lru_cache can memoise positions", why: "Correct." },
            { text: "Lists can't hold 'X' and 'O'", why: "They can." },
            { text: "Strings make the AI play better", why: "Same moves; just faster thanks to caching." },
          ],
          answer: 0,
          hint: "What does lru_cache need?",
          explain: "Caching requires hashable (immutable) arguments; many move orders reach the same position, so caching saves a lot of work.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Tic-tac-toe referee", difficulty: 3,
          prompt: `Players X and O alternate (X first) choosing squares 1–9 (row by row). Read moves until \`end\`. Reject moves to taken squares or outside 1–9 with \`invalid move <m>\` (the same player tries again). After each valid move print the board as three rows like \`X.O\`. Stop with \`X wins\`, \`O wins\` or \`draw\` as soon as the game ends (ignore any further moves); if the input ends first, print \`game in progress\`.`,
          starter: r`LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]
`,
          tests: [
            { label: "X wins", input: "5\n1\n5\n2\n3\n8\n9\nend\n", output: "...\n.X.\n...\nO..\n.X.\n...\ninvalid move 5\nOX.\n.X.\n...\nOXO\n.X.\n...\nOXO\n.X.\n.X.\nX wins" },
            { label: "Draw", input: "1\n2\n3\n5\n4\n6\n8\n7\n9\nend\n", output: "X..\n...\n...\nXO.\n...\n...\nXOX\n...\n...\nXOX\n.O.\n...\nXOX\nXO.\n...\nXOX\nXOO\n...\nXOX\nXOO\n.X.\nXOX\nXOO\nOX.\nXOX\nXOO\nOXX\ndraw", hidden: true },
          ],
          hints: [
            "Keep the board as a list of 9 '.' characters.",
            "Validate: m.isdigit(), 1 <= int(m) <= 9, and the square is '.'.",
            "After each valid move, print the 3 rows and check the winner.",
            "Use a `finished` flag to ignore later moves.",
          ],
          solution: r`LINES = [(0, 1, 2), (3, 4, 5), (6, 7, 8), (0, 3, 6), (1, 4, 7), (2, 5, 8), (0, 4, 8), (2, 4, 6)]

board = ["."] * 9
player = "X"
result = None
while (move := input()) != "end":
    if result:
        continue
    if not (move.isdigit() and 1 <= int(move) <= 9 and board[int(move) - 1] == "."):
        print("invalid move", move)
        continue
    board[int(move) - 1] = player
    for row in range(3):
        print("".join(board[row * 3: row * 3 + 3]))
    if any(board[i] == board[j] == board[k] == player for i, j, k in LINES):
        result = f"{player} wins"
    elif "." not in board:
        result = "draw"
    player = "O" if player == "X" else "X"
print(result or "game in progress")`,
          notes: "Separating 'validate', 'apply', 'show' and 'check end' keeps the referee simple — and you can reuse it unchanged under a pygame or web interface.",
        },
        {
          id: "stretch", kind: "task", title: "Enemy chase with BFS", difficulty: 4,
          prompt: `A maze (lines until \`---\`) contains walls \`#\`, the player \`P\` and an enemy \`E\`. Then the player's moves (\`U D L R\`, one per turn, until \`end\`); moves into walls are ignored. After each player move, the enemy steps one cell along a shortest path (BFS; when several neighbours are equally good, prefer the order up, down, left, right). Print \`turn t: P(r,c) E(r,c)\` each turn; if the enemy reaches the player, print \`caught on turn t\` and stop. If all moves are used, print \`escaped\`.`,
          starter: r`from collections import deque
`,
          tests: [
            { label: "Chase", input: "#######\n#P....#\n#.###.#\n#....E#\n#######\n---\nR\nR\nR\nR\nend\n", output: "turn 1: P(1,2) E(2,5)\nturn 2: P(1,3) E(1,5)\nturn 3: P(1,4) E(1,4)\ncaught on turn 3" },
            { label: "Escape", input: "#########\n#P.....E#\n#########\n---\nL\nL\nend\n", output: "turn 1: P(1,1) E(1,6)\nturn 2: P(1,1) E(1,5)\nescaped", hidden: true },
          ],
          hints: [
            "Find P and E positions, then replace them with '.' in the grid.",
            "BFS from the enemy, exploring neighbours in the order U, D, L, R; rebuild the path to the player.",
            "If the path has length ≥ 2, the enemy moves to path[1].",
            "Check 'caught' after the player moves AND after the enemy moves.",
          ],
          solution: r`from collections import deque

grid = []
while (line := input()) != "---":
    grid.append(list(line))
pos = {v: (r, c) for r, row in enumerate(grid) for c, v in enumerate(row) if v in "PE"}
player, enemy = pos["P"], pos["E"]
grid[player[0]][player[1]] = grid[enemy[0]][enemy[1]] = "."
STEPS = {"U": (-1, 0), "D": (1, 0), "L": (0, -1), "R": (0, 1)}

def open_cell(r, c):
    return 0 <= r < len(grid) and 0 <= c < len(grid[r]) and grid[r][c] != "#"

def next_step(start, goal):
    came_from, queue = {start: None}, deque([start])
    while queue:
        cell = queue.popleft()
        if cell == goal:
            break
        for dr, dc in STEPS.values():
            nxt = (cell[0] + dr, cell[1] + dc)
            if open_cell(*nxt) and nxt not in came_from:
                came_from[nxt] = cell
                queue.append(nxt)
    if goal not in came_from:
        return start
    cell = goal
    while came_from[cell] != start and came_from[cell] is not None:
        cell = came_from[cell]
    return cell

turn = 0
caught = False
while (move := input()) != "end":
    if caught:
        continue
    turn += 1
    dr, dc = STEPS[move]
    if open_cell(player[0] + dr, player[1] + dc):
        player = (player[0] + dr, player[1] + dc)
    if player != enemy:
        enemy = next_step(enemy, player)
    print(f"turn {turn}: P({player[0]},{player[1]}) E({enemy[0]},{enemy[1]})")
    if player == enemy:
        print(f"caught on turn {turn}")
        caught = True
if not caught:
    print("escaped")`,
          notes: "BFS gives the enemy perfect play on a small map. Real games make enemies beatable on purpose: slower speeds, limited vision, or re-planning only every few turns.",
        },
      ],
      realWorld: "Strategy and puzzle games use BFS/A* for unit movement; chess and Go engines extend minimax with pruning and learned evaluation; roguelikes like Spelunky and Minecraft generate worlds from seeds.",
      reteach: "BFS is ripples in a pond: drop a stone where the enemy stands, and the ripple reaches nearby cells first, then further ones; the first ripple to touch the player traced the shortest route. Minimax is playing chess in your head: 'if I go here, what's their best answer, and then mine…' — always assuming the opponent is as clever as you.",
      summary: [
        "Boards as lists/strings; list winning lines once; check bounds before indexing.",
        "BFS with a deque and came_from finds shortest paths on uniform grids.",
        "Minimax (with caching) gives perfect play in small games; seed RNGs for reproducible levels.",
      ],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "In which order should a frame be processed?",
      options: [
        { text: "Render, then input, then update", why: "You'd draw stale state." },
        { text: "Input, then update, then render", why: "Correct." },
        { text: "Update only every other frame", why: "That halves game speed." },
      ],
      answer: 1,
      hint: "Read, think, draw.",
      explain: "Read input, update the world with it, then draw the new state.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import random
def level(seed):
    rng = random.Random(seed)
    return "".join(rng.choice("..#") for _ in range(10))
print(level(5) == level(5), level(5) == level(6))`,
      answer: "True False\n",
      hint: "Same seed, same sequence.",
      explain: "The same seed always produces the same level; a different seed almost certainly differs.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Memoise the AI's position evaluations.",
      code: r`from functools import ___
@lru_cache(maxsize=None)
def value(position):
    return len(position)
print(value("XO."), value.cache_info().misses)`,
      blanks: [["lru_cache"]],
      output: "3 1\n",
      hint: "Least recently used cache.",
      explain: "`functools.lru_cache` stores results keyed by the (hashable) arguments.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: Snake (headless)", difficulty: 4,
    prompt: `Implement the rules of Snake on a W×H grid, driven by recorded input.

First line: \`W H seed\`. The snake starts as 3 cells with its head at (2, 0) and body (1, 0), (0, 0) (x, y), moving right. Food is placed with \`rng = random.Random(seed)\`: repeatedly pick \`(rng.randrange(W), rng.randrange(H))\` until the cell is free of the snake. Then one line per tick until \`end\`: a direction \`U D L R\` or \`-\` (keep going). Reversing directly into yourself is ignored.

Each tick: turn, move the head; if it leaves the grid or hits the body → \`game over on tick t: <wall|self>\` and stop. If it eats food: grow by one (don't remove the tail), score +1, print \`tick t: ate food, score s\`, and place new food. At the end print \`score S, length L, head (x, y)\`.`,
    starter: r`import random
from collections import deque
`,
    tests: [
      { label: "Seed 3", input: "8 6 3\nD\n-\n-\n-\nR\nL\n-\n-\n-\nD\nL\nU\nR\n-\nend\n", output: "tick 5: ate food, score 1\ntick 10: ate food, score 2\ngame over on tick 12: self\nscore 2, length 5, head (6, 5)" },
    ],
    hints: [
      "Keep the snake as a deque of (x, y) with the head on the left.",
      "When moving: compute the new head; collision with the body should ignore the tail cell if the snake isn't growing this tick.",
      "Directions as vectors; ignore a turn whose vector is the negative of the current one.",
      "Place food in a loop with rng until it lands on a free cell.",
    ],
    solution: r`import random
from collections import deque

w, h, seed = map(int, input().split())
rng = random.Random(seed)
DIRS = {"U": (0, -1), "D": (0, 1), "L": (-1, 0), "R": (1, 0)}
snake = deque([(2, 0), (1, 0), (0, 0)])
direction = DIRS["R"]

def place_food():
    while True:
        cell = (rng.randrange(w), rng.randrange(h))
        if cell not in snake:
            return cell

food = place_food()
score, tick, over = 0, 0, False
while (key := input()) != "end":
    if over:
        continue
    tick += 1
    if key in DIRS:
        dx, dy = DIRS[key]
        if (dx, dy) != (-direction[0], -direction[1]):
            direction = (dx, dy)
    hx, hy = snake[0]
    head = (hx + direction[0], hy + direction[1])
    growing = head == food
    body = list(snake) if growing else list(snake)[:-1]
    if not (0 <= head[0] < w and 0 <= head[1] < h):
        print(f"game over on tick {tick}: wall")
        over = True
        continue
    if head in body:
        print(f"game over on tick {tick}: self")
        over = True
        continue
    snake.appendleft(head)
    if growing:
        score += 1
        print(f"tick {tick}: ate food, score {score}")
        food = place_food()
    else:
        snake.pop()
print(f"score {score}, length {len(snake)}, head {snake[0]}")`,
    notes: "Because input and randomness are recorded, every game can be replayed exactly — the basis of replays, bug reports and automated game tests. To play it for real, draw `snake` and `food` with pygame and read arrow keys each frame; the rules stay unchanged.",
  },
};
