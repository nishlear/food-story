import math
from staticmap import StaticMap

lat1, lon1 = 10.718668, 106.604159  # top-left (NW)
lat2, lon2 = 10.716327, 106.610490  # bottom-right (SE)

ZOOM = 19

def lon_to_tile_x(lon, z):
    return (lon + 180) / 360 * 2**z

def lat_to_tile_y(lat, z):
    lat_rad = math.radians(lat)
    return (1 - math.log(math.tan(lat_rad) + 1 / math.cos(lat_rad)) / math.pi) / 2 * 2**z

# Pixel dimensions that exactly match the bounding box at this zoom
width  = round((lon_to_tile_x(lon2, ZOOM) - lon_to_tile_x(lon1, ZOOM)) * 256)
height = round((lat_to_tile_y(lat2, ZOOM) - lat_to_tile_y(lat1, ZOOM)) * 256)

center_lat = (lat1 + lat2) / 2
center_lon = (lon1 + lon2) / 2

m = StaticMap(width, height, url_template='https://tile.openstreetmap.org/{z}/{x}/{y}.png')
image = m.render(zoom=ZOOM, center=[center_lon, center_lat])
image.save("map.png")
print(f"Saved map.png ({width}x{height}px, zoom={ZOOM})")
