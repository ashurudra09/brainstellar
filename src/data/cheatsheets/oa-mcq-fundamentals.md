---
title: "OA MCQ Fundamentals"
slug: "oa-mcq-fundamentals"
summary: "Formulas, traps and free resources for the four MCQ sections of campus online assessments: aptitude, data interpretation, CS fundamentals, and probability and statistics."
icon: "📝"
tags: ["oa", "aptitude", "cs-fundamentals", "probability", "statistics", "interview-prep"]
updated: "2026-11-09"
---

*The MCQ sections that appear alongside coding in campus OAs for SWE, DS, AI/ML and quant roles. Practice questions for each section are linked at the top of the section.*

<div class="cs-grid">
  <div class="cs-card"><h4>A · Aptitude</h4>Arithmetic, algebra, counting, reasoning, puzzles</div>
  <div class="cs-card"><h4>B · Data interpretation</h4>Charts, tables, caselets, fast calculation</div>
  <div class="cs-card"><h4>C · CS fundamentals</h4>OS, networks, DBMS/SQL, OOP, code output, DSA theory, ML/DL/LLMs</div>
  <div class="cs-card"><h4>D · Probability &amp; statistics</h4>Counting, Bayes, expectation, distributions, inference</div>
</div>

## Test-taking tactics

- **Read the marking scheme first.** With negative marking, guess only when you can eliminate at least half the options (for +1 / −0.25 on 4 options, a blind guess has expected value 0).
- **Triage in one pass.** Answer everything under about 45 seconds, flag the rest, then return. Never spend three minutes on one MCQ while ten easy ones are unread.
- **Work from the options.** Plug options back into equations, check units and parity, and discard any option that's the wrong order of magnitude before you calculate.
- **Approximate first.** Round to two significant figures. Compute exactly only when two options are within about 5% of each other.
- **Code-output questions reward tracing, not recall.** Write down the variable values line by line. Most traps are integer division, operator precedence, aliasing and undefined behaviour.

<div class="cs-callout">"Cannot be determined" and "none of these" are correct more often than people expect when the data is genuinely incomplete, but they're also the classic trap when you just haven't found the trick. Decide which one it is before you pick it.</div>

## A · Aptitude

Practice: [Aptitude questions](/q/aptitude)

### Percentages, profit-loss, SI/CI
```text
Successive changes a% then b%     net = a + b + ab/100        (+20 then −20 → −4%)
Profit %                          on cost price
Discount %                        on marked price
CI − SI, 2 years                  P (r/100)²
```
<div class="cs-callout">A rise of x% then a fall of x% is always a net loss of x²/100 %, never zero.</div>

