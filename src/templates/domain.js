import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Seo from '../components/seo'
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
  const questions = data.allMarkdownRemark.nodes.map(node => node.frontmatter);
  const domain = getDomain(pageContext.domain);
  const label = domain ? domain.label : pageContext.domain;

  return (
    <Layout>
      <Seo title={label} />
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{label}</h2>

        {questions.length === 0 && <p style={{ textAlign: `center` }}>No questions yet.</p>}

        {questions.map(q => (
          <span key={q.qid}>
            <Link to={`/q/${pageContext.domain}/${q.qid}`} className={`btn btn-sm link-${q.difficulty || 'white'} smooth`}>{q.title}</Link>
          </span>
        ))}

        <br /><br />
      </div></div></div></div>
    </Layout>
  )
}
