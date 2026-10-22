import type { PyModuleDef } from "../types";

const r = String.raw;

/** Module 36 — Machine learning foundations (specialist path). */
export const M36: PyModuleDef = {
  id: "py-ml",
  number: 36,
  level: 5,
  title: "Machine Learning Foundations",
  summary: "What machine learning is; features and labels; train/test splits; regression; classification; distance-based models; feature scaling; evaluation metrics (MAE, RMSE, R², accuracy, precision, recall, confusion matrix); overfitting and validation; data leakage; fairness; scikit-learn workflow.",
  track: "specialist",
  optionalNote: "For aspiring data scientists and ML engineers. You'll build small models from scratch in plain Python to understand what libraries do; scikit-learn versions are shown for your own computer.",
  prereqs: ["py-security"],
  lessons: [
    {
      id: "py-ml-regression",
      title: "The ML workflow and linear regression",
      minutes: 19,
      difficulty: 4,
      objectives: [
        "Describe features, labels, training and testing",
        "Fit a straight line by least squares and make predictions",
        "Evaluate a regression model with MAE, RMSE and R²",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 2,
        prompt: "Why do we evaluate a model on a test set it never saw during training?",
        options: [
          { text: "To make training faster", why: "It doesn't affect training speed." },
          { text: "To estimate how well it works on new, real-world data", why: "Correct." },
          { text: "Because the training data is wrong", why: "Training data is fine — it's just been seen." },
        ],
        answer: 1,
        hint: "A student who memorised the answers…",
        explain: "Scoring on seen data rewards memorisation. Held-out data shows whether the model generalises.",
      },
      why: "Machine learning is behind recommendations, fraud detection, crop-yield forecasts and voice assistants. Under the libraries, a model is just a function with parameters chosen to fit data. Building the simplest one yourself makes every later tool — and its limits — understandable.",
      concept: [
        {
          title: "The workflow",
          body: `1. **Question & data**: what to predict (the **label**, y) from what (the **features**, X).
2. **Split**: training set (fit) and test set (evaluate) — often 80/20, shuffled with a fixed seed.
3. **Fit**: choose parameters that make predictions close to the training labels.
4. **Evaluate** on the test set with a suitable metric; compare with a **baseline** (e.g. always predicting the mean).
5. **Iterate** on features and models — without peeking at the test set.

**Regression** predicts numbers (price, temperature); **classification** predicts categories (spam/not spam).`,
        },
        {
          title: "Least-squares line",
          body: `For one feature: \`y ≈ slope · x + intercept\`.

\`\`\`text
slope = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²
intercept = ȳ − slope · x̄
\`\`\`

This choice minimises the sum of squared errors. (\`statistics.linear_regression\` computes it too, Python 3.10+.)`,
        },
        {
          title: "Regression metrics",
          body: `- **MAE**: average absolute error — "off by ₹X on average".
- **RMSE**: square root of the mean squared error — punishes big misses more.
- **R²**: 1 − SSE/SST; 1 is perfect, 0 is no better than predicting the mean, negative is worse than that.

Always report the baseline: an MAE of 5 means little until you know the mean-only model scores 30.`,
        },
      ],
      example: {
        title: "Predicting house rent from area",
        code: r`import math, random, statistics

random.seed(42)
data = [(area, round(30 * area + 4000 + random.gauss(0, 1500))) for area in range(400, 1600, 50)]
random.shuffle(data)
split = int(len(data) * 0.8)
train, test = data[:split], data[split:]

def fit(points):
    xs, ys = [p[0] for p in points], [p[1] for p in points]
    mx, my = statistics.mean(xs), statistics.mean(ys)
    slope = sum((x - mx) * (y - my) for x, y in points) / sum((x - mx) ** 2 for x in xs)
    return slope, my - slope * mx

def evaluate(predict, points):
    errors = [y - predict(x) for x, y in points]
    mae = statistics.mean(abs(e) for e in errors)
    rmse = math.sqrt(statistics.mean(e * e for e in errors))
    mean_y = statistics.mean(y for _, y in points)
    r2 = 1 - sum(e * e for e in errors) / sum((y - mean_y) ** 2 for _, y in points)
    return round(mae), round(rmse), round(r2, 3)

slope, intercept = fit(train)
print(f"rent ≈ {slope:.1f} × area + {intercept:.0f}")
print("model    MAE, RMSE, R²:", evaluate(lambda x: slope * x + intercept, test))
baseline = statistics.mean(y for _, y in train)
print("baseline MAE, RMSE, R²:", evaluate(lambda x: baseline, test))
print("1000 sq ft →", round(slope * 1000 + intercept, -2))`,
        output: "rent ≈ 30.4 × area + 3445\nmodel    MAE, RMSE, R²: (741, 857, 0.993)\nbaseline MAE, RMSE, R²: (9119, 10943, -0.068)\n1000 sq ft → 33900.0\n",
        lines: [
          [3, "A fixed seed makes the shuffle and noise repeatable."],
          [4, "Synthetic data: rent truly depends on area, plus random noise."],
          [7, "Hold out 20% for testing before fitting anything."],
          [12, "The least-squares slope formula."],
          [20, "R² compares our errors with those of always predicting the mean."],
          [23, "Fit on training data only."],
          [25, "Evaluate on unseen test data."],
          [26, "A baseline that ignores area — the model must beat it to be worth anything."],
        ],
      },
      mistakes: [
        { title: "Evaluating on training data", body: "Scores look great and mean little. Always hold out a test set (or use cross-validation)." },
        { title: "Data leakage", body: "Using information from the test set (or from the future) while training — e.g. scaling with the whole dataset's mean — inflates scores." },
        { title: "Extrapolating", body: "A line fitted on 400–1600 sq ft says nothing reliable about 10,000 sq ft." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`import statistics
xs = [1, 2, 3, 4]
ys = [3, 5, 7, 9]
slope, intercept = statistics.linear_regression(xs, ys)
print(slope, intercept, slope * 10 + intercept)`,
          answer: "2.0 1.0 21.0\n",
          hint: "The points lie exactly on y = 2x + 1.",
          explain: "A perfect line: slope 2, intercept 1, so x = 10 predicts 21.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Compute the mean absolute error.",
          code: r`actual = [100, 150, 200]
predicted = [110, 140, 230]
mae = sum(___(a - p) for a, p in zip(actual, predicted)) / len(actual)
print(round(mae, 2))`,
          blanks: [["abs"]],
          output: "16.67\n",
          hint: "Absolute value.",
          explain: "Errors are 10, 10 and 30, so MAE = 50 / 3 ≈ 16.67.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This reports a perfect score, but only because it evaluates on the data it was fitted on. Which line should use the test set?",
          code: r`import statistics
data = [(x, 2 * x + (3 if x % 2 else -3)) for x in range(10)]
train, test = data[:8], data[8:]
slope, intercept = statistics.linear_regression([x for x, _ in train], [y for _, y in train])
check = train
errors = [abs(y - (slope * x + intercept)) for x, y in check]
print(len(check), round(statistics.mean(errors), 2))`,
          line: 5,
          fix: r`import statistics
data = [(x, 2 * x + (3 if x % 2 else -3)) for x in range(10)]
train, test = data[:8], data[8:]
slope, intercept = statistics.linear_regression([x for x, _ in train], [y for _, y in train])
check = test
errors = [abs(y - (slope * x + intercept)) for x, y in check]
print(len(check), round(statistics.mean(errors), 2))`,
          output: "2 2.86\n",
          hint: "Which points has the model never seen?",
          explain: "Error measured on the 2 held-out points is the honest estimate of performance on new data.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A model gets R² = −0.2 on the test set. What does that mean?",
          options: [
            { text: "It's 20% accurate", why: "R² isn't accuracy." },
            { text: "It's worse than simply predicting the mean", why: "Correct." },
            { text: "The calculation must be wrong — R² can't be negative", why: "It can, on test data." },
          ],
          answer: 1,
          hint: "R² = 0 is the mean baseline.",
          explain: "Negative R² means the model's squared errors exceed those of the constant mean prediction.",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Fit, predict, evaluate", difficulty: 3,
          prompt: `Read training points \`x y\` until \`---\`, then test points until \`end\`. Fit a least-squares line on the training data (write the formula yourself — don't use statistics.linear_regression). Print \`y = a x + b\` (2 decimals each), then for each test point \`x: predicted p, actual y\` (p to 1 decimal), then \`MAE m\` (2 decimals).`,
          starter: r`def fit(points):
    pass
`,
          tests: [
            { label: "Study hours → marks", input: "1 52\n2 55\n3 61\n4 64\n5 70\n---\n6 72\n7 79\nend\n", output: "y = 4.50 x + 46.90\n6: predicted 73.9, actual 72\n7: predicted 78.4, actual 79\nMAE 1.25" },
          ],
          hints: [
            "Means of x and y, then slope = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)².",
            "intercept = ȳ − slope·x̄.",
            "Predict with slope * x + intercept.",
            "MAE: mean of absolute differences on the test set.",
          ],
          solution: r`def fit(points):
    n = len(points)
    mx = sum(x for x, _ in points) / n
    my = sum(y for _, y in points) / n
    slope = sum((x - mx) * (y - my) for x, y in points) / sum((x - mx) ** 2 for x, _ in points)
    return slope, my - slope * mx

def read(stop):
    pts = []
    while (line := input()) != stop:
        x, y = map(float, line.split())
        pts.append((x, y))
    return pts

train, test = read("---"), read("end")
a, b = fit(train)
print(f"y = {a:.2f} x + {b:.2f}")
errors = []
for x, y in test:
    p = a * x + b
    errors.append(abs(y - p))
    print(f"{x:g}: predicted {p:.1f}, actual {y:g}")
print(f"MAE {sum(errors) / len(errors):.2f}")`,
          notes: "Seven data points can't support a strong claim — 'each study hour adds about 4.4 marks' is a description of this small sample, not a law.",
        },
        {
          id: "stretch", kind: "task", title: "Does the model beat the baseline?", difficulty: 4,
          prompt: `Generate data with \`random.seed(S)\` (S from input): 50 points with \`x = random.uniform(0, 10)\` and \`y = 3 * x + 5 + random.gauss(0, N)\` (N from input), in that order of calls per point. Shuffle with the same generator, split 80/20, fit on train, and report on test: \`model RMSE a\`, \`baseline RMSE b\` (predicting the training mean), \`R² r\` (all 2 decimals) and \`useful: yes\` if R² ≥ 0.5 else \`useful: no\`.`,
          starter: r`import math, random, statistics

s, noise = input().split()
random.seed(int(s))
`,
          tests: [
            { label: "Low noise", input: "1 2\n", output: "model RMSE 1.91\nbaseline RMSE 9.70\nR² 0.96\nuseful: yes" },
            { label: "Very noisy", input: "7 40\n", output: "model RMSE 34.93\nbaseline RMSE 41.01\nR² 0.19\nuseful: no", hidden: true },
          ],
          hints: [
            "Build the list with a for loop so random calls happen in the stated order.",
            "`random.shuffle(points)` then slice at 40.",
            "statistics.linear_regression is fine here.",
            "R² = 1 − SSE/SST on the test set.",
          ],
          solution: r`import math, random, statistics

s, noise = input().split()
random.seed(int(s))
points = []
for _ in range(50):
    x = random.uniform(0, 10)
    y = 3 * x + 5 + random.gauss(0, float(noise))
    points.append((x, y))
random.shuffle(points)
train, test = points[:40], points[40:]
slope, intercept = statistics.linear_regression([x for x, _ in train], [y for _, y in train])
base = statistics.mean(y for _, y in train)

def rmse(pred):
    return math.sqrt(statistics.mean((y - pred(x)) ** 2 for x, y in test))

model_rmse = rmse(lambda x: slope * x + intercept)
base_rmse = rmse(lambda x: base)
mean_test = statistics.mean(y for _, y in test)
sse = sum((y - (slope * x + intercept)) ** 2 for x, y in test)
sst = sum((y - mean_test) ** 2 for _, y in test)
r2 = 1 - sse / sst
print(f"model RMSE {model_rmse:.2f}")
print(f"baseline RMSE {base_rmse:.2f}")
print(f"R² {r2:.2f}")
print("useful:", "yes" if r2 >= 0.5 else "no")`,
          notes: "With heavy noise the same true relationship becomes hard to detect from 50 points — the model may barely beat the baseline. Collecting better data often matters more than a fancier model.",
        },
      ],
      realWorld: "Banks forecast cash demand at ATMs, farms predict yield from rainfall and fertiliser, and ride-hailing apps estimate trip times — many start with linear models because they are fast, explainable baselines.",
      reteach: "Fitting a line is like stretching a rubber band through a scatter of nails so it sits as close as possible to all of them. The test set is a handful of nails you hid before stretching: if the band also passes near them, it has learned the pattern rather than memorising the nails.",
      summary: [
        "Features → label; split train/test before fitting; compare with a baseline.",
        "Least squares: slope = Σ(x−x̄)(y−ȳ)/Σ(x−x̄)², intercept = ȳ − slope·x̄.",
        "Report MAE/RMSE/R² on test data; beware leakage and extrapolation.",
      ],
      version: "statistics.linear_regression: Python 3.10+",
      libraryCode: [{
        title: "The same workflow in scikit-learn",
        code: `from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

X = [[area] for area, _ in data]       # 2-D: rows of features
y = [rent for _, rent in data]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)
print(model.coef_, model.intercept_, mean_absolute_error(y_test, pred), r2_score(y_test, pred))`,
        note: "`pip install scikit-learn` on your own computer. Every scikit-learn model follows the same fit/predict pattern.",
      }],
    },

    {
      id: "py-ml-classification",
      title: "Classification, scaling and evaluation",
      minutes: 19,
      difficulty: 4,
      objectives: [
        "Build a k-nearest-neighbours classifier",
        "Scale features using training statistics only",
        "Evaluate with a confusion matrix, precision and recall, and recognise overfitting",
      ],
      warmup: {
        id: "w", kind: "mcq", difficulty: 3,
        prompt: "A disease affects 1% of people. A model that always says 'healthy' has what accuracy?",
        options: [
          { text: "1%", why: "It's right for every healthy person." },
          { text: "99% — yet it never finds a single sick person", why: "Correct: accuracy misleads on imbalanced data." },
          { text: "50%", why: "Classes aren't balanced." },
        ],
        answer: 1,
        hint: "Count who it gets right.",
        explain: "That's why we also measure recall (how many sick people are found) and precision.",
      },
      why: "Many real problems are categories: spam or not, fraud or not, which crop disease a leaf shows. Building a classifier is easy; knowing whether it actually works — and for whom it fails — is the real skill.",
      concept: [
        {
          title: "k-nearest neighbours",
          body: `To classify a new point, find the **k** closest training points (Euclidean distance) and take the majority label. No training step — the data *is* the model.

Distances are dominated by large-scale features (salary in rupees vs age in years), so **scale** features first: \`(x − mean) / std\` using the **training** set's mean and std — computing them on all data leaks test information.`,
        },
        {
          title: "Confusion matrix and metrics",
          body: `| | predicted positive | predicted negative |
| --- | --- | --- |
| **actually positive** | TP | FN |
| **actually negative** | FP | TN |

- **Accuracy** = (TP + TN) / all
- **Precision** = TP / (TP + FP) — when it says "fraud", how often is it right?
- **Recall** = TP / (TP + FN) — of all fraud, how much does it catch?
- **F1** = harmonic mean of precision and recall.`,
        },
        {
          title: "Overfitting and fairness",
          body: `**Overfitting**: great on training data, poor on new data (k = 1 memorises every point, noise included). **Underfitting**: too simple to capture the pattern. Choose settings (like k) with a **validation** set or cross-validation — never the test set.

Models learn patterns in historical data, including unfair ones. Check performance **per group** (region, gender, language) and think about who is harmed by each kind of error.`,
        },
      ],
      example: {
        title: "k-NN with scaling and a confusion matrix",
        code: r`import math, statistics
from collections import Counter

train = [((25, 30000), "no"), ((35, 60000), "yes"), ((45, 80000), "yes"), ((20, 20000), "no"),
         ((50, 40000), "no"), ((30, 75000), "yes"), ((40, 90000), "yes"), ((23, 25000), "no")]
test = [((28, 70000), "yes"), ((48, 35000), "no"), ((33, 32000), "no"), ((38, 65000), "no")]

cols = list(zip(*[f for f, _ in train]))
means = [statistics.mean(c) for c in cols]
stds = [statistics.pstdev(c) for c in cols]
def scale(f):
    return [(v - m) / s for v, m, s in zip(f, means, stds)]

def knn(features, k=3):
    q = scale(features)
    nearest = sorted(train, key=lambda item: math.dist(q, scale(item[0])))[:k]
    return Counter(label for _, label in nearest).most_common(1)[0][0]

matrix = Counter()
for features, actual in test:
    matrix[(actual, knn(features))] += 1
tp, fn = matrix[("yes", "yes")], matrix[("yes", "no")]
fp, tn = matrix[("no", "yes")], matrix[("no", "no")]
print("TP FN FP TN:", tp, fn, fp, tn)
print("accuracy", (tp + tn) / len(test), "precision", round(tp / (tp + fp), 2) if tp + fp else None, "recall", tp / (tp + fn))
print("k=1 on training data:", sum(knn(f, 1) == y for f, y in train), "/", len(train))`,
        output: "TP FN FP TN: 1 0 2 1\naccuracy 0.5 precision 0.33 recall 1.0\nk=1 on training data: 8 / 8\n",
        lines: [
          [4, "Features: (age, income); label: did they buy?"],
          [8, "Means and standard deviations come from the TRAINING data only."],
          [11, "Scaling puts age and income on comparable scales before measuring distance."],
          [16, "Sort training points by distance and keep the k closest."],
          [17, "Majority vote among the neighbours."],
          [21, "Count each (actual, predicted) pair — the confusion matrix."],
          [25, "Two false alarms on only four test points: tiny test sets give noisy, unreliable scores."],
          [26, "k = 1 scores perfectly on its own training data: each point is its own nearest neighbour. That says nothing about new data."],
        ],
      },
      mistakes: [
        { title: "Trusting accuracy on imbalanced data", body: "Report the confusion matrix, precision and recall — and the class balance." },
        { title: "Scaling with all the data", body: "Fit scalers (and any preprocessing) on training data only, then apply them to test data." },
        { title: "Tuning on the test set", body: "Picking k by test score makes the test score optimistic. Use a validation split or cross-validation." },
      ],
      questions: [
        {
          id: "p1", kind: "predict", difficulty: 3,
          code: r`tp, fp, fn, tn = 30, 10, 20, 140
precision = tp / (tp + fp)
recall = tp / (tp + fn)
accuracy = (tp + tn) / (tp + fp + fn + tn)
print(precision, recall, accuracy)`,
          answer: "0.75 0.6 0.85\n",
          hint: "30/40, 30/50, 170/200.",
          explain: "Precision 0.75, recall 0.6, accuracy 0.85 — a high accuracy hiding that 40% of positives are missed.",
        },
        {
          id: "f1", kind: "fill", difficulty: 3,
          prompt: "Take the most common label among the neighbours.",
          code: r`from collections import Counter
neighbours = ["cat", "dog", "cat"]
print(Counter(neighbours).___(1)[0][0])`,
          blanks: [["most_common"]],
          output: "cat\n",
          hint: "The method returns (item, count) pairs, most frequent first.",
          explain: "`most_common(1)` → [('cat', 2)], so [0][0] is 'cat'.",
        },
        {
          id: "b1", kind: "bug", difficulty: 4,
          prompt: "This scales features using the mean of ALL rows, including the test row (data leakage). Which line should use only the training rows?",
          code: r`import statistics
train = [10, 20, 30]
test = [1000]
mean = statistics.mean(train + test)
print([round(x - mean, 1) for x in train], round(test[0] - mean, 1))`,
          line: 4,
          fix: r`import statistics
train = [10, 20, 30]
test = [1000]
mean = statistics.mean(train)
print([round(x - mean, 1) for x in train], round(test[0] - mean, 1))`,
          output: "[-10, 0, 10] 980\n",
          hint: "Information from the test set must not influence preprocessing.",
          explain: "Statistics for preprocessing are learned from training data and then applied unchanged to test data.",
        },
        {
          id: "m1", kind: "mcq", difficulty: 3,
          prompt: "A fraud model must catch as much fraud as possible, even if analysts check some false alarms. Which metric matters most?",
          options: [
            { text: "Recall", why: "Correct: missed fraud (false negatives) is the costly error." },
            { text: "Accuracy", why: "Dominated by the many non-fraud cases." },
            { text: "Precision", why: "That limits false alarms, the cheaper error here." },
          ],
          answer: 0,
          hint: "Which error is worse here?",
          explain: "When missing a positive is costly, optimise recall (while keeping precision manageable).",
        },
      ],
      exercises: [
        {
          id: "task", kind: "task", title: "Confusion matrix and metrics", difficulty: 3,
          prompt: `Read \`actual predicted\` label pairs (\`spam\`/\`ham\`; spam is the positive class) until \`end\`. Print \`TP x FP y FN z TN w\`, then \`accuracy a precision p recall r f1 f\` (2 decimals each; use 0.00 when a denominator is zero).`,
          starter: r`from collections import Counter
`,
          tests: [
            { label: "Mail", input: "spam spam\nham ham\nspam ham\nham spam\nham ham\nspam spam\nham ham\nham ham\nend\n", output: "TP 2 FP 1 FN 1 TN 4\naccuracy 0.75 precision 0.67 recall 0.67 f1 0.67" },
            { label: "Never predicts spam", input: "spam ham\nham ham\nend\n", output: "TP 0 FP 0 FN 1 TN 1\naccuracy 0.50 precision 0.00 recall 0.00 f1 0.00", hidden: true, category: "edge" },
          ],
          hints: [
            "Count pairs with a Counter keyed by (actual, predicted).",
            "TP = (spam, spam), FP = (ham, spam), FN = (spam, ham), TN = (ham, ham).",
            "A helper `div(a, b)` returning 0.0 when b == 0 avoids crashes.",
            "f1 = 2pr / (p + r).",
          ],
          solution: r`from collections import Counter

pairs = Counter()
while (line := input()) != "end":
    actual, predicted = line.split()
    pairs[(actual, predicted)] += 1
tp, fp = pairs[("spam", "spam")], pairs[("ham", "spam")]
fn, tn = pairs[("spam", "ham")], pairs[("ham", "ham")]

def div(a, b):
    return a / b if b else 0.0

precision, recall = div(tp, tp + fp), div(tp, tp + fn)
f1 = div(2 * precision * recall, precision + recall)
accuracy = div(tp + tn, tp + fp + fn + tn)
print(f"TP {tp} FP {fp} FN {fn} TN {tn}")
print(f"accuracy {accuracy:.2f} precision {precision:.2f} recall {recall:.2f} f1 {f1:.2f}")`,
          notes: "The edge case shows why: 50% accuracy, but precision and recall of 0 reveal the model never detects spam at all.",
        },
        {
          id: "stretch", kind: "task", title: "Choose k with a validation set", difficulty: 4,
          prompt: `Training points \`x y label\` until \`---\`, validation points until \`---\`, test points until \`end\`. Implement k-NN (Euclidean, majority vote; ties broken by the nearest neighbour's label among the tied labels — simplest: sort neighbours by distance, then label). For k in 1, 3, 5 print \`k=K validation accuracy A\` (2 decimals). Pick the best k (smallest on ties), then print \`chosen k=K test accuracy T\`. Don't look at test data until k is chosen.`,
          starter: r`import math
from collections import Counter
`,
          tests: [
            { label: "Two clusters with noise", input: "1 1 a\n1 2 a\n2 1 a\n2 2 a\n6 6 b\n6 7 b\n7 6 b\n7 7 b\n2 6 b\n1.5 1.5 b\n---\n1.4 1.6 a\n6.5 6.5 b\n2 5 a\n1 1.2 a\n---\n1.8 1.9 a\n6.2 6.8 b\n3 3 a\nend\n", output: "k=1 validation accuracy 0.50\nk=3 validation accuracy 1.00\nk=5 validation accuracy 1.00\nchosen k=3 test accuracy 1.00" },
          ],
          hints: [
            "Read three blocks with a helper read(stop).",
            "Sort training points by (distance, label) and take k.",
            "Counter.most_common keeps first-seen order on ties — so put nearer points first.",
            "best = max over k of accuracy, with smallest k on ties: iterate 1, 3, 5 and update only on strictly greater.",
          ],
          solution: r`import math
from collections import Counter

def read(stop):
    pts = []
    while (line := input()) != stop:
        x, y, label = line.split()
        pts.append(((float(x), float(y)), label))
    return pts

train, valid, test = read("---"), read("---"), read("end")

def predict(point, k):
    nearest = sorted(train, key=lambda item: (math.dist(point, item[0]), item[1]))[:k]
    return Counter(label for _, label in nearest).most_common(1)[0][0]

def accuracy(points, k):
    return sum(predict(p, k) == label for p, label in points) / len(points)

best_k, best = None, -1.0
for k in (1, 3, 5):
    acc = accuracy(valid, k)
    print(f"k={k} validation accuracy {acc:.2f}")
    if acc > best:
        best_k, best = k, acc
print(f"chosen k={best_k} test accuracy {accuracy(test, best_k):.2f}")`,
          notes: "The noisy training points (a 'b' at (1.5, 1.5)) fool k=1; larger k smooths them out. The test score is reported once, after the choice — that's what keeps it honest.",
        },
      ],
      realWorld: "Email providers classify spam, banks flag fraudulent transactions, agritech apps diagnose leaf diseases from photos — and responsible teams publish per-group error rates before deployment.",
      reteach: "k-NN is asking your k nearest neighbours which political party they vote for and assuming you vote the same way. Scaling is making sure 'nearest' means similar in every way, not just similar in salary. The confusion matrix is a scorecard of the four ways the guess can turn out — two right, two wrong — and the wrong ones rarely cost the same.",
      summary: [
        "k-NN: majority label of the k nearest training points; scale features with training statistics.",
        "Confusion matrix → accuracy, precision, recall, F1; accuracy misleads on imbalanced classes.",
        "Choose settings on validation data, report test once; check errors per group for fairness.",
      ],
      libraryCode: [{
        title: "scikit-learn pipeline",
        code: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.metrics import classification_report, confusion_matrix

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())   # scaler is fitted on training folds only
search = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 7]}, cv=5).fit(X_train, y_train)
pred = search.predict(X_test)
print(search.best_params_, confusion_matrix(y_test, pred), classification_report(y_test, pred), sep="\\n")`,
        note: "`pip install scikit-learn` on your own computer. A Pipeline keeps preprocessing inside cross-validation, preventing the leakage you fixed by hand.",
      }],
    },
  ],
  exam: [
    {
      id: "e1", kind: "mcq", difficulty: 3,
      prompt: "A model scores 99% on training data and 61% on test data. This is most likely…",
      options: [
        { text: "Underfitting", why: "Underfitting scores poorly on training data too." },
        { text: "Overfitting", why: "Correct." },
        { text: "A perfect model", why: "The test score says otherwise." },
      ],
      answer: 1,
      hint: "Memorised, not learned.",
      explain: "A big train/test gap means the model fits noise in the training data.",
    },
    {
      id: "e2", kind: "predict", difficulty: 3,
      code: r`import math
print(math.dist((0, 0), (3, 4)), round(math.dist((1, 1), (2, 2)), 3))`,
      answer: "5.0 1.414\n",
      hint: "Pythagoras.",
      explain: "√(3² + 4²) = 5.0 and √2 ≈ 1.414.",
    },
    {
      id: "e3", kind: "fill", difficulty: 3,
      prompt: "Recall = true positives divided by all actual positives.",
      code: r`tp, fn = 45, 5
recall = tp / (tp + ___)
print(recall)`,
      blanks: [["fn"]],
      output: "0.9\n",
      hint: "Actual positives = found + missed.",
      explain: "Recall = TP / (TP + FN) = 45 / 50 = 0.9.",
    },
  ],
  project: {
    id: "project", kind: "project", title: "Mini-project: crop recommender (k-NN from scratch)", difficulty: 4,
    prompt: `Recommend a crop from soil and weather readings. Training rows \`nitrogen,rainfall_mm,temperature,crop\` until \`---\`, then query rows \`nitrogen,rainfall_mm,temperature\` until \`end\`.

- Scale each feature with the **training** mean and population std (statistics.pstdev).
- Predict with k = 3 (sort by distance, then crop name; majority vote, ties to the nearest).
- For each query print \`<crop> (votes v/3, nearest distance d)\` with d to 2 decimals.
- Before the queries, report leave-one-out accuracy on the training data (predict each training row from all the others): \`leave-one-out accuracy: x/n\`.`,
    starter: r`import math, statistics
from collections import Counter
`,
    tests: [
      { label: "Crops", input: "90,200,25,rice\n85,220,26,rice\n95,210,24,rice\n40,60,22,wheat\n45,55,20,wheat\n35,70,21,wheat\n60,100,30,cotton\n65,90,32,cotton\n55,110,31,cotton\n---\n88,205,25\n42,65,21\n62,95,31\n70,150,27\nend\n", output: "leave-one-out accuracy: 9/9\nrice (3/3 votes, nearest distance 0.12)\nwheat (3/3 votes, nearest distance 0.27)\ncotton (3/3 votes, nearest distance 0.27)\nrice (2/3 votes, nearest distance 1.17)" },
    ],
    hints: [
      "Compute means/stds per column from training features only.",
      "A predict(point, rows) function lets you reuse it for leave-one-out (rows = training without row i).",
      "Counter.most_common(1) after sorting neighbours by (distance, crop).",
      "Report the nearest neighbour's scaled distance.",
    ],
    solution: r`import math, statistics
from collections import Counter

rows = []
while (line := input()) != "---":
    *nums, crop = line.split(",")
    rows.append(([float(n) for n in nums], crop))
cols = list(zip(*[f for f, _ in rows]))
means = [statistics.mean(c) for c in cols]
stds = [statistics.pstdev(c) for c in cols]

def scale(f):
    return [(v - m) / s for v, m, s in zip(f, means, stds)]

def predict(features, pool, k=3):
    q = scale(features)
    ranked = sorted(((math.dist(q, scale(f)), crop) for f, crop in pool))[:k]
    crop, votes = Counter(c for _, c in ranked).most_common(1)[0]
    return crop, votes, ranked[0][0]

correct = sum(predict(f, rows[:i] + rows[i + 1:])[0] == crop for i, (f, crop) in enumerate(rows))
print(f"leave-one-out accuracy: {correct}/{len(rows)}")
while (line := input()) != "end":
    crop, votes, nearest = predict([float(n) for n in line.split(",")], rows)
    print(f"{crop} ({votes}/3 votes, nearest distance {nearest:.2f})")`,
    notes: "The last query sits between clusters, so its prediction deserves less trust — the distance tells you that. A real recommender needs far more (and locally collected) data, agronomist review, soil pH and market prices, and clear communication that it's advice, not a guarantee.",
  },
};
