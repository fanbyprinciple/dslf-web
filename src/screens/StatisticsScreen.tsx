import React, { useMemo } from 'react';
import { Fight, WEEK_DAYS, getWeekDotStatuses } from '../utils';
import './StatisticsScreen.css';

interface StatisticsScreenProps {
  fights: Fight[];
  currentStreak: number;
  onBack: () => void;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function StatisticsScreen({
  fights,
  currentStreak,
  onBack,
}: StatisticsScreenProps) {
  const weekStatuses = useMemo(() => getWeekDotStatuses(fights), [fights]);

  const stats = useMemo(() => {
    const totalFights = fights.length;

    let avgDaysBetween = 0;
    let bestStreak = currentStreak;
    if (fights.length > 1) {
      const sortedFights = [...fights].sort((a, b) => a.timestamp - b.timestamp);
      let totalDays = 0;
      let maxGap = 0;
      for (let i = 1; i < sortedFights.length; i++) {
        const diff = sortedFights[i].timestamp - sortedFights[i - 1].timestamp;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        totalDays += days;
        if (days > maxGap) maxGap = days;
      }
      avgDaysBetween = Math.round(totalDays / (sortedFights.length - 1));
      bestStreak = Math.max(currentStreak, maxGap);
    }

    const reasonCounts: Record<string, number> = {};
    fights.forEach((fight) => {
      reasonCounts[fight.reason] = (reasonCounts[fight.reason] || 0) + 1;
    });

    let topReason = '';
    let topReasonPct = 0;
    let maxCount = 0;
    Object.entries(reasonCounts).forEach(([reason, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topReason = reason;
        topReasonPct = totalFights > 0 ? Math.round((count / totalFights) * 100) : 0;
      }
    });

    const otherReasons = Object.entries(reasonCounts)
      .filter(([r]) => r !== topReason)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([r, c]) => `${r} ${totalFights > 0 ? Math.round((c / totalFights) * 100) : 0}%`)
      .join('   ');

    // Monthly breakdown (last 4 months)
    const now = new Date();
    const monthlyData: { month: string; count: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const count = fights.filter((f) => {
        const fd = new Date(f.timestamp);
        return `${fd.getFullYear()}-${fd.getMonth()}` === key;
      }).length;
      monthlyData.push({ month: MONTHS[d.getMonth()], count });
    }
    const maxMonthly = Math.max(...monthlyData.map((m) => m.count), 1);

    const resolvedSameDay = fights.filter((f) => {
      // We treat all as resolved since we don't track resolution separately
      return true;
    }).length;
    const resolvedPct = totalFights > 0 ? Math.round((resolvedSameDay / totalFights) * 100) : 0;

    return {
      totalFights,
      currentStreak,
      avgDaysBetween,
      bestStreak,
      topReason,
      topReasonPct,
      otherReasons,
      monthlyData,
      maxMonthly,
      resolvedPct,
    };
  }, [fights, currentStreak]);

  return (
    <div className="stats-root">
      {/* Status bar */}
      <div className="stats-status-bar">
        <span className="stats-status-time">9:41</span>
        <div className="stats-status-icons">
          <span>WiFi</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <div className="stats-header">
        <button className="stats-back-btn" onClick={onBack}>←</button>
        <h1 className="stats-header-title">Fight Stats</h1>
        <div className="stats-header-right">↑</div>
      </div>

      <div className="stats-content">
        {/* ALL TIME STATS label */}
        <div className="stats-section-label">
          <span className="stats-section-label-text">ALL TIME STATS</span>
        </div>

        {/* KPI Row */}
        <div className="stats-kpi-row">
          <div className="stats-kpi-card stats-kpi-dark">
            <span className="stats-kpi-label stats-kpi-label-yellow">TOTAL FIGHTS</span>
            <span className="stats-kpi-value stats-kpi-value-white">{stats.totalFights}</span>
          </div>
          <div className="stats-kpi-card stats-kpi-dark">
            <span className="stats-kpi-label stats-kpi-label-yellow">AVG DAYS APART</span>
            <span className="stats-kpi-value stats-kpi-value-white">{stats.avgDaysBetween || '—'}</span>
          </div>
          <div className="stats-kpi-card stats-kpi-yellow">
            <span className="stats-kpi-label stats-kpi-label-dark">BEST STREAK</span>
            <span className="stats-kpi-value stats-kpi-value-dark">{stats.bestStreak}d</span>
          </div>
        </div>

        {/* WEEK STREAK label */}
        <div className="stats-section-label">
          <span className="stats-section-label-text">WEEK STREAK</span>
        </div>

        {/* Week dots */}
        <div className="stats-week-dots">
          {WEEK_DAYS.map((day, i) => (
            <div key={i} className={`stats-week-dot stats-week-dot-${weekStatuses[i]}`}>
              <span className="stats-week-dot-label">{day}</span>
            </div>
          ))}
        </div>

        {/* TOP FIGHT TRIGGERS label */}
        <div className="stats-section-label">
          <span className="stats-section-label-text">TOP FIGHT TRIGGERS</span>
        </div>

        {/* Triggers card */}
        <div className="stats-trig-wrap">
          <div className="stats-detail-card">
            {stats.topReason ? (
              <>
                <span className="stats-card-badge">
                  #1 TRIGGER — {stats.topReason.toUpperCase()}
                </span>
                <span className="stats-card-headline">
                  {stats.topReasonPct}% of all logged fights
                </span>
                <span className="stats-card-sub">{stats.otherReasons || 'No other triggers yet'}</span>
                <span className="stats-card-tip">
                  Tip: Set a 10-min cool-down before discussing sensitive topics.
                </span>
              </>
            ) : (
              <span className="stats-card-headline">No fights logged yet</span>
            )}
          </div>
        </div>

        {/* MONTHLY BREAKDOWN label */}
        <div className="stats-section-label">
          <span className="stats-section-label-text">MONTHLY BREAKDOWN</span>
        </div>

        {/* Bar chart */}
        <div className="stats-chart-wrap">
          <div className="stats-bar-chart">
            {stats.monthlyData.map(({ month, count }) => {
              const heightPct = stats.maxMonthly > 0 ? (count / stats.maxMonthly) : 0;
              const barH = Math.max(Math.round(heightPct * 70), count > 0 ? 8 : 0);
              return (
                <div key={month} className="stats-bar-col">
                  <div className="stats-bar-slot">
                    {count > 0 && (
                      <div className="stats-bar-fill" style={{ height: barH }}>
                        <span className="stats-bar-count">{count}</span>
                      </div>
                    )}
                  </div>
                  <span className="stats-bar-label">{month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RELATIONSHIP INSIGHT label */}
        <div className="stats-section-label">
          <span className="stats-section-label-text">RELATIONSHIP INSIGHT</span>
        </div>

        {/* Insight card */}
        <div className="stats-insight-wrap">
          <div className="stats-detail-card">
            <span className="stats-card-badge">RELATIONSHIP INSIGHT</span>
            <span className="stats-card-headline">
              {stats.resolvedPct}% of fights logged and tracked
            </span>
            <span className="stats-card-status-green">You're building healthy habits</span>
            <span className="stats-card-tip">
              {stats.bestStreak > 0
                ? `Your longest streak was ${stats.bestStreak} days.`
                : 'Start logging fights to track your patterns.'}{' '}
              {stats.topReason
                ? `${stats.topReason} triggers ${stats.topReasonPct}% of all fights — try a 10-min cool-down rule before sensitive conversations.`
                : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
