#!/usr/bin/env python3
"""Standalone map generation script called by Express via child_process.execFile.
Usage: python3 gen_map.py <lat_nw> <lon_nw> <lat_se> <lon_se> <zoom> <output_path>
Exit code 0 on success, 1 on failure.
"""
import sys
import os

# Add parent directory to path so we can import map_utils
sys.path.insert(0, os.path.dirname(__file__))
from map_utils import generate_map_png


def main():
    if len(sys.argv) != 7:
        print("Usage: python3 gen_map.py <lat_nw> <lon_nw> <lat_se> <lon_se> <zoom> <output_path>", file=sys.stderr)
        sys.exit(1)

    lat_nw, lon_nw, lat_se, lon_se = (float(x) for x in sys.argv[1:5])
    zoom = int(sys.argv[5])
    output_path = sys.argv[6]

    success = generate_map_png(lat_nw, lon_nw, lat_se, lon_se, zoom, output_path)
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
