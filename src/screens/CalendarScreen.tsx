import React, { useEffect, useMemo, useState } from 'react';
import { Fight } from '../utils';
import './CalendarScreen.css';

interface CalendarScreenProps {
  fights: Fight[];
  onBack: () => void;
}

type DayStatus = 'streak' | 'fight' | 'today-streak' | 'today-fight' | 'today-empty' | 'future' | 'empty';

interface DayCell {
  day: number | null;
  date: Date | null;
  status: DayStatus;
  connectLeft: boolean;
  connectRight: boolean;
  fightCount: number;
  fightReason?: string;
  fightResolved?: boolean;
  fightNotes?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function buildCalendar(year: number, month: number, fights: Fight[]): DayCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fightDateSet = new Set<string>();
  const fightCountMap: Record<string, number> = {};
  const fightReasonMap: Record<string, string> = {};
  const fightResolvedMap: Record<string, boolean> = {};
  const fightNotesMap: Record<string, string> = {};
  fights.forEach((f) => {
    const d = new Date(f.timestamp);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    fightDateSet.add(key);
    fightCountMap[key] = (fightCountMap[key] || 0) + 1;
    fightReasonMap[key] = f.reason;
    if (f.resolved !== undefined) fightResolvedMap[key] = f.resolved;
    if (f.notes) fightNotesMap[key] = f.notes;
  });

  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const rawDays: (Date | null)[] = [];
  const cur = new Date(startDate);
  while (rawDays.length < 42) {
    rawDays.push(cur.getMonth() === month ? new Date(cur) : null);
    cur.setDate(cur.getDate() + 1);
  }

  // Remove trailing empty rows
  while (rawDays.length > 35 && rawDays.slice(-7).every((d) => d === null)) {
    rawDays.splice(-7);
  }

  const cells: DayCell[] = rawDays.map((date) => {
    if (!date) return { day: null, date: null, status: 'empty', connectLeft: false, connectRight: false, fightCount: 0 };
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const isToday = date.getTime() === today.getTime();
    const isPast = date < today;
    const isFight = fightDateSet.has(key);
    let status: DayStatus;
    if (isToday) {
      status = isFight ? 'today-fight' : 'today-streak';
    } else if (isPast) {
      status = isFight ? 'fight' : 'streak';
    } else {
      status = 'future';
    }
    return {
      day: date.getDate(),
      date,
      status,
      connectLeft: false,
      connectRight: false,
      fightCount: fightCountMap[key] || 0,
      fightReason: fightReasonMap[key],
      fightResolved: fightResolvedMap[key],
      fightNotes: fightNotesMap[key],
    };
  });

  // Compute connections for streak days
  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    if (!c.date) continue;
    const isStreakDay = c.status === 'streak' || c.status === 'today-streak';
    if (!isStreakDay) continue;
    const prev = cells[i - 1];
    const next = cells[i + 1];
    const prevStreak = prev?.date && (prev.status === 'streak' || prev.status === 'today-streak');
    const nextStreak = next?.date && (next.status === 'streak' || next.status === 'today-streak');
    // Don't connect across week boundaries
    const dayOfWeek = c.date.getDay();
    c.connectLeft = !!prevStreak && dayOfWeek !== 0;
    c.connectRight = !!nextStreak && dayOfWeek !== 6;
  }

  return cells;
}

