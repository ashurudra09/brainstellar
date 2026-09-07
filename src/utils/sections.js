// Splits a question's rendered HTML into named sections by top-level <h2>
// headings. Three deliberate improvements over the old hardcoded
// Question/Hint/Answer/Solution parser: [^>]* tolerates heading attributes
// (e.g. from a heading-anchor plugin), [\s\S] handles headings with inline
// markup, and unknown sections are kept (in document order) instead of
// silently dropped -- any "##" is a section now, not just the original four.
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
