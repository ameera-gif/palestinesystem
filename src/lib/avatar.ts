// Generates a non-photographic avatar (SVG) for every fictional demo child
// and sponsor. This build never uses stock photography or a fabricated
// likeness of a real or invented child, in line with dignity-first,
// no-poverty-porn guidance — but a flat colour box with a single letter
// reads as a placeholder, not a design choice. Instead each avatar gets a
// soft on-brand gradient plus a subtle tatreez-inspired diamond motif —
// Palestinian embroidery's cross-stitch diamond is a real, recognisable
// pattern, used here at low opacity as texture, not appropriation of a
// specific regional/family design.

// Warm gold and its true colour-wheel complement, a cool blue, paired
// across the diagonal — the two real brand colours (see globals.css),
// combined for genuine contrast instead of a flat single fill or two warm
// tones sitting next to each other. Every pair is intentionally legible
// with white text on top.
const GRADIENT_PAIRS: [string, string][] = [
  ["#C97F0F", "#1D6FA5"], // gold -> blue
  ["#1D6FA5", "#332A1D"], // blue -> charcoal
  ["#B3720C", "#154F78"], // gold -> deep blue
  ["#8C5906", "#1D6FA5"], // deep gold -> blue
  ["#332A1D", "#C97F0F"], // charcoal -> gold
  ["#154F78", "#D9920F"], // deep blue -> bright gold
  ["#5C4A2A", "#2E7FB0"], // warm brown -> lighter blue
  ["#9C6B12", "#123F5C"], // amber -> deep navy
];

function hashOf(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash;
}

/** Simple tatreez-style diamond cross pattern, tiled at low opacity for texture. */
function diamondPattern(id: string, rotation: number) {
  return `<pattern id="${id}" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(${rotation})">
    <path d="M13 3 L21 13 L13 23 L5 13 Z" fill="#FFFFFF" opacity="0.10"/>
    <circle cx="13" cy="13" r="1.6" fill="#FFFFFF" opacity="0.16"/>
  </pattern>`;
}

export function initialsAvatarSvg(name: string, seed: string): string {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const hash = hashOf(seed);
  const [colorA, colorB] = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const angle = 20 + (hash % 40);
  const gradId = `g-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;
  const patId = `p-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colorA}"/>
      <stop offset="1" stop-color="${colorB}"/>
    </linearGradient>
    ${diamondPattern(patId, angle)}
  </defs>
  <rect width="200" height="200" rx="28" fill="url(#${gradId})"/>
  <rect width="200" height="200" rx="28" fill="url(#${patId})"/>
  <text x="100" y="120" font-family="'Segoe UI', Arial, sans-serif" font-size="70" font-weight="700" fill="#FFFFFF" text-anchor="middle" opacity="0.97">${initials}</text>
</svg>`;
}

export function illustrativeCardSvg(label: string, seed: string): string {
  const hash = hashOf(seed);
  const [colorA, colorB] = GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
  const gradId = `cg-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;
  const patId = `cp-${seed.replace(/[^a-zA-Z0-9]/g, "")}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 260" width="400" height="260">
  <defs>
    <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colorA}"/>
      <stop offset="1" stop-color="${colorB}"/>
    </linearGradient>
    ${diamondPattern(patId, 15)}
  </defs>
  <rect width="400" height="260" fill="${colorA}" opacity="0.12"/>
  <rect width="400" height="260" fill="url(#${patId})"/>
  <rect x="0" y="0" width="400" height="260" fill="none" stroke="url(#${gradId})" stroke-width="3"/>
  <text x="200" y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" fill="${colorB}" text-anchor="middle">${label}</text>
</svg>`;
}
