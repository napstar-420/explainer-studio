import React, { createContext, useContext } from 'react';
import { useVideoConfig } from 'remotion';

export type Word = { w: string; s: number; e: number };
export type TimedBeat = {
  id: string;
  line: string;
  title?: string[];
  underline?: string;
  startSec: number;
  endSec: number;
  /** Every `cue`/`at` phrase in the beat, resolved to the second its first word is spoken. */
  cues: Record<string, number>;
};
export type Timed = {
  slug: string;
  fps: number;
  durationSec: number;
  voice?: string;
  words: Word[];
  beats: TimedBeat[];
};

const Ctx = createContext<Timed | null>(null);
export const TimingProvider: React.FC<{ value: Timed; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

export const useTiming = (): Timed => {
  const t = useContext(Ctx);
  if (!t) throw new Error('useTiming must be used inside <TimingProvider>');
  return t;
};

/** Frames for one beat: `from`, `to`, and `at(phrase)` for a cue phrase inside it. */
export const useBeat = (id: string) => {
  const t = useTiming();
  const { fps } = useVideoConfig();
  const b = t.beats.find((x) => x.id === id);
  if (!b) throw new Error(`No beat "${id}" in timed-beats.json`);
  const f = (sec: number) => Math.round(sec * fps);
  return {
    beat: b,
    from: f(b.startSec),
    to: f(b.endSec),
    at: (phrase: string, offsetSec = 0) => {
      const sec = b.cues[phrase];
      if (sec === undefined) throw new Error(`Beat "${id}" has no cue "${phrase}" (add it to beats.json and rerun timing)`);
      return f(sec + offsetSec);
    },
  };
};

/** All beats in order, as frames. */
export const useBeats = () => {
  const t = useTiming();
  const { fps } = useVideoConfig();
  return t.beats.map((b) => ({ ...b, from: Math.round(b.startSec * fps), to: Math.round(b.endSec * fps) }));
};
