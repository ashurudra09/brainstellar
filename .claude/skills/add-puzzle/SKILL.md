---
name: add-puzzle
description: Add one or more new puzzles to this Brainstellar site (a Gatsby app under src/data/puzzles) — classifying difficulty and category, assigning the next puzzleId, writing the markdown file in the exact section format the site's template parses, and appending a matching entry to the legacy puzzles.yaml. Trigger this whenever the user invokes /add-puzzle, or asks to "add a puzzle", "add this to the site", "put this in brainstellar", or similar — whether the puzzle was just discussed in the conversation or is being pasted in directly.
---

# Add Puzzle

Turns a puzzle — whether it was just worked through earlier in the conversation
or is pasted/described directly in this invocation — into a new entry in this
Brainstellar site, formatted so it renders correctly.

This is a templating task with hard, mechanical constraints (exact section
headings, exact frontmatter fields, an exact ID scheme). Follow the format
precisely; the classification (difficulty/category) and writing are the only
parts that call for judgment.

## 1. Find the puzzle(s) to add

Look first at what's already been discussed in this conversation — if the user
just worked through a puzzle with you and then says "add this" or invokes
`/add-puzzle`, that puzzle IS the input. Otherwise, use whatever puzzle text
was passed directly to the skill invocation.

If there is genuinely no puzzle content in either place, stop and ask the user
to paste or describe it. Don't invent a puzzle to fill the gap.

Handle multiple puzzles in one invocation if the user gives you more than one
— repeat the whole process per puzzle, and see step 3 for how their IDs relate
to each other.

## 2. Extract and classify

For each puzzle, produce these five pieces of content:

- **title** — short and descriptive (a few words), matching the style of
  existing titles like "Rolling the bullet", "Monty Hall Problem", "Chess
  Tournament".
- **question** — the puzzle statement as it would be posed to someone.
- **hint** — a short nudge toward the key idea, not a giveaway. Every existing
  puzzle has one; write a natural one even if the original discussion didn't
  include an explicit hint.
- **answer** — the final answer stated concisely (a number, a short phrase).
- **solution** — the full worked explanation. Feel free to use `###`
  subheadings inside it for structure (e.g. a "Follow-up Question" or numbered
  steps) — see the format note in step 4 for why it must be `###` and not `##`.

Then classify:

- **difficulty** — exactly one of `easy`, `medium`, `hard`, `deadly`.
  - `easy`: solved with a single clean insight, no real computation — a good
    warm-up question.
  - `medium`: needs combining two ideas, or some casework/computation.
  - `hard`: needs a genuine "aha", multi-step derivation, or an unusual setup.
  - `deadly`: exceptionally hard — multi-part, needs advanced technique, or
    is a notably harder variant of a hard puzzle. This tier is rare (4 of the
    101 existing puzzles use it) — default to `hard` when in doubt rather than
    reaching for `deadly`.
- **category** — exactly one of `probability`, `discrete`, `strategy`,
  `general`.
  - `probability`: expected value, conditional probability, distributions,
    dice/cards/coins.
  - `discrete`: combinatorics, number theory, pigeonhole, graphs, sequences.
  - `strategy`: game theory, optimal/adversarial play, coordination problems.
  - `general`: logic/lateral-thinking puzzles that don't fit the three above.

State your classification and a one-line reason for each puzzle when you
report back in step 6 — you're deciding this automatically (the user doesn't
want to be asked for every puzzle), but they should be able to glance at the
reasoning and correct it if you got it wrong.

## 3. Assign the puzzleId

Run the bundled script from the repo root:

```bash
node .claude/skills/add-puzzle/scripts/next_puzzle_id.js
```

It scans every `src/data/puzzles/*.md` frontmatter block and `puzzles.yaml`
for existing `puzzleId` values and prints the next free one (max + 1). Use
that exact script rather than eyeballing existing files — the ID history is
irregular (early puzzles were grouped in blocks by difficulty: 1-32 easy,
101-130 medium, 201-226 hard/deadly; that scheme was abandoned starting at
1002, which is now just a plain incrementing sequence with a few gaps from
deleted puzzles) and hand-picking a "reasonable-looking" number risks a
collision.

For a batch of N puzzles in one invocation, run the script once and assign
`nextId, nextId+1, ..., nextId+N-1` in the order you're writing them.