Resource: [IndiaBix – Profit and Loss](https://www.indiabix.com/aptitude/profit-and-loss/)

### Ratio, mixtures, averages
```text
Alligation         cheap : dear = (dear − mean) : (mean − cheap)
Replacement        x of V litres replaced n times → V (1 − x/V)ⁿ of original left
Chaining ratios    A:B = 2:3, B:C = 4:5 → scale B to LCM → 8:12:15
```
Resource: [IndiaBix – Alligation or Mixture](https://www.indiabix.com/aptitude/alligation-or-mixture/)

### Time, speed, distance
```text
Average speed, equal distances    2ab / (a + b)      (not (a + b)/2)
Relative speed                    same direction: subtract; opposite: add
Train passing a pole              covers its own length
Train passing a platform          covers train + platform
Boats                             still water = (down + up)/2, stream = (down − up)/2
km/h → m/s                        × 5/18
```
Resource: [IndiaBix – Time and Distance](https://www.indiabix.com/aptitude/time-and-distance/)

### Time and work, pipes and cisterns
```text
Total work = LCM of the days, so every rate is an integer
A in 10 days, B in 15 → work 30 → rates 3 + 2 → together 6 days
Leaks and outlets are negative rates
```
Resource: [IndiaBix – Time and Work](https://www.indiabix.com/aptitude/time-and-work/)

### Number system, remainders, divisibility
```text
Last-digit cycles           2, 3, 7, 8 repeat every 4;  4, 9 every 2;  0, 1, 5, 6 fixed
HCF × LCM                   = product (for two numbers)
Number of divisors          p^a q^b → (a+1)(b+1)
Highest power of p in n!    ⌊n/p⌋ + ⌊n/p²⌋ + …   (composite base: factorise, take the min)
Divisible by 11             alternating digit sum ≡ 0 (mod 11)
```
Resource: [IndiaBix – Numbers](https://www.indiabix.com/aptitude/numbers/)

### Progressions and algebra
```text
AP sum             n/2 · (first + last)
GP sum             a (rⁿ − 1)/(r − 1);   infinite, |r| < 1:  a/(1 − r)
Identity           (x+y)² − (x−y)² = 4xy
```
<div class="cs-callout">Plugging the options into the equation is usually faster than solving it.</div>

Resource: [GeeksforGeeks – Sequences and Series](https://www.geeksforgeeks.org/aptitude/sequences-and-series/)

### Geometry and mensuration
```text
Scale a length by k → area × k², volume × k³
Painted cube cut into n³:  3 faces = 8,  2 faces = 12(n−2),  1 face = 6(n−2)²,  0 = (n−2)³
```
Resource: [IndiaBix – Area](https://www.indiabix.com/aptitude/area/)

### Aptitude-level counting and probability
```text
Circular arrangements of n        (n − 1)!
Repeated letters                  n! / (a! b! …)
Items kept together               treat the block as one item, then permute inside it
Inclusion–exclusion (3 sets)      |A∪B∪C| = ΣA − Σ(A∩B) + A∩B∩C
"At least one"                    1 − P(none)
```
Resource: [IndiaBix – Permutation and Combination](https://www.indiabix.com/aptitude/permutation-and-combination/)

### Seating arrangements and puzzles
- Fix the most constrained person first. Draw every case that survives a clue, then prune.
- In circles, left and right depend on whether people face the centre.
- Grid method for scheduling and matching puzzles: rows are people, columns are attributes, and you mark ✓/✗ per clue.

Resources: [GeeksforGeeks – Seating Arrangement](https://www.geeksforgeeks.org/aptitude/seating-arrangement/), [GeeksforGeeks – Puzzles](https://www.geeksforgeeks.org/aptitude/puzzles/)

### Syllogisms
- Draw Venn diagrams. A conclusion follows only if it is true in **every** possible diagram.
- "Some A are B" never implies "Some A are not B".
- When two conclusions are complementary ("some A are C" / "no A is C"), the answer is often "either follows".

Resource: [IndiaBix – Syllogism](https://www.indiabix.com/verbal-reasoning/syllogism/)

### Series, coding-decoding, blood relations, directions
- Series: try differences, then second differences, then ratios, then alternating sub-series. n² ± n, n³ ± 1 and primes are common.
- Letter codes: write the positions (A = 1 … Z = 26) and look for a shift or a reversal (A ↔ Z: 27 − n).
- Blood relations: draw a family tree with gender marks.
- Directions: track (x, y) and the facing direction, and use Pythagoras for the final distance.

Resource: [IndiaBix – Number Series](https://www.indiabix.com/logical-reasoning/number-series/)

### Clocks and calendars
```text
Angle between hands      |30H − 5.5M|      (take 360 − θ if > 180)
Hands overlap            every 65 5/11 minutes
Odd days                 normal year 1, leap year 2; century leap only if divisible by 400
```
Resource: [IndiaBix – Clock](https://www.indiabix.com/aptitude/clock/)

### Data sufficiency
Test statement 1 alone, then 2 alone, then both together. Decide only whether a **unique** answer exists; don't finish solving.

Resource: [IndiaBix – Data Sufficiency](https://www.indiabix.com/data-sufficiency/questions-and-answers/)

## B · Data interpretation

Practice: [Aptitude → data-interpretation](/q/aptitude)

| Type | Fast move |
|---|---|
| Bar, line, pie | Pie: 1% = 3.6°. Growth % = (new − old)/old. Read the axis scale and units before the bars. |
| Tables | Read the units and the totals row first. Same absolute rise on a smaller base means larger % growth. |
| Caselets | Turn the paragraph into a small table or Venn diagram before reading the questions. |
| Candlesticks | Each candle shows open, high, low and close. Green/hollow means close > open; red/filled means close < open. Wicks are the high and low. |

```text
Fractions to memorise   1/6 = 16.7%   1/7 = 14.3%   1/8 = 12.5%   1/9 = 11.1%   1/11 = 9.1%   1/12 = 8.3%
Squares                 to 30²;  (a ± b)² = a² ± 2ab + b²;  (a − b)(a + b) = a² − b²
```
<div class="cs-callout">"Highest growth" questions almost always mean percentage growth, not absolute growth. Check which one the question asks for.</div>

Resources: [IndiaBix – Bar Charts](https://www.indiabix.com/data-interpretation/bar-charts/), [IndiaBix – Table Charts](https://www.indiabix.com/data-interpretation/table-charts/), [Zetamac arithmetic drill](https://arithmetic.zetamac.com/)

## C · CS fundamentals

Practice: [OS & Networks](/q/os-networks) · [SQL](/q/sql) · [LLD & OOP](/q/lld) · [DSA](/q/dsa) · [Language-Specific](/q/language-specific) · [AI/ML](/q/ai-ml)

### Operating systems
```text
fork() n times in sequence       2ⁿ processes (including the parent)
Waiting time                     SJF/SRTF is optimal; RR with a huge quantum = FCFS
Deadlock conditions              mutual exclusion, hold and wait, no preemption, circular wait
No-deadlock resource bound       n processes each needing k → n(k − 1) + 1 units
Effective access time (TLB)      h(t + m) + (1 − h)(t + 2m)
Page table size                  (virtual space / page size) × entry size
Counting semaphore               final = initial − P + V
```
<div class="cs-callout">Belady's anomaly (more frames giving more faults) happens only with FIFO, never with LRU or optimal.</div>

Resource: [OSTEP (free book)](https://pages.cs.wisc.edu/~remzi/OSTEP/)

### Computer networks
```text
Layers           router L3, switch L2, hub L1;  TCP/UDP L4
Subnet /n        2^(32−n) − 2 usable hosts
Handshake        SYN → SYN-ACK → ACK
Go-Back-N        window ≤ 2^k − 1;  Selective Repeat ≤ 2^(k−1)
DNS              UDP 53 (TCP for large responses / zone transfers);  HTTP/3 runs on QUIC over UDP
Idempotent       GET, PUT, DELETE (not POST);   401 = not authenticated, 403 = authenticated but forbidden
```
Resource: [GATE Overflow – Computer Networks](https://gateoverflow.in/tag/computer-networks)

### DBMS theory and SQL output
```text
Normal forms      2NF: no partial dependency;  3NF: no transitive dependency;  BCNF: every determinant is a superkey
Execution order   FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
NULLs             COUNT(*) counts rows, COUNT(col) skips NULLs;  GROUP BY puts all NULLs in one group
Ranking           ROW_NUMBER 1,2,3,4   RANK 1,2,2,4   DENSE_RANK 1,2,2,3
Joins             CROSS = m × n rows;  LEFT JOIN with duplicate matches repeats the left row
Isolation         READ COMMITTED stops dirty reads, still allows non-repeatable reads
Indexes           B+ tree for ranges; composite (a, b, c) helps only queries filtering on a leading prefix
DELETE / TRUNCATE / DROP    DML with WHERE / DDL, all rows, fast / removes the table
```
<div class="cs-callout">Integer division bites in SQL too: <code>SELECT 7 / 2</code> is 3 in PostgreSQL. Cast one side to get 3.5.</div>

Resources: [GATE Overflow – Databases](https://gateoverflow.in/tag/databases), [SQLBolt](https://sqlbolt.com/)

### OOP
- Overloading is resolved at compile time. Overriding through `virtual` is resolved at runtime.
- Constructors run base → derived; destructors run derived → base.
- Deleting a derived object through a base pointer needs a **virtual destructor**, or the behaviour is undefined.
- Constructors can't be virtual. A virtual call made inside a constructor runs the base version.
- Passing by value slices a derived object down to the base type.

Resource: [GeeksforGeeks – OOP quiz](https://www.geeksforgeeks.org/quizzes/object-oriented-programming-oops-gq/)

### Code output: C and C++
| Trap | Example |
|---|---|
| Arrays decay to pointers | `sizeof(a)` inside a function is the pointer size (8 on 64-bit). |
| Macros are text substitution | `SQ(2+3)` with `x*x` gives 11. |
| Signed/unsigned comparison | `-1 < 1u` is false. |
| `sizeof('a')` | 4 in C (an int), 1 in C++. |
| Integer division before assignment | `float x = 7/2` gives 3.0. |
| `printf` returns the number of characters printed | |
| Modifying a variable twice without a sequence point | `i = i++ + ++i` is undefined behaviour. |
| Struct padding | Members are aligned to their size. |
| Default access | `class` members and bases are private; `struct` ones are public. |
| Member initialisation order | Members are initialised in declaration order, not initialiser-list order. |

Resources: [GeeksforGeeks – C quiz](https://www.geeksforgeeks.org/quizzes/c-gq/), [GeeksforGeeks – C++ quiz](https://www.geeksforgeeks.org/quizzes/c-plus-plus-gq/)

### Code output: Java
- `==` compares references. String literals are pooled; `new String` is not.
- `Integer` is cached for −128…127, so `==` on 128 is false.
- `1 + 2 + "3" + 4 + 5` gives `"3345"`, because evaluation runs left to right.
- A `return` in `finally` overrides the one in `try`.
- Initialisation order: static blocks, then instance blocks, then the constructor; the parent constructor runs first.
- Overload resolution prefers widening over boxing over varargs.
- Java passes references by value.

Resource: [GeeksforGeeks – Java quiz](https://www.geeksforgeeks.org/quizzes/java-gq/)

### Code output: Python
- Default arguments are evaluated once, so a mutable default is shared across calls.
- `[[0]*2]*2` aliases the same inner list.
- `b += [3]` mutates an aliased list in place.
- Lambdas in a loop bind late, so `[lambda: i for i in range(3)]` all return 2.
- `-7 // 2 == -4` and `-7 % 2 == 1`: floor division rounds toward −∞.
- A generator can be consumed only once.
- `1`, `True` and `1.0` hash equal, so they collapse to one dict key.
- `list.sort()` returns `None`.

Resource: [GeeksforGeeks – Python quiz](https://www.geeksforgeeks.org/quizzes/python-gq/)

### DSA theory
```text
Master theorem     T(n) = aT(n/b) + f(n): compare f(n) with n^(log_b a)
Common             T(n/2)+1 → log n;  T(n/2)+n → n;  T(n−1)+n → n²;  2T(n/2)+n → n log n
Harmonic loop      for i, for j += i  → n log n;   doubling outer loop with inner j < i → n
Stable sorts       merge, insertion, bubble, counting  (not quick, heap, selection)
Heap build         bottom-up O(n), not O(n log n)
BSTs on n keys     Catalan Cₙ:  1, 1, 2, 5, 14, 42
Graphs             complete graph n(n−1)/2 edges;  topological order ⟺ DAG;  Dijkstra fails with negative edges
```
Resource: [GATE Overflow – Algorithms](https://gateoverflow.in/tag/algorithms)

### Digital logic and computer organisation
```text
Two's complement of −x     invert the bits of x, then add 1        (−5 → 11111011)
Pipeline, k stages, n instrs   k + n − 1 cycles;  speedup → k as n grows
Cache AMAT                 hit time + miss rate × miss penalty
```
Resource: [GATE Overflow – Digital Logic](https://gateoverflow.in/tag/digital-logic)

### Classical ML
```text
Precision = TP/(TP+FP)    Recall = TP/(TP+FN)    F1 = harmonic mean    FPR = FP/(FP+TN)
Bias-variance             high train, low test accuracy = overfitting (variance)
Regularisation            L1 → sparse (exact zeros), L2 → shrinks everything smoothly
Ensembles                 bagging/random forest cut variance; boosting cuts bias
Entropy                   −Σ p log₂ p   (4+/4− → 1 bit)
PCA                       eigenvectors of the covariance matrix; standardise features first
k-fold CV on N samples    each fold trains on N(k−1)/k
```
<div class="cs-callout">Accuracy is the least useful metric on imbalanced data: at 1% fraud, predicting "never fraud" scores 99%. Use precision/recall or PR-AUC. And time series need forward-chaining CV, never shuffled folds.</div>

Resource: [StatQuest (YouTube)](https://www.youtube.com/@statquest)

### Deep learning
```text
Conv output        ⌊(W − K + 2P)/S⌋ + 1        (32, K=5, P=0, S=1 → 28)
Conv params        (K·K·C_in + 1) · C_out
Sigmoid'           σ(x)(1 − σ(x)), at most 0.25 → vanishing gradients in deep stacks
Softmax            outputs in (0, 1), sum to 1
Init               Xavier for tanh/sigmoid, He for ReLU
```
Resource: [Dive into Deep Learning](https://d2l.ai/)

### LLMs and GenAI
```text
Attention           softmax(QKᵀ / √d_k) V;  cost O(n² d) in sequence length n
Why √d_k            keeps dot-product variance near 1 so softmax doesn't saturate
LoRA                freeze W, train low-rank B·A (rank r ≪ d);  QLoRA = LoRA on a 4-bit base
RAG                 retrieve relevant chunks by embedding similarity, put them in the prompt
Agents              the model emits a tool call; the surrounding program runs it and returns the result
```
Resource: [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)

## D · Probability and statistics

Practice: [Probability & Statistics](/q/prob-stats) · story-style puzzles in [Quant Puzzles](/q/quant)

### Counting
```text
Stars and bars       x₁ + … + x_k = n, xᵢ ≥ 0  →  C(n + k − 1, k − 1)
Complement           P(at least one) = 1 − P(none)
Inclusion–exclusion  for "neither / none of" counts
```
Resource: [Harvard Stat 110](https://projects.iq.harvard.edu/stat110/home)

### Conditional probability and Bayes
```text
Bayes          P(A|B) = P(B|A) P(A) / P(B)
Odds form      posterior odds = prior odds × likelihood ratio
Exactly one    of independent A, B:  P(A)(1 − P(B)) + P(B)(1 − P(A))
```
<div class="cs-callout">Write it as counts out of 1000 people. Base rates dominate whenever the condition is rare.</div>

Resource: [Harvard Stat 110](https://projects.iq.harvard.edu/stat110/home)

### Expectation
```text
Linearity            E[X + Y] = E[X] + E[Y], even when dependent → sum of indicators
Geometric            expected trials to first success = 1/p
Coupon collector     n (1 + 1/2 + … + 1/n)        (die: 14.7 rolls)
Fixed points         a random permutation has 1 fixed point on average
Patterns             E[flips to HH] = 6,  E[flips to HT] = 4
```
Resource: [Brilliant – Linearity of Expectation](https://brilliant.org/wiki/linearity-of-expectation/)

### Geometric probability
```text
Probability = favourable area / total area
Two uniform points on [0,1]:  P(|X − Y| < t) = 1 − (1 − t)²
Stick broken at two random points forms a triangle with probability 1/4
```
Resource: [Seeing Theory](https://seeing-theory.brown.edu/)

### Random walks and Markov chains
```text
Fair gambler's ruin from i, target N     P(reach N) = i/N
Hitting times                             E_i = 1 + Σ_j P_ij E_j  → solve the linear system
Stationary distribution                   πP = π,  Σ π = 1  (birth–death: detailed balance)
```
Resource: [Harvard Stat 110](https://projects.iq.harvard.edu/stat110/home)

### Distributions, variance and limit theorems
| Distribution | Mean | Variance |
|---|---|---|
| Bernoulli(p) | p | p(1 − p) |
| Binomial(n, p) | np | np(1 − p) |
| Poisson(λ) | λ | λ |
| Geometric(p) | 1/p | (1 − p)/p² |
| Uniform(a, b) | (a + b)/2 | (b − a)²/12 |
| Exponential(λ) | 1/λ | 1/λ² (memoryless) |
| Normal(μ, σ²) | μ | σ² (68–95–99.7 rule) |

```text
Var(aX + bY) = a² Var X + b² Var Y + 2ab Cov(X, Y)
Sum of independent normals is normal: means add, variances add
Standard error of the mean = σ / √n;  CLT: the sample mean is ≈ normal for large n
```
<div class="cs-callout">Zero correlation does not imply independence. And correlation doesn't change under positive linear rescaling.</div>

Resource: [OpenIntro Statistics (free book)](https://www.openintro.org/book/os/)

### Inference, estimation and regression
```text
p-value         P(data at least this extreme | H₀)
Errors          Type I = false positive (α);  Type II = false negative (β);  power = 1 − β
z for a mean    (x̄ − μ₀) / (s/√n);   95% CI = x̄ ± 1.96 · SE
MLE             maximise the log-likelihood;  Bernoulli MLE = sample mean
Unbiased        sample variance divides by n − 1
OLS slope       Cov(x, y) / Var(x);   R² = 1 − SSE/SST, never falls when you add a feature
Bias-variance   E[error] = bias² + variance + noise
```
Resources: [OpenIntro Statistics](https://www.openintro.org/book/os/), [ISLP](https://www.statlearning.com/)

### Mental-maths speed tests
- Quant firms run timed arithmetic sections (often around 80 questions in 8 minutes, with negative marking).
- Drill decimals, fractions and two-digit multiplication daily.
- Use (a − b)(a + b) = a² − b², so 37 × 43 = 1600 − 9.
- Treat percentages as fractions: 1.2% of 4500 = 45 + 9.

Resources: [TraderMath](https://tradermath.org/), [Zetamac](https://arithmetic.zetamac.com/)
