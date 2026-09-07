---
title: "Graviton Reflex Sheet"
slug: "graviton-reflex-sheet"
summary: "Probability and statistics reflexes for a quant assessment: conditioning, counting, expectation, distributions, inference, Markov chains, stopping, optimising, and invariants."
icon: "🎲"
tags: ["quant", "probability", "statistics", "interview-prep"]
updated: "2026-09-07"
---

*Probability and statistics, compressed from a prep plan. Algorithms, graph theory and linear algebra are deliberately left out.*

<div class="cs-grid">
  <div class="cs-card"><h4>01</h4>Condition on something</div>
  <div class="cs-card"><h4>02</h4>Write it as indicators</div>
  <div class="cs-card"><h4>03</h4>Look for symmetry</div>
</div>

## &sect;1 Conditioning & Bayes

```text
Total probability      P(A) = Σᵢ P(A | Bᵢ) P(Bᵢ)   over a partition
Bayes                   P(B | A) = P(A | B) P(B) / P(A)
Odds form — use this    posterior odds = prior odds × likelihood ratio
Chain rule              P(A ∩ B) = P(A | B) · P(B)
```

<div class="cs-callout">First move when stuck: condition on the first step, the first pick, or the pivotal element.</div>

**Odds form, worked.** Prior odds 1:9; a test with likelihood ratio $P(+|D)/P(+|\lnot D) = 0.9/0.1 = 9$ gives posterior odds $9:9 = 1:1$, so $P = 1/2$. No denominators ever computed.

<div class="cs-callout">

**The mechanism trap.** The answer depends on **how you learned** the fact, not on the fact itself.

- "At least one child is a girl" &rarr; $P(\text{both girls}) = 1/3$.
- "The elder is a girl" &rarr; $1/2$.
- "I met one of the two at random and she is a girl" &rarr; $1/2$.
- Monty Hall: the host's *rule* &mdash; always opens a goat door, knowing where the car is &mdash; is what makes switching $2/3$. A host opening at random gives $1/2$.

Always ask: *what was the sampling mechanism that revealed this?*

</div>

### Shapes in the drill set

- **Compounding over sub-intervals** (13 &middot; Half Time): $P(\text{none in } T) = \prod P(\text{none in each sub-interval})$.
- **Conditioning on an arrival window** (20 &middot; Train to Catch): condition on the continuous arrival time, then integrate.
- **Symmetry beating the sum** (1002 &middot; To Begin or Not to Begin): first-move games often collapse to a one-line parity argument instead of a series.

## &sect;2 Counting

| Tool | Form |
|---|---|
| Combinations | $C(n,k) = n!/(k!(n-k)!)$ |
| Permutations | $P(n,k) = n!/(n-k)!$ |
| Stars and bars | $x_1+\dots+x_k=n$, non-negative &rarr; $C(n+k-1,\,k-1)$ |
| Strictly positive | $C(n-1,\,k-1)$ |
| Inclusion&ndash;exclusion | $\lvert A\cup B\rvert = \lvert A\rvert+\lvert B\rvert-\lvert A\cap B\rvert$, alternating signs for more sets |
| Multinomial | $n!/(n_1!\,n_2!\,\dots\,n_k!)$ |
| Complementary | count the bad cases when the good ones branch |

<div class="cs-callout">The symmetry move. "What fraction of all orderings are favourable?" collapses many problems to one line. Reach for it <em>before</em> you sum — if you are writing a long sum, you probably missed a symmetry.</div>

**Geometric probability.** When the sample space is continuous &mdash; two people arrive uniformly in an hour and meet if within fifteen minutes &mdash; draw the square and take an **area ratio**. Same reflex for 112 &middot; Random Ratio and 30 &middot; Witches at the Coffee Shop. A very common OA shape.

**Parity and colouring.** Domino covering and its relatives: find the quantity that cannot change. See &sect;9.

## &sect;3 Expectation

**Linearity holds without independence.** $E[X+Y] = E[X] + E[Y]$, always. The single highest-yield fact in the assessment. Say it out loud.

### Indicator method

Write the count as $X = \sum_i \mathbf{1}\{\text{event } i\}$, then $E[X] = \sum_i P(\text{event } i)$. This kills almost every "expected number of&hellip;" question.

