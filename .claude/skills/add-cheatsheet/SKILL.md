---
name: add-cheatsheet
description: Add a cheatsheet (typically a Claude-published artifact, either Markdown or HTML) to this placement-prep dashboard's Cheatsheets section as a new src/data/cheatsheets/{slug}.md file, converting an HTML artifact's styling into the site's shared .cs-* class vocabulary. Trigger this whenever the user invokes /add-cheatsheet, or asks to "add this cheatsheet", "put this cheatsheet on the site", "save this as a cheatsheet", or similar.
---

# Add Cheatsheet

Turns a cheatsheet -- almost always a Claude-published artifact from earlier
in the conversation, or one the user pastes a URL or content for -- into a
new reference page on this site, styled with the site's own theme instead of
the artifact's.

## 1. Locate the site root, and don't use heredocs

Same two traps as `add-question`:

**The site root may not be the working directory.** Find it once before
doing anything else:

```bash
find . -maxdepth 4 -type d -name questions -path "*/src/data/*" -not -path "*/public/*"
```

`cd` into the directory containing `src/data/questions` (the cheatsheet
folder, `src/data/cheatsheets`, is its sibling) and stay there for the whole
task.

**Never write cheatsheet content through a shell heredoc.** A cheatsheet
often has code blocks or LaTeX; a `bash <<'EOF'` heredoc silently eats a
level of backslashes. Use the **Write tool** for the `.md` file.

## 2. Find the cheatsheet

In priority order:
1. An artifact published earlier in this conversation.
2. An artifact URL the user pasted -- read it back with the Artifact tool's
   `read` action.
3. Content pasted directly into the invocation.

Stop and ask rather than inventing one. Read the **whole** artifact before
converting it -- a cheatsheet's value is in its long tail of rows, and a
partial read silently drops them.

## 3. Detect the format, then convert

The artifact is either HTML or Markdown. Branch on that first.

### Markdown artifact -- the easy case

Copy the body through essentially unchanged; the site's remark pipeline
already renders headings, tables, fenced code, and `$...$`/`$$...$$` math
(KaTeX) with no extra work. The only conversion needed: demote a leading
`# Title` into frontmatter `title` (so it isn't printed twice above the
template's own heading), and add the frontmatter from step 5.

### HTML artifact -- convert, don't transplant

Discard the artifact's `<style>` block, its fonts, its colours, its
`<script>`, and any wrapper divs that only exist to centre the page on its
own. Then map what remains:

| In the artifact | Becomes |
|---|---|
| `<h1>` | frontmatter `title` |
| `<h2>` / `<h3>` | `##` / `###` |
| `<table>` | markdown table |
| `<pre><code>` | fenced code block with a language tag |
| `<ul>` / `<ol>` | markdown lists |
| KaTeX/MathML output | `$...$` / `$$...$$` |
| card / tile grid | `<div class="cs-grid">` of `<div class="cs-card">` |
| two-column comparison | `<div class="cs-cols">` |
| coloured badge, chip, tag | `<span class="cs-pill">` |
| note / warning / tip box | `<div class="cs-callout">` |
| `<kbd>`, shortcut key | `<span class="cs-kbd">` |

Prefer plain markdown wherever it carries the same meaning -- reach for a
`.cs-*` class only when the layout itself is load-bearing (a side-by-side
comparison, a scannable grid). These eight classes (`cs-grid`, `cs-card`,
`cs-pill`, `cs-cols`, `cs-callout`, `cs-kbd`, `cs-table`, plus `cs-card h4`
for card titles) are defined once in `src/components/cheatsheet.css` against
the site's theme variables -- that file is the whole contract; don't invent
a ninth class or an inline `style=`. Never emit a hardcoded colour, an
inline `style=` attribute, or a `<style>` block of your own; anything that
seems to need one is a note to the user in step 6, not an inline exception.

**If the HTML artifact is interactive** -- tabs, filters, collapsibles, a
live search box -- that behaviour cannot survive the conversion, and
pretending otherwise produces a cheatsheet with dead buttons on it. Flatten
it instead:
- Tabs become sequential `##` sections.
- Collapsibles are expanded inline.
- A filterable table becomes the full table (the page is `Ctrl-F`-able
  anyway).

Do not port the `<script>` -- a per-cheatsheet script is exactly the
per-cheatsheet stylesheet problem in a second form. **Say so explicitly in
step 6**: name what was interactive and what it flattened into, so the user
can decide whether that particular cheatsheet wants different treatment.

## 4. Choose the slug

Kebab-case from the title (e.g. "Big-O Cheat Sheet" -> `big-o-cheat-sheet`).
Check `src/data/cheatsheets/` for a collision -- a collision means the user
is updating an existing cheatsheet: confirm, then overwrite and bump
`updated`, rather than silently creating `foo-2`.

## 5. Write `src/data/cheatsheets/{slug}.md`

```markdown
---
title: "{title}"
slug: "{slug}"
summary: "{one-sentence summary}"
icon: "{one emoji}"
tags: ["{tag}", ...]
updated: "{YYYY-MM-DD}"
---

{converted body}
```

- **No `qid`, no `difficulty`.** Cheatsheets are reference material, not
  practice items -- they never appear in progress tracking.
- `summary` is a plain sentence (no markdown), used as both the index card's
  description and the page's meta description.
- Images from the artifact go alongside the `.md` as `{slug}-{n}.{ext}`,
  referenced with standard markdown image syntax.

## 6. Report back

Tell the user:
- The slug, title, and tags.
- The file(s) written.
- The local URL to check it, `/cheatsheets/{slug}`, in `gatsby develop`.
- The source format (HTML or Markdown).
- Anything interactive that got flattened (per step 3), and anything the
  `.cs-*` vocabulary genuinely couldn't express.

Do not commit anything to git -- the user reviews first, same as
`add-question`.

## 7. Keep the two copies of this skill in sync

This skill exists twice: once in the site repo's own `.claude/skills/`, and
once in the parent workspace's `.claude/skills/`. Whichever copy you loaded,
mirror any edit to the other:

```bash
diff -r .claude/skills/add-cheatsheet ../.claude/skills/add-cheatsheet
```
