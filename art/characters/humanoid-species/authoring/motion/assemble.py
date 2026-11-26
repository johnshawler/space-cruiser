"""Assemble four synchronized, full-motion portraits per chapter in a seekable H.264 MP4."""
from pathlib import Path
import json,subprocess,tempfile,sys
from PIL import Image,ImageDraw,ImageFont
import numpy as np
d=Path(__file__).resolve().parent
import argparse, shutil
parser=argparse.ArgumentParser()
parser.add_argument('--tiles',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args()
out=args.output.resolve()
tiles=args.tiles.resolve();ff=shutil.which('ffmpeg');fp=shutil.which('ffprobe')
groups=[['Taluun','Orrek','Vessari','Mothren'],['Ureth','Keld','Sovai','Brunn'],
        ['Pelrin','Zhavet','Koruun','Eskel'],['Rhovi','Nemeya','Dathri','Ulnor']]
gait=['Eyestalk counterbalance','Heavy salvage stride','High talon step','Quick, light steps',
      'Measured navigator stride','Wide weight transfer','Webbed-foot push-off','Broad towing stance',
      'Quick courier stride','Long, high steps','Short, deliberate steps','Long, low stride',
      'Brisk pilot stride','Gentle bell carriage','Claw-side counterbalance','Measured portmaster stride']
stage=['Walk cycle','Sit down','Reach and lift','Happy','Bored','Sad']
beat=[0,96,144,210,248,288]
fontroot=Path('/System/Library/Fonts/Supplemental')
def font(name,sz):return ImageFont.truetype(str(fontroot/name),sz)
logo=font('DIN Condensed Bold.ttf',39);sub=font('Arial Narrow Bold.ttf',21);namefont=font('DIN Alternate Bold.ttf',26)
small=font('Arial Narrow.ttf',19);badge=font('Arial Narrow Bold.ttf',23)
W,H=1920,1080;cw,ch=936,468;coords=[(16,93),(968,93),(16,599),(968,599)]
def make_template(g,s):
    bg=Image.new('RGB',(W,H),'#ebe7dd');dr=ImageDraw.Draw(bg)
    dr.rectangle((0,0,W,55),fill='#27312e')
    dr.text((18,30),'LONG HAUL',font=logo,fill='#f6f1e7',anchor='lm')
    dr.line((170,14,170,42),fill='#748078',width=1)
    dr.text((188,29),'HUMANOID MOTION STUDIES',font=sub,fill='#d7dcd0',anchor='lm')
    dr.text((W//2,29),f'GROUP  {g+1} / 4',font=sub,fill='#c2c7b9',anchor='mm')
    current=('FACE  /  ' if s>=3 else '')+stage[s].upper()
    dr.text((W-27,29),current,font=badge,fill='#ffd18b',anchor='rm')
    for j,(x,y) in enumerate(coords):
        name=groups[g][j]
        dr.text((x+2,y-18),name.upper(),font=namefont,fill='#28312d',anchor='lm')
        if s==0:dr.text((x+cw-3,y-18),gait[g*4+j],font=small,fill='#52605a',anchor='rm')
    return np.asarray(bg)
def probe(path):
    data=json.loads(subprocess.check_output([fp,'-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,r_frame_rate,width,height','-of','json',str(path)]))['streams'][0]
    if int(data['nb_frames'])!=336 or data['r_frame_rate']!='24/1':raise ValueError((path,data))
def read_full(stream,n):
    data=stream.read(n)
    if len(data)!=n:raise EOFError(len(data))
    return data
def main():
    for group in groups:
        for n in group:probe(tiles/(n+'.mp4'))
    meta=tiles/'chapters.txt'
    meta.write_text(';FFMETADATA1\ntitle=Long Haul — Humanoids in Motion\n'+''.join(f'[CHAPTER]\nTIMEBASE=1/24\nSTART={i*336}\nEND={(i+1)*336}\ntitle={", ".join(group)}\n' for i,group in enumerate(groups)))
    encoder=subprocess.Popen([ff,'-v','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size','1920x1080','-framerate','24','-i','-',
        '-f','ffmetadata','-i',str(meta),'-map','0:v','-map_metadata','1','-map_chapters','1','-an',
        '-vf','scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
        '-c:v','libx264','-preset','fast','-crf','17','-threads','5','-profile:v','high','-level','4.1',
        '-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-g','48','-movflags','+faststart',str(out)],stdin=subprocess.PIPE)
    for g,group in enumerate(groups):
        inputs=[subprocess.Popen([ff,'-v','error','-threads','1','-i',str(tiles/(n+'.mp4')),'-vf',f'scale={cw}:{ch}:flags=lanczos','-threads','1','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE) for n in group]
        templates=[make_template(g,s) for s in range(6)]
        for f in range(336):
            s=sum(f>=b for b in beat)-1;frame=templates[s].copy()
            for reader,(x,y) in zip(inputs,coords):
                pix=np.frombuffer(read_full(reader.stdout,ch*cw*3),'u1').reshape(ch,cw,3);frame[y:y+ch,x:x+cw]=pix
            encoder.stdin.write(frame.tobytes())
        for p in inputs:
            p.stdout.close()
            if p.wait():raise RuntimeError('Tile decoder')
        print('CHAPTER',g+1,flush=True)
    encoder.stdin.close()
    if encoder.wait():raise RuntimeError('Encoder failed')
if __name__=='__main__':main()
