// MyFundAction's sunburst/flower mark, redrawn as SVG paths (recreated from
// the brand logo, not a bitmap copy) so it scales crisply from a 16px
// favicon up to a large hero graphic and can take a monochrome variant.
const PETAL_COLORS = [
  "#FFE07D",
  "#FFCB3E",
  "#FFB829",
  "#F7A424",
  "#F2941F",
  "#F7A424",
  "#FFB829",
  "#FFCB3E",
];

export function LogoMark({
  size = 32,
  className,
  monochrome,
}: {
  size?: number;
  className?: string;
  /** Single-color variant for dark backgrounds or tiny favicon contexts. */
  monochrome?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="-42 -42 84 84" className={className} aria-hidden="true">
      {PETAL_COLORS.map((color, i) => (
        <path
          key={i}
          d="M0,-6 C8,-15 8,-29 0,-36 C-8,-29 -8,-15 0,-6 Z"
          fill={monochrome ?? color}
          transform={`rotate(${i * 45})`}
        />
      ))}
    </svg>
  );
}
