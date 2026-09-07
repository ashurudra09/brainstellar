# Brainstellar

A personal placement-prep dashboard, forked from
[brainstellar.com](https://brainstellar.com)'s quant-puzzles site. It keeps
the original puzzle content but adds a practice tracker (solved/starred/
notes/spaced-repetition review) on top, and has grown to cover ten interview
domains rather than just quant puzzles.

This repo uses the [Gatsby](https://www.gatsbyjs.com) framework.

## Running locally

**Requires Node 18+.** A prebuilt `sharp` binary (pulled in by
`gatsby-plugin-manifest`, which resizes the PWA icon) is the one native
dependency in the tree; it ships binaries for common Node versions, so
recent LTS releases work out of the box. If `npm install` ever tries to
compile it from source (typically only on a very new, not-yet-supported Node
release) and fails, pin to the current LTS with
[nvm-windows](https://github.com/coreybutler/nvm-windows):

```sh
winget install CoreyButler.NVMforWindows
nvm install 20.19.0
nvm use 20.19.0
```

Then just double-click **`run-brainstellar.bat`** in this folder. It checks
for Node, runs `npm install` on first launch, starts `gatsby develop`, and
opens the site at `http://localhost:8000`. Keep the window open while you use
the site; closing it stops the server.

## Domains

`src/data/domains.js` is the single source of truth for every domain's
slug, label, icon, accent color, difficulties, categories, and default
question section layout (which sections are open vs. collapsed by default).
Everything else — the header's domain dropdown, the hub's progress tiles,
`/all`'s filter chips, per-domain pages — reads from this one file, so
adding a domain is a one-file edit (an entry in the `DOMAINS` array) plus a
`src/data/questions/{slug}/` folder for its content.

The ten domains today: Quant Puzzles, DSA, SQL, LLD & OOP, HLD, OS &
Networks, Data Science, AI/ML, Behavioural, Language-Specific.

## Routes

| Route | What |
|---|---|
| `/` | Practice dashboard — progress tiles per domain, due-for-review and revisit queues |
| `/all` | Every question across every domain, with search/filter/sort |
| `/q/{domain}` | One domain's question list |
| `/q/{domain}/{qid}` | A single question |
| `/cheatsheets` | Cheatsheet index |
| `/cheatsheets/{slug}` | A single cheatsheet |
| `/puzzles`, `/puzzles/{category}`, `/puzzles/{difficulty}` | Quant's original illustrated album grid and category/difficulty list pages — still live as navigation, not aliases. The old per-question alias URLs under `/puzzles/` (`/puzzles/{qid}`, `/puzzles/{category}/{qid}`, `/puzzles/{difficulty}/{qid}`) were removed; quant's question pages now live at `/q/quant/{qid}` like every other domain's. |

## Progress tracking

Solved / starred / revisit-flagged / notes are tracked per question (keyed
`{domain}:{qid}`) and stored in **`progress.json`** at the repo root. That
file is **gitignored** — progress is per-machine, with no sync between
machines or devices.

Under `gatsby develop`, two dev-only endpoints (`/__progress` GET/POST,
defined in `gatsby-node.js`'s `onCreateDevServer`) read and write that file
directly, so progress survives a dev server restart. Those endpoints don't
exist under `gatsby build`/`gatsby serve` (or the deployed static site) —
there, progress falls back to the browser's `localStorage` alone. This
difference is easy to miss: progress tracked while developing locally lives
in `progress.json`; progress tracked on the deployed site lives only in
that browser's `localStorage` and is lost if it's cleared.

The dashboard also runs a simple spaced-repetition queue: marking a question
solved schedules its next review after one of `settings.reviewIntervals`
(default `[7, 14, 30, 60]` days), and `/` surfaces whatever is currently due.

## The question format

Each question is `src/data/questions/{domain}/{qid}.md` — frontmatter
(`qid`, `title`, `difficulty`, `category`, and optionally `source`,
`companies`, or a per-file `open`/`collapsed` section override) followed by
`##`-headed sections. Which sections render open vs. collapsed by default
comes from the domain's `sections` config in `domains.js`; a section a
particular question doesn't need is simply omitted. `qid`s are scoped per
domain — `dsa:1` and `quant:1` are different questions.

Don't hand-write these — see the skill below, which knows the exact format
each domain's template expects.

## The skills

Two Claude Code skills live in `.claude/skills/`, and neither commits
anything to git — both leave the new file(s) for you to review first.

- **`/add-question`** (with **`/add-puzzle`** kept as an alias for muscle
  memory) — turns a question, pasted or discussed in the conversation, into
  a correctly-formatted file in the right domain, with the next free `qid`.
  See [`.claude/skills/add-question/SKILL.md`](.claude/skills/add-question/SKILL.md).
- **`/add-cheatsheet`** — turns a cheatsheet (almost always a Claude-
  published artifact) into `src/data/cheatsheets/{slug}.md`, converting an
  HTML artifact's own styling into the site's shared class vocabulary
  instead of shipping the artifact's stylesheet. See
  [`.claude/skills/add-cheatsheet/SKILL.md`](.claude/skills/add-cheatsheet/SKILL.md).

## Cheatsheets

Reference material (as opposed to practice questions) lives at
`/cheatsheets`, sourced from `src/data/cheatsheets/*.md` and rendered
through the same remark pipeline as questions (KaTeX math, Prism syntax
highlighting) — they never appear in question lists, counts, or progress
tracking.

Where a cheatsheet needs actual visual layout — a card grid, a two-column
comparison, a coloured badge, a callout box — its markdown embeds raw HTML
against a small shared vocabulary defined once in
`src/components/cheatsheet.css`: `cs-grid`/`cs-card`, `cs-pill`, `cs-cols`,
`cs-callout`, `cs-kbd`, `cs-table`. It's built on the site's existing theme
variables, so it themes itself for free — a hand-written cheatsheet should
reach for these same classes rather than inventing new ones.

## UI

Dark/light/auto theme (top-right toggle, `src/contexts/ThemeContext.js`),
and a search-and-filter toolbar on `/all` and every domain page (text
search, status/difficulty/topic filters, sortable columns). Both `/` and
`/all` link to a random unsolved question.
