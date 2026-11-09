import * as React from "react"
import { useMemo } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import ProgressStats from "../components/ProgressStats"
import ReviewQueue from "../components/ReviewQueue"

const IndexPage = ({ data }) => {
  const questions = useMemo(
    () => data.allMarkdownRemark.nodes.map(node => ({ ...node.frontmatter, domain: node.fields.domain })),
    [data]
  );

  return (
    <Layout id="wrapper">
      <Seo title="Practice Dashboard" />
      <div>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <div className="page-head"><h1>Your Progress</h1></div>
                <ProgressStats questions={questions} />
              </div>
            </div>
          </div>
        </div>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>Due for review</h2>
                <ReviewQueue mode="due" questions={questions} />
              </div>
            </div>
          </div>
        </div>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>Revisit</h2>
                <ReviewQueue mode="revisit" questions={questions} />
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
    allMarkdownRemark(
      filter: { fields: { collection: { eq: "questions" } } }
      sort: {frontmatter: {qid: ASC}}
    ){
      nodes {
        fields { domain }
        frontmatter {
          qid
          difficulty
          category
          title
        }
      }
    }
  }
`

export default IndexPage
