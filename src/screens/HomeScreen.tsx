import React from 'react';
import { Fight, WEEK_DAYS, getWeekDotStatuses } from '../utils';
import './HomeScreen.css';

interface HomeScreenProps {
  streakDays: number;
  fights: Fight[];
  onLogFight: () => void;
  onViewCalendar: () => void;
  onViewStatistics: () => void;
}

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}

export default function HomeScreen({
  streakDays,
  fights,
  onLogFight,
  onViewCalendar,
  onViewStatistics,
}: HomeScreenProps) {
  const weekStatuses = getWeekDotStatuses(fights);

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
            <div className="home-days-since-text">
              {streakDays === 1 ? 'Day' : 'Days'} Since Last Fight
            </div>
          </div>

          {/* Bottom stripe */}
          <div className="safety-stripes"></div>
        </div>

        {/* Week streak dots */}
        <div className="home-week-dots">
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className={`home-week-dot home-week-dot-${weekStatuses[i]}`}>
              <span className="home-week-dot-label">{day}</span>
            </div>
          ))}
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
            <CalendarIcon />
            <span className="home-nav-btn-label">HISTORY</span>
          </button>
          <button className="home-nav-btn" onClick={onViewStatistics}>
            <BarChartIcon />
            <span className="home-nav-btn-label">STATS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
