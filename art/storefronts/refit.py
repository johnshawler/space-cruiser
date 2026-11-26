"""Street-level architecture and working fixtures for the first thirty port shops.

Geometry uses the existing storefront builder's fabrication functions. The native lights
and the game bake are described by the same fixture positions, in metres.
"""
from functools import lru_cache
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'ship-interiors'))
import surfaces as hull

COAT = dict(verdanthia='sage', amethyne='purple', sloshwell='teal', candara='blue',
            brrrindle='wine', dunemoor='sand2', scorchmaw='rust', toxibloom='pine',
            jovexa='navy', **{'listening-post-hush':'navy','cryo-vault-rimeholm':'ice',
            'calibration-spire':'cream','beacon-far-wink':'teal'})
TRADE = {'depot':'RECEIVING','garage':'SERVICE','bar':'GALLEY','yard':'DRY DOCK',
         'outfit':'STORES','assay':'SAMPLES','livery':'MIX ROOM'}
# Width and height of the crown of each port's pressure frame.
CROWN = {'verdanthia':(6.5,6.3),'amethyne':(4.6,7.6),'sloshwell':(4.2,6.5),
         'candara':(5.2,6.1),'brrrindle':(5.0,6.0),'dunemoor':(6.8,6.7),
         'scorchmaw':(5.8,7.9),'toxibloom':(4.5,7.0),'jovexa':(4.6,7.5),
         'listening-post-hush':(6.6,6.0),'cryo-vault-rimeholm':(5.1,6.8),
         'calibration-spire':(6.5,6.6),'beacon-far-wink':(3.9,6.4)}

@lru_cache(None)
def surface_set(kind):
    fn, _, seed = hull.SETS[kind]
    colour, height, roughness, strength = fn(256,seed)
    normal = hull.rgba_image('Port '+kind+' relief',hull.normal_from(height,strength))
    rough = hull.rgba_image('Port '+kind+' roughness',np.repeat(roughness[:,:,None],3,axis=2))
    return colour, normal, rough

def finish_port_material(m,k):
    p=m.node_tree.nodes.get('Principled BSDF')
    if k in ('light','flame','cyan','glass'):
        if k=='glass':
            p.inputs['Metallic'].default_value=.49
            p.inputs['Coat Weight'].default_value=.33
        else:
            p.inputs['Emission Strength'].default_value=3.8
        return
    kind={'iron':'bare','edge':'bare','steel':'bare','brass':'bare','copper':'bare',
          'deckplate':'plate','coal':'rubber','dark':'rubber','mahogany':'wood','wood':'wood',
          'upholstery':'leather','canvas':'cloth','bone':'enamel','cream':'enamel','white':'enamel',
          'stone':'paint2','basalt':'paint2','rust':'paint2','snow':'enamel','ice':'enamel'}.get(k,'paint')
    if k=='safety':kind='paint2'
    pat,normal,rough=surface_set(kind)
    base=np.array(m.diffuse_color[:3])
    grey=base.dot([.25,.57,.18])
    base=(base*.75+grey*.25)*(.84 if kind=='paint' else .96)
    val=np.clip(pat*base[None,None,:],0,1)
    # Store explicit sRGB bytes; the glTF maps are also used by the game's vertex lighting pass.
    srgb=np.where(val<.0031308,12.92*val,1.055*val**(1/2.4)-.055)
    h,w=srgb.shape[:2]
    im=bpy.data.images.new(k+' • worn finish',w,h,alpha=False)
    im.colorspace_settings.name='sRGB'
    pix=np.ones((h,w,4),dtype='f');pix[:,:,:3]=srgb
    im.pixels.foreach_set(pix.ravel())
    im.filepath_raw=str(Path(TEXDIR.name)/(k+'.png'));im.file_format='PNG';im.save();im.pack()
    nt=m.node_tree
    def sample(image):
        node=nt.nodes.new('ShaderNodeTexImage');node.image=image;return node.outputs['Color']
    nt.links.new(sample(im),p.inputs['Base Color'])
    relief=nt.nodes.new('ShaderNodeNormalMap');relief.inputs['Strength'].default_value=.58 if kind!='plate' else .88
    nt.links.new(sample(normal),relief.inputs['Color']);nt.links.new(relief.outputs['Normal'],p.inputs['Normal'])
    nt.links.new(sample(rough),p.inputs['Roughness'])
    p.inputs['Metallic'].default_value={'bare':.73,'plate':.53,'paint':.15,'paint2':.18}.get(kind,.035)

