---
name: add-question
description: Add one or more new questions to this placement-prep dashboard (a Gatsby app under src/data/questions), across any of its ten domains (Quant Puzzles, DSA, SQL, LLD & OOP, HLD, OS & Networks, Data Science, AI/ML, Behavioural, Language-Specific) — classifying domain/difficulty/category, assigning the next qid (scoped per domain), and writing the markdown file in the section format that domain's template renders. Trigger this whenever the user invokes /add-question or /add-puzzle, or asks to "add a question", "add a puzzle", "add this to the site", "put this in brainstellar", or similar — whether the content was just discussed in the conversation or is being pasted in directly.
---

# Add Question

Turns a question — whether it was just worked through earlier in the
conversation or is pasted/described directly in this invocation — into a
new entry in this placement-prep dashboard, formatted so it renders
correctly for its domain.

This is a templating task with hard, mechanical constraints (exact section
headings per domain, exact frontmatter fields, an exact ID scheme scoped
per domain). Follow the format precisely; classifying domain/difficulty/
category and writing the content are the parts that call for judgment.

## 0. Locate the site root, and don't use heredocs

Two environment traps will waste your time if you skip this.

**The site root may not be the working directory.** Every path in this
skill (`src/data/questions`, `src/data/domains.js`, `gatsby-config.js`) is
relative to the Gatsby site root, which is sometimes the working directory
and sometimes a `brainstellar/` subdirectory of it (a parent folder holding
the site checkout alongside other notes). Find it once before doing
anything else:

```bash
find . -maxdepth 4 -type d -name questions -path "*/src/data/*" -not -path "*/public/*"
```

`cd` into the directory containing `src/data/questions` and stay there for
the whole task. Note that `.claude/` may live at *either* level, so the
presence of `.claude/` is not a reliable marker of the site root.

**Never write question content through a shell heredoc.** Question text is
often dense with LaTeX or code, and a `bash <<'EOF'` heredoc in this harness
silently eats one level of backslashes — `\dots` and `\mid` arrive
stripped, silently breaking math. Use the **Write tool** for the `.md`
file. Do not pipe the content through the shell.

## 1. Find the question(s) to add

Look first at what's already been discussed in this conversation — if the
user just worked through a problem with you and then says "add this" or
invokes `/add-question`, that content IS the input. Otherwise, use whatever
was passed directly to the skill invocation.

If there is genuinely no content in either place, stop and ask the user to
paste or describe it. Don't invent content to fill the gap.

Handle multiple questions in one invocation if the user gives you more than
one — repeat the whole process per question, and see step 4 for how their
ids relate to each other (per domain).

## 2. Determine the domain

Read `src/data/domains.js` for the current list of domains (`slug`,
`label`) — don't restate them here since the list can change. As of this
writing there are ten: Quant Puzzles, DSA, SQL, LLD & OOP, HLD, OS &
Networks, Data Science, AI/ML, Behavioural, Language-Specific.

Infer the domain from the content's shape: a brain-teaser/probability
puzzle → `quant`; a data-structures-and-algorithms problem (arrays, trees,
graphs, DP, ...) → `dsa`; a query-writing exercise over tables → `sql`;
an object-design/design-patterns question, **or an OOP concept question**
→ `lld`; a system-design question → `hld`; a processes/memory/networking
concept question → `os-networks`; a statistics/experiment-design/pandas
question → `data-science`; an ML/DL/NLP/LLM question → `ai-ml`; a "tell me
about a time..." / leadership / conflict story → `behavioural`; a question
about how a specific language implements something, or a cross-language
comparison → `language-specific`.

Two tie-breaks, since they're the only ambiguous calls the above list
introduces:
- **Names a language → `language-specific`**, even when the topic is OOP.
  "How does Python's MRO resolve diamond inheritance?" is
  `language-specific`/`python`; "what is the diamond problem?" is
  `lld`/`oop-principles`.
- **Explain vs design, within `lld`**: a question that asks you to *design*
  something goes to `case-study`/`design-patterns`; a question that asks
  you to *explain* an OOP idea goes to `oop-principles`. Both are `lld`.

Domain is a bigger call than difficulty or category — unlike those, **ask
the user to confirm** whenever the domain is genuinely ambiguous (e.g. a
question that could be filed under either `dsa` or `hld`) rather than
guessing silently.

## 3. Extract and classify

Read `src/data/domains.js` for the chosen domain's `difficulties`,
`categories`, and `sections` (`open`/`collapsed`) — classify and structure
against those exact values rather than restating them here, since they can
change. Behavioural has an empty `difficulties` list: skip the difficulty
classification and frontmatter field entirely for it.

For each question, produce:

- **title** — short and descriptive (a few words).
- **difficulty** — exactly one of the domain's declared difficulties (omit
  for a domain with none).
