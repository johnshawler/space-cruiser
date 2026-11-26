"""Assemble the 30 saved Blender views into the published, full-size proof sheet."""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


TRADES = {
    'depot': 'Cargo depot', 'garage': 'Repair garage', 'yard': 'Shipyard',
    'livery': 'Paint shop', 'outfit': 'Outfitter', 'assay': 'Assay office', 'bar': 'Cantina',
}
INK = '#e8e6dd'
MUTED = '#aebbb9'
GOLD = '#dbaa72'


def font(size, bold=False):
    names = ('DIN Alternate Bold.ttf', 'DejaVuSans-Bold.ttf') if bold else ('Arial.ttf', 'DejaVuSans.ttf')
    for name in names:
        for directory in (Path('/System/Library/Fonts/Supplemental'), Path('/usr/share/fonts/truetype/dejavu'), Path('.')):
            try:
                return ImageFont.truetype(str(directory / name), size)
            except OSError:
                continue
    return ImageFont.load_default(size=size)


def main():
    root = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('images', type=Path)
    parser.add_argument('details', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    manifest = json.loads((root / 'assets/storefronts/manifest.json').read_text())['venues']
    entries = [(key, port, shop) for port, shops in manifest.items() for key, shop in shops.items()
               if any(light.get('name') == 'port_sconce_left' for light in shop.get('lights', []))]
    if len(entries) != 30:
        raise ValueError(f'Expected 30 refitted ports of call, found {len(entries)} shops')
    entries.sort(key=lambda v: (list(TRADES).index(v[0]), v[2]['name']))

    width, detail_width, height = 900, 435, 515
    divider, gutter, margin = 5, 24, 44
    panel_width = width + divider + detail_width
    caption, header = 92, 176
    page_w = 2*margin + 5*panel_width + 4*gutter
    page_h = header + 6*(height+caption) + 5*gutter + margin
    sheet = Image.new('RGB', (page_w, page_h), '#162126')
    draw = ImageDraw.Draw(sheet)
    draw.text((margin, 24), 'LONG HAUL', font=font(30, True), fill=GOLD)
    draw.text((margin, 59), 'Port storefronts', font=font(78, True), fill=INK)
    draw.text((page_w-margin, 118), '30 SHOPS   /   13 PORTS     •     STOREFRONTS AND TRADE DETAILS', anchor='rs', font=font(31, True), fill=MUTED)
    draw.line((margin, header-16, page_w-margin, header-16), fill='#586368', width=2)
    title_font, metadata_font = font(37, True), font(24)
    for index, (key, port, shop) in enumerate(entries):
        column, row = index % 5, index // 5
        x, y = margin+column*(panel_width+gutter), header+row*(height+caption+gutter)
        file = args.images / Path(shop['file']).with_suffix('.jpg')
        with Image.open(file) as render:
            if render.size != (width, height):
                raise ValueError(f'Unexpected image dimensions in {file}: {render.size}')
            sheet.paste(render, (x, y))
        with Image.open(args.details / file.name) as detail:
            if detail.size != (detail_width, height):
                raise ValueError(f'Unexpected detail dimensions in {file.name}: {detail.size}')
            sheet.paste(detail, (x+width+divider, y))
        draw.text((x+1, y+height+6), shop['name'], font=title_font, fill=INK)
        location = port.replace('-', ' ').title()
        draw.text((x+1, y+height+52), f"{TRADES[key]}  /  {shop['port']}, {location}", font=metadata_font, fill=MUTED)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(args.output, quality=94, subsampling=0, optimize=True)


if __name__ == '__main__':
    main()