def panel(x,y,z,w,d,h,c):
    # Flat folded sheet with clipped corners. Most of the fasteners live in the returns.
    r=min(w*.16,h*.16,.12)
    outline=[(-w/2+r,-h/2),(w/2-r,-h/2),(w/2,-h/2+r),(w/2,h/2-r),
             (w/2-r,h/2),(-w/2+r,h/2),(-w/2,h/2-r),(-w/2,-h/2+r)]
    slab([(x+a,z+b) for a,b in outline],y-d/2,y+d/2,c)

def profile(side,inner,h):
    return [(side*8.16,-.06),(side*8.16,3.64),(side*(inner+.38),h-.48),
            (side*inner,h),(0,h)]

def ribbon(profile, y0,y1, thick, c):
    for (x,z),(u,v) in zip(profile,profile[1:]):
        length=math.hypot(u-x,v-z)
        if length==0:continue
        nx,nz=(v-z)/length*thick,-(u-x)/length*thick
        slab([(x,z),(u,v),(u+nx,v+nz),(x+nx,z+nz)],y0,y1,c)

def floor_panels(rear,bar):
    part('Lift-out floor panels and drainage trenches')
    # The vanilla slab is low, so the traversable surface is flush with y-up zero.
    cols=8; rows=round((rear+6)/2.05);dx=16.92/cols;dy=(rear+6)/rows
    box(0,rear/2+.5,-.145,17.08,rear+6.3,.22,'coal')
    for j in range(rows):
        for i in range(cols):
            x=(i-(cols-1)/2)*dx;y=-2.5+(j+.5)*dy
            surface='wood' if bar and 0<i<7 else ('deckplate' if i in (0,7,3,4) else 'iron')
            # Simple folded plates, with a dark gasket between them.
            panel(x,y,-.022,dx-.027,dy-.036,.042,surface)
            if (i+j)%3==0:
                for side in (-1,1):post(x+side*(dx/2-.12),y+.40*dy,.001,.004,.027,'steel',6)

def caged_lamp(x,y,z,side):
    part('Bulkhead sconces with wire cages')
    box(x,y,z+.24,.46,.40,.18,'iron')
    cone((x,y,z-.13),(x,y,z+.19),.19,.22,'light',16)
    for j in range(6):
        a=j*pi/3;post(x+.235*cos(a),y+.235*sin(a),z-.15,.38,.014,'coal',6)
    post(x,y,z-.18,.056,.23,'brass',12)

def make_frame(port, key, rear):
    paint=COAT[port];inner,h=CROWN[port]
    ys=[-.9,2.8,6.5,10.25]
    if key=='depot':ys.append(14.1)
    warm=key=='bar'
    for side in (-1,1):
        path=profile(side,inner,h)
        part('Pressed hull lining and spliced transverse ribs')
        for j,y in enumerate(ys):
            # The entrance remains open. The first bay is skylit and the deep bays have a solid crown.
            if j<len(ys)-1:
                end=ys[j+1]
                skin=path[:3] if j==0 or key=='yard' and j==1 else path
                ribbon(skin,y+.16,end-.16,.075*side, 'mahogany' if warm and j%2 else paint)
                box(side*8.10,(end+y)/2,1.04,.16,end-y-.14,1.73,'iron' if not warm else 'wood')
                box(side*8.0,(end+y)/2,1.91,.11,end-y-.12,.084,'brass')
            ribbon(path,y-.11,y+.11,-.16*side,'iron')
            ribbon(path,y-.125,y-.108,-.23*side,paint)
            for z in (.38,1.38,2.38,3.38):
                rod((side*7.95,y,z),(side*7.91,y,z),.071,'steel',6)
        part('Flanged supply and return lines with pipe shoes')
        for k in range(2):
            x=side*(7.81-k*.27);z=2.62+k*.31
            rod((x,-1.40,z),(x,ys[-1]+.65,z),.107+k*.033,'copper' if k==0 else 'iron',14)
            for y in ys:
                rod((x,y-.07,z),(x,y+.07,z),.16+k*.036,'brass' if k==0 else 'steel',12)
        # Bracket-mounted cabinets contain the visible fan grille and access tags.
        for j,y in enumerate(ys[1:]):
            x=side*7.86
            box(x,y+.85,2.65,.36,1.12,.85,'bone' if j%2 else paint)
            for k in range(5):box(x-side*.188,y+.48+k*.18,2.65,.031,.048,.53,'coal')
        if warm:
            for y in (3.8,7.55):
                x=side*6.65
                box(x,y,.45,1.66,1.58,.36,'wood')
                box(x,y,.70,1.65,1.59,.25,'upholstery')
                box(side*7.46,y,1.25,.20,1.59,1.15,'upholstery')
                for z in (.98,1.30,1.59):rod((side*7.34,y-.72,z),(side*7.34,y+.72,z),.019,'tan',8)
        for y in (2.0,8.35):
            caged_lamp(side*7.19,y,3.56,side)
    part('Overhead ladder trays and safety glazing')
    for side in (-1,1):
        x=side*(inner+.42)
        for dx in (-.25,.25):rod((x+dx,-.85,h-.62),(x+dx,ys[-1],h-.62),.055,'steel',10)
        for k in range(int(ys[-1]+2)):
            y=k-.55;rod((x-.25,y,h-.62),(x+.25,y,h-.62),.026,'iron',6)
    return h

