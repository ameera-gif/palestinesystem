// A simple line-art wave motif — the site's second recurring decorative
// accent alongside the logo's sunburst mark, paired with the blue secondary
// colour. Gaza is a Mediterranean coastal strip, so this isn't an arbitrary
// pattern choice. Plain line strokes only, no illustration standing in for
// real photography. The path is built to tile seamlessly at its own width
// (ends where it started, same tangent), so the `animated` variant places
// two copies side by side and scrolls exactly one copy-width for a
// perfectly seamless, continuous flowing-water loop.
function WaveSvg({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 0.4} viewBox="0 0 240 96" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M0 24 Q30 4 60 24 T120 24 T180 24 T240 24" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.9" />
      <path d="M0 52 Q30 32 60 52 T120 52 T180 52 T240 52" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.6" />
      <path d="M0 80 Q30 60 60 80 T120 80 T180 80 T240 80" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

export function WaveMotif({
  size = 160,
  className,
  color = "currentColor",
  animated = false,
}: {
  size?: number;
  className?: string;
  color?: string;
  animated?: boolean;
}) {
  if (!animated) {
    return (
      <div className={className} aria-hidden="true">
        <WaveSvg size={size} color={color} />
      </div>
    );
  }

  return (
    <div className={className} style={{ width: size, height: size * 0.4, overflow: "hidden" }} aria-hidden="true">
      <div className="animate-wave-flow flex" style={{ width: size * 2 }}>
        <WaveSvg size={size} color={color} />
        <WaveSvg size={size} color={color} />
      </div>
    </div>
  );
}
