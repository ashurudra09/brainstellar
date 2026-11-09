import 'katex/dist/katex.min.css'; // important: this styles the math output
import 'prismjs/themes/prism-tomorrow.css'; // code block syntax highlighting
import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Button from '../components/Button';
import { PuzzleStatusToggles, PuzzleNotes } from '../components/QuestionTracker';
import Seo from '../components/seo';
import { getDomain } from '../data/domains';
import { splitSections } from '../utils/sections';

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      fields { domain }
      frontmatter {
        qid
        difficulty
        category
        title
        open
        collapsed
      }
    }
  }
`

// Sections rendered inline use a "one-liner" reveal panel too small for
// longer content, so only the genuinely short ones (a nudge, a final
// answer) get it -- everything else (Solution and any domain-specific
// section) renders as a normal block, matching Solution's original style.
const ONE_LINER_SECTIONS = new Set(['Hint', 'Answer']);

const sectionId = (name, qid) => `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}${qid}`;

export default function Question({ data, pageContext }) {
  const puzzle = data.markdownRemark.frontmatter
  const domainSlug = data.markdownRemark.fields.domain
  const domain = getDomain(domainSlug)
  const rawMarkdownBody = data.markdownRemark.html
  const canonicalRoute = `/q/${domainSlug}/${puzzle.qid}`

  const sections = splitSections(rawMarkdownBody);
  const openNames = puzzle.open || (domain ? domain.sections.open : ['Question']);
  const progressKey = `${domainSlug}:${puzzle.qid}`;

  const { previousPuzzleRoute, nextPuzzleRoute } = pageContext

  return (
    <Layout>
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        <div className="q-head">
          <div className="tag">{domain ? domain.label : domainSlug}</div>
          <h1><a href={canonicalRoute} title="Permanent link to this post">{puzzle.title}</a></h1>
        </div>
        <div className="q-head">
          {puzzle.difficulty &&
            <Link className={`btn btn-sm btn-${puzzle.difficulty} smooth`} to={`/puzzles/${puzzle.difficulty}`} title={`More ${puzzle.difficulty} puzzles`}>{puzzle.difficulty}</Link>
          }
          <Link className="btn btn-sm link-white smooth" to={`/puzzles/${puzzle.category}`} title={`More ${puzzle.category} puzzles`}>{puzzle.category}</Link>
        </div>

        <PuzzleStatusToggles puzzleId={progressKey} />

        {sections.map(section => {
          const isSolution = section.name === 'Solution';
          const isOpen = openNames.includes(section.name);

          if (isOpen) {
            return (
              <div key={section.name} className={`content-text${isSolution ? ' solution' : ''}`} style={{ marginTop: `1em`, marginBottom: `1em` }}>
                {section.name !== 'Question' && <h3>{section.name}</h3>}
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            );
          }

          return (
            <Button
              key={section.name}
              id={sectionId(section.name, puzzle.qid)}
              label={section.name}
              passClass={ONE_LINER_SECTIONS.has(section.name) ? 'one-liner' : undefined}
              content={
                <div className={isSolution ? 'solution' : undefined} dangerouslySetInnerHTML={{ __html: section.content }} />
              }
            />
          );
        })}

        <PuzzleNotes puzzleId={progressKey} />

        <div className="q-nav">
          {previousPuzzleRoute ? <Link to={previousPuzzleRoute} className="btn btn-sm link-white smooth">&larr; Previous</Link> : <span />}
          {nextPuzzleRoute && <Link to={nextPuzzleRoute} className="btn btn-sm link-white smooth">Next Puzzle &rarr;</Link>}
        </div>
      </div></div></div></div>
    </Layout>
  )
}

export const Head = ({ data, pageContext }) => {
  const puzzle = data.markdownRemark.frontmatter;

  return (
    <>
      <Seo title={puzzle.title} description={pageContext.description} />
      <link rel="icon" href="/favicon.gif" />
    </>
  );
};
