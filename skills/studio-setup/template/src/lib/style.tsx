import React, { createContext, useContext } from 'react';

export type Style = {
  look?: 'storybook' | 'sketch';
  palette: { paper: string; ink: string; accent: string; accent2: string; muted: string[] };
  stroke: number;
  titleFont: string;
  titleWeight: number;
  titleColor: string;
  underlineColor: string;
};

export const defaultStyle: Style = {
  palette: {
    paper: '#efe9df',
    ink: '#2b2a33',
    accent: '#3b2f8f',
    accent2: '#e8893a',
    muted: ['#d9a5a0', '#9fb59a', '#c9a66b', '#a9b8c9', '#cdb7d6'],
  },
  stroke: 4,
  titleFont: 'Inter, "Helvetica Neue", Arial, sans-serif',
  titleWeight: 700,
  titleColor: '#1f1e24',
  underlineColor: '#c9a66b',
};

const Ctx = createContext<Style>(defaultStyle);
export const StyleProvider: React.FC<{ value?: Partial<Style>; children: React.ReactNode }> = ({ value, children }) => (
  <Ctx.Provider value={{ ...defaultStyle, ...value, palette: { ...defaultStyle.palette, ...value?.palette } }}>
    {children}
  </Ctx.Provider>
);
export const useStyle = () => useContext(Ctx);