def sales_desk(port,key,title):
    paint=COAT[port]
    part('Service counter • folded fascia, toe kick and replaceable cap')
    panel(0,0,.45,4.38,.81,.82,'coal')
    panel(0,-.413,.51,4.27,.05,.73,paint)
    for x in (-1.62,0,1.62):
        wide=1.80 if x==0 else 1.23
        panel(x,-.451,.53,wide,.039,.53,'iron' if x==0 else 'bone')
        for sx in (-1,1):
            for sz in (-1,1):
                rod((x+sx*(wide/2-.11),-.477,.53+sz*.17),(x+sx*(wide/2-.11),-.49,.53+sz*.17),.032,'steel',6)
    box(0,0,1.01,4.64,.94,.079,'wood' if key=='bar' else 'steel')
    for face_x in (-1.62, 1.62):
        for j in range(4):
            box(face_x,-.48,.43+j*.066,.60,.026,.026,'coal')
    for x in (-2.12,2.12):box(x,-.42,.52,.082,.11,.79,'brass')
    # Vendor hardware stays on the cashier's end, clear of goods and nameplate sockets.
    part('Paper docket printer with knurled roller and tear strip')
    panel(1.67,.05,1.21,.67,.58,.32,'bone')
    panel(1.67,-.252,1.25,.48,.013,.065,'coal')
    rod((1.43,.20,1.44),(1.91,.20,1.44),.099,'chalk',16)
    box(1.67,-.09,1.378,.39,.32,.012,'chalk')
    for i in range(6):box(1.66,-.18+i*.033,1.385,.26 if i%3 else .16,.008,.003,'iron')
    if key=='bar':
        for k in range(2):
            x=-1.75+k*.32
            cone((x,.12,1.055),(x,.12,1.29),.09,.12,'cream',16)
            post(x,.12,1.286,.009,.099,'mahogany',16)

def service_appliance(port,key,side):
    """Trade-specific bench against the sidewall, outside the camera and actor lanes."""
    paint=COAT[port];x=side*5.60;y=6.1
    part('Serviced equipment cabinet • '+TRADE[key])
    panel(x,y,1.07,2.34,1.02,1.91,paint)
    panel(x,y-.52,1.06,2.18,.04,1.64,'iron')
    for k in range(2):
        xx=x-.55+k*1.06;panel(xx,y-.56,.78,.96,.040,.98,'bone')
        rod((xx-.21,y-.62,1.03),(xx+.21,y-.62,1.03),.031,'brass',8)
    box(x,y,2.052,2.5,1.16,.075,'steel')
    if key in ('depot','assay'):
        part('Beam balance, scale pan and retained test weights')
        post(x,y,2.08,.75,.10,'iron');rod((x-.77,y,2.72),(x+.77,y,2.72),.06,'brass')
        for s in (-1,1):
            xx=x+s*.69;cone((xx,y,2.26),(xx,y,2.36),.27,.38,'steel',16)
            for j in (0,1,2):
                a=j*2*pi/3;rod((xx,y,2.70),(xx+.32*cos(a),y+.32*sin(a),2.35),.013,'copper',6)
    elif key in ('garage','yard','outfit'):
        part('Sectioned power coupling and inspection micrometer')
        for k in range(8):
            xx=x-.79+k*.19;rad=.31 if k in (0,7) else .245
            rod((xx,y,2.43),(xx+.12,y,2.43),rad,'steel' if k%2 else 'copper',16)
        for j in range(3):
            xx=x-.72+j*.71;box(xx,y,2.21,.15,.59,.24,'iron')
        gauge(x+.77,y-.16,2.76,.19)
    elif key=='livery':
        part('Pressure pots, transfer line and spray head')
        for j in range(3):
            xx=x-.76+j*.72;tank(xx,y,2.09,.25,.83,('cream',paint,'rust')[j])
            cable([(xx,y,2.94),(xx,y+.24,3.07),(x+.9,y+.24,3.07)],.03,'copper')
    else:
        part('Coffee urn, sight glass and drip tray')
        tank(x-.44,y,2.09,.43,1.02,'copper')
        cable([(x-.4,y-.38,2.61),(x-.4,y-.62,2.61),(x-.4,y-.62,2.43)],.042,'brass')
        box(x-.42,y-.46,2.12,.8,.31,.035,'coal')
        for j in range(3):cone((x+.36+.23*j,y,2.10),(x+.36+.23*j,y,2.39),.09,.12,'bone',16)
    part('Maintenance card and isolation switch')
    panel(x,y-.552,1.66,1.90,.036,.29,'coal')
    label(TRADE[key],x,y-.577,1.66,.16,'cream',1.60)

