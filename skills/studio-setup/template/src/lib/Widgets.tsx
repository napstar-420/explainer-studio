import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { progress } from './ease';
import { useStyle } from './style';

/** Brass year dial: spins while the year counts from `fromYear` to `toYear` between `from` and `to`. */
export const YearDial: React.FC<{ x: number; y: number; size?: number; from: number; to: number; fromYear: number; toYear: number; enter?: number; exit?: number }> = ({
  x,
  y,
  size = 360,
  from,
  to,
  fromYear,
  toYear,
  enter,
  exit,
}) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  const p = progress(frame, from, to, 'inOut');
  const year = Math.round(fromYear + (toYear - fromYear) * p);
  const o = (enter !== undefined ? progress(frame, enter, enter + 10, 'out') : 1) * (exit !== undefined ? 1 - progress(frame, exit, exit + 10, 'in') : 1);
  if (o <= 0) return null;
  const rot = -(fromYear + (toYear - fromYear) * p) * 3;
  const r = size / 2;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', opacity: o, textAlign: 'center' }}>
      <svg width={size} height={size + 30} viewBox={`${-r} ${-r - 30} ${size} ${size + 30}`} style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}>
        <circle r={r} fill="#d8c08f" stroke={s.palette.ink} strokeWidth={s.stroke} />
        <circle r={r * 0.86} fill="#f6f0e3" stroke={s.palette.ink} strokeWidth={2} />
        <g transform={`rotate(${rot})`}>
          {Array.from({ length: 60 }, (_, i) => (
            <line key={i} x1={0} y1={-r * 0.84} x2={0} y2={-r * (i % 5 === 0 ? 0.72 : 0.78)} stroke={s.palette.ink} strokeWidth={i % 5 === 0 ? 3 : 1.5} transform={`rotate(${i * 6})`} />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <text key={i} transform={`rotate(${i * 30}) translate(0 ${-r * 0.6})`} textAnchor="middle" fontSize={r * 0.11} fontFamily={s.titleFont} fill={s.palette.ink}>
              {1900 + i * 10}
            </text>
          ))}
          <path d={`M0 ${-r * 0.35} L${r * 0.1} 0 L0 ${r * 0.35} L${-r * 0.1} 0Z`} fill={s.palette.accent2} stroke={s.palette.ink} strokeWidth={2} />
        </g>
        <circle r={r * 0.06} fill={s.palette.ink} />
        <path d={`M0 ${-r + 4} l-16 -30 h32z`} fill="#b8862f" stroke={s.palette.ink} strokeWidth={3} />
      </svg>
      <div style={{ marginTop: 18, display: 'inline-block', padding: '6px 34px', border: `${s.stroke}px solid ${s.palette.ink}`, borderRadius: 18, background: '#fff', fontFamily: s.titleFont, fontWeight: 800, fontSize: size * 0.22, color: s.palette.ink }}>
        {year}
      </div>
    </div>
  );
};

/** Cloud-puff wipe (screen space): clouds swell over the frame from `at`, peak at the midpoint, then clear. */
export const SmokeWipe: React.FC<{ at: number; dur?: number; color?: string }> = ({ at, dur = 24, color = '#f4efe6' }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at || frame > at + dur) return null;
  const k = interpolate(frame, [at, at + dur / 2, at + dur], [0, 1, 0]);
  const puffs = [
    [200, 1600], [700, 1750], [950, 1250], [150, 1000], [600, 900], [900, 500], [300, 400], [540, 1350], [800, 150], [100, 150],
  ];
  return (
    <AbsoluteFill style={{ zIndex: 200 }}>
      <svg width="100%" height="100%" viewBox="0 0 1080 1920">
        {puffs.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={k * (420 + (i % 3) * 80)} fill={color} stroke={s.palette.ink} strokeWidth={3} strokeOpacity={0.35} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/** A paper note / clipping that slides in with a caption line, e.g. to cite a source on screen. */
export const Clipping: React.FC<{ x: number; y: number; w?: number; at: number; lines: string[]; source?: string; rotate?: number }> = ({ x, y, w = 640, at, lines, source, rotate = -3 }) => {
  const frame = useCurrentFrame();
  const s = useStyle();
  if (frame < at) return null;
  const p = progress(frame, at, at + 16, 'back');
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, transform: `translate(-50%, -50%) translateX(${(1 - p) * 900}px) rotate(${rotate}deg)`, background: '#faf7f0', border: `${s.stroke}px solid ${s.palette.ink}`, padding: 36, fontFamily: 'Georgia, serif', color: s.palette.ink, boxShadow: '8px 10px 0 rgba(0,0,0,0.08)', zIndex: 50 }}>
      {[0.9, 0.7, 0.8].map((wd, i) => (
        <div key={i} style={{ height: 14, width: `${wd * 100}%`, background: '#77736b', marginBottom: 12, borderRadius: 3 }} />
      ))}
      <div style={{ fontSize: 34, lineHeight: 1.35, marginTop: 18 }}>{lines.join(' ')}</div>
      {source ? <div style={{ fontSize: 24, marginTop: 18, opacity: 0.75, textAlign: 'right' }}>{source}</div> : null}
    </div>
  );
};
