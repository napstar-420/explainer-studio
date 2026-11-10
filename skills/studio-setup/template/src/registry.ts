// One line per video. The new-video skill adds entries here; keep the import style unchanged.
import type React from 'react';
import type { Timed } from './lib/timing';
import { Video as DemoVideo } from '../projects/demo/Video';
import demoTimed from '../projects/demo/timed-beats.json';
import { Video as DemoSketchVideo } from '../projects/demo-sketch/Video';
import demoSketchTimed from '../projects/demo-sketch/timed-beats.json';

export const projects: { id: string; component: React.FC; timed: Timed }[] = [
  { id: 'demo', component: DemoVideo, timed: demoTimed as unknown as Timed },
  { id: 'demo-sketch', component: DemoSketchVideo, timed: demoSketchTimed as unknown as Timed },
];