def overhead_shop_fittings(port, key):
    """Fit the bay over the dedicated side workbench, clear of all actor paths."""
    part('Overhead trade equipment and service connections')
    paint = COAT[port]
    x, y = 5.55, 6.12
    if key in ('yard', 'garage'):
        # Rail, trolley wheels, load block and a forged J-hook over the engine bench.
        box(x, y, 4.68, 3.66, .31, .14, 'steel')
        box(x, y, 4.86, 3.60, .12, .35, 'iron')
        box(x, y, 5.04, 3.66, .32, .14, 'steel')
        for xx in (x-1.45, x+1.45):
            rod((xx,y,5.01),(xx+.24,y,5.77),.065,'iron')
            rod((xx+.24,y,5.77),(7.92,y,5.23),.07,paint)
        block=x+.40 if key=='garage' else x-.55
        for dx in (-.24,.24):
            rod((block+dx,y-.28,4.85),(block+dx,y+.24,4.85),.15,'coal',14)
        panel(block,y-.10,4.51,.87,.58,.42,'safety')
        for dx in (-.13,.13):rod((block+dx,y-.09,4.34),(block+dx,y-.09,3.75),.022,'steel',8)
        panel(block,y-.09,3.63,.36,.18,.30,'iron')
        cable([(block,y-.09,3.51),(block,y-.09,3.32),(block+.10,y-.09,3.21),
               (block+.24,y-.09,3.23),(block+.30,y-.09,3.36)],.045,'brass')
    elif key=='bar':
        # Two independent lamps on goosenecks over the tables in the side booths.
        for yy in (3.8,7.55):
            cable([(7.91,yy,3.67),(7.19,yy,3.67),(6.94,yy,3.53),(6.85,yy,3.30)],.044,'brass')
            cone((6.85,yy,2.94),(6.85,yy,3.32),.44,.13,paint,24)
            post(6.85,yy,2.92,.026,.38,'light',24)
            post(5.27,yy,.05,.98,.085,'iron');post(5.27,yy,.05,.07,.39,'iron')
            post(5.27,yy,1.02,.10,.57,'mahogany',24)
            cone((5.17,yy,1.13),(5.17,yy,1.39),.09,.13,'cream',14)
            post(5.17,yy,1.382,.012,.115,'mahogany',14)
    elif key=='livery':
        # Slotted air extraction hood and hanging fan of baked enamel colour samples.
        slab([(x-1.28,3.57),(x+1.28,3.57),(x+.66,4.21),(x-.66,4.21)],y-.48,y+.52,'steel')
        for j in range(12):box(x-1.10+.20*j,y-.51,3.61,.065,.06,.115,'coal')
        rod((x,y,4.18),(x,y,4.83),.32,'iron',18);rod((x,y,4.83),(7.95,y,4.83),.32,'steel',18)
        for j,colour in enumerate(('cream','sage','red','teal','sand')):
            xx=x-1.05+j*.46
            post(xx,y-.35,3.18,.38,.016,'brass',6)
            panel(xx,y-.35,3.04,.32,.035,.30,colour)
    elif key in ('outfit','assay'):
        # Stock mesh and retaining lips let the samples be inspected at eye level.
        yy=y+.63
        for xx in (x-1.12,x+1.12):box(xx,yy,3.04,.09,.13,1.94,'steel')
        for zz in (2.44,3.18,3.98):box(x,yy,zz,2.37,.16,.08,'brass')
        if key=='assay':
            for j in range(4):
                xx=x-.85+j*.56
                box(xx,yy-.18,3.18,.53,.49,.08,'iron')
                grain(xx,yy-.16,3.37,.18,('basalt','rust','ice','sand')[j])
        else:
            for j in range(6):
                xx=x-.9+j*.355
                rod((xx,yy,3.95),(xx,yy-.2,3.72),.027,'brass',8)
                cable([(xx,yy-.2,3.72),(xx-.12,yy-.2,3.52),(xx-.12,yy-.2,3.05),
                       (xx+.10,yy-.2,2.98),(xx+.14,yy-.2,3.48),(xx,yy-.2,3.72)],.041,'coal' if j%2 else 'canvas')
    else:
        x=-6.9
        panel(x,y,3.17,1.78,.21,.77,paint)
        panel(x,y-.124,3.17,1.66,.025,.63,'coal')
        label('INTAKE',x,y-.15,3.17,.30,'chalk',1.39)
        for dx in (-.69,.69):post(x+dx,y,3.54,1.04,.034,'steel',8)


