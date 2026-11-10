import React from 'react';
import { random, useCurrentFrame } from 'remotion';
import { getLength, getPointAtLength, getTangentAtLength } from '@remotion/paths';
import { progress, type EaseName } from './ease';
import { useStyle } from './style';

/** Flickering rocket flame. Point it with the parent's rotation; it hangs below (0, 0). */
export const Flame: React.FC<{ size?: number }> = ({ size = 60 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const f = 1 + 0.18 * Math.sin(frame * 1.7) + 0.08 * Math.sin(frame * 3.1);
  return (
    <svg width={size} height={size * 1.6} viewBox="-30 0 60 96" style={{ overflow: 'visible' }}>
      <g transform={`scale(1 ${f})`}>
        <path d="M-22 0 C -20 30, -8 60, 0 92 C 8 60, 20 30, 22 0 Z" fill={s.palette.accent2} stroke={s.palette.ink} strokeWidth={3} />
        <path d="M-11 0 C -10 22, -4 42, 0 60 C 4 42, 10 22, 11 0 Z" fill="#f7d36b" />
      </g>
    </svg>
  );
};

/**
 * Moves its child along an SVG path `d` (world coordinates) between frames `from` and `to`, turned to
 * the path's direction (+`rotateOffset` degrees). With `trail`, leaves fading smoke puffs behind.
 */
export const FollowPath: React.FC<{
  d: string;
  from: number;
  to: number;
  ease?: EaseName;
  rotateOffset?: number;
  orient?: boolean;
  trail?: boolean;
  trailColor?: string;
  /** Show the object at the path start before `from` (default false: it appears when it starts moving). */
  showBefore?: boolean;
  children: React.ReactNode;
}> = ({ d, from, to, ease = 'inOut', rotateOffset = 90, orient = true, trail = false, trailColor = '#ffffff', showBefore = false, children }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const len = getLength(d);
  const at = (f: number) => {
    const l = progress(f, from, to, ease) * len;
    const p = getPointAtLength(d, l);
    const t = getTangentAtLength(d, Math.min(len - 0.01, Math.max(0.01, l)));
    return { ...p, angle: t ? (Math.atan2(t.y, t.x) * 180) / Math.PI : -90 };
  };
  if (frame < from && !showBefore) return null;
  const now = at(frame);
  const puffs = [];
  if (trail && frame > from) {
    for (let f = from; f < Math.min(frame, to); f += 2) {
      const age = frame - f;
      if (age > 45) continue;
      const p = at(f);
      const r = 14 + age * 1.4 + random(`p${f}`) * 8;
      puffs.push(<circle key={f} cx={p.x} cy={p.y} r={r} fill={trailColor} stroke={s.palette.ink} strokeOpacity={0.25} strokeWidth={2} opacity={Math.max(0, 1 - age / 45)} />);
    }
  }
  return (
    <>
      {puffs.length ? (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', width: 1, height: 1 }}>{puffs}</svg>
      ) : null}
      <div style={{ position: 'absolute', left: now.x, top: now.y, transform: `translate(-50%, -50%) rotate(${orient ? now.angle + rotateOffset : 0}deg)` }}>
        {children}
      </div>
    </>
  );
};

/** Items circling (cx, cy) on a dashed ellipse; items behind the body (z 0) and in front (z 2). Put the body at z 1. */
export const Orbit: React.FC<{
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  from: number;
  items: React.ReactNode[];
  periodSec?: number;
  fps?: number;
  dashed?: boolean;
  enterStagger?: number;
}> = ({ cx, cy, rx, ry, from, items, periodSec = 8, fps = 30, dashed = true, enterStagger = 4 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const t = Math.max(0, frame - from) / (periodSec * fps);
  return (
    <>
      {dashed ? (
        <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', width: 1, height: 1, zIndex: 0, opacity: progress(frame, from, from + 12) }}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={s.palette.ink} strokeOpacity={0.45} strokeWidth={2} strokeDasharray="10 10" />
        </svg>
      ) : null}
      {items.map((item, i) => {
        const a = (i / items.length + t) * Math.PI * 2;
        const x = cx + Math.cos(a) * rx;
        const y = cy + Math.sin(a) * ry;
        const front = Math.sin(a) > 0;
        const p = progress(frame, from + i * enterStagger, from + i * enterStagger + 10, 'back');
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, zIndex: front ? 2 : 0, transform: `translate(-50%, -50%) scale(${p * (front ? 1 : 0.85)})` }}>
            {item}
          </div>
        );
      })}
    </>
  );
};

/** Many copies of one child flying from a spiral into (tx, ty), staggered, vanishing on arrival. */
export const Swarm: React.FC<{ count?: number; cx: number; cy: number; tx: number; ty: number; from: number; to: number; spread?: number; seed?: string; children: React.ReactNode }> = ({
  count = 60,
  cx,
  cy,
  tx,
  ty,
  from,
  to,
  spread = 380,
  seed = 'swarm',
  children,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = i * 0.45 + frame * 0.03;
        const r = (spread * (i + 4)) / (count + 4);
        const sx = cx + Math.cos(a) * r;
        const sy = cy + Math.sin(a) * r * 0.55;
        const delay = random(`${seed}${i}`) * (to - from) * 0.6;
        const p = progress(frame, from + delay, from + delay + (to - from) * 0.4, 'in');
        if (p >= 1) return null;
        return (
          <div key={i} style={{ position: 'absolute', left: sx + (tx - sx) * p, top: sy + (ty - sy) * p, transform: `translate(-50%, -50%) rotate(${random(`${seed}r${i}`) * 360}deg) scale(${1 - p * 0.4})` }}>
            {children}
          </div>
        );
      })}
    </>
  );
};

/** Firework / emphasis burst of rays and dots at (x, y). */
export const Burst: React.FC<{ x: number; y: number; at: number; radius?: number; rays?: number; color?: string; dur?: number }> = ({ x, y, at, radius = 120, rays = 14, color, dur = 24 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at || frame > at + dur) return null;
  const p = progress(frame, at, at + dur, 'out');
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', width: 1, height: 1, zIndex: 5 }}>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const r1 = radius * (0.25 + p * 0.6);
        const r2 = radius * (0.4 + p * 0.6);
        return (
          <line key={i} x1={x + Math.cos(a) * r1} y1={y + Math.sin(a) * r1} x2={x + Math.cos(a) * r2} y2={y + Math.sin(a) * r2} stroke={color ?? s.palette.accent2} strokeWidth={4} strokeLinecap="round" opacity={1 - p} />
        );
      })}
    </svg>
  );
};

/** Hand-drawn circle annotation that draws itself around (x, y). */
export const DrawCircle: React.FC<{ x: number; y: number; rx: number; ry?: number; at: number; until?: number; color?: string }> = ({ x, y, rx, ry, at, until, color }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at || (until !== undefined && frame > until)) return null;
  const p = progress(frame, at, at + 14, 'out');
  const r2 = ry ?? rx;
  const d = `M ${x + rx} ${y} C ${x + rx} ${y - r2 * 1.1}, ${x - rx * 1.1} ${y - r2 * 1.05}, ${x - rx} ${y} C ${x - rx * 1.05} ${y + r2 * 1.1}, ${x + rx * 1.15} ${y + r2 * 1.05}, ${x + rx * 1.02} ${y - r2 * 0.25}`;
  return (
    <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', width: 1, height: 1, zIndex: 6 }}>
      <path d={d} fill="none" stroke={color ?? s.palette.ink} strokeWidth={5} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
    </svg>
  );
};
