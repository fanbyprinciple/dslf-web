import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
} from 'remotion';
import HomeScreen from '../src/screens/HomeScreen';
import FightLogModal from '../src/screens/FightLogModal';
import StreakResetScreen from '../src/screens/StreakResetScreen';
import CalendarScreen from '../src/screens/CalendarScreen';
import StatisticsScreen from '../src/screens/StatisticsScreen';
import PhoneFrame from './scenes/PhoneFrame';
import { MOCK_FIGHTS, MOCK_STREAK, MOCK_LAST_REASON } from './mockData';

// Scene durations in frames (30fps)
const FPS = 30;
const INTRO_DUR = 2.5 * FPS;       // 75f
const HOME_DUR = 3.5 * FPS;        // 105f
const MODAL_DUR = 3.5 * FPS;       // 105f
const RESET_DUR = 3 * FPS;         // 90f
const CALENDAR_DUR = 3.5 * FPS;    // 105f
const STATS_DUR = 4 * FPS;         // 120f
const OUTRO_DUR = 2 * FPS;         // 60f

export const TOTAL_FRAMES =
  INTRO_DUR + HOME_DUR + MODAL_DUR + RESET_DUR + CALENDAR_DUR + STATS_DUR + OUTRO_DUR;

// ── Slide-in wrapper ──────────────────────────────────────────
function SlideIn({
  children,
  from = 'right',
}: {
  children: React.ReactNode;
  from?: 'right' | 'left' | 'bottom';
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 18, mass: 0.7 } });

  const dx =
    from === 'right' ? interpolate(progress, [0, 1], [440, 0]) :
    from === 'left'  ? interpolate(progress, [0, 1], [-440, 0]) :
                       interpolate(progress, [0, 1], [0, 0]);
  const dy = from === 'bottom' ? interpolate(progress, [0, 1], [200, 0]) : 0;
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div style={{ transform: `translate(${dx}px, ${dy}px)`, opacity }}>
      {children}
    </div>
  );
}

// ── Intro scene ───────────────────────────────────────────────
function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const subProgress = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 14 } });

  return (
    <AbsoluteFill
      style={{
        background: '#FFD600',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: '#1A1A1A',
          letterSpacing: -2,
          transform: `scale(${interpolate(titleProgress, [0, 1], [0.6, 1])})`,
          opacity: titleProgress,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        DSLF
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#1A1A1A',
          opacity: subProgress,
          transform: `translateY(${interpolate(subProgress, [0, 1], [20, 0])}px)`,
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: 1,
        }}
      >
        Days Since Last Fight
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 14,
          fontWeight: 500,
          color: '#555',
          opacity: subProgress,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Relationship safety tracker
      </div>
    </AbsoluteFill>
  );
}

// ── Outro scene ───────────────────────────────────────────────
function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({ frame, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill
      style={{
        background: '#1A1A1A',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: '#FFD600',
          opacity: progress,
          transform: `scale(${interpolate(progress, [0, 1], [0.8, 1])})`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Keep the streak alive.
      </div>
      <div
        style={{
          fontSize: 16,
          color: '#888',
          opacity: interpolate(frame, [10, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        fanbyprinciple.github.io/dslf-web
      </div>
    </AbsoluteFill>
  );
}

// ── Phone scene wrapper ───────────────────────────────────────
function PhoneScene({
  children,
  slideFrom = 'right',
  bgColor = '#f7f7f7',
}: {
  children: React.ReactNode;
  slideFrom?: 'right' | 'left' | 'bottom';
  bgColor?: string;
}) {
  return (
    <AbsoluteFill
      style={{ background: '#111', alignItems: 'center', justifyContent: 'center' }}
    >
      <SlideIn from={slideFrom}>
        <PhoneFrame>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor }}>
            {children}
          </div>
        </PhoneFrame>
      </SlideIn>
    </AbsoluteFill>
  );
}

// ── Main composition ──────────────────────────────────────────
export default function Showcase() {
  let offset = 0;

  const introStart = offset; offset += INTRO_DUR;
  const homeStart = offset; offset += HOME_DUR;
  const modalStart = offset; offset += MODAL_DUR;
  const resetStart = offset; offset += RESET_DUR;
  const calendarStart = offset; offset += CALENDAR_DUR;
  const statsStart = offset; offset += STATS_DUR;
  const outroStart = offset;

  return (
    <AbsoluteFill>
      <Sequence from={introStart} durationInFrames={INTRO_DUR}>
        <IntroScene />
      </Sequence>

      <Sequence from={homeStart} durationInFrames={HOME_DUR}>
        <PhoneScene bgColor="#FFD600">
          <HomeScreen
            streakDays={MOCK_STREAK}
            fights={MOCK_FIGHTS}
            onLogFight={() => {}}
            onViewCalendar={() => {}}
            onViewStatistics={() => {}}
          />
        </PhoneScene>
      </Sequence>

      <Sequence from={modalStart} durationInFrames={MODAL_DUR}>
        <PhoneScene slideFrom="bottom" bgColor="#f7f7f7">
          <div style={{ flex: 1, position: 'relative' }}>
            <FightLogModal
              visible={true}
              onSave={() => {}}
              onCancel={() => {}}
            />
          </div>
        </PhoneScene>
      </Sequence>

      <Sequence from={resetStart} durationInFrames={RESET_DUR}>
        <PhoneScene bgColor="#FFD600">
          <StreakResetScreen
            lastReason={MOCK_LAST_REASON}
            onDone={() => {}}
          />
        </PhoneScene>
      </Sequence>

      <Sequence from={calendarStart} durationInFrames={CALENDAR_DUR}>
        <PhoneScene slideFrom="left" bgColor="#f7f7f7">
          <CalendarScreen fights={MOCK_FIGHTS} onBack={() => {}} />
        </PhoneScene>
      </Sequence>

      <Sequence from={statsStart} durationInFrames={STATS_DUR}>
        <PhoneScene bgColor="#F5F5F0">
          <StatisticsScreen
            fights={MOCK_FIGHTS}
            currentStreak={MOCK_STREAK}
            onBack={() => {}}
          />
        </PhoneScene>
      </Sequence>

      <Sequence from={outroStart} durationInFrames={OUTRO_DUR}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
}
