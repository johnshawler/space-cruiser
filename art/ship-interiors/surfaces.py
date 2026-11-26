"""Tiling surface sets for the richly finished decks: chipped paint, bare metal, tread plate, cloth, leather, wood, enamel.

Each set is one metre square and seamless: a colour layer that multiplies the material's own colour, a normal map and a
roughness map. They carry the fine detail; the baked light map (bake_light in art/cockpits/fabricate.py) carries the
light, shadow and the dirt that belongs to one particular place."""
import math,sys
from pathlib import Path
import numpy as np
import bpy
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'cockpits'))
from ship_finish import rgba_image
from meshwork import rgb

def fbm(n,beta,seed,stretch=(1,1)):
    """Seamless fractal noise in 0..1. stretch>1 on an axis draws the grain out along it."""
    rng=np.random.default_rng(seed);f=np.fft.fft2(rng.standard_normal((n,n)))
    ky=np.fft.fftfreq(n)[:,None]*stretch[0];kx=np.fft.fftfreq(n)[None,:]*stretch[1];k=np.sqrt(kx*kx+ky*ky);k[0,0]=1
    g=np.real(np.fft.ifft2(f/k**beta));g-=g.min();return g/g.max()
def step(a,b,x):t=np.clip((x-a)/(b-a),0,1);return t*t*(3-2*t)
def scratches(n,count,seed,length=(10,70)):
    rng=np.random.default_rng(seed);m=np.zeros((n,n))
    for _ in range(count):
        x,y=rng.uniform(0,n,2);a=rng.uniform(0,math.pi);l=rng.uniform(*length);v=rng.uniform(.4,1)
        t=np.arange(0,l,.5);m[(y+np.sin(a)*t).astype(int)%n,(x+np.cos(a)*t).astype(int)%n]=v
    return m
def normal_from(h,strength):
    dx=(np.roll(h,-1,1)-np.roll(h,1,1))*strength;dy=(np.roll(h,-1,0)-np.roll(h,1,0))*strength
    v=np.stack((-dx,-dy,np.ones_like(dx)),axis=-1);v/=np.linalg.norm(v,axis=-1,keepdims=True);return v*.5+.5
RUST=np.array([1.55,.72,.34]);BARE=np.array([1.7,1.72,1.68])

def paint(n,seed):
    """Brushed-on paint over steel: uneven coats, chips down to bright metal, rust blooming from the chips."""
    tone=.8+.3*fbm(n,2.4,seed);fine=fbm(n,.6,seed+1);chip=step(.80,.84,fbm(n,1.5,seed+2))*step(.35,.6,fbm(n,2.6,seed+3))
    rust=step(.6,.78,fbm(n,1.9,seed+4))*step(.45,.7,fbm(n,2.8,seed+5));sc=scratches(n,70,seed+6)
    col=np.repeat((tone*(.94+.12*fine))[:,:,None],3,2)
    rim=np.clip(step(.74,.80,fbm(n,1.5,seed+2))*step(.35,.6,fbm(n,2.6,seed+3))-chip,0,1)
    col*=1-.45*rim[:,:,None]
    col=col*(1-rust[:,:,None])+rust[:,:,None]*RUST*(.55+.5*fine[:,:,None])
    col=col*(1-chip[:,:,None])+chip[:,:,None]*BARE*(.8+.3*fine[:,:,None])
    col*=1+.35*sc[:,:,None]
    h=.25*fbm(n,2.0,seed+7)-.5*chip+.25*rust*fine-.3*sc+.08*fine
    return col,h,np.clip(.62+.2*fine-.32*chip+.25*rust,.1,.95),1.6
def bare(n,seed):
    """Unpainted metal: brushed one way, tarnished in patches, pitted."""
    grain=fbm(n,1.1,seed,(9,1));tarn=step(.45,.8,fbm(n,2.4,seed+1));pit=step(.86,.9,fbm(n,.9,seed+2))
    col=np.repeat((.82+.3*grain)[:,:,None],3,2)*(1-.42*tarn[:,:,None]*np.array([.9,1.,1.15]))
    col*=1-.5*pit[:,:,None];sc=scratches(n,90,seed+3,(20,160));col*=1+.3*sc[:,:,None]
    return col,.2*grain-.5*pit-.25*sc,np.clip(.34+.3*grain+.3*tarn,.08,.9),1.2
