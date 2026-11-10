import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { Boil, Bubble, Checklist, LineChart, Paper, Place, Polaroid, Scale, Scene, Soundtrack, StyleProvider, Title, useBeat, useTiming, type Style } from '../../src/lib';
import style from './style.json';

const A = (name: string) => staticFile(`demo-sketch/assets/${name}.svg`);

export const Video: React.FC = () => {
  const t = useTiming();
  const s1 = useBeat('s01');
  const s2 = useBeat('s02');
  const s3 = useBeat('s03');
  const s4 = useBeat('s04');
  return (
    <StyleProvider value={style as Partial<Style>}>
      <AbsoluteFill>
        <Paper stars={0} />
        <Boil>
          <Scene from={s1.from} to={s1.to}>
            <LineChart x={170} y={760} w={760} h={620} xLabel="summer"
              series={[
                { points: [[0, 0.35], [0.5, 0.42], [1, 0.48]], from: 0, to: 20, dashed: true },
                { points: [[0, 0.02], [0.4, 0.08], [0.7, 0.4], [1, 0.95]], from: s1.at('became the busiest') - s1.from - 10, to: s1.to - s1.from - 10, marker: <Img src={A('lemonade')} style={{ width: 90 }} /> },
              ]} />
          </Scene>
          <Scene from={s2.from} to={s2.to}>
            <Place x={330} y={1250}><Img src={A('kid')} style={{ width: 300, display: 'block' }} /></Place>
            <Bubble x={430} y={760} w={420} tx={360} ty={1010} at={6} text="Lemonade!" />
            <Checklist x={600} y={1100} size={54} items={[
              { text: 'Fresh', at: s2.at('fresh lemons') - s2.from },
              { text: 'Fair price', at: s2.at('fair prices') - s2.from },
              { text: 'Smile', at: s2.at('friendly smile') - s2.from },
            ]} />
          </Scene>
          <Scene from={s3.from} to={s3.to}>
            <Scale x={540} y={900} w={640} at={s3.at('free biscuits') - s3.from} fromTilt={0} toTilt={1}
              left={<Img src={A('lemonade')} style={{ width: 120, display: 'block', margin: '0 auto' }} />}
              right={<Img src={A('biscuit')} style={{ width: 140, display: 'block', margin: '0 auto' }} />} />
          </Scene>
          <Scene from={s4.from} to={s4.to}>
            <Polaroid at={s4.at('happy memory') - s4.from} caption="Just a memory">
              <Paper stars={0} />
              <Place x={540} y={1000}><Img src={A('lemonade')} style={{ width: 260, display: 'block' }} /></Place>
            </Polaroid>
          </Scene>
        </Boil>
        <Title text="One summer" sub="the busiest stand on the street" underline="summer" from={s1.from + 4} to={s1.to} />
        <Title text="Her secret" from={s2.from + 2} to={s2.to} />
        <Title text="Free biscuits" underline="free" from={s3.from + 2} to={s3.to} />
        <Soundtrack voice={t.voice} />
      </AbsoluteFill>
    </StyleProvider>
  );
};
