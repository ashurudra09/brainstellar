// src/components/ProgressControls.js
import React, { useRef, useState } from 'react';
import useProgress from '../hooks/useProgress';

const ProgressControls = () => {
  const { loaded, progress, clearAll, importProgress } = useProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!loaded) return null;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'progress.json';
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async e => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same filename later
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      importProgress(parsed);
      setError(null);
      setMenuOpen(false);
    } catch (err) {
      setError('Could not read that file -- make sure it is a progress.json exported from this site.');
    }
  };

  const handleClear = () => {
    const confirmed = window.confirm(
      'This will permanently delete ALL of your progress (solved questions, stars, notes). This cannot be undone. Continue?'
    );
    if (confirmed) clearAll();
    setMenuOpen(false);
  };

  return (
    <div className="auth-widget">
      <button type="button" className="btn btn-sm link-white smooth" onClick={() => setMenuOpen(open => !open)}>
        Progress
      </button>
      {menuOpen && (
        <div className="auth-menu">
          <button type="button" className="btn btn-sm link-white smooth" onClick={handleExport}>Export progress.json</button>
          <button type="button" className="btn btn-sm link-white smooth" onClick={handleImportClick}>Import progress.json</button>
          <button type="button" className="btn btn-sm link-white smooth" onClick={handleClear}>Clear all progress</button>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {error && (
        <span className="auth-error" role="alert">
          {error}
          <button type="button" className="auth-error-dismiss" onClick={() => setError(null)} aria-label="Dismiss">×</button>
        </span>
      )}
    </div>
  );
};

export default ProgressControls;
