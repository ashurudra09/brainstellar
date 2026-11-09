// Re-keys progress entries for questions that moved domain (quant -> prob-stats),
// so solved/notes state follows the question. `moved` is src/data/movedQuestions.json.
const renameKeys = (questions, moved) =>
  Object.fromEntries(Object.entries(questions || {}).map(([k, v]) => [moved[k] || k, v]));

module.exports = renameKeys;
