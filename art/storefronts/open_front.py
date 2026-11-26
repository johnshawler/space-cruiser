"""Fit each trade workshop to an open-front sales floor and add placement markers."""
PORTS={
    'verdanthia':'Vendorhaven','scorchmaw':'Port Gneiss','dunemoor':'Bureau Nine',
    'sloshwell':'Ladle Harbor','amethyne':'Bargain Roost','toxibloom':'Mellow Hollow',
    'candara':'Port Lament','jovexa':'The Drift','brrrindle':'Fort Snuggle',
    'listening-post-hush':'The Quiet Ear','cryo-vault-rimeholm':'The Freezer Aisle',
    'calibration-spire':'Tolerance Station','beacon-far-wink':'The Last Light'}
# Spawn positions in the game's venue frame, from VENUE_GAG and GAGS.reset.
CREW={'depot':((-3.6,-3.6),(2.2,-7.5)),'yard':((-.6,-3),(3.3,-3)),
'garage':((-.4,-4),(3.3,-3.8)),'livery':((-.25,-4),(3.35,-3.9)),
'outfit':((-.2,-3.9),(3,-3.6)),'assay':((0,-4),(3.2,-3.7)),
'bar':((-.55,-3.6),(2.35,-3.6))}
TRIM=['pine','sand','ice','blue','cream','rust','teal','navy','sand2','purple','mahogany','chalk','basalt','navy','wine','wine']
def make_open_shop(index,title,port,key):
    global parts
    # The trade equipment occupies the back of the open set. Keep the crew stage
    # and the approach to the public counter unobstructed at pedestrian height.
    factor=1.9
    rear=17.9 if key=='depot' else 13.65
    for vs,faces,colors,smooth in parts.values():
        vs[:]=[(factor*x,rear+factor*y,factor*(z-.24)) for x,y,z in vs]
    for ob in list(col.objects):
        ob.location=Vector((factor*ob.location.x,rear+factor*ob.location.y,factor*(ob.location.z-.24)))
        ob.scale*=factor
    c=TRIM[index]
    part('Open sales floor and recessed threshold')
    box(0,(rear+1.8)/2,-.125,16.9,rear+7.0,.30,'wood' if key=='bar' else ('bone' if key=='livery' else 'edge'))
    for x in (-8.17,8.17):
        box(x,(rear+1.8)/2,.015,.13,rear+6.83,.032,c)
        for j in range(7):
            box(x*.94,-1.1+j*1.46,.018,.40,.07,.03,'brass')
    # Short side returns express the building's architecture without a front wall.
    for sign in (-1,1):
        x=sign*7.51
        if key in ('garage','yard','assay'):
            for y in (1.2,5.6,9.2):
                box(x,y,1.60,.20,.20,3.2,c)
                rod((x,y,2.13),(x,y+1.45,3.15),.074,'steel')
            box(x,5.58,3.16,.22,9.1,.23,c)
            for i in range(5):box(x,1.7+i*1.6,.56,.15,1.5,1.12,'iron' if key=='assay' else c)
        elif key in ('bar','outfit','livery'):
            for j in range(5):
                y=1.9+j*1.68;h=1.05+.17*j
                box(x,y,h/2,.25,1.63,h,c);box(x,y,h,.35,1.68,.13,'brass' if key=='outfit' else 'wood')
            for y in (1.95,6.99):
                if key=='bar':
                    box(sign*6.63,y,.45,1.35,1.66,.46,c);box(sign*7.18,y,.98,.22,1.72,.74,c)
                    post(sign*5.82,y,.03,.69,.09,'brass');post(sign*5.82,y,.72,.10,.54,'wood')
                if key=='livery':
                    for k,paint in enumerate(('cream','yellow','navy')):tank(sign*(6.66+.03*k),y+.33*k,.03,.17,.59,paint)
        else:
            for j in range(4):
                y=2.5+j*2.3;box(x,y,.59,.20,2.16,1.18,c)
                box(x,y,1.21,.29,2.23,.10,'brass')
    part('Shop canopy • open centre, covered side aisles')
    for side in (-1,1):
        x=side*7.63
        for j,y in enumerate((-.65,4.20,8.90,rear-1.70)):
            h=3.95+.12*j
            box(x,y,h/2,.18,.23,h,c)
            rod((x,y,h-.91),(x-side*.76,y,h-.08),.072,'brass' if key in ('bar','yard') else 'edge')
        # Roof only the side aisles. The keeper remains visible from the house camera.
        for j in range(8):
            y=-.83+(rear-.2)/8*j
            box(x-side*.56,y+(rear-.2)/16,4.02+j*.046,1.42,(rear-.2)/8+.03,.13,c)
            box(x-side*1.25,y+(rear-.2)/16,3.91+j*.046,.10,(rear-.2)/8+.04,.16,'brass' if index in (0,3,4,9,11,15) else 'edge')
        if key in ('garage','assay','yard','depot'):
            for j in range(8):
                box(side*6.1,1.0+j*1.47,.045,.95,.51,.04,'dark')
                for k in range(4):box(side*6.1, .82+j*1.47+k*.12,.075,.91,.051,.019,'edge')
        if key=='outfit':
            for j in range(3):
                y=2+j*2.72
                box(side*6.9,y,.50,.92,1.28,.94,'navy')
                box(side*6.9,y,1.00,1.04,1.36,.10,'brass')
                fins(side*6.9,y,1.30,.24,.65,'steel')
    # Identify the trading floor at its side header and leave the centre of the front unobstructed.
    badge={'depot':'DISPATCH','garage':'REPAIRS','yard':'SHIP SALES','bar':'CANTINA',
           'livery':'PAINT BAY','outfit':'FITTINGS','assay':'ORE BUYER'}[key]
    board(badge,-6.95,-.90,3.58,2.45,.52,c)
    part('Public counter and port nameplate')
    box(0,0,.50,4.4,.80,1.,c);box(0,0,1.015,4.64,.94,.07,'wood' if key=='bar' else 'steel')
    box(0,-.42,.52,3.04,.076,.79,'coal')
    label(PORTS[port].upper(),0,-.47,.52,.44,'cream',2.81)
    # Fixed physical sign only. Game interaction arms can attach to signpost.
    part('Wayfinding mast');post(3.4,-.7,0,3.30,.081,'wood')
    box(3.4,-.7,3.31,.24,.24,.18,'brass')
    for j,angle in enumerate((-1,1)):
        box(3.4+angle*.41,-.7,2.89-j*.28,.98,.16,.17,c)
    if key=='depot':
        part('Goods display frame • twelve sockets')
        for x in (-6.59,-2.31):box(x,.9,2.16,.10,.86,4.32,'iron')
        for z in (1,2.15,3.3):box(-4.45,.9,z-.05,4.22,.9,.10,c)
        box(-4.45,.92,4.27,4.36,.96,.12,'iron')
        # An open frame and packing bench define the droid's stock-room route.
        for x in (3.33,5.67):box(x,8.2,1.76,.13,.24,3.52,c)
        box(4.5,8.2,3.57,2.52,.26,.14,c)
        box(4.5,13.6,1.19,2.70,.86,.12,'wood')
        for x in (3.39,5.61):
            for y in (13.28,13.92):box(x,y,.57,.12,.12,1.14,'steel')
    for side in (-1,1):
        part('Side work lamps')
        x=side*7.37;y=3.40
        post(x,y,0,3.48,.076,'iron');rod((x,y,3.46),(x-side*.64,y,3.46),.065,'brass')
        lamp(x-side*.58,y,3.37,.54)
    # Returned coordinates are in the glTF/game frame (x, up, forward).
    a,b=CREW[key]
    marks={'entrance':(0,0,2.32),'counter':(0,1.05,0),'keeper':(-1.55,0,-.85),
           'customer':(0,0,1.30),'nameplate':(0,.52,.47),'signpost':(3.4,3.3,.7),
           'crew_a':(a[0],0,a[1]),'crew_b':(b[0],0,b[1]),'camera_shop':(0,5.6,11.5),'camera_target':(0,2.1,-2.6),
           'light_key':(-6.79,3.30,-3.4),'light_fill':(6.79,3.30,-3.4)}
    if key=='depot':
        marks.update(shelf=(-4.45,0,-.9),stock_door=(4.5,0,-8.2),packing_bench=(4.5,1.25,-13.6),droid_home=(3.6,0,-1.4))
        for row,z in enumerate((3.3,2.15,1.0)):
            for j in range(4):marks[f'goods_{4*row+j+1:02}']=(-4.45-2.1+1.05*(j+.5),z,-.85)
    return marks
def create_markers(marks):
    objects=[]
    for name,(x,y,z) in marks.items():
        obj=bpy.data.objects.new(name,None);col.objects.link(obj)
        obj.location=(x,-z,y);obj.empty_display_type='PLAIN_AXES';obj.empty_display_size=.22
        obj['marker']=name
        if name.startswith('light_'):obj['color']='#ffe2b8';obj['intensity']=1.0 if name=='light_key' else .65;obj['distance']=20
        if name=='camera_shop':
            target=Vector((0,2.6,2.1));obj.rotation_euler=(target-obj.location).to_track_quat('-Z','Y').to_euler()
        if obj.name!=name:raise ValueError(f'Non-unique marker: {name}')
        objects.append(obj)
    return objects
def save_one(title,port,key):
    native=SOURCE/'models';native.mkdir(exist_ok=True)
    file=native/(port+'-'+key+'.blend')
    shot=bpy.data.scenes.new(title);shot.unit_settings.system='METRIC'
    shot.collection.children.link(col)
    bpy.data.libraries.write(str(file),{shot},fake_user=True,compress=True)
    bpy.data.scenes.remove(shot)
