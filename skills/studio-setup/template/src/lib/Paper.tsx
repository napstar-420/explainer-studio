import React from 'react';
import { AbsoluteFill, random, useCurrentFrame } from 'remotion';
import { useStyle } from './style';

/** Warm paper background with grain, a soft vignette and twinkling star marks. Screen space. */
export const Paper: React.FC<{ stars?: number; seed?: string; color?: string }> = ({ stars = 45, seed = 'paper', color }) => {
  const s = useStyle();
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: color ?? s.palette.paper }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
        <radialGradient id="vig" cx="50%" cy="45%" r="75%">
          <stop offset="60%" stopColor="#000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.10" />
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#vig)" />
        {Array.from({ length: stars }, (_, i) => {
          const x = random(`${seed}x${i}`) * 1080;
          const y = random(`${seed}y${i}`) * 1920;
          const big = random(`${seed}b${i}`) > 0.85;
          const tw = 0.35 + 0.35 * Math.sin(frame / 18 + i);
          return big ? (
            <path key={i} d={`M${x} ${y - 7}L${x + 1.5} ${y - 1.5}L${x + 7} ${y}L${x + 1.5} ${y + 1.5}L${x} ${y + 7}L${x - 1.5} ${y + 1.5}L${x - 7} ${y}L${x - 1.5} ${y - 1.5}Z`} fill={s.palette.ink} opacity={tw * 0.6} />
          ) : (
            <circle key={i} cx={x} cy={y} r={1.6} fill={s.palette.ink} opacity={tw * 0.5} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
