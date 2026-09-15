// Generates a non-photographic avatar (SVG) for every fictional demo child
// and sponsor. This build never uses stock photography or a fabricated
// likeness of a real or invented child, in line with dignity-first,
// no-poverty-porn guidance — but a flat colour box with a single letter
// reads as a placeholder, not a design choice. Instead each avatar gets a
// soft on-brand gradient plus a subtle tatreez-inspired diamond motif —
// Palestinian embroidery's cross-stitch diamond is a real, recognisable
// pattern, used here at low opacity as texture, not appropriation of a
// specific regional/family design.

// Primary dark green and warm sand, the two dominant structural colours
// (see globals.css), paired across the diagonal for genuine contrast
// instead of a flat single fill. The muted Palestinian red appears in only
// one of eight pairs — an identity accent, not a flood of flag colours.
// Every pair stays mid-to-dark throughout so white initials/labels stay
// legible on top.
const GRADIENT_PAIRS: [string, string][] = [
  ["#203A30", "#A68F6C"], // dark green -> sand-dark
  ["#101A15", "#203A30"], // brand-dark -> dark green
  ["#213B2B", "#A68F6C"], // deep olive -> sand-dark
  ["#A68F6C", "#101A15"], // sand-dark -> brand-dark
  ["#203A30", "#8F2E2E"], // dark green -> muted red (sparing accent)
  ["#6B5636", "#203A30"], // warm brown -> dark green
  ["#213B2B", "#101A15"], // deep olive -> brand-dark
  ["#8A7452", "#213B2B"], // muted sand-brown -> deep olive
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