def refit_shop(title,port,key):
    # Rebuild the shared open-air forecourt as a serviced room. Authored rear workshops
    # and the existing shelf, droid and stage registration geometry stay in their frames.
    for name in ('Open sales floor and recessed threshold','Shop canopy • open centre, covered side aisles',
                 'Public counter and port nameplate','Side work lamps'):
        parts.pop(name,None)
    # The physical nameplate is furnished by the game. Remove its old floating duplicate.
    for ob in list(col.objects):
        if ob.type=='FONT' and (ob.data.body==PORTS[port].upper() or (ob.location.x < -6 and ob.location.y < 0)):
            bpy.data.objects.remove(ob,do_unlink=True)
    rear=17.9 if key=='depot' else 13.65
    floor_panels(rear,key=='bar');h=make_frame(port,key,rear)
    if key == 'depot':
        # The cargo droid turns below this registration point on its way to the shelves.
        # Suspend the direction arms from the first rib and keep their game anchor.
        parts.pop('Wayfinding mast',None)
        part('Suspended freight wayfinding sign')
        rod((3.4,-.9,h-.09),(3.4,-.7,3.30),.060,'iron')
        for side in (-1,1):
            panel(3.4+side*.41,-.7,3.16+side*.10,.98,.13,.17,COAT[port])
    sales_desk(port,key,title)
    service_appliance(port,key,1 if key!='depot' else -1)
    overhead_shop_fittings(port,key)
    part('Stamped sign rail and opal strip')
    # Over the rear of the sales floor, with a bright work strip washing the sign.
    z=h-.84;yy=7.4
    panel(0,yy,z,6.55,.18,.78,'iron')
    panel(0,yy-.11,z,6.39,.07,.63,COAT[port])
    label(TRADE[key],0,yy-.153,z,.39,'chalk',5.32)
    for x in (-2.70,2.70):
        post(x,yy,z+.30,h-z-.25,.034,'steel',8)
    box(0,yy-.17,z+.43,5.2,.27,.12,'coal')
    box(0,yy-.18,z+.361,5.02,.17,.024,'light')
    # Game coordinates x, up, forward. These positions coincide with practical fittings.
    rear_col='#f9bf80' if key in ('bar','assay','garage') else '#cee5eb'
    return [
        {'name':'port_sconce_left','position':[-7.19,3.38,-2],'color':'#ffd4aa','intensity':.72,'distance':15},
        {'name':'port_sconce_right','position':[7.19,3.38,-8.35],'color':rear_col,'intensity':.80,'distance':17},
        {'name':'sign_strip','position':[0,z+.25,-yy+.45],'color':'#f8d7a3','intensity':.75,'distance':19},
    ]

