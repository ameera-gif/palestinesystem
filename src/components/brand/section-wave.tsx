// A soft colour blend between two page sections, so one background flows
// into the next instead of cutting at a hard flat edge. Deliberately just a
// gradient, not a wave/curve shape — an SVG wave divider was tried first
// and looked dated/"clip art" once there were several stacked down one
// page; a plain blend can't have that problem and still kills the flat-cut
// "compartmentalized" look.
export function SectionWave({ fromColor, toColor }: { fromColor: string; toColor: string }) {
  return (
    <div
      style={{ height: "96px", background: `linear-gradient(to bottom, ${fromColor}, ${toColor})` }}
      aria-hidden="true"
    />
  );
}