- **Double heads in $n$ flips:** $n-1$ adjacent pairs, each HH with probability $1/4$ &rarr; $(n-1)/4$.
- **Matching letters and envelopes:** $E[\text{matches}] = n \cdot (1/n) = 1$, even though the match events are **dependent**. The cleanest illustration of linearity without independence.
- **Random permutation,** positions where $i$ sits adjacent to $i+1$: set up the indicator per adjacent slot; don't guess the answer.
- **Expected white vertices** in the minimal subtree spanning all black vertices: $E = \sum_v P(v \text{ white} \land v \in G)$. Never try to describe the random object $G$ itself.

### First-step / recursive analysis

Let $E$ be the answer, condition on the first move, write $E$ in terms of itself, solve.

```text
Flips until HH    E = ½(1 + E_H) + ½(1 + E),  E_H = ½·1 + ½(1 + E)  →  E = 6
k heads in a row  fair coin: 2^(k+1) − 2
Absorption        one equation per transient state, solve the linear system
```

### Standard results

| Result | Value |
|---|---|
| Waiting time to first success | $1/p$ |
| Coupon collector, $n$ coupons | $n(1+1/2+\dots+1/n) \approx n\ln n$ |
| Wald's identity | $E[\sum_{i=1}^N X_i] = E[N]\cdot E[X]$ for a stopping time $N$ |
| Tail sum, $X$ a non-negative integer | $E[X] = \sum_{k\ge1} P(X\ge k)$ |
| Total expectation | $E[X] = E[E[X\vert Y]]$ |
| Total variance | $\mathrm{Var}(X) = E[\mathrm{Var}(X\vert Y)] + \mathrm{Var}(E[X\vert Y])$ |

## &sect;4 Distributions

| Distribution | Mean | Variance | Shows up when |
|---|---|---|---|
| Bernoulli($p$) | $p$ | $p(1-p)$ | single yes/no |
| Binomial($n,p$) | $np$ | $np(1-p)$ | fixed trials, count successes |
| Geometric($p$) | $1/p$ | $(1-p)/p^2$ | trials until first success |
| Neg. binomial($r,p$) | $r/p$ | $r(1-p)/p^2$ | trials until the $r$-th success |
| Poisson($\lambda$) | $\lambda$ | $\lambda$ | rare events in a fixed window |
| Exponential($\lambda$) | $1/\lambda$ | $1/\lambda^2$ | continuous waiting time |
| Uniform($a,b$) | $(a+b)/2$ | $(b-a)^2/12$ | "a random point on&hellip;" |
| Normal($\mu,\sigma^2$) | $\mu$ | $\sigma^2$ | sums and averages of many things |
| Beta($\alpha,\beta$) | $\alpha/(\alpha+\beta)$ | &mdash; | prior on an unknown probability |

**Memorylessness &mdash; geometric and exponential only.** $P(X>s+t \mid X>s) = P(X>t)$. If a problem says "given it has already lasted $t$&hellip;", check this first; it often makes the answer trivial.

**Order statistics** of $n$ iid $U[0,1]$: $E[X_{(k)}] = k/(n+1)$. The max is $n/(n+1)$, the min is $1/(n+1)$, and the $n+1$ gaps are equal in expectation.

**Poisson &harr; exponential.** If events arrive Poisson($\lambda$) per unit time, inter-arrival times are Exponential($\lambda$). The minimum of independent exponentials is exponential with rate $\sum \lambda_i$.

## &sect;5 Statistics & inference

### Variance algebra

```text
Var(X)     = E[X²] − (E[X])²
Var(aX+b)  = a² Var(X)              the b never matters
Var(X+Y)   = Var(X) + Var(Y) + 2Cov(X,Y)
Cov(X,Y)   = E[XY] − E[X]E[Y]       Cov(aX,bY) = ab·Cov(X,Y)
Sample mean of n iid: mean μ, variance σ²/n
```

### CLT and standard error

The sample mean of $n$ iid draws is approximately $\mathrm{Normal}(\mu, \sigma^2/n)$, so $SE = \sigma/\sqrt n$. **Halving the error needs $4n$; quartering it needs $16n$.**

### Estimators