def fit_native_lights(fixtures):
    lamps=[]
    for f in fixtures:
        x,z,forward=f['position'];dat=bpy.data.lights.new(f['name'],'AREA')
        dat.shape='DISK';dat.size=2.4;dat.energy=360*f['intensity']
        dat.color=tuple(int(f['color'][i:i+2],16)/255 for i in (1,3,5))
        light=bpy.data.objects.new(f['name'],dat);col.objects.link(light)
        light.location=(x,-forward,z)
        target=Vector((x*.38,-forward-1.5,.7))
        light.rotation_euler=(target-light.location).to_track_quat('-Z','Y').to_euler();lamps.append(light)
    return lamps

def forecourt_display(port,key):
    x,y=-4.8,4.2
    part('Trade display and service fittings')
    if key=='depot':
        x,y=-6.1,4.05
        if port=='verdanthia':
            post(x,y,.12,2.95,.10,'iron');gauge(x,y,2.83,.68)
            for j in range(3):
                xx=x-.45+j*.41;cone((xx,y-.28,.75),(xx,y-.28,1.02),.15,.22,'rust')
                for k in range(3):ball(xx+(k-1)*.07,y-.28,1.17+k*.05,.14,.07,.18,'leaf',8,5)
        elif port=='dunemoor':
            panel(x,y,1.5,2.45,.45,2.7,'mahogany')
            for j in range(3):
                for k in range(4):
                    xx=x-.8+j*.8;zz=.67+k*.55
                    panel(xx,y-.24,zz,.66,.06,.42,'sand')
                    panel(xx,y-.28,zz,.32,.02,.11,'chalk')
            label('INCOMING',x,y-.24,2.70,.20,'chalk',1.85)
        else:
            for j in range(2):
                xx=x-.46+j*.9;tank(xx,y,.14,.35,1.55,'ice')
                cable([(xx,y,1.71),(xx,y,1.98),(x+.9,y,2.1)],.047,'copper')
            gauge(x+.88,y,1.99,.27)
        return
    panel(x,y,.43,2.75,1.55,.82,'iron')
    box(x,y,.87,2.84,1.62,.12,'wood' if key=='bar' else 'steel')
    if key=='yard':
        small_ship(x,y,1.75,.70,'cream' if port=='sloshwell' else 'steel')
        for dx in (-.65,.65):box(x+dx,y,1.09,.15,.54,.35,'brass')
    elif key=='garage':
        if port=='listening-post-hush':
            panel(x,y,1.64,2.23,.22,1.18,'steel')
            for j in range(3):gauge(x-.73+j*.73,y-.16,1.69,.23)
        elif port=='toxibloom':
            for j in range(3):
                xx=x-.65+j*.66;post(xx,y,.92,.76+j*.11,.11,'chalk')
                ball(xx,y,1.65+j*.11,.41,.37,.14,'rust',14,6)
        else:
            fins(x,y,1.53,.42,1.78)
            for j in range(2):rod((x-.81,y+.25*j,1.18),(x+.8,y+.25*j,1.18),.043,'copper')
    elif key=='livery':
        for j in range(5):
            xx=x-1.04+j*.51;zz=1.6+.12*sin(j)
            panel(xx,y,zz,.43,.11,1.18,('rust','cream','sage','teal','navy')[j])
            post(xx,y,.92,.19,.045,'steel')
    elif key=='outfit':
        if port=='calibration-spire':scale(x,y,.94,1.24)
        else:
            for j in range(3):crate(x-.7+.68*j,y,.93,.65,'wood' if j==1 else 'pine')
            box(x,y+.27,1.97,2.21,.1,.39,'mahogany')
            label('BONDED STOCK',x,y+.205,1.97,.22,'chalk',1.96)
    elif key=='assay':
        if port=='beacon-far-wink':
            for j in range(3):
                xx=x-.77+j*.77;grain(xx,y,1.17,.37,('rust','ice','basalt')[j])
                box(xx,y-.51,.99,.42,.13,.08,'brass')
        else:
            cone((x,y,.95),(x,y,1.52),.46,.58,'basalt')
            post(x,y,1.51,.02,.49,'flame')
            rod((x+.52,y,1.44),(x+1.14,y,1.44),.06,'iron')
    elif key=='bar':
        if port=='brrrindle':
            tank(x,y,1.0,.48,1.23,'copper')
            drinks(x-.97,y-.33,.94,3)
        else:
            box(x,y,1.59,2.16,.40,1.14,'mahogany');gauge(x-.45,y-.22,1.66,.36)
            for j in range(6):box(x+.15+j*.11,y-.22,1.58,.04,.04,.72,'brass')