export default function CalendarScreen({ fights, onBack }: CalendarScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedCell, setSelectedCell] = useState<DayCell | null>(null);

  const cells = useMemo(
    () => buildCalendar(currentMonth.year, currentMonth.month, fights),
    [currentMonth, fights]
  );

  const monthLabel = new Date(currentMonth.year, currentMonth.month, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  const prevMonth = () => {
    setCurrentMonth(({ year, month }) => {
      if (month === 0) return { year: year - 1, month: 11 };
      return { year, month: month - 1 };
    });
  };
  const nextMonth = () => {
    setCurrentMonth(({ year, month }) => {
      if (month === 11) return { year: year + 1, month: 0 };
      return { year, month: month + 1 };
    });
  };

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="cal-root">
      {/* Header */}
      <div className="cal-header">
        <button className="cal-back-btn" onClick={onBack}>←</button>
        <span className="cal-header-title">Fight History</span>
        <div style={{ width: 40 }} />
      </div>

      <div className="cal-scroll">
        {/* Calendar */}
        <div className="cal-calendar-box">
          {/* Month nav */}
          <div className="cal-month-nav">
            <button className="cal-nav-btn" onClick={prevMonth}>‹</button>
            <span className="cal-month-label">{monthLabel}</span>
            <button className="cal-nav-btn" onClick={nextMonth}>›</button>
          </div>

          {/* Weekday headers */}
          <div className="cal-weekday-row">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="cal-weekday-cell">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="cal-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="cal-week-row">
                {week.map((cell, di) => {
                  const isSelected = selectedCell?.date?.getTime() === cell.date?.getTime();
                  return (
                    <div
                      key={di}
                      className={[
                        'cal-day-wrap',
                        cell.connectLeft ? 'cal-connect-left' : '',
                        cell.connectRight ? 'cal-connect-right' : '',
                        (cell.status === 'streak' || cell.status === 'today-streak') ? 'cal-day-wrap-streak' : '',
                      ].join(' ')}
                      onClick={() => cell.day && setSelectedCell(isSelected ? null : cell)}
                    >
                      <div
                        className={[
                          'cal-day-circle',
                          cell.status === 'streak' ? 'cal-day-streak' : '',
                          cell.status === 'fight' ? 'cal-day-fight' : '',
                          cell.status === 'today-streak' ? 'cal-day-today-streak' : '',
                          cell.status === 'today-fight' ? 'cal-day-today-fight' : '',
                          cell.status === 'today-empty' ? 'cal-day-today-empty' : '',
                          cell.status === 'future' ? 'cal-day-future' : '',
                          isSelected ? 'cal-day-selected' : '',
                        ].join(' ')}
                      >
                        {cell.day !== null && (
                          <span className={[
                            'cal-day-num',
                            cell.status === 'streak' ? 'cal-day-num-streak' : '',
                            cell.status === 'fight' ? 'cal-day-num-fight' : '',
                            cell.status === 'today-streak' || cell.status === 'today-fight' ? 'cal-day-num-today' : '',
                            cell.status === 'future' ? 'cal-day-num-future' : '',
                          ].join(' ')}>
                            {cell.day}
                          </span>
                        )}
                      </div>
                      {cell.fightCount > 0 && (
                        <span className="cal-fight-dot">•</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Tap hint */}
        <div className="cal-tap-hint">TAP A DATE TO SEE DETAILS</div>

        {/* Selected day detail */}
        {selectedCell && selectedCell.day && (
          <div className="cal-detail-card">
            <span className="cal-detail-date">
              {selectedCell.date?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            {selectedCell.status === 'streak' || selectedCell.status === 'today-streak' ? (
              <>
                <span className="cal-detail-status-green">Fight-free day</span>
                <span className="cal-detail-notes">No fights logged — streak continued!</span>
              </>
            ) : selectedCell.status === 'fight' || selectedCell.status === 'today-fight' ? (
              <>
                <span className="cal-detail-reason">Reason: {selectedCell.fightReason}</span>
                {selectedCell.fightResolved !== undefined && (
                  <span className={selectedCell.fightResolved ? 'cal-detail-status-green' : 'cal-detail-status-red'}>
                    Status: {selectedCell.fightResolved ? 'Resolved' : 'Unresolved'}
                  </span>
                )}
                {selectedCell.fightNotes && (
                  <span className="cal-detail-notes">Note: {selectedCell.fightNotes}</span>
                )}
              </>
            ) : (
              <span className="cal-detail-notes">Future date</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
