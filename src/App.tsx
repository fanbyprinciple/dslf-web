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
  saveToken,
  loadFightsFromGitHub,
  saveFightsToGitHub,
  validateToken,
} from './githubStorage';
import './App.css';

type AppScreen = 'dashboard' | 'reset' | 'calendar' | 'statistics';
type AppState = 'loading' | 'ready' | 'error';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [screen, setScreen] = useState<AppScreen>('dashboard');
  // tokenPrompt: show token setup inline when trying to log a fight on a tokenless device
  const [tokenPrompt, setTokenPrompt] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [streakDays, setStreakDays] = useState(0);
  const [lastFightReason, setLastFightReason] = useState('Communication');
  const [fights, setFights] = useState<Fight[]>([]);
  const [syncError, setSyncError] = useState('');

  // Bootstrap: load data from public GitHub API — no token required
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setAppState('loading');
    try {
      const loaded = await loadFightsFromGitHub();
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

  // Called when user completes token setup from the inline prompt
  const handleTokenSetupComplete = useCallback(async (t: string) => {
    saveToken(t);
    setToken(t);
    setTokenPrompt(false);
    setModalVisible(true);
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

  const handleLogFight = useCallback(() => {
    if (!token) {
      // No token on this device — ask for it before showing modal
      setTokenPrompt(true);
    } else {
      setModalVisible(true);
    }
  }, [token]);

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
        <button className="app-error-retry" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  // Inline token setup: shown when user hits "Log Fight" on a device without a token
  if (tokenPrompt) {
    return (
      <SetupScreen
        onComplete={handleTokenSetupComplete}
        onSkip={() => setTokenPrompt(false)}
      />
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
