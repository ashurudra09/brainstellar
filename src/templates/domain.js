import React, { useCallback, useMemo, useState } from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'
import Seo from '../components/seo'
import ProgressStats from '../components/ProgressStats'
import RandomQuestionButton from '../components/RandomQuestionButton'
import QuestionTable from '../components/QuestionTable'
import { getDomain } from '../data/domains'

export const query = graphql`
  query($domain: String!) {
    allMarkdownRemark(
      filter: { fields: { domain: { eq: $domain } } }
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
`

export default function DomainPage({ data, pageContext }) {
  const domain = getDomain(pageContext.domain);
  const label = domain ? domain.label : pageContext.domain;

  const questions = useMemo(
    () => data.allMarkdownRemark.nodes.map(node => ({ ...node.frontmatter, domain: pageContext.domain })),
    [data, pageContext.domain]
  );
  const [visible, setVisible] = useState(questions);
  const handleVisibleChange = useCallback(list => setVisible(list), []);

  return (
    <Layout>
      <Seo title={label} />
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{domain ? `${domain.icon} ${label}` : label}</h2>

        {questions.length === 0 ? (
          <p style={{ textAlign: `center` }}>No questions yet.</p>
        ) : (
          <>
            <ProgressStats questions={questions} domain={domain} />
            <RandomQuestionButton questions={visible} />
            <QuestionTable questions={questions} domain={domain} onVisibleChange={handleVisibleChange} />
          </>
        )}

        <br /><br />
      </div></div></div></div>
    </Layout>
  )
}
