import React from 'react';
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from 'remotion';
import { progress } from './ease';
import { useStyle } from './style';

const Layer: React.FC<{ z?: number; children: React.ReactNode }> = ({ z = 4, children }) => (
  <svg style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', width: 1, height: 1, zIndex: z }}>{children}</svg>
);

/** A scene that cuts in at `from` and out at `to` (the "sketch" look's hard cuts), with an optional quick fade. */
export const Scene: React.FC<{ from: number; to: number; fade?: number; children: React.ReactNode }> = ({ from, to, fade = 0, children }) => (
  <Sequence from={from} durationInFrames={Math.max(1, to - from)} layout="none">
    <SceneFade len={to - from} fade={fade}>{children}</SceneFade>
  </Sequence>
);
const SceneFade: React.FC<{ len: number; fade: number; children: React.ReactNode }> = ({ len, fade, children }) => {
  const f = useCurrentFrame();
  const o = fade ? Math.min(1, f / fade, (len - f) / fade) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Hand-drawn "line boil": wraps children in an SVG displacement that changes every few frames. */
export const Boil: React.FC<{ strength?: number; every?: number; children: React.ReactNode }> = ({ strength = 2.2, every = 4, children }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / every) % 3;
  const id = `boil${seed}`;
  return (
    <AbsoluteFill>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={seed + 1} />
          <feDisplacementMap in="SourceGraphic" scale={strength} />
        </filter>
      </svg>
      <AbsoluteFill style={{ filter: `url(#${id})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Speech or thought bubble pointing at (tx, ty), popping in at `at`. */
export const Bubble: React.FC<{ x: number; y: number; w?: number; tx: number; ty: number; at: number; until?: number; text?: string; kind?: 'speech' | 'thought'; children?: React.ReactNode; size?: number }> = ({
  x, y, w = 360, tx, ty, at, until, text, kind = 'speech', children, size = 44,
}) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at || (until !== undefined && frame > until)) return null;
  const p = progress(frame, at, at + 10, 'back');
  const h = w * 0.5;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, transform: `translate(-50%, -50%) scale(${p})`, zIndex: 20 }}>
      <svg width={w} height={h} style={{ position: 'absolute', overflow: 'visible' }}>
        {kind === 'speech' ? (
          <path d={`M${w * 0.42} ${h * 0.92} L${tx - x + w / 2} ${ty - y + h / 2} L${w * 0.58} ${h * 0.9}`} fill="#fff" stroke={s.palette.ink} strokeWidth={s.stroke} strokeLinejoin="round" />
        ) : (
          [0.25, 0.55].map((k, i) => <circle key={i} cx={w / 2 + (tx - x) * k} cy={h * 0.95 + (ty - y - h * 0.45) * k} r={12 - i * 5} fill="#fff" stroke={s.palette.ink} strokeWidth={3} />)
        )}
        <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 4} ry={h / 2 - 4} fill="#fff" stroke={s.palette.ink} strokeWidth={s.stroke} strokeDasharray={kind === 'thought' ? '2 0' : undefined} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 12%', fontFamily: s.titleFont, fontWeight: 700, fontSize: size, color: s.palette.ink }}>
        {children ?? text}
      </div>
    </div>
  );
};

/** List whose items appear one by one with a tick or cross drawing in. */
export const Checklist: React.FC<{ x: number; y: number; items: { text: string; at: number; mark?: 'tick' | 'cross' }[]; size?: number; gap?: number }> = ({ x, y, items, size = 56, gap = 1.6 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  return (
    <div style={{ position: 'absolute', left: x, top: y, fontFamily: s.titleFont, fontWeight: 700, fontSize: size, color: s.palette.ink, zIndex: 10 }}>
      {items.map((it, i) => {
        if (frame < it.at) return null;
        const p = progress(frame, it.at, it.at + 10, 'out');
        const d = it.mark === 'cross' ? 'M4 4 L28 28 M28 4 L4 28' : 'M3 17 L12 27 L30 4';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: size * 0.4, height: size * gap, opacity: p }}>
            <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32">
              <path d={d} fill="none" stroke={it.mark === 'cross' ? '#b33a3a' : s.palette.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - progress(frame, it.at + 4, it.at + 14, 'out')} />
            </svg>
            {it.text}
          </div>
        );
      })}
    </div>
  );
};

/** Line chart: axes, then each series draws from left to right; optional marker (any node) rides the line end. */
export const LineChart: React.FC<{
  x: number; y: number; w: number; h: number;
  series: { points: [number, number][]; from: number; to: number; dashed?: boolean; color?: string; marker?: React.ReactNode }[];
  xLabel?: string;
}> = ({ x, y, w, h, series, xLabel }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const px = (p: [number, number]) => [x + p[0] * w, y + h - p[1] * h] as const;
  return (
    <>
      <Layer>
        <path d={`M${x} ${y} V${y + h} H${x + w}`} fill="none" stroke={s.palette.ink} strokeWidth={s.stroke} strokeLinecap="round" />
        {series.map((se, i) => {
          const d = se.points.map((p, k) => `${k ? 'L' : 'M'}${px(p).join(' ')}`).join(' ');
          const t = progress(frame, se.from, se.to, 'inOut');
          return <path key={i} d={d} fill="none" stroke={se.color ?? s.palette.ink} strokeWidth={s.stroke} strokeLinecap="round" strokeDasharray={se.dashed ? '14 12' : undefined} pathLength={se.dashed ? undefined : 1} {...(se.dashed ? { opacity: t > 0 ? 1 : 0 } : { strokeDasharray: 1, strokeDashoffset: 1 - t })} />;
        })}
        {xLabel ? <text x={x + w / 2} y={y + h + 50} textAnchor="middle" fontFamily={s.titleFont} fontSize={30} fill={s.palette.ink}>{xLabel}</text> : null}
      </Layer>
      {series.map((se, i) => {
        if (!se.marker || frame < se.from) return null;
        const t = progress(frame, se.from, se.to, 'inOut');
        const n = se.points.length - 1;
        const k = Math.min(n - 1, Math.floor(t * n));
        const local = t * n - k;
        const a = px(se.points[k]!);
        const b = px(se.points[k + 1]!);
        return <div key={i} style={{ position: 'absolute', left: a[0] + (b[0] - a[0]) * local, top: a[1] + (b[1] - a[1]) * local - 40, transform: 'translate(-50%, -50%)', zIndex: 6 }}>{se.marker}</div>;
      })}
    </>
  );
};

/** Arrow along a path (map routes, "this goes there"), drawing in; dashed by default. */
export const Arrow: React.FC<{ d: string; at: number; dur?: number; dashed?: boolean; color?: string; width?: number }> = ({ d, at, dur = 18, dashed = true, color, width = 4 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at) return null;
  const t = progress(frame, at, at + dur, 'out');
  const id = `ah${Math.abs(d.length * 31 + at)}`;
  return (
    <Layer z={8}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10" fill="none" stroke={color ?? s.palette.ink} strokeWidth={2} />
        </marker>
      </defs>
      <mask id={`${id}m`}>
        <path d={d} fill="none" stroke="#fff" strokeWidth={width + 30} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
      </mask>
      <path d={d} fill="none" stroke={color ?? s.palette.ink} strokeWidth={width} strokeLinecap="round" strokeDasharray={dashed ? '12 10' : undefined} mask={`url(#${id}m)`} markerEnd={t > 0.95 ? `url(#${id})` : undefined} />
    </Layer>
  );
};

/** Balance scale comparing two things; `tilt` from -1 (left heavy) to 1 (right heavy), animated from `at`. */
export const Scale: React.FC<{ x: number; y: number; w?: number; left: React.ReactNode; right: React.ReactNode; at: number; fromTilt?: number; toTilt?: number }> = ({ x, y, w = 600, left, right, at, fromTilt = -1, toTilt = 0 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const tilt = interpolate(progress(frame, at, at + 30, 'back'), [0, 1], [fromTilt, toTilt]);
  const ang = tilt * 12;
  const r = w / 2;
  const dy = Math.sin((ang * Math.PI) / 180) * r;
  const pan = (side: -1 | 1, node: React.ReactNode) => (
    <div style={{ position: 'absolute', left: x + side * r * Math.cos((ang * Math.PI) / 180), top: y + side * dy + 70, transform: 'translate(-50%, -100%)', zIndex: 6 }}>
      {node}
      <svg width={220} height={30} viewBox="0 0 220 30" style={{ display: 'block', margin: '0 auto' }}><path d="M5 5 H215 L185 26 H35 Z" fill="#e8e3da" stroke={s.palette.ink} strokeWidth={s.stroke} /></svg>
    </div>
  );
  return (
    <>
      <Layer>
        <path d={`M${x} ${y} V${y + 420} M${x - 90} ${y + 430} Q${x} ${y + 380} ${x + 90} ${y + 430} Z`} stroke={s.palette.ink} strokeWidth={s.stroke} fill="#d9d4cb" />
        <line x1={x - r * Math.cos((ang * Math.PI) / 180)} y1={y - dy} x2={x + r * Math.cos((ang * Math.PI) / 180)} y2={y + dy} stroke={s.palette.ink} strokeWidth={s.stroke + 3} strokeLinecap="round" />
        <circle cx={x} cy={y} r={10} fill="#fff" stroke={s.palette.ink} strokeWidth={3} />
      </Layer>
      {pan(-1, left)}
      {pan(1, right)}
    </>
  );
};

/** Hub-and-spoke network (factory → shops): links draw in; `broken` links become dashed with an X. */
export const Network: React.FC<{ hub: [number, number]; nodes: [number, number][]; at: number; broken?: number[]; breakAt?: number; renderHub?: React.ReactNode; renderNode?: (i: number) => React.ReactNode }> = ({ hub, nodes, at, broken = [], breakAt, renderHub, renderNode }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  return (
    <>
      <Layer z={3}>
        {nodes.map(([nx, ny], i) => {
          const t = progress(frame, at + i * 3, at + i * 3 + 14, 'out');
          const isBroken = broken.includes(i) && breakAt !== undefined && frame >= breakAt;
          const mx = (hub[0] + nx) / 2;
          const my = (hub[1] + ny) / 2;
          return (
            <g key={i}>
              <line x1={hub[0]} y1={hub[1]} x2={hub[0] + (nx - hub[0]) * t} y2={hub[1] + (ny - hub[1]) * t} stroke={s.palette.ink} strokeWidth={3} strokeDasharray={isBroken ? '10 10' : undefined} opacity={isBroken ? 0.5 : 1} />
              {isBroken ? <path d={`M${mx - 14} ${my - 14} L${mx + 14} ${my + 14} M${mx + 14} ${my - 14} L${mx - 14} ${my + 14}`} stroke="#b33a3a" strokeWidth={5} strokeLinecap="round" /> : null}
            </g>
          );
        })}
      </Layer>
      {renderHub ? <div style={{ position: 'absolute', left: hub[0], top: hub[1], transform: 'translate(-50%, -50%)', zIndex: 5 }}>{renderHub}</div> : null}
      {renderNode ? nodes.map(([nx, ny], i) => <div key={i} style={{ position: 'absolute', left: nx, top: ny, transform: 'translate(-50%, -50%)', zIndex: 5, opacity: progress(frame, at + i * 3, at + i * 3 + 8) }}>{renderNode(i)}</div>) : null}
    </>
  );
};

/** Big number that counts up, e.g. "10 +1". */
export const Counter: React.FC<{ x: number; y: number; from: number; to: number; start?: number; end: number; prefix?: string; suffix?: string; size?: number }> = ({ x, y, from, to, start = 0, end, prefix = '', suffix = '', size = 140 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < from) return null;
  const v = Math.round(start + (end - start) * progress(frame, from, to, 'out'));
  return <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', fontFamily: s.titleFont, fontWeight: 800, fontSize: size, color: s.palette.ink, zIndex: 10 }}>{prefix}{v.toLocaleString('en-US')}{suffix}</div>;
};

/** Freezes the scene into a taped polaroid that shrinks and tilts: the "now it's a memory" ending. Screen space. */
export const Polaroid: React.FC<{ at: number; caption?: string; children: React.ReactNode }> = ({ at, caption, children }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const p = progress(frame, at, at + 24, 'inOut');
  const scale = 1 - p * 0.32;
  return (
    <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${p * -3}deg)`, transformOrigin: '50% 45%' }}>
      <AbsoluteFill style={{ background: '#fff', opacity: p, border: `${p * 4}px solid ${s.palette.ink}`, boxShadow: `0 ${p * 18}px ${p * 40}px rgba(0,0,0,0.15)` }} />
      <AbsoluteFill style={{ top: p * 50, left: p * 50, right: p * 50, bottom: p * 260, width: 'auto', height: 'auto', overflow: 'hidden', filter: `sepia(${p * 0.35})` }}>{children}</AbsoluteFill>
      {caption && p > 0.6 ? <div style={{ position: 'absolute', bottom: 90, width: '100%', textAlign: 'center', fontFamily: s.titleFont, fontWeight: 700, fontSize: 110, color: s.palette.ink, opacity: (p - 0.6) / 0.4 }}>{caption}</div> : null}
      {p > 0.5 ? [[-30, 30], [1030, 30]].map(([tx, ty], i) => <div key={i} style={{ position: 'absolute', left: tx, top: ty, width: 160, height: 46, background: 'rgba(225,215,190,0.8)', transform: `rotate(${i ? 35 : -35}deg)` }} />) : null}
    </AbsoluteFill>
  );
};

/** Hand-drawn strike-through over a region (e.g. crossing out an arrow or a claim). */
export const Strike: React.FC<{ x: number; y: number; w: number; at: number; color?: string }> = ({ x, y, w, at, color = '#b33a3a' }) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const t = progress(frame, at, at + 8, 'out');
  return (
    <Layer z={9}>
      <path d={`M${x - w / 2} ${y - w / 2} L${x + w / 2} ${y + w / 2} M${x + w / 2} ${y - w / 2} L${x - w / 2} ${y + w / 2}`} stroke={color} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t} />
    </Layer>
  );
};
