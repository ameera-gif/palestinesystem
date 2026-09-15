import { cn } from "@/lib/cn";

// Real brand assets, cropped from the official logo file the user provided
// (public/brand/logo-full.png / logo-icon.png) — not a recreation. See
// logo-mark.tsx for the separate hand-drawn SVG mark, which is kept only
// for the large monochrome decorative watermark on the public site (a use
// case a flat PNG can't serve, since it needs arbitrary tint colors).
const FULL_ASPECT = 523 / 119;
const ICON_ASPECT = 128 / 127;

export function Logo({
  size = 28,
  showWordmark = true,
  className,
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  if (!showWordmark) {
    return (
      <img
        src="/brand/logo-icon.png"
        alt="MyFundAction"
        width={Math.round(size * ICON_ASPECT)}
        height={size}
        className={cn("shrink-0 object-contain", className)}
        style={{ height: size, width: "auto" }}
      />
    );
  }

  return (
    <img
      src="/brand/logo-full.png"
      alt="MyFundAction"
      width={Math.round(size * FULL_ASPECT)}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      style={{ height: size, width: "auto" }}
    />
  );
}
