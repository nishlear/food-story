import { describe, it, expect } from 'vitest';
import { projectVendorToPercent } from './geoProjection';

// Bbox: NW = (3.1480, 101.7080), SE = (3.1455, 101.7115)
const BBOX = {
  lat_nw: 3.1480,
  lon_nw: 101.7080,
  lat_se: 3.1455,
  lon_se: 101.7115,
};

describe('projectVendorToPercent', () => {
  it('maps NW corner to (0, 0)', () => {
    const result = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      BBOX.lat_nw, BBOX.lon_nw
    );
    expect(result.x).toBeCloseTo(0, 5);
    expect(result.y).toBeCloseTo(0, 5);
  });

  it('maps SE corner to (100, 100)', () => {
    const result = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      BBOX.lat_se, BBOX.lon_se
    );
    expect(result.x).toBeCloseTo(100, 5);
    expect(result.y).toBeCloseTo(100, 5);
  });

  it('maps center to (50, 50)', () => {
    const midLat = (BBOX.lat_nw + BBOX.lat_se) / 2;
    const midLon = (BBOX.lon_nw + BBOX.lon_se) / 2;
    const result = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      midLat, midLon
    );
    expect(result.x).toBeCloseTo(50, 5);
    expect(result.y).toBeCloseTo(50, 5);
  });

  it('latitude inversion: north vendor has smaller y', () => {
    const northVendor = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      3.1475, 101.7098
    );
    const southVendor = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      3.1460, 101.7098
    );
    expect(northVendor.y).toBeLessThan(southVendor.y);
  });

  it('real-world vendor at (3.1468, 101.7098) returns values between 0-100', () => {
    const result = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      3.1468, 101.7098
    );
    expect(result.x).toBeGreaterThan(0);
    expect(result.x).toBeLessThan(100);
    expect(result.y).toBeGreaterThan(0);
    expect(result.y).toBeLessThan(100);
  });
});
