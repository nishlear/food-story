import { haversine } from './haversine';
import { describe, it, expect } from 'vitest';

describe('haversine', () => {
  it('returns 0 for identical points', () => {
    expect(haversine(10.0, 106.0, 10.0, 106.0)).toBe(0);
  });

  it('returns ~111km for 1 degree latitude', () => {
    const d = haversine(10.0, 106.0, 11.0, 106.0);
    expect(d).toBeGreaterThan(110000);
    expect(d).toBeLessThan(112000);
  });

  it('returns reasonable distance for nearby points (~100m)', () => {
    const d = haversine(10.7700, 106.6950, 10.7709, 106.6950);
    expect(d).toBeGreaterThan(90);
    expect(d).toBeLessThan(110);
  });
});
