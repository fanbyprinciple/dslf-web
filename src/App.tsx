import React, { useEffect, useState, useCallback } from 'react';
import HomeScreen from './screens/HomeScreen';
import FightLogModal from './screens/FightLogModal';
import StreakResetScreen from './screens/StreakResetScreen';
import CalendarScreen from './screens/CalendarScreen';
import StatisticsScreen from './screens/StatisticsScreen';
import SetupScreen from './screens/SetupScreen';
import { Fight, computeStreakDays } from './utils';
import {
  getStoredToken,
  loadFightsFromGitHub,
  saveFightsToGitHub,
} from './githubStorage';
import './App.css';

type AppScreen = 'dashboard' | 'reset' | 'calendar' | 'statistics';
type AppState = 'setup' | 'loading' | 'ready' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  const [modalVisible, setModalVisible] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [lastFightReason, setLastFightReason] = useState('Communication');
  const [fights, setFights] = useState<Fight[]>([]);
  const [syncError, setSyncError] = useState('');

  // Bootstrap: check for token then load data
  useEffect(() => {
    const t = getStoredToken();
    if (!t) {
      setAppState('setup');
      return;
    }
    setToken(t);
    loadData(t);
  }, []);

  async function loadData(t: string) {
    setAppState('loading');
    try {
      const loaded = await loadFightsFromGitHub(t);
      setFights(loaded);
      const last = loaded.length > 0 ? Math.max(...loaded.map((f) => f.timestamp)) : null;
      setStreakDays(computeStreakDays(last));
      if (loaded.length > 0) {
        const latest = loaded.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));
        setLastFightReason(latest.reason);
      }
      setAppState('ready');
    } catch (e: any) {
      setSyncError(e.message || 'Failed to load data from GitHub');
      setAppState('error');
    }
  }

  const handleSetupComplete = useCallback((t: string) => {
    setToken(t);
    loadData(t);
  }, []);

  // Recalculate streak every minute on dashboard
  useEffect(() => {
    if (screen !== 'dashboard' || appState !== 'ready') return;
    const interval = setInterval(() => {
      const last = fights.length > 0 ? Math.max(...fights.map((f) => f.timestamp)) : null;
      setStreakDays(computeStreakDays(last));
    }, 60_000);
    return () => clearInterval(interval);
  }, [screen, fights, appState]);

  const handleLogFight = useCallback(() => setModalVisible(true), []);

  const handleSaveFight = useCallback(
    async (reason: string, notes: string, resolved: boolean) => {
      const now = Date.now();
      const newFight: Fight = { timestamp: now, reason, notes, resolved };
      const updatedFights = [...fights, newFight];

      setFights(updatedFights);
      setLastFightReason(reason);
      setStreakDays(0);
      setModalVisible(false);
      setScreen('reset');

      // Persist to GitHub in background
      if (token) {
        try {
          await saveFightsToGitHub(token, updatedFights);
        } catch (e: any) {
          console.error('GitHub save failed:', e.message);
        }
      }
    },
    [fights, token]
  );

  const handleDone = useCallback(() => setScreen('dashboard'), []);

  if (appState === 'setup') {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  if (appState === 'loading') {
    return (
      <div className="app-loading-screen">
        <span className="app-loading-spinner">🔥</span>
        <span className="app-loading-text">Loading from GitHub…</span>
      </div>
    );
  }

  if (appState === 'error') {
    return (
      <div className="app-error-screen">
        <span className="app-error-icon">⚠️</span>
        <p className="app-error-title">Could not reach GitHub</p>
        <p className="app-error-msg">{syncError}</p>
        <button className="app-error-retry" onClick={() => token && loadData(token)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {screen === 'dashboard' && (
        <>
          <HomeScreen
            streakDays={streakDays}
            fights={fights}
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
