import math
import os
from staticmap import StaticMap


def generate_map_png(
    lat_nw: float, lon_nw: float, lat_se: float, lon_se: float,
    zoom: int, output_path: str
) -> bool:
    """Generate a static map PNG from OSM tiles. Returns True on success, False on failure."""
    try:
        def lon_to_tile_x(lon, z):
            return (lon + 180) / 360 * 2**z

        def lat_to_tile_y(lat, z):
            lat_rad = math.radians(lat)
            return (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * 2**z

        width = round((lon_to_tile_x(lon_se, zoom) - lon_to_tile_x(lon_nw, zoom)) * 256)
        height = round((lat_to_tile_y(lat_se, zoom) - lat_to_tile_y(lat_nw, zoom)) * 256)
        width = min(max(width, 1), 2048)
        height = min(max(height, 1), 2048)

        center_lat = (lat_nw + lat_se) / 2
        center_lon = (lon_nw + lon_se) / 2

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        m = StaticMap(width, height, url_template='https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        image = m.render(zoom=zoom, center=[center_lon, center_lat])
        image.save(output_path)
        return True
    except Exception:
        return False