- **Unbiased:** $E[\hat\theta] = \theta$. **Consistent:** $\hat\theta \to \theta$ in probability as $n\to\infty$. Different properties &mdash; an estimator can have either without the other. $\hat\theta = X_1$ is unbiased but not consistent; $\hat\theta = \bar X + 1/n$ is consistent but biased.
- **Sample variance divides by $n-1$** (Bessel) to be unbiased for $\sigma^2$.
- **MSE = bias&sup2; + variance.** A biased estimator can beat an unbiased one.

### MLE recipe

Write the likelihood, take the log, differentiate, set to zero.

```text
Exponential  ℓ(λ) = n ln λ − λΣxᵢ   →   λ̂ = 1/x̄
Bernoulli    p̂ = x̄
Normal       μ̂ = x̄,  σ̂² = Σ(xᵢ−x̄)²/n   — note: the biased version
```

### Bayesian conjugacy

A $\mathrm{Beta}(\alpha,\beta)$ prior with $k$ successes in $n$ binomial trials gives posterior $\mathrm{Beta}(\alpha+k,\,\beta+n-k)$. Posterior mean $(\alpha+k)/(\alpha+\beta+n)$ &mdash; a weighted average of the prior mean and $k/n$.

### Correlation & regression

- $\rho = \mathrm{Cov}(X,Y)/(\sigma_X\sigma_Y)$, always in $[-1,1]$. Covariance carries units, correlation doesn't.
- **OLS slope $\beta = \mathrm{Cov}(X,Y)/\mathrm{Var}(X)$**; intercept $\alpha = \bar y - \beta \bar x$.
- $R^2$ is the fraction of variance explained; in **simple** regression $R^2 = \rho^2$.
- **Zero correlation &ne; independence.** $Y=X^2$ with $X$ symmetric about 0 has $\rho=0$ and total dependence.

<div class="cs-callout">

**The two questions that separate candidates.**

**Regression to the mean** is a statistical artefact of imperfect correlation, not a causal force. Top performers being praised and then doing worse implies **nothing** about the praise. Correct answer: no causal conclusion follows.

**The p-value is $P(\text{data at least this extreme} \mid H_0 \text{ true})$, not $P(H_0 \text{ true} \mid \text{data})$.** It is not the probability the result was a fluke, and $p=0.05$ does not mean a 5% chance the null is true. Correct answer: that inference does not follow.

</div>

## &sect;6 Markov chains & stationary distributions

<div class="cs-callout">Birth&ndash;death chain &rArr; detailed balance. Self-loops never appear in the balance equations — the "stay" probabilities are red herrings. Don't write the full generator.</div>

```text
Detailed balance   πᵢ · p(i→i+1) = π_{i+1} · p(i+1→i)

A2, as asked       up 0.2 / down 0.3  →  π_{i+1} = (2/3)πᵢ  →  πᵢ = π₀(2/3)ⁱ
                   π₀ / (1 − 2/3) = 3π₀ = 1   →   π₀ = 1/3

Same shape         up 0.3 / down 0.4  →  ratio 3/4,  π₀ = 1/4
                   expected position  Σ i(3/4)ⁱ(1/4) = 3
```

**Sums worth having cold:** $\sum_{i\ge0} r^i = 1/(1-r)$ and $\sum_{i\ge0} i\,r^i = r/(1-r)^2$.

**Absorption and expected hitting time:** $E_i = 1 + \sum_j p_{ij} E_j$ for each transient state, with $E=0$ at absorbing states.

## &sect;7 Optimal stopping by indifference

<div class="cs-callout">The reflex: at the optimal threshold you are exactly <em>indifferent</em> between keeping the current draw and continuing. That equation pins the threshold. The gradeable skill is setting up the indifference equation, not the arithmetic.</div>

```text
U[0,1], at most three draws, keep the last
1 draw left    E = 1/2
2 left         keep above 1/2   →  E = ½(3/4) + ½(1/2) = 5/8
3 left         keep above 5/8   →  E = (3/8)(13/16) + (5/8)(5/8) ≈ 0.6953
```

**The threshold at each stage equals the value of continuing.** That sentence is the whole method.

## &sect;8 Optimising a probability over a chosen set

Maximise $P(\text{exactly one selected})$ from $N$ independent candidates with probabilities $p_i$. Track two numbers: $f = P(\text{exactly one})$ and $g = P(\text{none})$.

