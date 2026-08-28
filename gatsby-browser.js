/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

// You can delete this file if you're not using it
// gatsby-ssr.js

import React from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { ProgressProvider } from './src/contexts/ProgressContext';

export const wrapRootElement = ({ element }) => {
  return (
    <ThemeProvider>
      <ProgressProvider>
        {element}
      </ProgressProvider>
    </ThemeProvider>
  );
};
