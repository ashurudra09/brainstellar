// src/components/AuthButton.js
import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AuthButton = () => {
  const { user, authLoaded, error, signInGoogle, signInGithub, signOutUser, clearError } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!authLoaded) return null;

  if (user) {
    return (
      <div className="auth-widget">
        <span className="auth-name" title={user.email || ''}>{user.displayName || user.email || 'Account'}</span>
        <button type="button" className="btn btn-sm link-white smooth" onClick={signOutUser}>Sign Out</button>
      </div>
    );
  }

  return (
    <div className="auth-widget">
      <button type="button" className="btn btn-sm link-white smooth" onClick={() => setMenuOpen(open => !open)}>
        Sign In
      </button>
      {menuOpen && (
        <div className="auth-menu">
          <button type="button" className="btn btn-sm link-white smooth" onClick={() => { setMenuOpen(false); signInGoogle(); }}>
            Sign in with Google
          </button>
          <button type="button" className="btn btn-sm link-white smooth" onClick={() => { setMenuOpen(false); signInGithub(); }}>
            Sign in with GitHub
          </button>
        </div>
      )}
      {error && (
        <span className="auth-error" role="alert">
          {error}
          <button type="button" className="auth-error-dismiss" onClick={clearError} aria-label="Dismiss">×</button>
        </span>
      )}
    </div>
  );
};

export default AuthButton;
