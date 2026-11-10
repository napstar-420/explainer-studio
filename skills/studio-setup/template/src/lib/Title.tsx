import React from 'react';
import { useCurrentFrame } from 'remotion';
import { progress } from './ease';
import { useStyle } from './style';

/**
 * Keyword title (screen space): one or two words near the top, the key word gets a hand-drawn
 * underline that draws in. Fades in at `from`, out before `to`.
 */
export const Title: React.FC<{ text: string; sub?: string; underline?: string; from: number; to: number; top?: number; size?: number; color?: string }> = ({
  text,
  sub,
  underline,
  from,
  to,
  top = 230,
  size = 78,
  color,
}) => {
  const s = useStyle();
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const inP = progress(frame, from, from + 10, 'out');
  const outP = progress(frame, to - 8, to, 'in');
  const draw = progress(frame, from + 6, from + 20, 'out');
  const words = text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: 60,
        right: 60,
        textAlign: 'center',
        fontFamily: s.titleFont,
        fontWeight: s.titleWeight,
        fontSize: size,
        lineHeight: 1.15,
        color: color ?? s.titleColor,
        opacity: inP * (1 - outP),
        transform: `translateY(${(1 - inP) * 24}px)`,
        zIndex: 100,
      }}
    >
      {words.map((w, i) => {
        const marked = underline && w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase() === underline.toLowerCase();
        return (
          <React.Fragment key={i}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {w}
              {marked ? (
                <svg viewBox="0 0 100 12" preserveAspectRatio="none" style={{ position: 'absolute', left: '-4%', width: '108%', bottom: -size * 0.18, height: size * 0.22, overflow: 'visible' }}>
                  <path d="M2 8 C 25 3, 55 11, 98 5" fill="none" stroke={s.underlineColor} strokeWidth={5} strokeLinecap="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                </svg>
              ) : null}
            </span>
            {i < words.length - 1 ? ' ' : null}
          </React.Fragment>
        );
      })}
      {sub ? <div style={{ fontSize: size * 0.45, fontWeight: 500, marginTop: size * 0.25, opacity: progress(frame, from + 8, from + 18, 'out') }}>{sub}</div> : null}
    </div>
  );
};
