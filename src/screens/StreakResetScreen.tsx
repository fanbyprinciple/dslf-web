import React, { useEffect, useState } from 'react';
import './StreakResetScreen.css';

interface StreakResetScreenProps {
  lastReason: string;
  onDone: () => void;
}

export default function StreakResetScreen({ lastReason, onDone }: StreakResetScreenProps) {
  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const [snackbarOpacity, setSnackbarOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSnackbarOpacity(0);
      setTimeout(() => setSnackbarVisible(false), 400);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="streak-reset-root">
      {/* Header */}
      <div className="streak-reset-header">
        <span className="streak-reset-status-time">9:41</span>
        <span className="streak-reset-status-icons">●●●</span>
      </div>

      {/* Main content */}
      <div className="streak-reset-content">
        {/* Safety sign */}
        <div className="streak-reset-sign-frame">
          <div className="streak-reset-inner-sign">
            <div className="safety-stripes-inverted"></div>
            <div className="streak-reset-inner-sign-body">
              <div className="streak-reset-white-box">
                <span className="streak-reset-zero-num">0</span>
              </div>
              <div className="streak-reset-days-text">DAYS</div>
              <div className="streak-reset-since-text">SINCE LAST FIGHT</div>
            </div>
            <div className="safety-stripes-inverted"></div>
          </div>
        </div>

        {/* Reset message */}
        <div className="streak-reset-msg-frame">
          <h2 className="streak-reset-title">Streak reset. Starting fresh 💪</h2>
          <p className="streak-reset-sub">Every day without a fight is a win.</p>
        </div>

        {/* Info card */}
        <div className="streak-reset-info-card">
          <div className="streak-reset-warning-icon">!</div>
          <div className="streak-reset-info-texts">
            <div className="streak-reset-info-top">Last fight reason: {lastReason}</div>
            <div className="streak-reset-info-bottom">Try to improve this area 💡</div>
          </div>
        </div>

        {/* Done button */}
        <button className="streak-reset-done-btn" onClick={onDone}>
          DONE
        </button>
      </div>

      {/* Snackbar */}
      {snackbarVisible && (
        <div
          className="streak-reset-snackbar"
          style={{ opacity: snackbarOpacity, transition: 'opacity 0.4s ease' }}
        >
          <span className="streak-reset-snackbar-text">Fight logged</span>
          <button className="streak-reset-undo-btn" onClick={onDone}>
            UNDO
          </button>
        </div>
      )}
    </div>
  );
}
