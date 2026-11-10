import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Burst, DrawCircle, Flame, FollowPath, Orbit, Paper, Place, Soundtrack, StyleProvider, Svg, Swarm, Title, World, YearDial, useBeat, useTiming, type Style } from '../../src/lib';
import style from './style.json';

const A = (name: string) => `demo/assets/${name}.svg`;

export const Video: React.FC = () => {
  const t = useTiming();
  const b1 = useBeat('b01');
  const b2 = useBeat('b02');
  const b3 = useBeat('b03');
  const launch = b3.at('launched');
  // World: desk at the bottom (y≈3300), dial in the middle (y≈2200), sky at the top.
  const camera = [
    { at: 0, x: 540, y: 3250, zoom: 1 },
    { at: b2.from, x: 540, y: 3200, zoom: 1.08 },
    { at: b2.from + 24, x: 540, y: 2250, zoom: 1 },
    { at: launch, x: 540, y: 2250, zoom: 1 },
    { at: launch + 40, x: 540, y: 1300, zoom: 0.9, ease: 'inOut' as const },
  ];
  return (
    <StyleProvider value={style as Partial<Style>}>
      <AbsoluteFill>
        <Paper />
        <World width={1080} height={4000} camera={camera}>
          {/* b01: desk */}
          <Svg src={A('desk')} x={540} y={3620} w={1300} />
          <Svg src={A('cup')} x={540} y={3330} w={300} enter={{ at: 0, type: 'rise' }} z={2} />
          <Swarm count={70} cx={540} cy={2950} tx={540} ty={3300} from={b1.from + 6} to={b1.at('paper clip') + 30}>
            <Img src={staticFile(A('paper-clip'))} style={{ width: 34 }} />
          </Swarm>
          {/* b02: dial and orbiting designs */}
          <YearDial x={540} y={1930} size={300} enter={b2.from + 10} from={b2.from + 18} to={b2.at('1899')} fromYear={2026} toYear={1899} exit={launch - 6} />
          <Place x={540} y={2350} z={1} enter={{ at: b2.from + 16, type: 'pop' }} exit={{ at: launch, dur: 1 }}>
            <Img src={staticFile(A('paper-clip'))} style={{ width: 80, display: 'block' }} />
          </Place>
          <Orbit cx={540} cy={2350} rx={330} ry={110} from={b2.at('dozens')} periodSec={7} fps={t.fps}
            items={['wire-a', 'wire-b', 'wire-c', 'wire-a', 'wire-b', 'wire-c'].map((n, i) => <Img key={i} src={staticFile(A(n))} style={{ width: 90 }} />)} />
          <DrawCircle x={540} y={2350} rx={90} ry={150} at={b2.at('dozens') + 20} until={launch} />
          {/* b03: launch */}
          <FollowPath d="M540 2350 C 520 2000, 640 1700, 540 1000" from={launch} to={launch + 50} trail>
            <div style={{ position: 'relative', width: 80 }}>
              <Img src={staticFile(A('paper-clip'))} style={{ width: 80, display: 'block' }} />
              <div style={{ position: 'absolute', left: 10, top: 196 }}>
                <Flame size={60} />
              </div>
            </div>
          </FollowPath>
          <Burst x={540} y={1050} at={b3.at('others')} radius={160} />
        </World>
        <Title text={b1.beat.title?.join(' ') ?? ''} underline={b1.beat.underline} from={b1.from + 4} to={b1.to} />
        <Title text={b2.beat.title?.join(' ') ?? ''} from={b2.at('1899')} to={b2.to} />
        <Title text={b3.beat.title?.join(' ') ?? ''} underline={b3.beat.underline} from={b3.from + 4} to={b3.to} />
        <Soundtrack voice={t.voice} />
      </AbsoluteFill>
    </StyleProvider>
  );
};
