import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import QuestionTable from "../components/QuestionTable"
import RandomQuestionButton from "../components/RandomQuestionButton"
import * as styles from "../components/index.module.css"

const AllQuestionsPage = ({ data }) => {
  const questions = useMemo(
    () => data.allMarkdownRemark.nodes.map(node => ({ ...node.frontmatter, domain: node.fields.domain })),
    [data]
  );
  const [visible, setVisible] = useState(questions);
  const handleVisibleChange = useCallback(list => setVisible(list), []);

  return (
    <Layout id="wrapper">
      <Seo title="All Questions" />
      <div className={styles.textCenter}>
        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>All Questions</h2>
                <RandomQuestionButton questions={visible} />
                <QuestionTable questions={questions} onVisibleChange={handleVisibleChange} />
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

export default AllQuestionsPage