def plate(n,seed):
    """Steel tread plate: raised lozenges in a herringbone, worn bright on top, dirt packed between them."""
    y,x=np.mgrid[0:n,0:n]/n;c=10;h=np.zeros((n,n))
    for flip in(0,1):
        u=(x*c+(.5 if flip else 0))%1-.5;v=(y*c+(.5 if flip else 0))%1-.5;s=1 if flip else -1
        a=(u+s*v)*.707;b=(u-s*v)*.707;h=np.maximum(h,np.clip(1-np.maximum(np.abs(a)/.34,np.abs(b)/.085),0,1))
    lug=step(.0,.35,h);dirt=fbm(n,2.2,seed);fine=fbm(n,.7,seed+1);wear=step(.35,.75,fbm(n,2.6,seed+2))
    col=np.repeat((.5+.22*dirt+.1*fine)[:,:,None],3,2)
    col=col*(1-lug[:,:,None])+lug[:,:,None]*(.75+.9*wear[:,:,None])*(.9+.2*fine[:,:,None])
    rust=step(.7,.85,fbm(n,1.8,seed+3))*(1-lug);col=col*(1-.7*rust[:,:,None])+.7*rust[:,:,None]*RUST*.6
    return col,lug*.9+.1*fine,np.clip(.72-.4*lug*wear+.15*fine,.1,.95),3.2
