from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math,random
out=Path(__file__).parent/'micro';out.mkdir(exist_ok=True)
N=384
Y,X=np.mgrid[0:N,0:N]
for idx,typ in enumerate(['cloth','leather','skin','rock','fur','chitin','feather','rope','horn','opal','metal','eye','glass','emissive']):
 seed=492+idx;rg=np.random.default_rng(seed);rnd=random.Random(seed)
 def noise(n):
  pts=rg.random((n,n)).astype('float32');pts=np.pad(pts,((2,2),(2,2)),mode='wrap')
  im=Image.fromarray(pts).resize(((n+4)*N//n,(n+4)*N//n),Image.Resampling.BICUBIC)
  px=2*N//n; return np.array(im.crop((px,px,px+N,px+N)))
 large=noise(6)-.5;mid=noise(24)-.5;fine=noise(96)-.5; grain=rg.normal(0,1,(N,N))
 alt=Image.new('L',(N,N),128);dr=ImageDraw.Draw(alt)
 if typ in ('skin','rock','chitin','leather','opal'):
  count={'rock':200,'skin':610,'chitin':173,'leather':450,'opal':154}[typ]
  for j in range(count):
   x,y=rnd.randrange(N),rnd.randrange(N);w=rnd.uniform(1,7 if typ!='rock' else 13);h=w*rnd.uniform(.47,.94);v=rnd.randint(70,196)
   for dx in (-N,0,N):
    for dy in (-N,0,N):
     if -14<x+dx<N+14 and -14<y+dy<N+14:
      dr.ellipse((x-w+dx,y-h+dy,x+w+dx,y+h+dy),fill=v,outline=int(v*.89),width=1)
 elif typ in ('feather','fur','cloth','rope','horn'):
  for j in range(1800 if typ in ('fur','feather') else 650):
   x,y=rnd.randrange(N),rnd.randrange(N);l=rnd.uniform(2,15 if typ=='fur' else 9);dx=rnd.uniform(-.5*l,.15*l);v=rnd.randint(63,200)
   for xx in (x-N,x,x+N):
    for yy in (y-N,y,y+N):
     if -17<xx<N+17 and -17<yy<N+17:dr.line([(xx,yy),(xx+dx,yy+l)],fill=v,width=1)
 pat=(np.asarray(alt).astype(float)-128)/128
 weave=(np.sin(2*np.pi*X/4.)*(np.sin(2*np.pi*Y/8)>0)+np.cos(2*np.pi*Y/4.)*(np.cos(2*np.pi*X/8)>0))
 signal=large*.37+mid*.34+fine*.18+grain*.032+pat*.31
 if typ in ('cloth','rope'):signal+=weave*.075
 if typ=='rock':signal+=.13*np.sin(Y*.22+mid*.9)+np.minimum(mid,-.21)*.31
 if typ=='horn':signal+=.095*np.cos(X*.27+large*.8)
 val=np.clip(.615+signal,0.12,1)
 # Utility pigment map. Colour and shadow range are chosen in the physical material.
 Image.fromarray((val*255).astype('uint8'),'L').save(out/(typ+'.png'),optimize=True)
