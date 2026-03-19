import { describe, it, expect } from 'vitest';
import { projectVendorToPercent, percentToLatLon } from './geoProjection';

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

describe('percentToLatLon', () => {
  it('maps (0, 0) to NW corner', () => {
    const result = percentToLatLon(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      0, 0
    );
    expect(result.lat).toBeCloseTo(BBOX.lat_nw, 5);
    expect(result.lon).toBeCloseTo(BBOX.lon_nw, 5);
  });

  it('maps (100, 100) to SE corner', () => {
    const result = percentToLatLon(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      100, 100
    );
    expect(result.lat).toBeCloseTo(BBOX.lat_se, 5);
    expect(result.lon).toBeCloseTo(BBOX.lon_se, 5);
  });

  it('maps (50, 50) to midpoint of bbox', () => {
    const midLat = (BBOX.lat_nw + BBOX.lat_se) / 2;
    const midLon = (BBOX.lon_nw + BBOX.lon_se) / 2;
    const result = percentToLatLon(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      50, 50
    );
    expect(result.lat).toBeCloseTo(midLat, 5);
    expect(result.lon).toBeCloseTo(midLon, 5);
  });

  it('round-trips with projectVendorToPercent within 1e-6', () => {
    const vendorLat = 3.1468;
    const vendorLon = 101.7098;
    const { x, y } = projectVendorToPercent(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      vendorLat, vendorLon
    );
    const result = percentToLatLon(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      x, y
    );
    expect(Math.abs(result.lat - vendorLat)).toBeLessThan(1e-6);
    expect(Math.abs(result.lon - vendorLon)).toBeLessThan(1e-6);
  });

  it('asymmetric input xPct=25, yPct=75 returns correct fractional lat/lon', () => {
    const result = percentToLatLon(
      BBOX.lat_nw, BBOX.lon_nw, BBOX.lat_se, BBOX.lon_se,
      25, 75
    );
    const expectedLon = BBOX.lon_nw + 0.25 * (BBOX.lon_se - BBOX.lon_nw);
    const expectedLat = BBOX.lat_nw - 0.75 * (BBOX.lat_nw - BBOX.lat_se);
    expect(result.lon).toBeCloseTo(expectedLon, 5);
    expect(result.lat).toBeCloseTo(expectedLat, 5);
  });
});
