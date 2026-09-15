// A curved divider between two page sections, so one background colour
// flows into the next instead of cutting at a hard flat edge — the fix for
// sections reading as stacked, disconnected "compartments". Sits as its own
// thin element between two <section>s: painted in the colour of the
// section ABOVE it, with a wave-shaped cutout that reveals the colour of
// the section BELOW. `flip` mirrors the wave vertically for variety so
// consecutive dividers don't all curve the same way.
export function SectionWave({
  fromColor,
  toColor,
  flip = false,
}: {
  fromColor: string;
  toColor: string;
  flip?: boolean;
}) {
  return (
    <div style={{ background: fromColor, lineHeight: 0 }} aria-hidden="true">
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "56px", display: "block", transform: flip ? "scaleY(-1)" : undefined }}
      >
        <path d="M0,32 C240,70 480,0 720,24 C960,48 1200,10 1440,40 L1440,80 L0,80 Z" fill={toColor} />
      </svg>
    </div>
  );
}
