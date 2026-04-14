export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function distance2D(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distance3D(
  a: { x: number; y: number; z?: number },
  b: { x: number; y: number; z?: number },
) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

export function average(points: number[]) {
  if (!points.length) {
    return 0;
  }

  return points.reduce((sum, point) => sum + point, 0) / points.length;
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  if (inMax - inMin === 0) {
    return outMin;
  }

  const progress = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, progress);
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
