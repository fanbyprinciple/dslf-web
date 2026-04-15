import React from 'react';
import { Colors } from '../constants';
import './HomeScreen.css';

interface HomeScreenProps {
  streakDays: number;
  onLogFight: () => void;
  onViewCalendar: () => void;
  onViewStatistics: () => void;
}

export default function HomeScreen({
  streakDays,
  onLogFight,
  onViewCalendar,
  onViewStatistics,
}: HomeScreenProps) {
  return (
    <div className="home-root">
      {/* Header */}
      <div className="home-header">
        <span className="home-status-time">9:41</span>
      </div>

      {/* Content */}
      <div className="home-content-wrap">
        {/* Safety Sign */}
        <div className="home-sign-outer">
          {/* Top stripe */}
          <div className="safety-stripes"></div>

          {/* Inner yellow section */}
          <div className="home-sign-inner">
            {/* Number box */}
            <div className="home-num-box">
              <span className="home-num-text">{streakDays}</span>
            </div>
            <div className="home-days-text">DAYS</div>
            <div className="home-since-text">SINCE LAST FIGHT</div>
          </div>

          {/* Bottom stripe */}
          <div className="safety-stripes"></div>
        </div>

        {/* Tagline */}
        <div className="home-tagline">
          Relationship safety record — keep the streak alive
        </div>

        {/* CTA Button */}
        <button className="home-log-btn" onClick={onLogFight}>
          <div className="home-log-btn-accent" />
          <div className="home-log-btn-inner">
            <span className="home-log-btn-text">LOG FIGHT TODAY</span>
          </div>
        </button>

        {/* Navigation Buttons */}
        <div className="home-nav-buttons-row">
          <button className="home-nav-btn" onClick={onViewCalendar}>
            <span className="home-nav-btn-icon">📅</span>
            <span className="home-nav-btn-label">Fight History</span>
          </button>
          <button className="home-nav-btn" onClick={onViewStatistics}>
            <span className="home-nav-btn-icon">📊</span>
            <span className="home-nav-btn-label">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
}
