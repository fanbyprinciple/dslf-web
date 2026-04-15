import React, { useEffect, useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import FightLogModal from './screens/FightLogModal';
import StreakResetScreen from './screens/StreakResetScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import { Fight, computeStreakDays, getLocalStorageItem, setLocalStorageItem } from './utils';
import { STORAGE_KEYS } from './constants';
import './App.css';

type AppScreen = 'dashboard' | 'reset' | 'calendar' | 'statistics';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  const [modalVisible, setModalVisible] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [lastFightReason, setLastFightReason] = useState('Communication');
  const [loading, setLoading] = useState(true);
  const [fights, setFights] = useState<Fight[]>([]);

  // Load persisted data on mount
  useEffect(() => {
    const tsRaw = getLocalStorageItem(STORAGE_KEYS.lastFightTimestamp);
    const reason = getLocalStorageItem(STORAGE_KEYS.lastFightReason);
    const fightHistoryRaw = getLocalStorageItem(STORAGE_KEYS.fightHistory);

    const ts = tsRaw ? parseInt(tsRaw, 10) : null;
    setStreakDays(computeStreakDays(ts));
    if (reason) setLastFightReason(reason);
    if (fightHistoryRaw) {
      try {
        const history = JSON.parse(fightHistoryRaw) as Fight[];
        setFights(history);
      } catch (_e) {
        // ignore parse errors
      }
    }
    setLoading(false);
  }, []);

  // Recalculate streak every minute while on dashboard
  useEffect(() => {
    if (screen !== 'dashboard') return;
    const interval = setInterval(() => {
      const tsRaw = getLocalStorageItem(STORAGE_KEYS.lastFightTimestamp);
      const ts = tsRaw ? parseInt(tsRaw, 10) : null;
      setStreakDays(computeStreakDays(ts));
    }, 60_000);
    return () => clearInterval(interval);
  }, [screen]);

  const handleLogFight = useCallback(() => {
    setModalVisible(true);
  }, []);

  const handleSaveFight = useCallback(
    (reason: string, _notes: string, _resolved: boolean) => {
      const now = Date.now();
      const newFight: Fight = { timestamp: now, reason };
      const updatedFights = [...fights, newFight];
      
      setLocalStorageItem(STORAGE_KEYS.lastFightTimestamp, String(now));
      setLocalStorageItem(STORAGE_KEYS.lastFightReason, reason);
      setLocalStorageItem(STORAGE_KEYS.fightHistory, JSON.stringify(updatedFights));
      
      setFights(updatedFights);
      setLastFightReason(reason);
      setStreakDays(0);
      setModalVisible(false);
      setScreen('reset');
    },
    [fights]
  );

  const handleDone = useCallback(() => {
    setScreen('dashboard');
  }, []);

  if (loading) {
    return <div className="app-loading" />;
  }

  return (
    <div className="app-container">
      {screen === 'dashboard' && (
        <>
          <HomeScreen
            streakDays={streakDays}
            onLogFight={handleLogFight}
            onViewCalendar={() => setScreen('calendar')}
            onViewStatistics={() => setScreen('statistics')}
          />
          <FightLogModal
            visible={modalVisible}
            onSave={handleSaveFight}
            onCancel={() => setModalVisible(false)}
          />
        </>
      )}

      {screen === 'reset' && (
        <StreakResetScreen lastReason={lastFightReason} onDone={handleDone} />
      )}

      {screen === 'calendar' && (
        <CalendarScreen fights={fights} onBack={() => setScreen('dashboard')} />
      )}

      {screen === 'statistics' && (
        <StatisticsScreen
          fights={fights}
          currentStreak={streakDays}
          onBack={() => setScreen('dashboard')}
        />
      )}
    </div>
  );
}
