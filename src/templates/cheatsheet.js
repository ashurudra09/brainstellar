import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Seo from '../components/seo'

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
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

        <h2 style={{ textAlign: `center`, marginTop: `0.5em`, marginBottom: `0.2em` }}>
          {frontmatter.icon} {frontmatter.title}
        </h2>

        {frontmatter.tags && frontmatter.tags.length > 0 && (
          <div style={{ textAlign: `center`, marginBottom: `1em` }}>
            {frontmatter.tags.map(tag => <span key={tag} className="cs-pill" style={{ margin: '0 4px' }}>{tag}</span>)}
          </div>
        )}

        <div className="content-text" dangerouslySetInnerHTML={{ __html: html }} />

        <br /><br />
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
