import * as React from "react"
import { useMemo } from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import ProgressStats from "../components/ProgressStats"
import DomainCards from "../components/DomainCards"
import ReviewQueue from "../components/ReviewQueue"
import * as styles from "../components/index.module.css"

const IndexPage = ({ data }) => {
  const questions = useMemo(
    () => data.allMarkdownRemark.nodes.map(node => ({ ...node.frontmatter, domain: node.fields.domain })),
    [data]
  );

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
                  <Link to="/all" className="btn btn-sm link-white smooth">All Questions</Link>
                </div>
                <ProgressStats questions={questions} />
              </div>
            </div>
          </div>
        </div>

        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>Domains</h2>
                <DomainCards questions={questions} />
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
    allMarkdownRemark(sort: {frontmatter: {qid: ASC}}){
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
