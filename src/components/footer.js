// src/components/footer.js
import React from 'react'

const Footer = () => (
  <footer style={{ textAlign: `center`, color: `var(--muted)`, fontSize: `14px`, padding: `8px 0 32px` }}>
    <div>
      Puzzle content is not owned by this site -- see the original at{' '}
      <a href="https://brainstellar.com" style={{ color: 'inherit', textDecoration: 'underline' }}>brainstellar.com</a>.
    </div>
    <div>
      Created by{' '}
      <a href="https://github.com/ashurudra09" style={{ color: 'inherit', textDecoration: 'underline' }}>ashurudra09</a>
    </div>
  </footer>
)

export default Footer
