// Shared between gatsby-browser.js and gatsby-ssr.js so the provider tree
// only needs to be kept in sync in one place.
import React from 'react';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProgressProvider } from './src/contexts/ProgressContext';

const WrapRootElement = ({ element }) => (
  <ThemeProvider>
    <AuthProvider>
      <ProgressProvider>
        {element}
      </ProgressProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default WrapRootElement;
