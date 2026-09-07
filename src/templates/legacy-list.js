import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import { Helmet } from "react-helmet";

// Collapses the old category.js/difficulty.js templates. A Gatsby page query
// is static, so the field being filtered on (category vs difficulty) can't
// be a GraphQL variable -- passing both and leaving one null would match
// nodes whose field IS null instead of ignoring it. So this queries every
// quant question unfiltered and filters in JS by the {field, value} pair
// from pageContext.
export const query = graphql`
  query {
    allMarkdownRemark(
      filter: { fields: { domain: { eq: "quant" } } }
      sort: { frontmatter: { qid: ASC } }
    ) {
      nodes {
        frontmatter {
          qid
          title
          difficulty
          category
        }
      }
    }
  }
`;

export default function LegacyList({ data, pageContext }) {
  const { field, value } = pageContext;
  const puzzles = data.allMarkdownRemark.nodes
    .map(node => node.frontmatter)
    .filter(p => p[field] === value);

  return (
    <Layout>
      <Helmet>
        <link rel="icon" href="/favicon.gif" />
        <title>{value} Puzzles | Brainstellar Puzzles</title>
      </Helmet>
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">

        <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{value} puzzles</h2>

        {puzzles.map(puzzle => (
          <span key={puzzle.qid}>
            <Link to={`/q/quant/${puzzle.qid}`} className={`btn btn-sm link-${puzzle.difficulty} smooth`}>{puzzle.title}</Link>
          </span>
        ))}

        <br /><br />

      </div></div></div></div>
    </Layout>
  )
}
