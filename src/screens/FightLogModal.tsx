import React, { useState } from 'react';
import './FightLogModal.css';

const REASONS = ['Communication', 'Money', 'Work Stress', 'Family', 'Chores', 'Other'];

interface FightLogModalProps {
  visible: boolean;
  onSave: (reason: string, notes: string, resolved: boolean) => void;
  onCancel: () => void;
}

export default function FightLogModal({ visible, onSave, onCancel }: FightLogModalProps) {
  const [selectedReason, setSelectedReason] = useState('Communication');
  const [notes, setNotes] = useState('');
  const [resolved, setResolved] = useState(true);

  const handleSave = () => {
    onSave(selectedReason, notes, resolved);
    setSelectedReason('Communication');
    setNotes('');
    setResolved(true);
  };

  const handleCancel = () => {
    setSelectedReason('Communication');
    setNotes('');
    setResolved(true);
    onCancel();
  };

  if (!visible) return null;

  return (
    <div className="fight-log-modal-overlay">
      <div className="fight-log-modal-sheet">
        {/* Header */}
        <div className="fight-log-modal-header">
          <div className="fight-log-modal-handle-bar" />
          <h2 className="fight-log-modal-title">Log a Fight</h2>
          <p className="fight-log-modal-subtitle">What happened? Let's track it.</p>
        </div>

        <div className="fight-log-modal-body">
          {/* Quick reason */}
          <div className="fight-log-modal-section">
            <label className="fight-log-modal-section-label">QUICK REASON</label>
            <div className="fight-log-modal-chips-row">
              {REASONS.slice(0, 3).map((r) => (
                <button
                  key={r}
                  className={`fight-log-modal-chip ${
                    selectedReason === r ? 'fight-log-modal-chip-selected' : ''
                  }`}
                  onClick={() => setSelectedReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="fight-log-modal-chips-row">
              {REASONS.slice(3).map((r) => (
                <button
                  key={r}
                  className={`fight-log-modal-chip ${
                    selectedReason === r ? 'fight-log-modal-chip-selected' : ''
                  }`}
                  onClick={() => setSelectedReason(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="fight-log-modal-section">
            <label className="fight-log-modal-section-label">NOTES (OPTIONAL)</label>
            <textarea
              className="fight-log-modal-notes-field"
              placeholder="Add details about what happened..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Resolved toggle */}
          <div className="fight-log-modal-resolved-row">
            <label className="fight-log-modal-resolved-label">Resolved?</label>
            <div className="fight-log-modal-toggle-wrap">
              <button
                className={`fight-log-modal-toggle-btn ${
                  resolved ? 'fight-log-modal-toggle-btn-active' : ''
                }`}
                onClick={() => setResolved(true)}
              >
                <span
                  className={`fight-log-modal-toggle-btn-text ${
                    resolved ? 'fight-log-modal-toggle-btn-text-active' : ''
                  }`}
                >
                  YES
                </span>
              </button>
              <button
                className={`fight-log-modal-toggle-btn ${
                  !resolved ? 'fight-log-modal-toggle-btn-active' : ''
                }`}
                onClick={() => setResolved(false)}
              >
                <span
                  className={`fight-log-modal-toggle-btn-text ${
                    !resolved ? 'fight-log-modal-toggle-btn-text-active' : ''
                  }`}
                >
                  NO
                </span>
              </button>
            </div>
          </div>

          <div className="fight-log-modal-divider" />

          {/* Save button */}
          <button className="fight-log-modal-save-btn" onClick={handleSave}>
            SAVE &amp; RESET STREAK
          </button>

          {/* Cancel */}
          <button className="fight-log-modal-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
