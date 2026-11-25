"""Merge independent Blender outputs into one archive with one manifest per asset type."""
import argparse, json, shutil, struct
from pathlib import Path
from html import escape
parser=argparse.ArgumentParser();parser.add_argument('scope',choices=['shops','ships','cast']);args=parser.parse_args()
scope=args.scope
root=Path('assembled');root.mkdir(exist_ok=True)
types={'shops':['interiors'],'ships':['cockpits','ship-interiors'],'cast':['characters']}[scope]
records={group:{} for group in types}
for part in sorted(Path('parts').iterdir()):
    for src in sorted(part.rglob('*')):
        if not src.is_file():continue
        rel=src.relative_to(part);dst=root/rel
        if src.name=='manifest.json':
            if len(rel.parts)!=3 or rel.parts[1] not in records:continue
            group=rel.parts[1]
            for r in json.loads(src.read_text())['rooms' if group=='interiors' else 'ships']:
                if (r.get('location') or r.get('ship'))!=part.name.removeprefix('interiors-').removeprefix('fleet-'):continue
                records[group][r['file']]=r
            continue
        dst.parent.mkdir(parents=True,exist_ok=True)
        if dst.exists() and dst.read_bytes()!=src.read_bytes():raise ValueError(f'Conflicting artifacts at {rel}')
        shutil.copy(src,dst)
for group in types:
    section=root/'assets'/group
    models=sorted(section.rglob('*.glb'));expected={'interiors':30,'cockpits':5,'ship-interiors':5,'characters':50}[group]
    assert len(models)==expected,(group,len(models))
    if group!='characters':
        key='rooms' if group=='interiors' else 'ships';rows=records[group]
        assert len(rows)==expected,(expected,len(rows))
        (section/'manifest.json').write_text(json.dumps({key:[rows[k] for k in sorted(rows)]},indent=2)+'\n')
    images=root/'docs'/('character-surfaces' if group=='characters' else group)
    assert len(list(images.rglob('*.png')))=={'interiors':60,'cockpits':25,'ship-interiors':30,'characters':50}[group]
    scenery=root/'art'/('characters/blender/scenes' if group=='characters' else group)
    assert len(list(scenery.rglob('*.blend')))==expected
    for model in models:
        data=model.read_bytes();assert data[:4]==b'glTF' and len(data)==struct.unpack_from('<I',data,8)[0]
    doc=Path('docs')/('character-surfaces' if group=='characters' else group)/'index.md'
    if doc.exists():shutil.copy(doc,images/'index.md')
    source=Path('art')/group
    if source.is_dir():
        for f in source.rglob('*.py'):
            if any(s=='__pycache__' for s in f.parts):continue
            out=root/f;out.parent.mkdir(parents=True,exist_ok=True);shutil.copy(f,out)
cards=[]
for img in sorted((root/'docs').rglob('*.png')):
    link=img.relative_to(root).as_posix();caption=img.stem.replace('-',' ').title()
    if scope!='cast':caption=img.parent.name.replace('-',' ').title()+' · '+caption
    cards.append(f'<figure><a href="{escape(link)}"><img loading="lazy" src="{escape(link)}" alt="{escape(caption)}"></a><figcaption>{escape(caption)}</figcaption></figure>')
title={'shops':'Port interiors','ships':'Cockpits and walkable decks','cast':'Resident portraits'}[scope]
(root/'gallery.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>{title}</title><style>body{{margin:auto;padding:2.5vw;font:17px system-ui;color:#e9eeee;background:#132027}}h1{{font-size:clamp(2rem,5vw,4rem)}}main{{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(330px,100%),1fr));gap:1.7rem}}figure{{margin:0}}img{{width:100%;height:auto;display:block}}figcaption{{margin-top:.6rem}}</style><h1>{title}</h1><main>'+''.join(cards)+'</main></html>')
