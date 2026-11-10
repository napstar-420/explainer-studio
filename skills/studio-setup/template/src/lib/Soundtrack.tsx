import React from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { useTiming } from './timing';

/**
 * Voice-over, music ducked under speech, and sound effects at frames. Paths are relative to public/.
 * Missing `voice`/`music` are skipped, so a silent draft still renders.
 */
export const Soundtrack: React.FC<{
  voice?: string;
  music?: string;
  musicVolume?: number;
  duckTo?: number;
  sfx?: { src: string; at: number; volume?: number }[];
}> = ({ voice, music, musicVolume = 0.45, duckTo = 0.12, sfx = [] }) => {
  const { fps } = useVideoConfig();
  const t = useTiming();
  const spans: [number, number][] = [];
  for (const w of t.words) {
    const a = Math.floor((w.s - 0.25) * fps);
    const b = Math.ceil((w.e + 0.35) * fps);
    const last = spans[spans.length - 1];
    if (last && a <= last[1]) last[1] = Math.max(last[1], b);
    else spans.push([a, b]);
  }
  const speaking = (f: number) => spans.some(([a, b]) => f >= a && f <= b);
  return (
    <>
      {voice ? <Audio src={staticFile(voice)} /> : null}
      {music ? <Audio src={staticFile(music)} loop volume={(f) => (speaking(f) ? duckTo : musicVolume)} /> : null}
      {sfx.map((e, i) => (
        <Sequence key={i} from={e.at} layout="none">
          <Audio src={staticFile(e.src)} volume={e.volume ?? 0.8} />
        </Sequence>
      ))}
    </>
  );
};
