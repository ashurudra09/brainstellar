#!/usr/bin/env node
// Prints the next available puzzleId (max existing id across the markdown
// puzzles and the legacy puzzles.yaml, plus 1) and, with --list, all
// currently-used ids sorted ascending, so a batch of new puzzles can also
// sanity-check they aren't colliding with anything.
//
// Run from anywhere; paths are resolved relative to this script's location.

const fs = require('fs');
const path = require('path');

// Walk up from this script looking for a dir containing src/data/puzzles;
// .claude/ may live inside the site repo or beside it (sibling checkout).
function findRepoRoot(start) {
  for (let dir = start; ; dir = path.dirname(dir)) {
    for (const cand of [dir, ...fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => path.join(dir, d.name))]) {
      if (fs.existsSync(path.join(cand, 'src', 'data', 'puzzles'))) return cand;
    }
    if (path.dirname(dir) === dir) throw new Error('could not locate src/data/puzzles');
  }
}
const repoRoot = findRepoRoot(path.resolve(__dirname, '..', '..', '..', '..'));
const puzzlesDir = path.join(repoRoot, 'src', 'data', 'puzzles');
const yamlPath = path.join(repoRoot, 'src', 'data', 'puzzles.yaml');

const ids = new Set();

for (const file of fs.readdirSync(puzzlesDir)) {
  if (!file.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(puzzlesDir, file), 'utf8');
  const match = content.match(/^puzzleId:\s*(\d+)/m);
  if (match) ids.add(Number(match[1]));
}

try {
  const yaml = require(path.join(repoRoot, 'node_modules', 'js-yaml'));
  const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
  if (Array.isArray(doc)) {
    doc.forEach(p => { if (p && typeof p.puzzleId === 'number') ids.add(p.puzzleId); });
  }
} catch (e) {
  console.error(`Warning: could not parse puzzles.yaml (${e.message}); continuing with .md ids only.`);
}

const sorted = [...ids].sort((a, b) => a - b);
const nextId = sorted.length ? sorted[sorted.length - 1] + 1 : 1;

if (process.argv.includes('--list')) {
  console.log(sorted.join(' '));
}
console.log(nextId);
