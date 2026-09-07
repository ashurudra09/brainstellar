# Placement Prep Dashboard — multi-domain overhaul

> **Status: complete.** This plan's phases have all landed. Further work
> (build speed, a tenth domain, cheatsheets, and the README/doc pass) is
> tracked in [`v2.1-plan.md`](v2.1-plan.md), which supersedes parts of this
> document (its Phase 2 build pipeline, Phase 1's domain list).

## Context

This repo is a fork of Brainstellar (Gatsby 5) holding 114 quant puzzles as markdown, extended with progress tracking, starring, filtering and notes. The goal is to turn it from a puzzle site into a single placement-prep dashboard covering nine domains: Quant Puzzles, DSA, SQL, LLD, HLD, OS & Networks, Data Science, AI/ML, and Behavioural.

Three things block that today:

1. **The section parser is hardcoded.** `splitContent` in `src/templates/puzzle.js:31-52` matches the literal strings `Question`/`Hint`/`Answer`/`Solution` and silently discards every other `##` heading. DSA needs Constraints/Complexity/Code, HLD needs Requirements/Trade-offs, SQL needs Schema.
2. **The taxonomy is duplicated in five places** with no source of truth: `PuzzleTable.js:14-22`, `ProgressStats.js:5-10`, `albums.js:44-60`, `header.js:34-37`, and the `.btn-*`/`.link-*`/`.pt-difficulty-*` CSS families. Adding a `dsa` category today renders as an unstyled grey pill and is invisible in the stats panel.
3. **Everything is keyed on a single global `puzzleId`** — the routes, the GraphQL queries, and the `progress.json` keys.

Outcome: a hub dashboard at `/` with per-domain pages, a cross-domain `/all` view, a manual Revisit list, an escalating-interval review queue for starred questions, and one generic `/add-question` skill that authors into any domain.

### Decisions taken (from discussion)

- Hub + per-domain pages **and** a global `/all` list.
- Per-domain category lists; shared difficulty scale (`easy`/`medium`/`hard`, plus `deadly` retained for quant only). Behavioural has no difficulty.
- Generic section renderer: any `##` is a section.
- Per-domain folders; new URLs `/q/{domain}/{qid}`; existing `/puzzles/*` URLs preserved by continuing to generate those pages (no redirect plugin needed for gh-pages).
- Progress stays local-only: localStorage as source of truth, `progress.json` as the dev-server mirror.
- Provenance: optional `source` and `companies` frontmatter, only when actually known. **No company page.**
- Review: manual `revisit` flag with a permanent dashboard list, plus escalating intervals (7 → 14 → 30 → 60d) for starred+solved questions.
- `src/data/puzzles.yaml` and `convert.js` are deleted.

---

## Phase 0 — Prep and cleanup

**Delete dead starter scaffolding:** `src/pages/page-2.js`, `src/pages/using-ssr.js`, `src/pages/using-typescript.tsx`, `src/templates/using-dsg.js`.

**Fix undeclared dependencies.** `src/templates/puzzle.js:1,10` imports `katex` and `he`, which resolve only transitively. Add both to `package.json` dependencies explicitly.

**Add code-block styling** (required before any DSA/SQL content is readable). There is currently not one `pre` or `code` rule in `src/components/layout.css` (1366 lines), and `body` sets a proportional font with `text-align: justify`. Add to the fork's section (after L926): monospace family, `text-align: left`, `overflow-x: auto`, `background: var(--color-background-off)`, padding, and inline-`code` styling. Then add `gatsby-remark-prismjs` + `prismjs` to `gatsby-config.js` as a `gatsby-transformer-remark` sub-plugin and import a Prism theme next to the KaTeX import in the question template.

**Clean up `gatsby-config.js`:** `gatsby-transformer-remark` and `gatsby-remark-katex` are each listed twice (`:11-13`); the bare top-level entries are no-ops. Remove them.

---

## Phase 1 — Domain config and content migration

### 1a. Create `src/data/domains.js` — the single source of truth

Exports `DIFFICULTIES`, `DIFFICULTY_ORDER` (drives the sort comparator), `DOMAINS` (array), and helpers `getDomain(slug)` / `DOMAIN_BY_SLUG`. Each domain entry:

```js
{
  slug: 'dsa',
  label: 'DSA',
  icon: '🧩',
  accent: '#4a8fd3',
  difficulties: ['easy', 'medium', 'hard'],
  categories: ['arrays', 'strings', 'trees', 'graphs', 'dp', 'greedy',
               'binary-search', 'heaps', 'tries', 'bit-manipulation', 'math'],
  sections: {
    open: ['Question', 'Constraints', 'Examples'],
    collapsed: ['Hint', 'Approach', 'Complexity', 'Code', 'Solution'],
  },
}
```

Nine entries. `quant` additionally carries `difficulties: [...,'deadly']` and `legacyPathPrefix: 'puzzles'`. `behavioural` carries `difficulties: []` and sections `open: ['Question']`, `collapsed: ['Structure', 'My Story']`. Starter category lists per domain — SQL: joins/aggregation/window-functions/subqueries/indexing/schema-design/optimization; HLD: scalability/caching/databases/messaging/consistency/case-study; LLD: design-patterns/oop-principles/concurrency/api-design/case-study; OS & Networks: processes/memory/concurrency/filesystems/tcp-ip/http/dns/security; Data Science: statistics/hypothesis-testing/regression/experiment-design/pandas/case-study; AI/ML: classical-ml/deep-learning/nlp/llms/evaluation/mlops/math-foundations; Behavioural: leadership/conflict/failure/teamwork/motivation/project-deep-dive.

`DIFFICULTIES` carries an `accent` per difficulty the same way.

Every consumer listed in Context item 2 must be rewritten to read from this file.

**Colours are applied as an inline `--accent` custom property, not as generated classes.** This is a plain-CSS site with no CSS-in-JS and no stylesheet codegen step, and adding one to satisfy "config drives the CSS" is not worth it. A badge renders as `<span className="pt-difficulty-badge" style={{ '--accent': accent }}>` and `layout.css` keeps one generic rule reading `var(--accent)`, so a new difficulty or domain is one edit in `domains.js` and zero CSS.

Scope this to the three families the new components own — `.pt-difficulty-*`, `.filter-chip-*`, `.progress-tile-*` (`layout.css:1050-1302`) — each collapsing to its base rule. Leave the site's original `.link-*` / `.btn-*` families alone: they are quant-only, already complete including `deadly`, and are referenced by legacy templates whose markup this plan otherwise doesn't touch. The `--difficulty-*` tokens at `:932-937` stay only if something still needs them by name after the collapse.

### 1b. Move content

`git mv src/data/puzzles src/data/questions/quant` (carries all 114 `.md` files and the 16 `{id}_*.png|svg` assets — the inline `![alt](1_rolling_bullet.png)` references are relative, so they keep working). Create empty sibling folders for the other eight slugs, each with a `.gitkeep`.

### 1c. Rewrite frontmatter (one-time script, scratchpad)

Rename `puzzleId:` → `qid:` in all 114 files. Rationale: `puzzleId` is wrong for a SQL question, and plain `id` collides confusingly with `MarkdownRemark.id` in GraphQL. Do not add a `domain` field — domain is derived from the folder in Phase 2, so it can never drift.

**The rename is a breaking change to every existing GraphQL query, including the files this plan otherwise leaves alone.** `puzzleId` appears today as a filter/sort field, a selected field, a React `key`, and a URL segment. Every one of these must move to `qid` in the same commit as the frontmatter rewrite, or the page silently renders undefined:

| File | What breaks |
|---|---|
| `gatsby-node.js:21-27` | `sort: {frontmatter: {puzzleId: ASC}}` and the selected field |
| `src/templates/puzzle.js:17-28` | whole query — replaced in Phase 3 anyway |
| `src/pages/index.js:61-68` | query — replaced in Phase 5 anyway |
| `src/templates/albums.js:121-128, :77-78` | query, `key`, and `/puzzles/${puzzleId}` link. **Not otherwise touched by this plan** |
| `src/templates/category.js:9-18, :41-42` | query, `key`, link. Folded into `legacy-list.js` in Phase 2 |
| `src/templates/difficulty.js` | same as `category.js` |

Phases 4 and 5 then layer a second, separate change on top of this one: anywhere the value is used as a *progress key* rather than for display or routing, it becomes the composite `` `${domain}:${qid}` `` (Phase 4). Budget these as one mechanical pass over every `puzzleId` occurrence in the repo — grep for it and expect to touch more files than the component list in Phase 5 names.

**Recommended, easy to drop:** before deleting `puzzles.yaml`, backfill its `source` values (`"Quant Interview"`, `"Graviton Quant OA"`, `"Very Common"`, …) into the matching markdown frontmatter as `source: "..."` for the ~100 puzzles that have one. This is the provenance data that was going to be lost, it costs one script run, and it feeds the new `source` field directly. Skip this step if you'd rather start provenance from scratch.

### 1d. Delete `src/data/puzzles.yaml` and `convert.js`

Also remove the `gatsby-transformer-json` dependency (declared but never in the plugins array) and the `puzzles.yaml` reference in `README.md:42`.

---

## Phase 2 — Build pipeline

**`gatsby-config.js`:** replace the single `data2` filesystem source with one pointing at `src/data/questions` (name: `questions`). Subdirectories are picked up recursively; no per-domain source needed.

**`gatsby-node.js` — add `onCreateNode`:** for each `MarkdownRemark`, read the parent `File` node's `relativeDirectory` and `createNodeField({ node, name: 'domain', value: relativeDirectory })`. This is what makes domain queryable without a frontmatter field.

**`gatsby-node.js` — rewrite `createPages`** (currently `:18-147`). Query all markdown with `fields { domain }` and `frontmatter { qid title difficulty category }`. Then:

| Path | Template | Notes |
|---|---|---|
| `/q/{domain}/{qid}` | `templates/question.js` | Canonical. Context passes the **node `id`**, not qid — `qid` is only unique per domain, so the detail query must be `markdownRemark(id: {eq: $id})`. Prev/next scoped within the domain, ordered by qid. |
| `/q/{domain}` | `templates/domain.js` | Per-domain list page. |
| `/puzzles/{qid}` | `templates/question.js` | **Legacy, quant only.** Same rendered output as today. |
| `/puzzles/{category\|difficulty}/{qid}` | `templates/question.js` | **Legacy, quant only.** Keep the existing generate-for-every-difficulty behaviour (`gatsby-node.js:99-112`) so old URLs survive. Do **not** replicate this multiplication for the new domains — it would 4× the page count nine times over. |
| `/puzzles/{category}` and `/puzzles/{difficulty}` | `templates/legacy-list.js` | **Legacy, quant only.** `category.js` and `difficulty.js` are near-identical (both even export a component misspelled `Cateogry`); collapse them into one template. See the filtering note below — the collapse cannot be done with a parameterised GraphQL filter. |
| `/puzzles` | `templates/albums.js` | Keep, but its query and `puzzleId` references still need the Phase 1c rename. Add the missing Deadly tile while here. |

**Every route rendered by `question.js` must pass the node `id` in context — legacy ones included.** The three `/puzzles/*` rows share the canonical template, so they share its `markdownRemark(id: {eq: $id})` query. Today those pages pass `puzzleId` (`gatsby-node.js:77-111`); passing `qid` instead is not enough. Their URLs and rendered output are unchanged, but the context they are built with is not.

**`legacy-list.js` filters in JS, not in GraphQL.** A Gatsby page query is static, so the *field being filtered on* cannot be a variable — and the obvious workaround of passing both `$category` and `$difficulty` and leaving one null is a trap: `{eq: null}` matches nodes whose field **is** null, so a category page built that way returns zero puzzles rather than ignoring the unused filter. Instead have the template query all quant markdown unfiltered and filter in the component by the `{ field, value }` pair passed through pageContext. At 114 quant puzzles the cost of over-fetching is irrelevant.

Keep `onCreateDevServer` (`:155-180`) and `onCreateWebpackConfig` (`:182-211`) as-is.

---

## Phase 3 — Generic section renderer

**New `src/utils/sections.js`:**

```js
export const splitSections = html => {
  const parts = html.split(/<h2[^>]*>([\s\S]*?)<\/h2>/);
  const out = [];
  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].replace(/<[^>]*>/g, '').trim();
    const content = parts[i + 1] || '';
    if (content.trim()) out.push({ name, content });
  }
  return out;
};
```

Three deliberate improvements over `splitContent`: `[^>]*` tolerates heading attributes (today a heading-anchor plugin would make every section vanish at once), `[\s\S]` handles headings with inline markup, and unknown sections are **kept in document order** instead of dropped.

**New `src/templates/question.js`** replaces `puzzle.js`. Renders each section in file order: open inline if its name is in the domain's `sections.open`, otherwise wrapped in the existing `<Button>` reveal (`src/components/Button.js` is reused unchanged). Unknown section names default to **collapsed** — safe, since an unrecognised heading is more likely to be an answer than a prompt. A per-file frontmatter `open: [...]` / `collapsed: [...]` overrides the domain default.

While rewriting, drop three defects carried by `puzzle.js`:
- The `useEffect` at `:76-90` attaches raw `addEventListener` to every `.push` element, duplicating `Button.js`'s own React toggle, never cleans up, and re-binds across client-side navigations. Delete it.
- `:141` renders `puzzle.questionImage` from `/puzzle-images/`, a field no markdown has and a directory that doesn't exist. Delete.
- `:166` uses `class=` instead of `className=`, so `.solution a { text-decoration: underline }` (`layout.css:922`) never applies. Fix. Same at `:153` (`passClass` on a plain `<div>`).

Also move `<Seo>` to the Gatsby 5 `export const Head` API — currently rendered in the body at `index.js:25` / `puzzle.js:97`, so its `<title>`/`<meta>` land in `<body>`.

---

## Phase 4 — Progress schema v2

**`src/contexts/ProgressContext.js`** — new shape:

```json
{
  "version": 2,
  "questions": {
    "quant:1033": {
      "solved": true, "starred": true, "revisit": false,
      "notes": "<p>…</p>",
      "solvedAt": 1788648687172,
      "lastReviewedAt": 1789000000000,
      "reviewCount": 2
    }
  },
  "settings": { "reviewIntervals": [7, 14, 30, 60] }
}
```

Keys become `"{domain}:{qid}"`. **Migration:** on load, if `version === 1` or a `puzzles` key is present, map every bare numeric key `"{n}"` → `"quant:{n}"` into `questions`, stamp `version: 2`, and persist immediately. Idempotent. Write `progress.v1.backup.json` once before the first v2 write.

New context API on top of the existing `loaded/entry/isSolved/isStarred/getNotes/toggleSolved/toggleStarred/setNotes/counts`:
- `isRevisit(key)` / `toggleRevisit(key)` — independent manual flag, never auto-clears.
- `markReviewed(key)` — `reviewCount++`, `lastReviewedAt = Date.now()`.
- `isDueForReview(key)` — true when `starred && solved` and `now - (lastReviewedAt ?? solvedAt)` exceeds `reviewIntervals[Math.min(reviewCount, len-1)]` days.
- `counts` gains `revisitKeys` and `dueKeys` Sets.
- `settings` + `setReviewIntervals` so the schedule is tunable from the dashboard.

**Add `src/hooks/useProgress.js`** — a thin `useContext(ProgressContext)` wrapper. Four components call the context directly today; route them all through this.

Also move the `persist(next)` call out of the `setProgress` updater (`:81`) into a `useEffect` on `progress`. It's a side effect inside a reducer and misbehaves under React 18 StrictMode double-invocation.

`gatsby-node.js:155-180` (`GET`/`POST /__progress`) needs no change — it reads and writes opaque JSON.

---

## Phase 5 — Dashboard, domain pages, review queue

**`src/pages/index.js` — the hub.** Replaces the current single-table dashboard with: overall progress donut, a **Due for review** list, a **Revisit** list, and a grid of nine domain cards each showing solved/total and linking to `/q/{domain}`.

**New `src/templates/domain.js`** — per-domain page: domain-scoped stats, filter chips built from that domain's own `categories` and `difficulties`, and the question table.

**New `src/pages/all.js`** — cross-domain table with a Domain column and domain filter chips.

**Components:**
- `PuzzleTable.js` → `QuestionTable.js`. Add a Domain column (rendered only in cross-domain mode), a domain filter, and `revisit` + `due` status filters alongside the existing `all/unsolved/solved/starred/notes`. Read difficulty and category lists from `domains.js` rather than the hardcoded `DIFFICULTY_FILTERS`/`DIFFICULTY_ORDER` at `:14-22`. Must tolerate `difficulty: null` (Behavioural) — render no badge and sort those last. Extend search beyond title+category (`:42-45`) to include qid and domain. Preserve the existing keyboard/ARIA handling on toggles and sortable headers.
- `ProgressStats.js` → generalised: overall donut plus per-**domain** tiles on the hub; per-difficulty bars only inside a domain page. Note it currently compares against a `Set` of string ids (`:28`) — that becomes the composite key.
- `PuzzleTracker.js` → `QuestionTracker.js`: add a Revisit toggle and a "Mark reviewed" button next to Solved/Star. `PuzzleNotes` is unchanged — keep the imperative `innerHTML`-once pattern and its explaining comment at `:40-42`; React-controlled `contentEditable` resets the cursor on every keystroke.
- `RandomPuzzleButton.js` → `RandomQuestionButton.js`. It already picks from the passed-in filtered list; preserve the `useMemo`/`useCallback` reference-stability dance in `index.js:13-21` that stops the `onVisibleChange` effect from looping.
- New `DomainCards.js`, new `ReviewQueue.js`.

**`src/components/header.js`** — replace the four hardcoded difficulty links (`:34-37`) with Dashboard / All Questions / a domain menu generated from `domains.js`.

**CSS** — apply domain and difficulty accents as the inline `--accent` custom property decided in Phase 1a, and collapse the per-value class families (`.pt-difficulty-*`, `.filter-chip-*`, `.progress-tile-*`) into their generic base rules. No new CSS is written per domain. Separately, fix the `[data-theme="auto"]` block at `:13-19`, which uses CSS Nesting that Gatsby doesn't transpile; it only appears to work because `ThemeContext.js:13` resolves `auto` in JS.

---

## Phase 6 — Rewrite the authoring skill

`.claude/skills/add-puzzle/` → `.claude/skills/add-question/`, keeping `/add-puzzle` as an alias so muscle memory works.

Changes from the current `SKILL.md`:
- **Add a domain step.** Unlike difficulty and category (classified automatically), domain is a big enough call to confirm with the user when the input is ambiguous.
- **Read the enums from `src/data/domains.js`** rather than restating them. The current skill's claim that they live in `difficulty.js`/`category.js` is already wrong.
- **Delete the entire `puzzles.yaml` step** (`SKILL.md:187-241`) — roughly a third of the file, and the source of the fiddly double-backslash LaTeX escaping.
- **Keep the no-heredoc rule** (`:17-41`). That is a real hard-won constraint: the harness eats one level of backslashes, silently breaking `\dots`/`\mid`. Use the Write tool for markdown.
- **Section guidance per domain** — the skill emits the domain's declared sections; it no longer needs to warn that extra `##` headings vanish, because they don't any more.
- **Optional provenance** — write `source` / `companies` only when the user states them. Never infer.
- `scripts/next_puzzle_id.js` → `next_question_id.js --domain <slug>`, scanning only that domain's folder for `^qid:` and printing max+1 (1 for an empty domain). Drop the js-yaml branch (`:36-44`). Quant continues from 1034.
- **Sync the duplicate copy** at `C:\work\interview prep\quant\.claude\skills\` (the current skill's step 7).

---

## Phase 7 — Seed content and verification

Add 2–3 real questions per new domain so every page renders with content, exercising the section variety: a DSA question with Constraints/Examples/Complexity/Code (fenced code, to prove Prism), a SQL question with a Schema section and a fenced query, an HLD question with Requirements/Trade-offs, and a Behavioural question with no difficulty.

### Verification

1. `gatsby clean && npm run develop`, then drive the dev server through the Browser pane.
2. **Legacy URLs unbroken** — `/puzzles/1`, `/puzzles/1033`, `/puzzles/probability/4`, `/puzzles/easy/1033` (the deliberate cross-difficulty case), `/puzzles/hard`, `/puzzles/probability`, `/puzzles` all still render. For the two list pages, check the puzzle list is **non-empty** — the `legacy-list.js` filtering trap fails silently as an empty page, not an error.
3. **New routes** — `/`, `/all`, `/q/quant`, `/q/dsa`, `/q/dsa/1`, `/q/behavioural/1`.
4. **Section renderer** — confirm `1.md` (all four sections, images, KaTeX) and `1009.md` (empty Hint and Answer → those buttons must not render) are unchanged; confirm a DSA question shows Constraints inline and Code collapsed; confirm an unknown `## Foo` heading appears collapsed rather than vanishing.
5. **Progress migration** — with the existing 35-entry `progress.json` in place, load the site once and confirm keys become `quant:*`, all 33 solved and 19 starred survive, notes render, and `progress.v1.backup.json` exists. Then confirm a fresh POST round-trips through `/__progress`.
6. **Review logic** — star and solve a question, temporarily set `reviewIntervals` to `[0,...]`, confirm it appears in Due for review; click "Mark reviewed" and confirm it drops out and `reviewCount` increments.
7. `read_console_messages` clean (in particular, no React `class`/`passClass` attribute warnings), and `npm run build` succeeds.
8. Check dark mode and the mobile viewport on the hub and a domain page via `resize_window`.

### Notes

- `progress.json` is untracked as of commit `5d0ae87` and stays that way. The local file (v1, 35 entries) is still on disk, which is what Phase 7's migration check reads.
- The CI workflow (`.github/workflows/build-and-deploy.yml`) force-copies `public/` to a separate prod repo on push to `develop`. The deployed site has no `/__progress` endpoint and is localStorage-only — that is unchanged by this work.