## 4. Write the markdown file

Create `src/data/puzzles/{puzzleId}.md`:

```markdown
---
puzzleId: {puzzleId}
title: "{title}"
difficulty: "{difficulty}"
category: "{category}"
---

## Question
{question}

## Hint
{hint}

## Answer
{answer}

## Solution
{solution}
```

Two things about this format are load-bearing, not stylistic:

- **Frontmatter has exactly these 4 fields.** No `source` field — the legacy
  `puzzles.yaml` has one, but the live `.md` format dropped it.
- **Exactly these four `##` headings, this wording, this order, nothing
  else at the `##` level.** The page template
  ([src/templates/puzzle.js](../../../src/templates/puzzle.js))'s
  `splitContent` function finds sections by literally splitting the rendered
  HTML on `<h2>` tags and matching the text against `'Question'`, `'Hint'`,
  `'Answer'`, `'Solution'`. Any other top-level `##` heading — including a
  typo'd section name — doesn't error, it just silently vanishes from the
  rendered page. Anything you want to structure *within* a section (e.g. a
  "Follow-up Question" inside Solution, like puzzle 3 has) must use `###` or
  deeper. If this skill ever seems to be producing puzzles that render with
  a section missing, check whether `splitContent` in that file still works
  this way before assuming the puzzle content is wrong.
- The difficulty/category enums used above come from
  [src/templates/difficulty.js](../../../src/templates/difficulty.js) and
  [category.js](../../../src/templates/category.js) filtering on these exact
  strings — same rule: if new values are added there in the future, come back
  and update the enums in step 2.

Formatting that carries over normally (no special handling needed):
- Inline math `$...$` and block math `$$...$$` (KaTeX) render as in existing
  puzzles.
- Markdown images: `![alt](filename.png)`, file living alongside the `.md` in
  `src/data/puzzles/`.

### If the puzzle has an image

Only handle this if the user actually supplied an image (pasted, uploaded, or
pointed at a local file) — never generate a new diagram from scratch. Copy it
into `src/data/puzzles/`, named `{puzzleId}_{short-description}.{ext}`
(matching the existing convention, e.g. `1_rolling_bullet.png` for the
question's image and `1_rolling_bullet_a.png` for a second one in the
solution), and reference it with standard markdown image syntax at the right
point in Question or Solution.

## 5. Append to puzzles.yaml

`src/data/puzzles.yaml` is a legacy file — [gatsby-config.js](../../../gatsby-config.js)
only sources `src/data/puzzles/*.md`, so this file isn't read by the live
site, and it's already missing 14 puzzles that were added straight as `.md`
without ever being backfilled here. Don't try to fix that gap; just keep it
growing by appending your new entries in the same style, since the user
wants it kept in sync going forward.

Open the file, and insert a new object just before the closing `]` (matching
the trailing comma the existing last entry has), in this shape:

```json
{
    "puzzleId": {puzzleId},
    "title": "{title}",
    "difficulty": "{difficulty}",
    "category": "{category}",
    "source": "{source}",
    "question": "{question}",
    "hint": "{hint}",
    "answer": "{answer}",
    "solution": "{solution}",
  },
```

- `source` — where the puzzle came from if the user mentioned it (e.g. "Quant
  Interview", a company name); otherwise `"Custom"`.
- Include `questionImage` / `solutionImage` keys (bare filename, no path) only
  if step 4 added an image; omit them otherwise.
- Write each string as a single double-quoted YAML scalar with literal `\n\n`
  between paragraphs (not raw newlines inside the quotes) — this parses
  cleanly and is simpler than replicating the older entries' line-folding
  style. Escape backslashes in LaTeX (`\\pi`, `\\dfrac`) and any double quotes
  inside the text the same way JSON would.
- This file only ever grows — never edit or remove an existing entry while
  doing this.

## 6. Report back

For each puzzle added, tell the user:
- The assigned `puzzleId`, title, difficulty, and category, with your
  one-line reasoning for the classification.
- The files written (the new `.md`, the image if any, and confirmation
  `puzzles.yaml` was updated).
- That they can check it renders correctly by running
  `run-brainstellar.bat` (or `gatsby develop`) and visiting
  `/puzzles/{puzzleId}`.

Don't commit anything to git — leave that to the user, since new puzzle
content is exactly the kind of thing they'll want to read over first.