- **category** — exactly one of the domain's declared categories.
- **content per section** — write the domain's `sections.open` and
  `sections.collapsed` headings that actually apply (every domain's first
  open section is `Question`; skip a declared section that has nothing to
  say for this particular question — an absent section is fine, Phase 3's
  renderer only renders sections that exist). A question can also use a
  one-off `##` heading beyond the domain's declared list if it genuinely
  needs one; the renderer keeps any `##` heading (defaulting an unrecognized
  one to collapsed) instead of silently dropping it. Use `###` for
  structure *within* a section (e.g. a numbered derivation inside
  Solution).

State your domain/difficulty/category classification and a one-line reason
for each when you report back in step 6 — you're deciding these
automatically (aside from an ambiguous domain, step 2), but the user should
be able to glance at the reasoning and correct it if you got it wrong.

## 4. Assign the qid

Run the bundled script from the site root found in step 0, passing the
domain slug from step 2:

```bash
node .claude/skills/add-question/scripts/next_question_id.js --domain <slug>
```

If `.claude/` sits one level above the site root, adjust the path
accordingly. The script finds `src/data/questions` by walking up from its
own location and checking each directory and its immediate children, so it
works from either layout — but if it ever throws
`could not locate src/data/questions`, that resolution is what needs
fixing, not your invocation.

It scans only `src/data/questions/{domain}/*.md` frontmatter and prints the
next free id in that domain (max + 1). **qids are scoped per domain** —
`dsa:1` and `quant:1` are different questions — so always pass `--domain`,
and re-run per domain if a batch spans more than one. Quant continues from
1034 (the pre-migration `puzzleId` sequence); every other domain starts
fresh at 1 the first time a question is added to it.

For a batch of N questions in the *same* domain in one invocation, run the
script once for that domain and assign `nextId, nextId+1, ..., nextId+N-1`
in the order you're writing them.

## 5. Write the markdown file

Create `src/data/questions/{domain}/{qid}.md`:

```markdown
---
qid: {qid}
title: "{title}"
difficulty: "{difficulty}"
category: "{category}"
---

## Question
{...}

## {NextSection}
{...}
```

- **No `domain:` frontmatter field.** Domain is derived from the folder a
  file lives in (`onCreateNode` in `gatsby-node.js`), so it can never drift
  from where you actually put the file.
- **Omit the `difficulty` field entirely for Behavioural** — don't write
  `difficulty: null` or an empty string, just leave the line out.
- **Section headings must be exactly `##`, matching the domain's declared
  names from step 3** (case and wording), so the per-domain
  open/collapsed default applies without needing a per-file override.
- **Optional provenance** — add `source: "..."` and/or
  `companies: ["...", ...]` only when the user actually stated them in the
  conversation; never infer or invent a source. Omit both fields otherwise.
- **A per-file override**, if a question's own section split should differ
  from its domain's default, is a frontmatter `open: [...]` /
  `collapsed: [...]` array of section names. Use this rarely — most
  questions should just take the domain default.

Formatting that carries over normally (no special handling needed):
- Inline math `$...$` and block math `$$...$$` (KaTeX).
- Fenced code blocks (` ```lang ... ``` `) — syntax-highlighted via Prism.
- Markdown images: `![alt](filename.png)`, file living alongside the `.md`
  in its domain folder.

### If the question has an image

Only handle this if the user actually supplied an image (pasted, uploaded,
or pointed at a local file) — never generate a new diagram from scratch.
Copy it into `src/data/questions/{domain}/`, named
`{qid}_{short-description}.{ext}` (matching the existing convention, e.g.
`1_rolling_bullet.png` for the question's image and `1_rolling_bullet_a.png`
for a second one in the solution), and reference it with standard markdown
image syntax at the right point in the relevant section.

## 6. Report back

For each question added, tell the user:
- The domain, assigned qid, title, difficulty (if applicable), and
  category, with your one-line reasoning for each classification.
- The files written (the new `.md`, the image if any).
- That they can check it renders correctly by running `gatsby develop` and
  visiting `/q/{domain}/{qid}`.

Don't commit anything to git — leave that to the user, since new question
content is exactly the kind of thing they'll want to read over first.

## 7. Keep the two copies of this skill in sync

This skill exists twice: once in the site repo's own `.claude/skills/`, and
once in the parent workspace's `.claude/skills/`. Whichever copy you
loaded, any edit you make to `SKILL.md` or to `scripts/` must be mirrored
to the other, or the next session will load the stale one. Check with:

```bash
diff -r .claude/skills/add-question ../.claude/skills/add-question
```

Also keep `.claude/skills/add-puzzle/SKILL.md` (both copies) in sync if you
ever change what it points to — it's a thin alias, not a fork; see that
file.