def cloth(n,seed):
    """Canvas weave with stains and pilling."""
    y,x=np.mgrid[0:n,0:n];p=n/64;warp=.5+.5*np.sin(x*2*math.pi/p);weft=.5+.5*np.sin(y*2*math.pi/p)
    over=((x//(p/2)+y//(p/2))%2).astype(float);w=over*warp+(1-over)*weft;stain=fbm(n,2.5,seed);fuzz=fbm(n,.5,seed+1)
    col=np.repeat((.74+.22*w+.1*fuzz)[:,:,None],3,2)*(1-.3*step(.55,.8,stain)[:,:,None]*np.array([.85,1.,1.1]))
    return col,.6*w+.2*fuzz,np.clip(.82+.1*fuzz,.1,.98),1.4
def leather(n,seed):
    """Old leather: a net of cracks, rubbed pale on the high spots."""
    a=fbm(n,1.5,seed);b=fbm(n,1.5,seed+1);crack=1-step(.0,.035,np.minimum(np.abs(a-.5),np.abs(b-.5)));rub=step(.5,.8,fbm(n,2.6,seed+2));fine=fbm(n,.7,seed+3)
    col=np.repeat((.85+.2*fine+.5*rub)[:,:,None],3,2)*(1-.6*crack[:,:,None])
    return col,.4*fine-.9*crack+.2*rub,np.clip(.6-.25*rub+.3*crack,.1,.95),1.8
def wood(n,seed):
    """Four planks to the metre: grain along the plank, dark joints, a knot or two, bare paths worn in."""
    y,x=np.mgrid[0:n,0:n]/n;pl=np.floor(y*4);off=np.sin(pl*12.9898)*43758.5453%1
    g=fbm(n,1.4,seed,(1,14));ring=.5+.5*np.sin((g*9+off*7+y*4*2.2)*2*math.pi);joint=1-step(.0,.02,np.abs((y*4)%1-.5)*-1+.5)
    tone=.7+.25*np.take(np.random.default_rng(seed).uniform(0,1,4),pl.astype(int)%4)
    col=np.repeat((tone*(.82+.2*ring*g+.1*g))[:,:,None],3,2)*np.array([1.,.96,.9])
    grey=step(.5,.8,fbm(n,2.4,seed+2));col=col*(1-.35*grey[:,:,None])+.35*grey[:,:,None]*np.array([1.05,1.05,1.08])[None,None,:]*col.mean(axis=2,keepdims=True)
    col*=1-.75*joint[:,:,None]
    return col,.35*ring*g-1.2*joint+.15*g,np.clip(.7+.15*g-.2*grey,.1,.95),1.6
def enamel(n,seed):
    """Enamel or glazed finish: smooth, crazed, chipped black at the knocks."""
    a=fbm(n,1.7,seed);craze=1-step(.0,.012,np.abs(a-.5));chip=step(.84,.87,fbm(n,1.3,seed+1));yel=fbm(n,2.6,seed+2)
    col=np.ones((n,n,3))*(.9+.12*yel[:,:,None])*np.array([1.,.98,.9+.0])*(1-.25*craze[:,:,None])
    col=col*(1-chip[:,:,None])+chip[:,:,None]*np.array([.22,.2,.19])
    return col,-.3*craze-.8*chip,np.clip(.3+.2*yel+.5*chip,.05,.95),1.0
def rubber(n,seed):
    """Ribbed rubber, scuffed pale."""
    y,x=np.mgrid[0:n,0:n];rib=.5+.5*np.sin(y*2*math.pi/(n/40));scuff=step(.55,.8,fbm(n,2.2,seed,(1,3)));fine=fbm(n,.6,seed+1)
    col=np.repeat((.85+.15*rib+.1*fine+.9*scuff)[:,:,None],3,2)
    return col,.8*rib+.1*fine,np.clip(.85-.2*scuff,.1,.98),1.5
SETS={'paint':(paint,512,11),'paint2':(paint,512,37),'bare':(bare,512,5),'plate':(plate,512,3),'cloth':(cloth,256,7),
      'leather':(leather,256,9),'wood':(wood,512,13),'enamel':(enamel,256,17),'rubber':(rubber,256,19)}
_made={}
def images(kind,rough):
    if kind not in _made:
        fn,n,seed=SETS[kind];col,h,ro,strength=fn(n,seed)
        ci=rgba_image('surf-'+kind+'-colour',np.clip(col*.5,0,1)**(1/2.2),False);ci.colorspace_settings.name='sRGB'   # stored at half strength, as sRGB
        _made[kind]=(ci,rgba_image('surf-'+kind+'-normal',normal_from(h,strength)),ro)
    key=kind+str(round(rough*100))
    if key not in _made:
        ro=_made[kind][2];_made[key]=rgba_image('surf-'+key+'-rough',np.repeat(np.clip(ro+(rough-.6),.06,.97)[:,:,None],3,2))
    return _made[kind][0],_made[kind][1],_made[key]
def finish(mat,kind,colour=None,bump=1.):
    """Give a material one of the sets. Its colour layer multiplies the material's own colour (doubled, because the
    layer is stored at half strength so chips can be brighter than the paint)."""
    nt=mat.node_tree;p=nt.nodes.get('Principled BSDF')
    if colour:p.inputs['Base Color'].default_value=(*rgb(colour),1)
    base=np.array(p.inputs['Base Color'].default_value[:3]);rough=.6
    for l in list(nt.links):
        if l.to_node==p and l.to_socket.name=='Roughness':
            img=l.from_node.image;a=np.empty(len(img.pixels),dtype=np.float32);img.pixels.foreach_get(a);rough=float(a.reshape(-1,4)[:,0].mean())
    for nd in [x for x in nt.nodes if x.type in('TEX_IMAGE','NORMAL_MAP')]:nt.nodes.remove(nd)
    ci,ni,ri=images(kind,rough)
    c=nt.nodes.new('ShaderNodeTexImage');c.image=ci
    mix=nt.nodes.new('ShaderNodeMix');mix.data_type='RGBA';mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1
    mix.inputs[7].default_value=(*np.clip(base*2,0,1),1);nt.links.new(c.outputs['Color'],mix.inputs[6]);nt.links.new(mix.outputs[2],p.inputs['Base Color'])
    n=nt.nodes.new('ShaderNodeTexImage');n.image=ni;nm=nt.nodes.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=bump
    nt.links.new(n.outputs['Color'],nm.inputs['Color']);nt.links.new(nm.outputs['Normal'],p.inputs['Normal'])
    r=nt.nodes.new('ShaderNodeTexImage');r.image=ri;nt.links.new(r.outputs['Color'],p.inputs['Roughness'])
    mat.diffuse_color=(*base,1)
