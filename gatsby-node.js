/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, 'progress.json');

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
    name: 'domain',
    // src/data/questions/{domain}/{qid}.md -> relativeDirectory is just "{domain}"
    value: parent.relativeDirectory,
  });
};

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
exports.createPages = async function ({ actions, graphql }) {
  const { data } = await graphql(`
    query {
      allMarkdownRemark(sort: {frontmatter: {qid: ASC}}) {
        nodes {
          id
          fields { domain }
          frontmatter { qid category difficulty }
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
        },
      });
    });

    actions.createPage({
      path: `q/${domain}`,
      component: require.resolve(`./src/templates/domain.js`),
      context: { domain },
    });
  });

  // --- Legacy routes, quant only: same paths and rendered output as before
  // the domain migration, so old links keep working. ---
  const puzzles = byDomain['quant'] || [];
  const puzzleCount = puzzles.length;
  const categories = Array.from(new Set(puzzles.map(node => node.frontmatter.category)));
  const difficulties = Array.from(new Set(puzzles.map(node => node.frontmatter.difficulty)));

  puzzles.forEach((node, index) => {
    const puzzle = node.frontmatter;

    const nextPuzzleId = puzzles[(index + 1) % puzzleCount].frontmatter.qid;
    const previousPuzzleId = puzzles[(index - 1 + puzzleCount) % puzzleCount].frontmatter.qid;

    const nextCategoryPuzzleId = puzzles.find(
      (n, i) => n.frontmatter.category === puzzle.category && i > index
    )?.frontmatter.qid;

    const nextDifficultyPuzzleId = puzzles.find(
      (n, i) => n.frontmatter.difficulty === puzzle.difficulty && i > index
    )?.frontmatter.qid;

    const previousCategoryPuzzleId = puzzles
      .slice(0, index)
      .reverse()
      .find(n => n.frontmatter.category === puzzle.category)?.frontmatter.qid;

    const previousDifficultyPuzzleId = puzzles
      .slice(0, index)
      .reverse()
      .find(n => n.frontmatter.difficulty === puzzle.difficulty)?.frontmatter.qid;

    // Puzzle page
    actions.createPage({
      path: `puzzles/${puzzle.qid}`,
      component: require.resolve(`./src/templates/question.js`),
      context: {
        id: node.id,
        previousPuzzleRoute: `/puzzles/${previousPuzzleId}`,
        nextPuzzleRoute: `/puzzles/${nextPuzzleId}`,
      },
    });

    // Category puzzle page
    actions.createPage({
      path: `puzzles/${puzzle.category}/${puzzle.qid}`,
      component: require.resolve(`./src/templates/question.js`),
      context: {
        id: node.id,
        previousPuzzleRoute: previousCategoryPuzzleId ? `/puzzles/${puzzle.category}/${previousCategoryPuzzleId}` : null,
        nextPuzzleRoute: nextCategoryPuzzleId ? `/puzzles/${puzzle.category}/${nextCategoryPuzzleId}` : null,
        category: puzzle.category,
      },
    });

    difficulties.forEach((difficulty) => {
      // Difficulty puzzle page
      actions.createPage({
        // allow old URL's to work even if the difficulty level gets changed later.
        path: `puzzles/${difficulty}/${puzzle.qid}`,
        component: require.resolve(`./src/templates/question.js`),
        context: {
          id: node.id,
          previousPuzzleRoute: previousDifficultyPuzzleId ? `/puzzles/${puzzle.difficulty}/${previousDifficultyPuzzleId}` : null,
          nextPuzzleRoute: nextDifficultyPuzzleId ? `/puzzles/${puzzle.difficulty}/${nextDifficultyPuzzleId}` : null,
          difficulty: difficulty,
        },
      });
    });
  });

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
      res.json({ version: 1, puzzles: {} });
    }
  });

  app.post('/__progress', (req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
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
    // cheerio's undici dependency conditionally requires node:sqlite (a
    // Node 22+ built-in) for an HTTP cache feature this site never uses;
    // webpack can't bundle it, so treat it as external rather than resolve it.
    externals: [{ 'node:sqlite': 'commonjs node:sqlite' }],
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
