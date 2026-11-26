from pathlib import Path
from PIL import Image,ImageFilter
import numpy as np
from forms import CAST
d=Path(__file__).parent; out=d/'tex';out.mkdir(exist_ok=True)
ref=Image.open((d.parent/'reference'/'Original-concept.png')).convert('RGB')
xs=[0,327,633,935,1254];ys=[35,347,657,948,1254]
for name,c in CAST.items():
 i,j=c['col'],c['row']
 im=ref.crop((xs[i],ys[j],xs[i+1],ys[j]+c['floor']+2))
 a=np.array(im,dtype=float);h,w=a.shape[:2]
 edges=np.sort(np.concatenate([a[:,8:36],a[:,w-30:w-7]],axis=1),axis=1)
 mid=np.median(edges,axis=1);mid=np.array(Image.fromarray(mid[:,None,:].astype('uint8')).filter(ImageFilter.MedianFilter(5)))[:,0]
 left=np.median(a[:,8:32],axis=1);right=np.median(a[:,w-28:w-6],axis=1)
 mix=np.linspace(0,1,w)[None,:,None]; bg=left[:,None]*(1-mix)+right[:,None]*mix
 diff=a-bg; delta=np.sqrt(np.mean(diff**2,axis=2)); chrom=diff.max(2)-diff.min(2)
 mask=(delta>16)|(chrom>11)
 mask[:,:33]=False;mask[:,-12:]=False
 mask=Image.fromarray((mask*255).astype('uint8')).filter(ImageFilter.MedianFilter(3))
 mask.save(out/(name+'-mask.png')); b=np.array(mask)>0
 # Pull clean edge colours out underneath UV seams.
 rgb=a.copy()
 for k in range(22):
  sumc=np.zeros_like(rgb);count=np.zeros_like(b,dtype=float)
  for dy,dx in [(1,0),(-1,0),(0,1),(0,-1)]:
   nb=np.roll(b,(dy,dx),axis=(0,1));sumc+=np.roll(rgb,(dy,dx),axis=(0,1))*nb[:,:,None];count+=nb
  fill=(~b)&(count>0);rgb[fill]=sumc[fill]/count[fill,None];b|=fill
 Image.fromarray(rgb.astype('uint8')).save(out/(name+'.png'))
