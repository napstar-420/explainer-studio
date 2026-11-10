import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { easeFn, type EaseName } from './ease';

/** A camera key: at frame `at`, the world point (x, y) is centred and shown at `zoom` (1 = world px = screen px). */
export type CamKey = { at: number; x: number; y: number; zoom?: number; ease?: EaseName };

export const cameraAt = (keys: CamKey[], frame: number) => {
  const ks = [...keys].sort((a, b) => a.at - b.at);
  if (frame <= ks[0]!.at) return { x: ks[0]!.x, y: ks[0]!.y, zoom: ks[0]!.zoom ?? 1 };
  for (let i = 1; i < ks.length; i++) {
    const a = ks[i - 1]!;
    const b = ks[i]!;
    if (frame <= b.at) {
      const t = interpolate(frame, [a.at, b.at], [0, 1], { easing: easeFn(b.ease ?? 'inOut') });
      const za = Math.log(a.zoom ?? 1);
      const zb = Math.log(b.zoom ?? 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, zoom: Math.exp(za + (zb - za) * t) };
    }
  }
  const l = ks[ks.length - 1]!;
  return { x: l.x, y: l.y, zoom: l.zoom ?? 1 };
};

/**
 * One continuous world. Lay every scene out at world coordinates and move the camera between them:
 * this replaces cuts. Children use <Place>/<Svg> with world x/y.
 */
export const World: React.FC<{ width: number; height: number; camera: CamKey[]; children: React.ReactNode }> = ({ width, height, camera, children }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const c = cameraAt(camera, frame);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width,
          height,
          transformOrigin: '0 0',
          transform: `translate(${W / 2 - c.x * c.zoom}px, ${H / 2 - c.y * c.zoom}px) scale(${c.zoom})`,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
