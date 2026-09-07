const test = require('node:test');
const assert = require('node:assert/strict');
const mergeProgress = require('./mergeProgress');

test('local-only key is kept', () => {
  const local = { questions: { 'quant:1': { solved: true, updatedAt: 5 } } };
  const merged = mergeProgress(local, {});
  assert.equal(merged.questions['quant:1'].solved, true);
});

test('cloud-only key is kept', () => {
  const cloud = { questions: { 'quant:1': { solved: true, updatedAt: 5 } } };
  const merged = mergeProgress({}, cloud);
  assert.equal(merged.questions['quant:1'].solved, true);
});

test('local newer wins', () => {
  const local = { questions: { 'quant:1': { solved: true, updatedAt: 10 } } };
  const cloud = { questions: { 'quant:1': { solved: false, updatedAt: 5 } } };
  const merged = mergeProgress(local, cloud);
  assert.equal(merged.questions['quant:1'].solved, true);
});

test('cloud newer wins', () => {
  const local = { questions: { 'quant:1': { solved: false, updatedAt: 5 } } };
  const cloud = { questions: { 'quant:1': { solved: true, updatedAt: 10 } } };
  const merged = mergeProgress(local, cloud);
  assert.equal(merged.questions['quant:1'].solved, true);
});

test('un-solve: newer false beats older true', () => {
  const local = { questions: { 'quant:1': { solved: false, updatedAt: 2 } } };
  const cloud = { questions: { 'quant:1': { solved: true, updatedAt: 1 } } };
  const merged = mergeProgress(local, cloud);
  assert.equal(merged.questions['quant:1'].solved, false);
});

test('legacy local entry without updatedAt loses booleans to cloud but keeps its notes', () => {
  const local = { questions: { 'quant:1': { solved: true, notes: 'my typed notes' } } };
  const cloud = { questions: { 'quant:1': { solved: false, notes: '', updatedAt: 100 } } };
  const merged = mergeProgress(local, cloud);
  assert.equal(merged.questions['quant:1'].solved, false);
  assert.match(merged.questions['quant:1'].notes, /my typed notes/);
});

test('reviewCount is monotonic (max of both sides)', () => {
  const local = { questions: { 'quant:1': { reviewCount: 3, updatedAt: 1 } } };
  const cloud = { questions: { 'quant:1': { reviewCount: 5, updatedAt: 2 } } };
  const merged = mergeProgress(local, cloud);
  assert.equal(merged.questions['quant:1'].reviewCount, 5);
});

test('non-empty notes on both sides are preserved, not dropped', () => {
  const local = { questions: { 'quant:1': { notes: 'local note', updatedAt: 1 } } };
  const cloud = { questions: { 'quant:1': { notes: 'cloud note', updatedAt: 2 } } };
  const merged = mergeProgress(local, cloud);
  assert.match(merged.questions['quant:1'].notes, /local note/);
  assert.match(merged.questions['quant:1'].notes, /cloud note/);
});

test('mergeProgress({}, {}) returns a valid state with settings defined', () => {
  const merged = mergeProgress({}, {});
  assert.deepEqual(merged.questions, {});
  assert.ok(Array.isArray(merged.settings.reviewIntervals));
});

test('idempotent: merging a result with itself is unchanged', () => {
  const local = { questions: { 'quant:1': { solved: true, notes: 'x', updatedAt: 5 } } };
  const cloud = { questions: { 'quant:1': { solved: false, notes: 'y', updatedAt: 1 } } };
  const once = mergeProgress(local, cloud);
  const twice = mergeProgress(once, once);
  assert.deepEqual(twice, once);
});
