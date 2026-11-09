import * as React from "react"
import { useCallback, useMemo, useState } from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import QuestionTable from "../components/QuestionTable"
import RandomQuestionButton from "../components/RandomQuestionButton"

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
      <div>
        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <div className="page-head"><h1>All Questions</h1></div>
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

export default AllQuestionsPage
