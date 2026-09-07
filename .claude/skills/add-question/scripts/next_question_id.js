#!/usr/bin/env node
// Prints the next available qid for one domain (max existing qid in that
// domain's src/data/questions/{domain}/*.md, plus 1; 1 for an empty
// domain), and, with --list, all ids currently used in that domain sorted
// ascending. qids are scoped per domain -- dsa:1 and quant:1 are different
// questions -- so this only ever scans the one folder.
//
// Usage: node next_question_id.js --domain <slug> [--list]
//
// Run from anywhere; paths are resolved relative to this script's location.

const fs = require('fs');
const path = require('path');

// Walk up from this script looking for a dir containing src/data/questions;
// .claude/ may live inside the site repo or beside it (sibling checkout).
function findRepoRoot(start) {
  for (let dir = start; ; dir = path.dirname(dir)) {
    for (const cand of [dir, ...fs.readdirSync(dir, { withFileTypes: true })
        .filter(d => d.isDirectory()).map(d => path.join(dir, d.name))]) {
      if (fs.existsSync(path.join(cand, 'src', 'data', 'questions'))) return cand;
    }
    if (path.dirname(dir) === dir) throw new Error('could not locate src/data/questions');
  }
}

const args = process.argv.slice(2);
const domainIdx = args.indexOf('--domain');
const domain = domainIdx !== -1 ? args[domainIdx + 1] : undefined;
if (!domain) {
  console.error('Usage: node next_question_id.js --domain <slug> [--list]');
  process.exit(1);
}

const repoRoot = findRepoRoot(path.resolve(__dirname, '..', '..', '..', '..'));
const domainDir = path.join(repoRoot, 'src', 'data', 'questions', domain);

if (!fs.existsSync(domainDir)) {
  console.error(`No such domain folder: src/data/questions/${domain} (check src/data/domains.js for valid slugs)`);
  process.exit(1);
}

const ids = new Set();
for (const file of fs.readdirSync(domainDir)) {
  if (!file.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(domainDir, file), 'utf8');
  const match = content.match(/^qid:\s*(\d+)/m);
  if (match) ids.add(Number(match[1]));
}

const sorted = [...ids].sort((a, b) => a - b);
const nextId = sorted.length ? sorted[sorted.length - 1] + 1 : 1;

if (args.includes('--list')) {
  console.log(sorted.join(' '));
}
console.log(nextId);