```text
Adding a candidate with probability p
f ← f(1−p) + g·p
g ← g(1−p)

Adding helps iff  f(1−p) + gp > f   ⟺   g > f   — independent of p
```

**Algorithm:** sort $p$ descending, add one at a time, stop as soon as $P(\text{none}) \le P(\text{exactly one})$. $O(N\log N)$. The elegance is that the stopping rule never references $p$ at all &mdash; say that out loud.

**The contrast that is the lesson.** $P(\text{at least one})$ is monotone increasing in the set, so you recommend **everyone** &mdash; trivial, no trade-off. "Exactly one" is non-monotone, which is what made the problem interesting. $P(\text{exactly two})$ needs three tracked quantities and the clean $g>f$ rule no longer holds.

## &sect;9 Invariants & parity

<div class="cs-callout">The reflex: find the quantity that cannot change.</div>

- **Numbers 1&hellip;50, replace $a,b$ with $\lvert a-b\rvert$.** Since $\lvert a-b\rvert \equiv a+b \pmod 2$, the parity of the total is invariant. $1+\dots+50=1275$ is odd, so the final value is odd and at most 50 &mdash; exactly $\{1,3,\dots,49\}$.
- **Chameleons 13 / 15 / 17.** The pairwise differences **mod 3** are invariant; they start all distinct mod 3, so a monochromatic state is unreachable. **No.**
- **Deterministic process on a finite state space** either halts or cycles. Rule out cycles with a **monovariant** &mdash; a strictly decreasing quantity &mdash; and termination follows.
- **Pigeonhole on prefix sums.** $S_0 \dots S_n$ are $n+1$ values in $n$ residue classes mod $n$, so two coincide and the contiguous block between them is divisible by $n$.

## &sect;10 One screen &mdash; read this last

<div class="cs-grid">

<div class="cs-card">

#### Conditioning

$P(A)=\sum P(A\vert B_i)P(B_i)$ &middot; odds-form Bayes &middot; always ask <em>how</em> the information was revealed.

</div>

<div class="cs-card">

#### Counting

$C(n,k)$ &middot; stars and bars $C(n+k-1,k-1)$ &middot; inclusion&ndash;exclusion &middot; count the complement &middot; symmetry before summing &middot; continuous &rArr; area ratio.

</div>

<div class="cs-card">

#### Expectation

Linearity needs no independence &middot; $E[\text{count}]=\sum P(\text{event}_i)$ &middot; first-step recursion &middot; waiting time $1/p$ &middot; coupon collector $\approx n\ln n$ &middot; $E[X_{(k)}]=k/(n+1)$ for $U[0,1]$.

</div>

<div class="cs-card">

#### Distributions

Binomial $np, np(1-p)$ &middot; geometric $1/p, (1-p)/p^2$ &middot; Poisson $\lambda,\lambda$ &middot; exponential $1/\lambda, 1/\lambda^2$ &middot; uniform $(a+b)/2, (b-a)^2/12$ &middot; memorylessness &rArr; geometric and exponential only.

</div>

<div class="cs-card">

#### Statistics

$\bar X \sim N(\mu,\sigma^2/n)$ &middot; $SE=\sigma/\sqrt n$, 4&times; the data halves it &middot; sample variance divides by $n-1$ &middot; MLE = log, differentiate, solve &middot; $\mathrm{Var}(aX+b)=a^2\mathrm{Var}(X)$ &middot; $\beta=\mathrm{Cov}(X,Y)/\mathrm{Var}(X)$ &middot; $R^2=\rho^2$ in simple regression &middot; zero correlation &ne; independence &middot; regression to the mean &ne; causation &middot; p-value &ne; $P(H_0\text{ true})$.

</div>

<div class="cs-card">

#### Markov

Birth&ndash;death &rArr; detailed balance, ignore the self-loops &middot; absorption &rArr; one equation per transient state.

</div>

<div class="cs-card">

#### Stopping

The threshold <em>is</em> the value of continuing; solve by indifference.

</div>

</div>

---

*Drawn from a prep plan's probability and statistics blocks. Morning rule: re-read this, then stop. Do not attempt new hard puzzles before the assessment.*
