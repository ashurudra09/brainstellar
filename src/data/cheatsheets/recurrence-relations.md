---
title: "Recurrence Relations"
slug: "recurrence-relations"
summary: "Seven recurrence-relation shapes that cover almost everything you'll meet in a quant or algorithms interview, each with the method that cracks it."
icon: "🔁"
tags: ["algorithms", "math", "interview-prep"]
updated: "2026-09-07"
---

## Spot the shape, jump to the method

| If it looks like... | It's | Use |
|---|---|---|
| $a_n = c_1 a_{n-1} + \dots + c_k a_{n-k}$ | 1 | Linear homogeneous &rarr; characteristic equation |
| same, plus a leftover term $+ f(n)$ | 2 | Nonhomogeneous &rarr; homogeneous + particular solution |
| $T(n) = a \cdot T(n/b) + f(n)$ | 3 | Divide & conquer &rarr; Master theorem |
| sum over all ways to split $n$ into two parts | 4 | Combinatorial convolution &rarr; generating functions |
| $a_n = a_{n-1} + f(n)$, one term, additive | 5 | Telescoping &rarr; sum both sides |
| depends on neighbors *both* ways, with edge conditions | 6 | Boundary-value &rarr; same algebra, fit boundaries not $a_0, a_1$ |
| squares, ratios, or radicals of $a_{n-1}$ | 7 | Nonlinear &rarr; substitute to linearize |

<div class="cs-grid">

<div class="cs-card">

### 1 &middot; Linear homogeneous <span class="cs-pill">constant coeff.</span>

$$a_n = c_1 a_{n-1} + c_2 a_{n-2} + \dots + c_k a_{n-k}$$

**Method &mdash; characteristic equation**
1. Guess $a_n = r^n$, substitute, divide out $r^{n-k}$ &rarr; polynomial $x^k = c_1 x^{k-1} + \dots + c_k$.
2. Find its roots $r_1, \dots, r_k$.
3. Distinct real roots: $a_n = A_1 r_1^n + \dots + A_k r_k^n$
4. Root $r$ with multiplicity $m$: terms $(A_0 + A_1 n + \dots + A_{m-1} n^{m-1}) r^n$
5. Complex pair $re^{\pm i\theta}$: $r^n(A\cos n\theta + B\sin n\theta)$
6. Fit $A$'s using the $k$ given initial values.

**Worked example**: Fibonacci $a_n = a_{n-1} + a_{n-2}$: $x^2 = x + 1$ gives roots $\phi, \psi = (1 \pm \sqrt5)/2$. Fitting $a_0=0, a_1=1$ &rarr; Binet's formula $a_n = (\phi^n - \psi^n)/\sqrt5$.

</div>

<div class="cs-card">

### 2 &middot; Linear nonhomogeneous <span class="cs-pill">constant coeff.</span>

$$a_n = c_1 a_{n-1} + \dots + c_k a_{n-k} + f(n)$$

**Method &mdash; homogeneous + particular**
1. Solve the homogeneous part (method 1) &rarr; $a_n^{(h)}$.
2. Guess a particular solution $a_n^{(p)}$ shaped like $f(n)$: polynomial deg $d$ &rarr; try polynomial deg $d$; $d^n$ &rarr; try $A \cdot d^n$.
3. If your guess collides with a root of the characteristic equation, multiply the guess by $n$ (or $n^2, \dots$) until it doesn't.
4. $a_n = a_n^{(h)} + a_n^{(p)}$, then fit constants to the actual initial values.

**Worked example**: $a_n = 2a_{n-1} + 3$, $a_0=1$. Homogeneous: $A \cdot 2^n$. Particular: try constant $p$ &rarr; $p = 2p+3$ &rarr; $p=-3$. General $a_n = A \cdot 2^n - 3$, $a_0=1$ &rarr; $A=4$, so $a_n = 4 \cdot 2^n - 3$.

</div>

<div class="cs-card">

### 3 &middot; Divide & conquer <span class="cs-pill">master theorem</span>

$$T(n) = a \cdot T(n/b) + f(n)$$

**Method &mdash; compare $f(n)$ to $n^{\log_b a}$**
1. Work is $n^c$ where $c = \log_b a$.
2. $f(n) = O(n^{c-\epsilon})$ &rarr; $T(n) = \Theta(n^c)$ &mdash; leaves dominate.
3. $f(n) = \Theta(n^c \log^k n)$ &rarr; $T(n) = \Theta(n^c \log^{k+1} n)$ &mdash; balanced.
4. $f(n) = \Omega(n^{c+\epsilon})$, plus regularity &rarr; $T(n) = \Theta(f(n))$ &mdash; root dominates.
5. Doesn't fit cleanly (e.g. $a\,T(n/2) + n/\log n$)? Unroll the recursion tree by hand, or reach for Akra&ndash;Bazzi.

