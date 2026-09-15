// Soft, slowly-drifting blurred colour fields — the actual fix for "the
// background is boring": a flat gradient reads static no matter how nice
// the colour is, this reads alive. Pure CSS animation (see globals.css),
// no JS, paused under prefers-reduced-motion, purely decorative so it can
// never affect content visibility or layout.
export function BlobBackground({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const opacity = variant === "dark" ? { a: 0.45, b: 0.35, c: 0.3 } : { a: 0.25, b: 0.2, c: 0.18 };

  return (
    <div className="blob-field" aria-hidden="true">
      <div
        className="blob blob-a"
        style={{
          width: 420,
          height: 420,
          top: -120,
          left: -100,
          background: "#F2971F",
          opacity: opacity.a,
        }}
      />
      <div
        className="blob blob-b"
        style={{
          width: 380,
          height: 380,
          bottom: -140,
          right: -80,
          background: "#1D6FA5",
          opacity: opacity.b,
        }}
      />
      <div
        className="blob blob-c"
        style={{
          width: 320,
          height: 320,
          top: "35%",
          right: "18%",
          background: "#D9920F",
          opacity: opacity.c,
        }}
      />
    </div>
  );
}
