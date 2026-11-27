"""Generate seamless neutral material maps for the exterior kit (Python with NumPy/Pillow)."""
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
N=256
rng=np.random.default_rng(417)
folder=Path(__file__).resolve().parent/'maps'
folder.mkdir(exist_ok=True)
def smooth_noise(scale):
    a=rng.normal(0,1,(N,N))
    freq=np.fft.fftfreq(N)
    w=np.exp(-2*(np.pi*scale)**2*(freq[:,None]**2+freq[None,:]**2))
    z=np.fft.ifft2(np.fft.fft2(a)*w).real
    return z/max(.001,z.std())
for kind in ('paint','rock'):
    weather=.085*smooth_noise(19)+.05*smooth_noise(4)+.026*smooth_noise(.5)
    if kind=='paint':
        lum=np.clip(.83+weather*.55,.55,.96)
        grain=Image.fromarray(np.uint8(lum*255));d=ImageDraw.Draw(grain)
        for y in (0,128):
            d.line((0,y,N,y),fill=117);d.line((0,y+1,N,y+1),fill=231)
        for x,y in ((59,0),(188,128)):
            d.line((x,y,x,y+127),fill=133);d.line((x+1,y+1,x+1,y+127),fill=223)
        for x,y in [(8,8),(246,8),(8,118),(246,118),(8,136),(246,136),(8,246),(246,246)]:
            d.ellipse((x-2,y-2,x+2,y+2),fill=120);d.line((x-1,y-1,x+1,y-1),fill=232)
        for i in range(43):
            x,y=rng.integers(0,N,2);d.line((int(x),int(y),int(x+rng.integers(1,12)),int(y+rng.integers(-2,3))),fill=int(rng.integers(184,234)))
        base=np.asarray(grain)/255
        color=np.stack([base*1.018,base,base*.97],axis=-1)
    else:
        base=np.clip(.85+weather+.035*smooth_noise(1.5),.52,1)
        color=np.stack([base*1.015,base,base*.987],axis=-1)
    Image.fromarray(np.uint8(np.clip(color,0,1)*255)).save(folder/(kind+'.png'),optimize=True)
    gx=(np.roll(base,-1,1)-np.roll(base,1,1))*1.75
    gy=(np.roll(base,-1,0)-np.roll(base,1,0))*1.75
    no=np.stack([-gx,gy,np.ones_like(base)],axis=-1);no/=np.linalg.norm(no,axis=-1,keepdims=True)
    Image.fromarray(np.uint8((no*.5+.5)*255)).save(folder/(kind+'-normal.png'),optimize=True)
