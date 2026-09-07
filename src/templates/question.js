import 'katex/dist/katex.min.css'; // important: this styles the math output
import 'prismjs/themes/prism-tomorrow.css'; // code block syntax highlighting
import React from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import Button from '../components/Button';
import { PuzzleStatusToggles, PuzzleNotes } from '../components/PuzzleTracker';
import FacebookComments from '../components/FacebookComments';
import Seo from '../components/seo';
import { getDomain } from '../data/domains';
import { splitSections } from '../utils/sections';
import he from 'he';
const cheerio = require('cheerio');

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
  // quant keeps its pre-migration canonical URL; every other domain only ever
  // had the /q/{domain}/{qid} form.
  const canonicalRoute = domainSlug === 'quant' ? `/puzzles/${puzzle.qid}` : `/q/${domainSlug}/${puzzle.qid}`

  const sections = splitSections(rawMarkdownBody);
  const openNames = puzzle.open || (domain ? domain.sections.open : ['Question']);

  const { previousPuzzleRoute, nextPuzzleRoute, category, difficulty } = pageContext

  return (
    <Layout>
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        {category && <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{category} puzzles</h2>}

        {difficulty && <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{difficulty} puzzles</h2>}


        <br /><br />

        <table style={{ border: '0px solid black', width: '100%', padding: '0px', margin: '0px' }}>
          <tbody>
            <tr style={{ padding: '0px', margin: '0px' }}>
              <td style={{ padding: '0px', margin: '0px', border: '0px solid black', width: '20%', text: '' }}>
                {puzzle.difficulty &&
                  <Link className={`btn  btn-sm btn-${puzzle.difficulty} smooth`} to={`/puzzles/${puzzle.difficulty}`} title={`More ${puzzle.difficulty} puzzles`}>{puzzle.difficulty}</Link>
                }
              </td>
              <td style={{ padding: '0px', margin: '0px' }}>
                <div className="content-text" style={{ padding: '0px', margin: '0px', textAlign: 'center', fontSize: '1.3em' }}>
                  <a href={canonicalRoute} title="Permanent link to this post">
                    {puzzle.title}
                  </a>
                </div>
              </td>
              <td style={{ padding: '0px', margin: '0px', border: '0px solid black', width: '20%', maxWidth: '80px', textAlign: 'right' }}>
                <Link className={`btn  btn-sm link-white smooth`} to={`/puzzles/${puzzle.category}`} title={`More ${puzzle.category} puzzles`}>{puzzle.category}</Link>

              </td>
            </tr>
          </tbody>
        </table>

        <PuzzleStatusToggles puzzleId={puzzle.qid} />

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

        <PuzzleNotes puzzleId={puzzle.qid} />

        <FacebookComments puzzleId={puzzle.qid} />


        <br />
        <div style={{ marginBottom: `50px` }}>
          <table style={{ width: `100%`, tableLayout: `fixed` }}>
            <tbody>
              <tr>
                <td>

                  {previousPuzzleRoute && (
                    <Link style={{ float: `left` }} to={previousPuzzleRoute} className={"btn  btn-sm link-white smooth"}>Previous</Link>
                  )}
                </td>

                <td>

                  {nextPuzzleRoute && (
                    <Link style={{ float: `right` }} to={nextPuzzleRoute} className={"btn  btn-sm link-white smooth"}>Next Puzzle</Link>
                  )}
                </td>

              </tr>
            </tbody>
          </table>
        </div>
        <br /><br />
      </div></div></div></div>
    </Layout>
  )
}

export const Head = ({ data }) => {
  const puzzle = data.markdownRemark.frontmatter;
  const sections = splitSections(data.markdownRemark.html);
  const question = sections.find(s => s.name === 'Question') || sections[0];

  const $ = cheerio.load(question ? question.content : '');
  $("math").remove(); // Replace 'math' with the actual tag name for your LaTeX equations
  const description = he.decode($.text());

  return (
    <>
      <Seo title={puzzle.title} description={description} />
      <link rel="icon" href="/favicon.gif" />
    </>
  );
};