**Worked example**: Mergesort: $T(n) = 2T(n/2) + n$. $c = \log_2 2 = 1$, $f(n) = \Theta(n^1 \log^0 n)$ &rarr; case 2, $k=0$ &rarr; $T(n) = \Theta(n\log n)$.

</div>

<div class="cs-card">

### 4 &middot; Combinatorial / counting <span class="cs-pill">generating fns</span>

$$C_n = \sum_{i=0}^{n-1} C_i C_{n-1-i} \quad \text{(convolution)}$$

**Method &mdash; generating functions**
1. Define $G(x) = \sum a_n x^n$.
2. Multiply the recurrence by $x^n$ and sum over all valid $n$.
3. Rewrite the sums as closed forms in $G(x)$: a shift &rarr; $x \cdot G(x)$; a convolution &rarr; $G(x) \cdot G(x)$; a derivative-like term &rarr; $G'(x)$.
4. Solve the resulting algebraic (often quadratic) equation for $G(x)$.
5. Extract $[x^n]G(x)$ via known series/binomial expansion to get the closed form.

**Worked example**: Catalan numbers: $G = 1 + xG^2$ &rarr; $G(x) = (1-\sqrt{1-4x})/(2x)$ &rarr; $C_n = \binom{2n}{n}/(n+1)$.

</div>

<div class="cs-card">

### 5 &middot; First-order / telescoping <span class="cs-pill">summation</span>

$$a_n - a_{n-1} = f(n) \quad \text{or} \quad a_n = a_{n-1} \cdot f(n)$$

**Method &mdash; telescope the sum (or product)**
1. Additive: sum both sides from $k=1$ to $n$ &rarr; $a_n = a_0 + \sum_{k=1}^n f(k)$.
2. Multiplicative: take the product instead, or take logs to reduce it to the additive case.
3. No characteristic equation needed &mdash; it's really just "evaluate a sum."

**Worked example**: $a_n = a_{n-1} + n$, $a_0=0$ &rarr; $a_n = \sum_{k=1}^n k = n(n+1)/2$.

</div>

<div class="cs-card">

### 6 &middot; Boundary-value (gambler's ruin) <span class="cs-pill">probability</span>

$$p \cdot p_{i+1} - p_i + q \cdot p_{i-1} = 0, \quad p_0 = 0,\ p_N = 1$$

**Method &mdash; first-step analysis, then method 1**
1. Condition on the first step to write $p_i$ in terms of its neighbors &mdash; this *is* a linear recurrence in the state index $i$.
2. Solve it exactly like method 1: characteristic roots of $p x^2 - x + q = 0$ are $x=1$ and $x=q/p$.
3. The only twist: fit the two constants to **boundary** conditions ($p_0$, $p_N$) instead of initial values ($a_0$, $a_1$).
4. Same trick solves expected-time-to-absorption recurrences: $E_i = 1 + qE_{i-1} + pE_{i+1}$ (nonhomogeneous version, method 2).

**Worked example**: Fair walk ($p=q=\tfrac12$): root $x=1$ repeated &rarr; $p_i = A + Bi$ &rarr; $p_i = i/N$. Biased: $p_i = (1-(q/p)^i)/(1-(q/p)^N)$.

</div>

<div class="cs-card">

### 7 &middot; Nonlinear <span class="cs-pill">substitution</span>

$$a_n = c \cdot a_{n-1}^2 \quad \text{or} \quad a_n = \frac{a_{n-1}}{1+a_{n-1}}$$

**Method &mdash; substitute to linearize**
1. Squares/products &rarr; take logs: $b_n = \log a_n$ turns $a_n = c \cdot a_{n-1}^2$ into $b_n = \log c + 2b_{n-1}$, linear in $b$.
2. Fractional/reciprocal forms &rarr; try $b_n = 1/a_n$.
3. Solve the linear recurrence in $b_n$ (method 1 or 2), then invert the substitution.

**Worked example**: $a_n = a_{n-1}/(1+a_{n-1})$: let $b_n = 1/a_n$ &rarr; $b_n = b_{n-1}+1$ &rarr; $b_n = b_0+n$ &rarr; $a_n = 1/(1/a_0+n)$.

</div>

</div>

## Interview reflexes

<div class="cs-callout">

- Compute the first 4&ndash;5 terms by hand before picking a method &mdash; it confirms your closed form and sometimes reveals a known sequence outright.
- Always verify a candidate closed form against the initial/boundary conditions *and* one term you didn't use to derive it.
- Off-by-one is the most common error: check whether the recurrence is stated for $n\ge0$, $n\ge1$, or $n\ge2$, and whether "n steps" means n terms or n transitions.
- For boundary-value problems (method 6), the number of unknowns equals the recursion's order &mdash; two boundary conditions for a second-order recurrence, not one.
- If nothing above fits, try a substitution first (method 7's trick) before assuming the recurrence has no closed form &mdash; many "nonlinear" interview recurrences are linear in disguise.
- When a closed form seems hopeless, the actual question may only need the recurrence itself, or its growth rate (method 3's machinery), not an explicit formula.

</div>
