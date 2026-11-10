import { Easing, interpolate } from 'remotion';

export type EaseName = 'linear' | 'in' | 'out' | 'inOut' | 'back';
export const easeFn = (e: EaseName = 'inOut') =>
  ({
    linear: Easing.linear,
    in: Easing.in(Easing.cubic),
    out: Easing.out(Easing.cubic),
    inOut: Easing.inOut(Easing.cubic),
    back: Easing.out(Easing.back(1.6)),
  })[e];

/** 0→1 progress between two frames, clamped and eased. */
export const progress = (frame: number, from: number, to: number, ease: EaseName = 'inOut') =>
  to <= from ? (frame >= from ? 1 : 0) : interpolate(frame, [from, to], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeFn(ease) });
