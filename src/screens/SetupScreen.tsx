import React, { useState } from 'react';
import { validateToken, saveToken } from '../githubStorage';
import './SetupScreen.css';

interface SetupScreenProps {
  onComplete: (token: string) => void;
}

export default function SetupScreen({ onComplete }: SetupScreenProps) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConnect = async () => {
    const t = token.trim();
    if (!t) return;
    setStatus('checking');
    setErrorMsg('');
    const valid = await validateToken(t);
    if (valid) {
      saveToken(t);
      onComplete(t);
    } else {
      setStatus('error');
      setErrorMsg('Token invalid or lacks repo access. Check scopes and try again.');
    }
  };

  return (
    <div className="setup-root">
      <div className="setup-card">
        {/* Logo / Icon */}
        <div className="setup-icon">🔐</div>

        <h1 className="setup-title">Connect to GitHub</h1>
        <p className="setup-sub">
          Your fight data will be stored as{' '}
          <code>data/fights.json</code> in your{' '}
          <strong>fanbyprinciple/dslf-web</strong> repo — no external database.
        </p>

        <div className="setup-steps">
          <div className="setup-step">
            <span className="setup-step-num">1</span>
            <span>
              Go to{' '}
              <strong>github.com/settings/tokens</strong> → "Generate new token (classic)"
            </span>
          </div>
          <div className="setup-step">
            <span className="setup-step-num">2</span>
            <span>Set expiration to <strong>No expiration</strong>, check <strong>repo</strong> scope</span>
          </div>
          <div className="setup-step">
            <span className="setup-step-num">3</span>
            <span>Paste the token below — it stays on this device only</span>
          </div>
        </div>

        <input
          className="setup-input"
          type="password"
          placeholder="ghp_xxxxxxxxxxxxxxxxxx"
          value={token}
          onChange={(e) => { setToken(e.target.value); setStatus('idle'); }}
          onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
        />

        {status === 'error' && (
          <p className="setup-error">{errorMsg}</p>
        )}

        <button
          className="setup-btn"
          onClick={handleConnect}
          disabled={!token.trim() || status === 'checking'}
        >
          {status === 'checking' ? 'Verifying...' : 'Connect & Continue'}
        </button>

        <p className="setup-note">
          🔒 Token is stored only in your browser's localStorage — never sent anywhere except GitHub's API.
        </p>
      </div>
    </div>
  );
}
