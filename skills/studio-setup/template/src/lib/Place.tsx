import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { progress, type EaseName } from './ease';

export type Enter = { at: number; type?: 'pop' | 'fade' | 'rise' | 'drop' | 'none'; dur?: number };
export type Exit = { at: number; type?: 'fade' | 'shrink'; dur?: number };

/** Positions children centred on (x, y) with rotation/scale, and plays an enter/exit. */
export const Place: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  rotate?: number;
  scale?: number;
  z?: number;
  opacity?: number;
  enter?: Enter;
  exit?: Exit;
  children: React.ReactNode;
}> = ({ x, y, w, h, rotate = 0, scale = 1, z, opacity = 1, enter, exit, children }) => {
  const frame = useCurrentFrame();
  let s = scale;
  let o = opacity;
  let dy = 0;
  if (enter && enter.type !== 'none') {
    const d = enter.dur ?? 12;
    const ease: EaseName = enter.type === 'pop' ? 'back' : 'out';
    const p = progress(frame, enter.at, enter.at + d, ease);
    if (frame < enter.at) o = 0;
    if (enter.type === 'pop') s *= p;
    if (enter.type === 'fade' || enter.type === 'rise' || enter.type === 'drop' || enter.type === undefined) o *= progress(frame, enter.at, enter.at + d, 'out');
    if (enter.type === 'rise') dy = (1 - p) * 60;
    if (enter.type === 'drop') dy = -(1 - p) * 220;
  }
  if (exit) {
    const p = progress(frame, exit.at, exit.at + (exit.dur ?? 10), 'in');
    if (exit.type === 'shrink') s *= 1 - p;
    else o *= 1 - p;
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y + dy,
        width: w,
        height: h,
        zIndex: z,
        opacity: o,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${s})`,
      }}
    >
      {children}
    </div>
  );
};

/** An SVG/PNG from public/ placed in the world. `src` is relative to public/, e.g. "demo/assets/cup.svg". */
type PlaceProps = Omit<React.ComponentProps<typeof Place>, 'children'>;
export const Svg: React.FC<PlaceProps & { src: string }> = ({ src, w, ...rest }) => (
  <Place w={w} {...rest}>
    <Img src={staticFile(src)} style={{ width: w ?? 'auto', display: 'block' }} />
  </Place>
);
