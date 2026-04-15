import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import HomeScreen from '../src/screens/HomeScreen';
import FightLogModal from '../src/screens/FightLogModal';
import StreakResetScreen from '../src/screens/StreakResetScreen';
import CalendarScreen from '../src/screens/CalendarScreen';
import StatisticsScreen from '../src/screens/StatisticsScreen';
import PhoneFrame from './scenes/PhoneFrame';
import { MOCK_FIGHTS, MOCK_STREAK, MOCK_LAST_REASON } from './mockData';

const FPS = 30;

// Fast cut durations
const INTRO_DUR   = Math.round(2.2 * FPS);
const SCENE_DUR   = Math.round(3.0 * FPS);  // each screen scene
const FLASH_DUR   = 4;                        // white flash between cuts
const OUTRO_DUR   = Math.round(2.0 * FPS);

const SCENE_COUNT = 5;
export const TOTAL_FRAMES =
  INTRO_DUR +
  SCENE_COUNT * (SCENE_DUR + FLASH_DUR) +
  OUTRO_DUR;

// ── Hazard Tape Strip ─────────────────────────────────────────
function HazardStrip({ side }: { side: 'left' | 'right' }) {
  const stripeW = 90;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        [side]: 0,
        width: stripeW,
        background: 'repeating-linear-gradient(45deg, #FFD600 0px, #FFD600 30px, #1A1A1A 30px, #1A1A1A 60px)',
        zIndex: 10,
        opacity: 0.95,
      }}
    />
  );
}

// ── Flash overlay ─────────────────────────────────────────────
function FlashOverlay() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, FLASH_DUR], [1, 0], {
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill
      style={{ background: '#FFD600', opacity, zIndex: 100, pointerEvents: 'none' }}
    />
  );
}

// ── 5-point caption block ─────────────────────────────────────
function Caption({
  title,
  points,
  frame,
}: {
  title: string;
  points: string[];
  frame: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: '"Arial Black", system-ui, sans-serif',
      }}
    >
      {/* Screen title */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#FFD600',
          letterSpacing: 4,
          textTransform: 'uppercase',
          opacity: interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' }),
          transform: `translateX(${interpolate(frame, [0, 8], [-30, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        {title}
      </div>

      {/* 5 bullets staggered */}
      {points.map((pt, i) => {
        const startF = 6 + i * 5;
        const prog = spring({
          frame: Math.max(0, frame - startF),
          fps,
          config: { damping: 20, mass: 0.6 },
        });
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              opacity: prog,
              transform: `translateX(${interpolate(prog, [0, 1], [-20, 0])}px)`,
            }}
          >
            <span style={{ color: '#FFD600', fontSize: 18, fontWeight: 900, marginTop: 2 }}>▸</span>
            <span style={{ color: 'white', fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>{pt}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Phone punch-in ────────────────────────────────────────────
function PhonePunch({ children }: { children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 12, mass: 0.5, stiffness: 200 } });
  const scaleVal = interpolate(scale, [0, 1], [0.82, 1]);

  return (
    <div
      style={{
        transform: `scale(${scaleVal})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </div>
  );
}

// ── Full scene layout ─────────────────────────────────────────
function Scene({
  screen,
  title,
  points,
  bgColor = '#f7f7f7',
}: {
  screen: React.ReactNode;
  title: string;
  points: string[];
  bgColor?: string;
}) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      <HazardStrip side="left" />
      <HazardStrip side="right" />

      {/* Horizontal hazard bars top + bottom */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 60,
        background: 'repeating-linear-gradient(90deg, #FFD600 0px, #FFD600 40px, #1A1A1A 40px, #1A1A1A 80px)',
        zIndex: 10,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: 'repeating-linear-gradient(90deg, #FFD600 0px, #FFD600 40px, #1A1A1A 40px, #1A1A1A 80px)',
        zIndex: 10,
      }} />

      {/* Main content area */}
      <AbsoluteFill
        style={{
          top: 60, bottom: 60, left: 90, right: 90,
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Caption above */}
        <div style={{ width: '100%', maxWidth: 700 }}>
          <Caption title={title} points={points} frame={frame} />
        </div>

        {/* Phone */}
        <PhonePunch>
          <PhoneFrame>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: bgColor }}>
              {screen}
            </div>
          </PhoneFrame>
        </PhonePunch>
      </AbsoluteFill>

      <FlashOverlay />
    </AbsoluteFill>
  );
}

