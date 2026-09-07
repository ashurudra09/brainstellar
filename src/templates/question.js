import 'katex/dist/katex.min.css'; // important: this styles the math output
import 'prismjs/themes/prism-tomorrow.css'; // code block syntax highlighting
import React, { useEffect } from 'react'
import { graphql, Link } from 'gatsby'
import Layout from '../components/layout'
import { Helmet } from "react-helmet";
import Button from '../components/Button';
import { PuzzleStatusToggles, PuzzleNotes } from '../components/PuzzleTracker';
import FacebookComments from '../components/FacebookComments';
import Seo from '../components/seo';
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
      }
    }
  }
`

const splitContent = (htmlContent) => {
  const parts = htmlContent.split(/<h2>(.*?)<\/h2>/);
  let question, hint, answer, solution;

  for (let i = 1; i < parts.length; i += 2) {
    const section = parts[i];
    const content = parts[i + 1];

    if (section === 'Question') question = content;
    else if (section === 'Hint') hint = content;
    else if (section === 'Answer') answer = content;
    else if (section === 'Solution') solution = content;
  }

  if (question && question.trim() === '') { question = undefined };
  if (hint && hint.trim() === '') { hint = undefined };
  if (answer && answer.trim() === '') { answer = undefined };
  if (solution && solution.trim() === '') { solution = undefined };

  return { question, hint, answer, solution };
}


export default function Question({ data, pageContext }) {
  const puzzle = data.markdownRemark.frontmatter
  const domain = data.markdownRemark.fields.domain
  const rawMarkdownBody = data.markdownRemark.html
  // quant keeps its pre-migration canonical URL; every other domain only ever
  // had the /q/{domain}/{qid} form.
  const canonicalRoute = domain === 'quant' ? `/puzzles/${puzzle.qid}` : `/q/${domain}/${puzzle.qid}`

  const { question, hint, answer, solution } = splitContent(rawMarkdownBody);

  const $ = cheerio.load(question);

  $("math").remove(); // Replace 'math' with the actual tag name for your LaTeX equations
  let description = $.text();
  description = he.decode(description);


  const { previousPuzzleRoute, nextPuzzleRoute, category, difficulty } = pageContext

  useEffect(() => {
    document.querySelectorAll('.push').forEach(button => {
      button.addEventListener('click', function () {
        const content = document.getElementById(this.id.replace('Button', ''))
        if (content) {
          const isHidden = content.classList.contains('hidden')
          content.classList.toggle('hidden', !isHidden)
          content.classList.toggle('unhidden', isHidden)
          this.classList.toggle('pushed', isHidden)
          this.classList.toggle('push', !isHidden)
        }
      })
    })

  }, [])




  return (
    <Layout>
      <Seo title={puzzle.title} description={description} />
      <Helmet>
        <link rel="icon" href="/favicon.gif" />
        <title>{puzzle.title} | Brainstellar Puzzles</title>
      </Helmet>
      <div className="stylishpage"><div className="bord1"><div className="bord2"><div className="container">
        {category && <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{category} puzzles</h2>}

        {difficulty && <h2 style={{ textAlign: `center`, marginTop: `1.5em`, marginBottom: `1em` }}>{difficulty} puzzles</h2>}


        <br /><br />

        <table style={{ border: '0px solid black', width: '100%', padding: '0px', margin: '0px' }}>
          <tbody>
            <tr style={{ padding: '0px', margin: '0px' }}>
              <td style={{ padding: '0px', margin: '0px', border: '0px solid black', width: '20%', text: '' }}>
                <Link className={`btn  btn-sm btn-${puzzle.difficulty} smooth`} to={`/puzzles/${puzzle.difficulty}`} title={`More ${puzzle.difficulty} puzzles`}>{puzzle.difficulty}</Link>
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

        {question && <div className="content-text" style={{ marginTop: `1em`, marginBottom: `1em` }}>
          <div dangerouslySetInnerHTML={{ __html: question }} />
        </div>}

        {hint &&
          <Button id={`hint${puzzle.qid}`} label="Hint" content={
            <div dangerouslySetInnerHTML={{ __html: hint }} />
          }
            passClass="one-liner"
          />
        }

        {answer &&
          <Button id={`answer${puzzle.qid}`} label="Answer" content={
            <div passClass="one-liner" dangerouslySetInnerHTML={{ __html: answer }} />
          }
            passClass="one-liner"
          />
        }

        {solution &&
          <Button id={`solution${puzzle.qid}`} label="Solution" content={
            <div className="solution" dangerouslySetInnerHTML={{ __html: solution }} />
          } />
        }

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
