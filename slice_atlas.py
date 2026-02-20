#!/usr/bin/env python3
"""Slice a sprite atlas with black background into individual sprite PNG files.

Usage:
    python slice_atlas.py --input atlas.png --output-dir sprites
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path
from typing import Iterable

from PIL import Image


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Slice sprite atlas into separate PNG files.")
    parser.add_argument("--input", required=True, type=Path, help="Path to atlas image (PNG/JPG).")
    parser.add_argument("--output-dir", default=Path("sprites"), type=Path, help="Output directory.")
    parser.add_argument(
        "--alpha-threshold",
        type=int,
        default=10,
        help="Minimum alpha for a pixel to be considered non-background.",
    )
    parser.add_argument(
        "--rgb-threshold",
        type=int,
        default=24,
        help="Pixels darker than this on all RGB channels are treated as background.",
    )
    parser.add_argument(
        "--min-area",
        type=int,
        default=64,
        help="Discard connected components smaller than this number of pixels.",
    )
    parser.add_argument(
        "--padding",
        type=int,
        default=2,
        help="Extra transparent padding around each exported sprite.",
    )
    return parser.parse_args()


def is_foreground(rgba: tuple[int, int, int, int], alpha_threshold: int, rgb_threshold: int) -> bool:
    r, g, b, a = rgba
    if a < alpha_threshold:
        return False
    return r > rgb_threshold or g > rgb_threshold or b > rgb_threshold


def neighbors(x: int, y: int, width: int, height: int) -> Iterable[tuple[int, int]]:
    if x > 0:
        yield x - 1, y
    if x + 1 < width:
        yield x + 1, y
    if y > 0:
        yield x, y - 1
    if y + 1 < height:
        yield x, y + 1


def connected_components(mask: list[list[bool]]) -> list[tuple[int, int, int, int, int]]:
    """Return components as tuples: (x_min, y_min, x_max, y_max, area)."""
    height = len(mask)
    width = len(mask[0]) if height else 0
    visited = [[False] * width for _ in range(height)]
    components: list[tuple[int, int, int, int, int]] = []

    for y in range(height):
        for x in range(width):
            if not mask[y][x] or visited[y][x]:
                continue

            queue: deque[tuple[int, int]] = deque([(x, y)])
            visited[y][x] = True

            x_min = x_max = x
            y_min = y_max = y
            area = 0

            while queue:
                cx, cy = queue.popleft()
                area += 1
                x_min = min(x_min, cx)
                x_max = max(x_max, cx)
                y_min = min(y_min, cy)
                y_max = max(y_max, cy)

                for nx, ny in neighbors(cx, cy, width, height):
                    if mask[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        queue.append((nx, ny))

            components.append((x_min, y_min, x_max, y_max, area))

    return components


def main() -> None:
    args = parse_args()
    image = Image.open(args.input).convert("RGBA")
    width, height = image.size
    pixels = image.load()

    mask: list[list[bool]] = []
    for y in range(height):
        row = []
        for x in range(width):
            row.append(is_foreground(pixels[x, y], args.alpha_threshold, args.rgb_threshold))
        mask.append(row)

    comps = [c for c in connected_components(mask) if c[4] >= args.min_area]
    comps.sort(key=lambda c: (c[1], c[0]))

    args.output_dir.mkdir(parents=True, exist_ok=True)

    metadata = []
    for idx, (x_min, y_min, x_max, y_max, area) in enumerate(comps, start=1):
        left = max(0, x_min - args.padding)
        upper = max(0, y_min - args.padding)
        right = min(width, x_max + 1 + args.padding)
        lower = min(height, y_max + 1 + args.padding)

        sprite = image.crop((left, upper, right, lower))
        filename = f"sprite_{idx:03}.png"
        sprite_path = args.output_dir / filename
        sprite.save(sprite_path)

        metadata.append(
            {
                "name": filename,
                "bbox": {"left": left, "top": upper, "right": right, "bottom": lower},
                "source_bbox": {"left": x_min, "top": y_min, "right": x_max + 1, "bottom": y_max + 1},
                "area": area,
            }
        )

    metadata_path = args.output_dir / "sprites.json"
    metadata_path.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Done. Exported {len(metadata)} sprites to: {args.output_dir}")
    print(f"Metadata: {metadata_path}")


if __name__ == "__main__":
    main()
