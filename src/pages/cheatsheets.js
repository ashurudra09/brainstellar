import * as React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../components/index.module.css"

const CheatsheetsPage = ({ data }) => {
  const cheatsheets = data.allMarkdownRemark.nodes.map(node => ({ ...node.frontmatter, slug: node.frontmatter.slug }));

  return (
    <Layout id="wrapper">
      <Seo title="Cheatsheets" />
      <div className={styles.textCenter}>
        <div className="stylishpage">
          <div className="bord1">
            <div className="bord2">
              <div className="container">
                <h2>Cheatsheets</h2>

                {cheatsheets.length === 0 ? (
                  <p>No cheatsheets yet.</p>
                ) : (
                  <div className="cs-grid">
                    {cheatsheets.map(sheet => (
                      <Link key={sheet.slug} to={`/cheatsheets/${sheet.slug}`} className="cs-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h4>{sheet.icon} {sheet.title}</h4>
                        {sheet.summary && <p style={{ opacity: 0.8, fontSize: '0.9em' }}>{sheet.summary}</p>}
                        {sheet.tags && sheet.tags.length > 0 && (
                          <div>
                            {sheet.tags.map(tag => <span key={tag} className="cs-pill" style={{ marginRight: 4, marginTop: 4 }}>{tag}</span>)}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
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
      filter: { fields: { collection: { eq: "cheatsheets" } } }
      sort: { frontmatter: { title: ASC } }
    ) {
      nodes {
        frontmatter {
          slug
          title
          summary
          icon
          tags
        }
      }
    }
  }
`

export default CheatsheetsPage
