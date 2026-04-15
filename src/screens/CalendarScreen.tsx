import React, { useEffect, useState } from 'react';
import { Fight } from '../utils';
import './CalendarScreen.css';

interface CalendarScreenProps {
  fights: Fight[];
  onBack: () => void;
}

interface SelectedFight extends Fight {
  resolved?: boolean;
}

export default function CalendarScreen({ fights, onBack }: CalendarScreenProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<(number | null)[]>([]);
  const [fightsByDate, setFightsByDate] = useState<Map<string, Fight[]>>(new Map());
  const [selectedFight, setSelectedFight] = useState<SelectedFight | null>(null);

  useEffect(() => {
    const dateMap = new Map<string, Fight[]>();
    fights.forEach((fight) => {
      const date = new Date(fight.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      const existing = dateMap.get(key) || [];
      dateMap.set(key, [...existing, fight]);
    });
    setFightsByDate(dateMap);
  }, [fights]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: (number | null)[] = [];
    const current = new Date(startDate);

    while (days.length < 42) {
      if (current.getMonth() === month) {
        days.push(current.getDate());
      } else {
        days.push(null);
      }
      current.setDate(current.getDate() + 1);
    }

    setCalendarDays(days);
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const getDateKey = (day: number) => {
    return `${currentMonth.getFullYear()}-${currentMonth.getMonth()}-${day}`;
  };

  const isFightDay = (day: number | null) => {
    if (day === null) return false;
    return fightsByDate.has(getDateKey(day));
  };

  const handleDayClick = (day: number | null) => {
    if (day === null || !isFightDay(day)) {
      setSelectedFight(null);
      return;
    }
    const dayFights = fightsByDate.get(getDateKey(day));
    if (dayFights && dayFights.length > 0) {
      setSelectedFight(dayFights[dayFights.length - 1]);
    }
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-root">
      {/* Header */}
      <div className="calendar-header">
        <button className="calendar-back-btn" onClick={onBack}>
          ←
        </button>
        <h1 className="calendar-header-title">Fight History</h1>
        <div className="calendar-header-right">≡</div>
      </div>

      <div className="calendar-content">
        {/* Month Navigation */}
        <div className="calendar-month-nav">
          <button className="calendar-month-btn" onClick={handlePrevMonth}>
            ← Prev
          </button>
          <span className="calendar-month-label">{monthName}</span>
          <button className="calendar-month-btn" onClick={handleNextMonth}>
            Next →
          </button>
        </div>

        {/* Day Headers */}
        <div className="calendar-day-header-row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="calendar-day-header-cell">
              <span className="calendar-day-header-text">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className="calendar-day-cell"
              onClick={() => handleDayClick(day)}
            >
              {day !== null ? (
                <div
                  className={`calendar-day-content ${
                    isFightDay(day) ? 'calendar-day-content-fight' : ''
                  }`}
                >
                  <span
                    className={`calendar-day-text ${
                      isFightDay(day) ? 'calendar-day-text-fight' : ''
                    }`}
                  >
                    {day}
                  </span>
                  {isFightDay(day) && (
                    <span className="calendar-fight-dot" />
                  )}
                </div>
              ) : (
                <div className="calendar-day-content" />
              )}
            </div>
          ))}
        </div>

        {/* Hint or Detail Card */}
        {!selectedFight ? (
          <div className="calendar-hint-wrap">
            <span className="calendar-hint-text">TAP A DATE TO SEE DETAILS</span>
          </div>
        ) : (
          <div className="calendar-card-wrap">
            <div className="calendar-detail-card">
              <span className="calendar-detail-date">
                {new Date(selectedFight.timestamp).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="calendar-detail-reason">Reason: {selectedFight.reason}</span>
              <span className="calendar-detail-status">Status: Resolved</span>
              <span className="calendar-detail-notes">
                Note: Fight logged via app.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
