/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const fs = require('fs');
const path = require('path');
const { splitSections } = require('./src/utils/sections');

const PROGRESS_FILE = path.join(__dirname, 'progress.json');
const PROGRESS_V1_BACKUP_FILE = path.join(__dirname, 'progress.v1.backup.json');

// Named entities remark's HTML renderer actually emits (amp/lt/gt/quot/#39
// cover everything markdown produces -- there's no need for the full HTML5
// entity table `he` ships).
const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const decodeEntities = s => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => NAMED_ENTITIES[e]);

// Plain-text meta description for a question's <Head>, computed once at
// build time instead of shipping a full HTML parser (cheerio) to the browser.
const descriptionFor = html => {
  const sections = splitSections(html);
  const question = sections.find(s => s.name === 'Question') || sections[0];
  const content = question ? question.content : '';
  // KaTeX renders a <math> MathML block alongside its visual HTML, whose text
  // content is raw LaTeX/MathML noise -- drop the whole element, not just its tags.
  const withoutMath = content.replace(/<math[^>]*>[\s\S]*?<\/math>/g, '');
  const text = decodeEntities(withoutMath.replace(/<[^>]*>/g, ' '));
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * @type {import('gatsby').GatsbyNode['createSchemaCustomization']}
 */
exports.createSchemaCustomization = ({ actions }) => {
  // No question currently overrides its domain's default open/collapsed
  // sections, so without an explicit type Gatsby's schema inference would
  // never see these frontmatter fields and question.js's query would fail
  // the moment it asked for them.
  actions.createTypes(`
    type MarkdownRemarkFrontmatter {
      open: [String]
      collapsed: [String]
    }
  `);
};

/**
 * @type {import('gatsby').GatsbyNode['onCreateNode']}
 */
exports.onCreateNode = ({ node, actions, getNode }) => {
  if (node.internal.type !== 'MarkdownRemark') return;

  const parent = getNode(node.parent);
  actions.createNodeField({
    node,
    name: 'collection',
    // Which gatsby-source-filesystem instance this file came from -- lets
    // queries tell questions and cheatsheets apart.
    value: parent.sourceInstanceName,
  });

  if (parent.sourceInstanceName === 'questions') {
    actions.createNodeField({
      node,
      name: 'domain',
      // src/data/questions/{domain}/{qid}.md -> relativeDirectory is just "{domain}"
      value: parent.relativeDirectory,
    });
  }
};

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async function ({ actions, graphql }) {
  const { data } = await graphql(`
    query {
      allMarkdownRemark(
        filter: { fields: { collection: { eq: "questions" } } }
        sort: {frontmatter: {qid: ASC}}
      ) {
        nodes {
          id
          html
          fields { domain }
          frontmatter { qid category difficulty }
        }
      }
      cheatsheets: allMarkdownRemark(
        filter: { fields: { collection: { eq: "cheatsheets" } } }
      ) {
        nodes {
          id
          frontmatter { slug }
        }
      }
    }
  `);

  const nodes = data.allMarkdownRemark.nodes;
  console.log({ "length": nodes.length });

  const byDomain = {};
  nodes.forEach(node => {
    const domain = node.fields.domain;
    (byDomain[domain] = byDomain[domain] || []).push(node);
  });

  // Canonical routes: /q/{domain}/{qid} (detail, prev/next scoped within the
  // domain) and /q/{domain} (per-domain list).
  Object.keys(byDomain).forEach(domain => {
    const domainNodes = byDomain[domain];
    const count = domainNodes.length;

    domainNodes.forEach((node, index) => {
      const prevNode = domainNodes[(index - 1 + count) % count];
      const nextNode = domainNodes[(index + 1) % count];
      actions.createPage({
        path: `q/${domain}/${node.frontmatter.qid}`,
        component: require.resolve(`./src/templates/question.js`),
        context: {
          id: node.id,
          previousPuzzleRoute: count > 1 ? `/q/${domain}/${prevNode.frontmatter.qid}` : null,
          nextPuzzleRoute: count > 1 ? `/q/${domain}/${nextNode.frontmatter.qid}` : null,
          description: descriptionFor(node.html),
        },
      });
    });

    actions.createPage({
      path: `q/${domain}`,
      component: require.resolve(`./src/templates/domain.js`),
      context: { domain },
    });
  });

  // --- Legacy routes, quant only: the illustrated album grid and its
  // category/difficulty list pages. Per-question aliases are gone -- quant's
  // canonical question URL is /q/quant/{qid}, same as every other domain. ---
  const puzzles = byDomain['quant'] || [];
  const categories = Array.from(new Set(puzzles.map(node => node.frontmatter.category)));
  const difficulties = Array.from(new Set(puzzles.map(node => node.frontmatter.difficulty)));

  categories.forEach((category) => {
    actions.createPage({
      path: `puzzles/${category}`,
      component: require.resolve(`./src/templates/legacy-list.js`),
      context: { field: 'category', value: category },
    });
  });

  difficulties.forEach((difficulty) => {
    actions.createPage({
      path: `puzzles/${difficulty}`,
      component: require.resolve(`./src/templates/legacy-list.js`),
      context: { field: 'difficulty', value: difficulty },
    });
  });

  // extra homepage (album grid + full puzzle list), kept separate from the
  // practice dashboard that now lives at `/`
  actions.createPage({
    path: `puzzles`,
    component: require.resolve(`./src/templates/albums.js`),
  });

  data.cheatsheets.nodes.forEach(node => {
    actions.createPage({
      path: `cheatsheets/${node.frontmatter.slug}`,
      component: require.resolve(`./src/templates/cheatsheet.js`),
      context: { id: node.id },
    });
  });
};


// Dev-only endpoints backing the practice tracker's progress.json file.
// Reads/writes progress.json at the repo root so solved/starred/notes state
// survives across `gatsby develop` restarts and can be committed to git.
// Not available under `gatsby build`/`gatsby serve` — ProgressContext falls
// back to localStorage there.
exports.onCreateDevServer = ({ app }) => {
  app.get('/__progress', (req, res) => {
    try {
      const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');
      res.json(JSON.parse(raw));
    } catch (e) {
      res.json({ version: 2, questions: {}, settings: { reviewIntervals: [7, 14, 30, 60] } });
    }
  });

  app.post('/__progress', (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // One-time safety copy: the client migrates progress.json's schema
        // (v1 -> v2) in memory and writes the result back through this same
        // endpoint, so back up the pre-migration file before it's overwritten.
        if (data.version === 2 && !fs.existsSync(PROGRESS_V1_BACKUP_FILE)) {
          try {
            const existing = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
            if (existing.version === 1 || existing.puzzles) {
              fs.writeFileSync(PROGRESS_V1_BACKUP_FILE, JSON.stringify(existing, null, 2));
            }
          } catch (e) {
            // no pre-existing progress.json (or it's unreadable) -- nothing to back up
          }
        }

        const tmpFile = `${PROGRESS_FILE}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2));
        fs.renameSync(tmpFile, PROGRESS_FILE);
        res.json({ ok: true });
      } catch (e) {
        res.status(400).json({ ok: false, error: e.message });
      }
    });
  });
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    module: {
      rules: [
        {
          test: /\.drawio\.png$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        },
        {
          test: /\.drawio\.svg$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
              },
            },
          ],
        },
      ],
    },
  })
}
