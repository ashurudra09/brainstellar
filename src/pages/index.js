import * as React from "react"
import { useState, useCallback, useMemo } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import ProgressStats from "../components/ProgressStats"
import RandomPuzzleButton from "../components/RandomPuzzleButton"
import PuzzleTable from "../components/PuzzleTable"
import * as styles from "../components/index.module.css"

const IndexPage = ({ data }) => {
  // Memoized so this array keeps a stable reference across re-renders: PuzzleTable
  // reports its filtered list back up via onVisibleChange, and a fresh array here
  // on every render would otherwise retrigger that effect in an infinite loop.
  const puzzles = useMemo(
    () => data.allMarkdownRemark.nodes.map((node) => node.frontmatter),
    [data]
  );
  const [visiblePuzzles, setVisiblePuzzles] = useState(puzzles);
  const handleVisibleChange = useCallback((list) => setVisiblePuzzles(list), []);

  return (
    <Layout id="wrapper">
      <Seo title="Practice Dashboard" />
      <div className={styles.textCenter}>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2 style={{ textAlign: 'center' }}>Your Progress</h2>
                <div style={{ textAlign: 'center' }}>
                  <Link to="/puzzles" className="btn btn-sm link-white smooth">All Puzzles</Link>
                </div>
                <ProgressStats puzzles={puzzles} />
                <RandomPuzzleButton puzzles={visiblePuzzles} />
              </div>
            </div>
          </div>
        </div>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>All Puzzles</h2>
                <PuzzleTable puzzles={puzzles} onVisibleChange={handleVisibleChange} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}

export const query = graphql`
  query {
    allMarkdownRemark(sort: {frontmatter: {puzzleId: ASC}}){
      nodes {
        frontmatter {
          puzzleId
          difficulty
          category
          title
        }
      }
    }
  }
`

export default IndexPage
