"""Seamless surface finishes and street hardware for the storefront collection."""
import io, struct, tempfile, zlib, hashlib
import numpy as np

def surface_image(key):
    if key in ('light','flame','cyan','glass'):return None
    side=192
    seed=int.from_bytes(hashlib.sha256(key.encode()).digest()[:4],'big')
    rand=np.random.default_rng(seed)
    y,x=np.mgrid[:side,:side]
    def field(n):
        grid=rand.random((n,n));u=x*n/side;v=y*n/side;i=u.astype(int);j=v.astype(int);a=u-i;b=v-j
        a=a*a*(3-2*a);b=b*b*(3-2*b)
        return (grid[j,i]*(1-a)+grid[j,(i+1)%n]*a)*(1-b)+(grid[(j+1)%n,i]*(1-a)+grid[(j+1)%n,(i+1)%n]*a)*b
    low,mid,fine=field(4)-.5,field(16)-.5,rand.random((side,side))-.5
    base=np.array([int(PAL[key][i:i+2],16) for i in (0,2,4)])
    strength=.70 if key in ('snow','ice','chalk','pearl') else 1.
    noise=low*.26+mid*.15+fine*.10
    if key in ('wood','mahogany','tan'):
        noise+=.082*np.sin(x*.95+np.sin(y*2*pi/side)*3+low*14)+.068*np.sin(x*2*pi/side*27+mid*6)
    elif key in ('basalt','stone','sand','sand2','ice','snow'):
        noise+=.22*fine+.08*np.maximum(0,(field(8)-.69)*5)
    elif key in ('wine','red','rose'):
        noise+=.025*((x%3==0)+(y%3==0))
    rgb=base[None,None,:]*(1+strength*noise[:,:,None])
    if key not in ('leaf','snow','ice','sage','wine','rose','pink','stone','basalt'):
        # Shallow worn scratches and a few exposed chips in enamel and metal.
        for j in range(48):
            xx,yy=rand.integers(side,size=2);length=int(rand.integers(2,16));slope=rand.uniform(-.63,.63)
            tint=np.array([170,152,128]) if j%2 else np.array([81,64,49])
            for t in range(length):
                ix=(xx+t)%side;iy=(yy+round(t*slope))%side
                rgb[iy,ix]=rgb[iy,ix]*.68+tint*.32
    arr=np.asarray(np.clip(rgb,0,255),dtype='uint8')
    def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    data=b''.join(b'\0'+a.tobytes() for a in arr)
    blob=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',side,side,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(data,9))+chunk(b'IEND',b'')
    f=Path(TEXDIR.name)/(key+'.png');f.write_bytes(blob)
    img=bpy.data.images.load(str(f));img.name=key+' • worn surface';img.pack();return img

def detail_kit(i):
    part('Street hardware • service marks and storefront fittings')
    # The two shipyards use different lines of spacecraft and different aprons.
    if i in (3,4):
        if i==3:
            for x in (-1.66,-.64,.38,1.4):
                for y in (-1.32,-.31):
                    box(x,y,2.13,.73,.46,.38,'orange' if x<0 else 'tan')
                    for a in (-.22,.22):box(x+a,y,2.13,.065,.49,.42,'iron')
            for j in range(9):box(-3.26+j*.73,-1.91,.275,.35,.09,.034,'yellow')
        else:
            for side in (-1,1):
                slab([(.71,2.29),(1.8,2.99),(1.68,2.28)],-.30+side*.65,-.23+side*.65,'navy')
            for j in range(6):box(-2.2+j*.77,-2.36,1.03,.18,.11,.03,'light')
        return
    if i in (0,1,2,5,6,7,8,11,12,13):
        # Hose reels use actual turns and connect a public fitting to its return.
        x={0:3.43,1:3.05,2:-3.32,5:-2.43,6:-2.61,7:-2.71,8:2.91,11:3.13,12:-3.03,13:-3.23}[i]
        y=-1.87;z=.85
        box(x,y,z,.77,.31,.82,'edge')
        for j in range(5):
            yy=y-.18-j*.047
            pts=[(x+.30*cos(t*pi/12),yy,z+.30*sin(t*pi/12)) for t in range(25)]
            cable(pts,.042,'dark')
        cable([(x+.27,yy,z),(x+.39,yy-.04,.45),(x+.50,yy-.10,.34),(x+.65,yy-.12,.51)],.037,'coal')
        rod((x+.65,yy-.12,.49),(x+.68,yy-.12,.71),.050,'brass')
    if i in (2,5,7,8,11,13):
        # Roof-mounted ventilation, soldered elbow and inspection cover.
        x={2:2.61,5:-2.0,7:-2.36,8:-2.35,11:-2.48,13:1.84}[i]
        zz={2:4.0,5:3.88,7:3.78,8:3.06,11:3.79,13:3.86}[i]
        box(x,.71,zz,.99,.80,.22,'edge')
        for j in range(8):box(x-.39+j*.11,.69,zz+.136,.049,.59,.045,'dark')
        tank(x+.68,1.10,zz-.03,.17,.54,'copper')
    if i in (0,5,6,7,12,13,15):
        for x in (-2.69,2.68):
            z={0:2.51,5:2.41,6:2.36,7:2.92,12:2.04,13:2.63,15:2.23}[i]
            box(x,-1.55,z+.17,.25,.28,.11,'edge')
            ball(x,-1.61,z,.104,.11,.17,'light',12,6)
            for xx in (-.083,.083):rod((x+xx,-1.71,z-.13),(x+xx,-1.71,z+.13),.012,'iron',6)
    if i in (7,11):
        for j in range(4):
            x=-2.8+j*.42;gauge(x,1.68,2.39,.16)
    if i in (0,3,5,6,10,12,14,15):
        # Small, distinct counter props: dispatch folders, patch stock, cups.
        if i==0:
            for j in range(5):box(.66,-1.55,1.40+j*.04,.46,.34,.034,'bone' if j%2 else 'wood')
        if i==5:
            for j in range(7):box(2.1+j*.06,-.43,.55+j*.05,.92,.56,.04,'steel')
        if i==14:
            for j in range(3):
                x=1+j*.38
                pts=[(x+.11+.085*cos(t*pi/8),-1.98,1.52+.076*sin(t*pi/8)) for t in range(17)]
                cable(pts,.019,'cream')
    if i==15:
        bulbs([(-2.4+j*.48,-1.52,2.62-.24*sin(j*pi/10)) for j in range(11)])
    if i==14:
        for j in range(3):
            x=-2.2+j*.75;ball(x,-2.29,1.50,.20,.05,.09,'orange')
    if i==1:
        # Queue rails frame the clerk window. Place the legend clear of the pilasters.
        board('DISPATCH',-1.25,-2.25,2.34,1.41,.27,'mahogany')
