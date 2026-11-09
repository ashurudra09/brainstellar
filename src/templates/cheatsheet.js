import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Seo from '../components/seo'
import InteractiveCheatsheet from '../components/InteractiveCheatsheet'
import interactive from '../cheatsheets'

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        slug
        kind
        summary
        icon
        tags
        updated
      }
    }
  }
`

export default function Cheatsheet({ data }) {
  const { html, frontmatter } = data.markdownRemark;

  return (
    <Layout>
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        <Link to="/cheatsheets" className="btn btn-sm link-white smooth">&larr; Cheatsheets</Link>

        <div className="page-head" style={{ marginTop: `0.8em` }}>
          <h1>{frontmatter.icon} {frontmatter.title}</h1>
          {frontmatter.summary && <p className="lede">{frontmatter.summary}</p>}
        </div>

        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div style={{ marginBottom: `1em` }}>
            {frontmatter.tags.map(tag => <span key={tag} className="cs-pill" style={{ marginRight: 6 }}>{tag}</span>)}
          </div>
        )}

        {frontmatter.kind === 'interactive' && interactive[frontmatter.slug]
          ? <InteractiveCheatsheet slug={frontmatter.slug} data={interactive[frontmatter.slug]} />
          : <div className="content-text" dangerouslySetInnerHTML={{ __html: html }} />}

        </div></div></div></div>
    </Layout>
  )
}

export const Head = ({ data }) => {
  const { frontmatter } = data.markdownRemark;
  return (
    <>
      <Seo title={frontmatter.title} description={frontmatter.summary} />
      <link rel="icon" href="/favicon.gif" />
    </>
  );
};