// ── Intro ─────────────────────────────────────────────────────
function IntroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 10, mass: 0.4, stiffness: 280 } });
  const subProg = spring({ frame: Math.max(0, frame - 8), fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      <HazardStrip side="left" />
      <HazardStrip side="right" />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 70,
        background: 'repeating-linear-gradient(90deg, #FFD600 0, #FFD600 40px, #1A1A1A 40px, #1A1A1A 80px)',
        zIndex: 10,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        background: 'repeating-linear-gradient(90deg, #FFD600 0, #FFD600 40px, #1A1A1A 40px, #1A1A1A 80px)',
        zIndex: 10,
      }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
        <div style={{
          fontSize: 180,
          fontWeight: 900,
          color: '#FFD600',
          letterSpacing: -8,
          fontFamily: '"Arial Black", sans-serif',
          transform: `scale(${interpolate(titleScale, [0, 1], [0.4, 1])})`,
          opacity: titleScale,
          lineHeight: 1,
          textShadow: '8px 8px 0px #1A1A1A',
        }}>
          DSLF
        </div>
        <div style={{
          fontSize: 32,
          fontWeight: 900,
          color: 'white',
          letterSpacing: 6,
          fontFamily: '"Arial Black", sans-serif',
          opacity: subProg,
          transform: `translateY(${interpolate(subProg, [0, 1], [30, 0])}px)`,
        }}>
          DAYS SINCE LAST FIGHT
        </div>
        <div style={{
          marginTop: 8,
          padding: '10px 32px',
          background: '#FFD600',
          fontSize: 20,
          fontWeight: 900,
          color: '#1A1A1A',
          letterSpacing: 3,
          fontFamily: '"Arial Black", sans-serif',
          opacity: interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          transform: `scaleX(${interpolate(frame, [18, 28], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
        }}>
          FOR COUPLES WHO KEEP RECEIPTS
        </div>
      </AbsoluteFill>
      <FlashOverlay />
    </AbsoluteFill>
  );
}

// ── Outro ─────────────────────────────────────────────────────
function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const prog = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: '#FFD600' }}>
      <HazardStrip side="left" />
      <HazardStrip side="right" />
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 70,
        background: 'repeating-linear-gradient(90deg, #1A1A1A 0, #1A1A1A 40px, #FFD600 40px, #FFD600 80px)',
        zIndex: 10,
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        background: 'repeating-linear-gradient(90deg, #1A1A1A 0, #1A1A1A 40px, #FFD600 40px, #FFD600 80px)',
        zIndex: 10,
      }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <div style={{
          fontSize: 96,
          fontWeight: 900,
          color: '#1A1A1A',
          fontFamily: '"Arial Black", sans-serif',
          transform: `scale(${interpolate(prog, [0, 1], [0.7, 1])})`,
          opacity: prog,
          textAlign: 'center',
          lineHeight: 1,
          letterSpacing: -3,
        }}>
          KEEP THE<br/>STREAK ALIVE.
        </div>
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#555',
          fontFamily: 'system-ui, sans-serif',
          opacity: interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          fanbyprinciple.github.io/dslf-web
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// ── Composition ───────────────────────────────────────────────
export default function Showcase() {
  const scenes: { title: string; points: string[]; bg: string; screen: React.ReactNode }[] = [
    {
      title: 'THE DASHBOARD',
      bg: '#FFD600',
      points: [
        '14 days. Your personal best.',
        'The number that defines you now.',
        'One bad evening away from zero.',
        'Streaks heal. Silence doesn\'t.',
        'Your therapist would be proud. Maybe.',
      ],
      screen: (
        <HomeScreen
          streakDays={MOCK_STREAK}
          fights={MOCK_FIGHTS}
          onLogFight={() => {}}
          onViewCalendar={() => {}}
          onViewStatistics={() => {}}
        />
      ),
    },
    {
      title: 'LOG THE CRIME',
      bg: '#f7f7f7',
      points: [
        'Pick your poison. Communication. Classic.',
        'Notes section: future court exhibit A.',
        'Resolved? Optimistic. Suspicious.',
        'Six reasons. You\'ve hit all six.',
        'This button resets everything. No pressure.',
      ],
      screen: (
        <div style={{ flex: 1, position: 'relative', background: '#00000066' }}>
          <FightLogModal visible={true} onSave={() => {}} onCancel={() => {}} />
        </div>
      ),
    },
    {
      title: 'STREAK RESET',
      bg: '#FFD600',
      points: [
        'Zero days. A new low score.',
        '"Starting fresh" — season 47.',
        'Communication strikes again. Wow.',
        'At least you\'re logging it. Accountability.',
        'Couch is ready. It missed you.',
      ],
      screen: <StreakResetScreen lastReason={MOCK_LAST_REASON} onDone={() => {}} />,
    },
    {
      title: 'THE RECEIPTS',
      bg: '#f7f7f7',
      points: [
        'Red dots = your greatest hits.',
        'April: 3 fights. You were busy.',
        'Tap a date. Relive the trauma.',
        'The calendar never forgets.',
        'Patterns detected. Therapy pending.',
      ],
      screen: <CalendarScreen fights={MOCK_FIGHTS} onBack={() => {}} />,
    },
    {
      title: 'THE DATA',
      bg: '#F5F5F0',
      points: [
        '23 fights logged. Dedication.',
        'Communication: 38%. Never saw that coming.',
        '47-day streak. Best you ever did.',
        'Avg 18 days apart. Room for improvement.',
        'Algorithm has opinions. You won\'t like them.',
      ],
      screen: (
        <StatisticsScreen
          fights={MOCK_FIGHTS}
          currentStreak={MOCK_STREAK}
          onBack={() => {}}
        />
      ),
    },
  ];

  let offset = 0;

  const introStart = offset;
  offset += INTRO_DUR + FLASH_DUR;

  const sceneStarts = scenes.map(() => {
    const start = offset;
    offset += SCENE_DUR + FLASH_DUR;
    return start;
  });

  const outroStart = offset;

  return (
    <AbsoluteFill style={{ background: '#0d0d0d' }}>
      <Sequence from={introStart} durationInFrames={INTRO_DUR + FLASH_DUR}>
        <IntroScene />
      </Sequence>

      {scenes.map((scene, i) => (
        <Sequence key={i} from={sceneStarts[i]} durationInFrames={SCENE_DUR + FLASH_DUR}>
          <Scene
            title={scene.title}
            points={scene.points}
            bgColor={scene.bg}
            screen={scene.screen}
          />
        </Sequence>
      ))}

      <Sequence from={outroStart} durationInFrames={OUTRO_DUR}>
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
}
