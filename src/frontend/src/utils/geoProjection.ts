/**
 * Project vendor lat/lon to CSS percentage positions on the map image.
 *
 * Uses linear bounding-box mapping (same math as src/map.py).
 * Valid for food-street scale (~few hundred metres) where Mercator
 * nonlinearity is negligible.
 *
 * @param lat_nw - Street bounding box NW latitude (top of image)
 * @param lon_nw - Street bounding box NW longitude (left of image)
 * @param lat_se - Street bounding box SE latitude (bottom of image)
 * @param lon_se - Street bounding box SE longitude (right of image)
 * @param vendorLat - Vendor's latitude
 * @param vendorLon - Vendor's longitude
 * @returns { x, y } as percentages (0-100) for CSS positioning
 */
export function projectVendorToPercent(
  lat_nw: number,
  lon_nw: number,
  lat_se: number,
  lon_se: number,
  vendorLat: number,
  vendorLon: number
): { x: number; y: number } {
  const x = ((vendorLon - lon_nw) / (lon_se - lon_nw)) * 100;
  // Latitude is inverted: NW is top (y=0), SE is bottom (y=100)
  const y = ((lat_nw - vendorLat) / (lat_nw - lat_se)) * 100;
  return { x, y };
}
