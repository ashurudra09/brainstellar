/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-node/
 */

const fs = require('fs');
const path = require('path');

const PROGRESS_FILE = path.join(__dirname, 'progress.json');

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */



exports.createPages = async function ({ actions, graphql }) {
  const { data } = await graphql(`
    query {
      allMarkdownRemark(sort: {frontmatter: {qid: ASC}}) {
          nodes {
            frontmatter{
            qid
            category
            difficulty
          }
        }
      }
    }
  `);



  // Create a page for each puzzle
  const puzzles = data.allMarkdownRemark.nodes.map((node) => node.frontmatter);
  const puzzleCount = puzzles.length;

  console.log({ "length": puzzleCount })

  const categoriesSet = new Set();

  const difficultiesSet = new Set();


  // Extracting list of categories
  const categories = Array.from(new Set(puzzles.map(puzzle => puzzle.category)));
  const difficulties = Array.from(new Set(puzzles.map(puzzle => puzzle.difficulty)));


  puzzles.forEach((puzzle, index) => {
    categoriesSet.add(puzzle.category);
    difficultiesSet.add(puzzle.difficulty);

    const nextPuzzleId = puzzles[(index + 1) % puzzleCount].qid;
    const previousPuzzleId = puzzles[(index - 1 + puzzleCount) % puzzleCount].qid;

    const nextCategoryPuzzleId = puzzles.find(
      (p, i) => p.category === puzzle.category && i > index
    )?.qid;

    const nextDifficultyPuzzleId = puzzles.find(
      (p, i) => p.difficulty === puzzle.difficulty && i > index
    )?.qid;

    const previousCategoryPuzzleId = puzzles
      .slice(0, index)
      .reverse()
      .find(p => p.category === puzzle.category)?.qid;

    const previousDifficultyPuzzleId = puzzles
      .slice(0, index)
      .reverse()
      .find(p => p.difficulty === puzzle.difficulty)?.qid;

    // Puzzle page
    actions.createPage({
      path: `puzzles/${puzzle.qid}`,
      component: require.resolve(`./src/templates/puzzle.js`),
      context: {
        puzzleId: puzzle.qid,
        previousPuzzleRoute: `/puzzles/${previousPuzzleId}`,
        nextPuzzleRoute: `/puzzles/${nextPuzzleId}`
      }
    });

    // Category puzzle page
    actions.createPage({
      path: `puzzles/${puzzle.category}/${puzzle.qid}`,
      component: require.resolve(`./src/templates/puzzle.js`),
      context: {
        puzzleId: puzzle.qid,
        previousPuzzleRoute: previousCategoryPuzzleId ? `/puzzles/${puzzle.category}/${previousCategoryPuzzleId}` : null,
        nextPuzzleRoute: nextCategoryPuzzleId ? `/puzzles/${puzzle.category}/${nextCategoryPuzzleId}` : null,
        category: puzzle.category
      },
    });

    difficulties.forEach((difficulty) => {
      // Difficulty puzzle page
      actions.createPage({
        // allow old URL's to work even if the difficulty level gets changed later.
        path: `puzzles/${difficulty}/${puzzle.qid}`,
        component: require.resolve(`./src/templates/puzzle.js`),
        context: {
          puzzleId: puzzle.qid,
          previousPuzzleRoute: previousDifficultyPuzzleId ? `/puzzles/${puzzle.difficulty}/${previousDifficultyPuzzleId}` : null,
          nextPuzzleRoute: nextDifficultyPuzzleId ? `/puzzles/${puzzle.difficulty}/${nextDifficultyPuzzleId}` : null,
          difficulty: puzzle.difficulty,
        },
      });
    });

  });

  categories.forEach((category) => {
    // Category page
    actions.createPage({
      path: `puzzles/${category}`,
      component: require.resolve(`./src/templates/category.js`),
      context: {
        category: category,
      }
    });
  });

  difficulties.forEach((difficulty) => {
    // Difficulty page
    actions.createPage({
      path: `puzzles/${difficulty}`,
      component: require.resolve(`./src/templates/difficulty.js`),
      context: {
        puzzleId: null,
        previousPuzzleRoute: null,
        nextPuzzleRoute: null,
        difficulty: difficulty,
      }
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
