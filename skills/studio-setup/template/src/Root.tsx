import React from 'react';
import { Composition } from 'remotion';
import { projects } from './registry';
import { TimingProvider } from './lib/timing';

export const WIDTH = 1080;
export const HEIGHT = 1920;

export const Root: React.FC = () => (
  <>
    {projects.map(({ id, component: Video, timed }) => {
      const Wrapped: React.FC = () => (
        <TimingProvider value={timed}>
          <Video />
        </TimingProvider>
      );
      return (
        <Composition
          key={id}
          id={id}
          component={Wrapped}
          width={WIDTH}
          height={HEIGHT}
          fps={timed.fps}
          durationInFrames={Math.max(1, Math.ceil(timed.durationSec * timed.fps))}
        />
      );
    })}
  </>
);
