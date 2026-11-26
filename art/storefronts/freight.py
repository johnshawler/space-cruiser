"""Freight and repair frontage. Each machine is drawn in its own shop-floor units."""
def hopper(x,y,z,lower,upper,depth,height,color):
    """Open rectangular feed hopper, with a flared lip and a hollow throat."""
    rings=[]
    for h,w,d in ((0,lower,depth*.48),(height,upper,depth),(height,upper-.09,depth-.09),(.07,lower-.08,depth*.48-.07)):
        rings.extend((x+sx*w/2,y+sy*d/2,z+h) for sx,sy in ((-1,-1),(1,-1),(1,1),(-1,1)))
    put(rings,[(4*j+i,4*j+(i+1)%4,4*((j+1)%4)+(i+1)%4,4*((j+1)%4)+i) for j in range(4) for i in range(4)],color)

def basin(x,y,z,r,h,color):
    profile=[(.40,0),(.61,.13),(.85,.48),(1,.96),(1,1),(.94,1),(.81,.49),(.54,.16),(.32,.11)]
    sides=24
    verts=[(x+r*a*cos(j*2*pi/sides),y+r*a*sin(j*2*pi/sides),z+h*b) for a,b in profile for j in range(sides)]
    faces=[(j*sides+k,j*sides+(k+1)%sides,(j+1)*sides+(k+1)%sides,(j+1)*sides+k) for j in range(len(profile)-1) for k in range(sides)]
    faces.append(tuple(range(len(verts)-sides,len(verts))))
    put(verts,faces,color,True)

def drum(x,y,z,rad,width,c,axis='y'):
    delta=Vector((0,width/2,0) if axis=='y' else (width/2,0,0))
    middle=Vector((x,y,z))
    rod(middle-delta,middle+delta,rad,c,20)

def wheel(x,y,z,r,c):
    hoop(x,y,z,r,r,.055,c)
    for j in range(6):
        t=j*pi/3
        rod((x,y,z),(x+r*cos(t),y,z+r*sin(t)),.031,c,8)
    drum(x,y,z,.12,.24,'brass')

def parcels():
    for x,y,z,size,col in ((-1.05,.18,0,.91,'tan'),(-.09,.18,0,.83,'sage'),(-.53,.18,.80,.68,'bone'),(.81,.18,0,.75,'rust')):
        crate(x,y,z,size,col)

def quarry():
    for x in (-.93,.93):
        for y in (-.48,.48):
            rod((x*1.2,y,0),(x,y,1.55),.084,'iron')
    hopper(0,0,1.24,.70,2.54,1.55,1.16,'rust')
    for j in range(7):
        x=-.91+(j%4)*.55;y=-.29+(j//4)*.57
        grain(x,y,2.07,.43+.085*(j%3),'basalt' if j%2 else 'stone')
    box(0,-.12,.70,1.68,1.23,.15,'dark')
    for j in range(7):drum(-.67+j*.23,-.12,.84,.078,1.04,'steel')
    wheel(1.10,-.54,1.31,.34,'yellow')

def ladle_freight():
    for x in (-1,1):
        post(x,.32,0,2.60,.11,'copper')
        rod((x,.32,2.49),(x*.34,.32,2.88),.091,'copper')
    rod((-1.11,.32,2.63),(1.11,.32,2.63),.12,'wood')
    cable([(-.35,.28,2.58),(-.5,.01,1.51),(-.62,0,1.20)],.046,'brass')
    cable([(.35,.28,2.58),(.5,.01,1.51),(.62,0,1.20)],.046,'brass')
    basin(0,0,.64,.83,.66,'teal');crate(0,0,.82,.53,'tan')
    for j in range(7):
        box(-1,-.015,.35+j*.26,.27 if j%2==0 else .16,.08,.034,'cream')

def perch_freight():
    for x in (-1.10,1.10):
        rod((x*1.17,.48,0),(x,.20,2.15),.105,'mahogany')
        rod((x,.20,1.90),(x*.64,.14,2.63),.074,'brass')
        for j in range(3):
            dx=x*(.64-j*.09)
            slab([(dx,2.32+j*.10),(dx+x*.24,2.95+j*.12),(dx+x*.33,2.69+j*.10)],.09,.19,'gold' if j==1 else 'lilac')
    for j,h in enumerate((.41,1.22,2.01)):
        length=2.05-.25*j
        rod((-length/2,-.10,h),(length/2,-.10,h),.081,'wood')
        box(0,.10,h+.07,length,.62,.10,'brass')
        for x in (-.48,.42):crate(x,.14,h+.13,.49,'rose' if j%2 else 'tan')

def spore_sorter():
    for j,(x,h,r) in enumerate(((-.86,1.13,.60),(.19,2.25,1.05),(1.02,1.36,.53))):
        cone((x,0,0),(x+.07,0,h),.23,.13,'bone')
        ball(x+.07,0,h,r,.82*r,.36*r,'rust' if j==1 else 'leaf')
        for k in range(9):
            a=k*2*pi/9
            ball(x+.07+.70*r*cos(a),.56*r*sin(a),h+.233*r,.059,.056,.025,'cream')
        for k in range(7):
            a=k*2*pi/7
            rod((x+.07,0,h-.13*r),(x+.07+.85*r*cos(a),.68*r*sin(a),h-.13*r),.024,'sand2')
    for j in range(3):crate(-.73+j*.62,-.42,0,.40,'sage')

def lament_winch():
    for side in (-1,1):
        x=side*.69
        slab([(x-.36,0),(x+.37,0),(x+.15,1.19),(x-.17,1.19)],-.38,.43,'navy')
    drum(0,.03,.91,.40,1.34,'wood','x')
    for j in range(12):drum(-.54+j*.097,.03,.91,.42,.065,'copper','x')
    for x in (-.74,.74):drum(x,.03,.91,.55,.11,'iron','x')
    cable([(.34,-.32,.76),(.54,-.65,.28),(.90,-.83,.11),(1.15,-.63,.11)],.058,'copper')
    rod((-1.13,.63,.09),(-1.13,.63,2.24),.11,'rust')
    rod((-1.13,.63,2.13),(-.09,.63,2.52),.11,'rust')
    wheel(-.04,.54,2.43,.26,'brass')
    cable([(-.04,.56,2.30),(-.04,.56,1.70),(.08,.56,1.56),(.20,.56,1.73)],.052,'iron')

def cargo_bubble():
    turntable(0,0,0,1.12,'teal')
    for j in range(3):
        t=j*pi/3
        pts=[(1.03*cos(a*pi/12)*cos(t),1.03*cos(a*pi/12)*sin(t),1.47+1.13*sin(a*pi/12)) for a in range(25)]
        cable(pts,.047,'aqua' if j%2 else 'brass')
    crate(0,0,1.10,.72,'cream')
    for x in (-.67,.67):
        ball(x,-.1,1.71+.29*x,.17,.17,.17,'pearl')
    for j in range(6):post(.84*cos(j*pi/3),.84*sin(j*pi/3),.31,.12,.057,'cyan')

def scarf_hut():
    for x,y,z,s in ((-.55,0,0,1.11),(.58,.18,0,.89),(-.36,.03,1.0,.81)):
        crate(x,y,z,s,'wood')
        box(x,y,z+.67*s,s*1.02,.83*s,.23*s,'red')
        box(x+.27*s,y-.43*s,z+.48*s,.20*s,.11*s,.50*s,'wine')
        for j in range(4):box(x+(.20+.045*j)*s,y-.44*s,z+.18*s,.024*s,.044*s,.12*s,'cream')
    for side in (-1,1):
        rod((side*1.03,.36,.38),(side*.32,.36,2.53),.043,'brass')
        ball(side*.32,.36,2.54,.089,.086,.086,'orange')

def quiet_receiver():
    # Concave acoustic dish above a vibration-isolated receiving platform.
    for x in (-.65,.65):
        for y in (-.40,.40):
            post(x,y,0,.58,.12,'dark')
            for j in range(4):post(x,y,.08+j*.11,.05,.17,'steel')
    box(0,0,.64,1.80,1.26,.16,'purple')
    post(0,.11,.70,.70,.11,'iron')
    n=32
    rings=[(.08,-.02),(.46,-.12),(.82,-.37),(1.05,-.67)]
    vs=[(r*cos(k*2*pi/n),d+.16,1.62+r*sin(k*2*pi/n)) for r,d in rings for k in range(n)]
    put(vs,[(j*n+k,j*n+(k+1)%n,(j+1)*n+(k+1)%n,(j+1)*n+k) for j in range(3) for k in range(n)],'bone')
    hoop(0,-.51,1.62,1.05,1.05,.044,'brass')
    for k in range(3):
        a=2*pi*k/3
        rod((.96*cos(a),-.47,1.62+.96*sin(a)),(0,-.85,1.62),.041,'iron')
    drum(0,-.83,1.62,.12,.22,'cyan')

def precision_freight():
    for x in (-1.17,1.17):
        box(x,0,1.35,.20,.68,2.57,'steel')
        for j in range(10):
            box(x,-.351,.35+j*.21,.16 if j%2==0 else .08,.03,.026,'navy')
    box(0,0,2.53,2.61,.74,.25,'orange')
    for i in range(8):drum(-.87+i*.25,0,.28,.104,1.05,'iron')
    crate(0,0,.38,.96,'tan')
    for side in (-1,1):
        box(side*.72,0,1.18,.76,.22,.13,'steel')
        box(side*.52,0,1.36,.11,.38,.55,'navy')
    gauge(.71,-.46,2.15,.36)

def last_light_freight():
    for x in (-.95,.95):
        cone((x,.11,0),(x,.11,1.90),.22,.115,'wine')
    for h in (.46,1.40):rod((-.95,.11,h),(.95,.11,h),.068,'brass')
    for j,(dx,h) in enumerate(((-.95,1.85),(0,2.48),(.95,1.85))):
        if j==1:post(dx,.11,0,h,.17,'navy')
        post(dx,.11,h,.10,.36,'iron',12)
        ball(dx,.11,h+.23,.25,.25,.28,'light' if j==1 else 'aqua')
        cone((dx,.11,h+.49),(dx,.11,h+.68),.38,.06,'copper',12)
    for j in range(5):
        box(0,-.39,.58+j*.20,.97,.14,.076,'cream' if j in (0,3) else 'gold')

def fixomatic():
    box(0,0,.15,2.64,1.36,.30,'teal')
    drum(-.72,0,.61,.37,.74,'yellow')
    joints=[(-.72,0,.62),(-.95,0,1.53),(-.11,0,2.34),(.73,0,1.94)]
    for a,b in zip(joints,joints[1:]):rod(a,b,.15,'yellow')
    for x,y,z in joints:
        drum(x,y,z,.22,.38,'iron');drum(x,y-.22,z,.117,.072,'brass')
    rod((.61,-.01,2.16),(.88,-.01,1.58),.081,'wood')
    box(.87,-.01,1.52,.77,.31,.30,'steel')
    box(.74,0,.42,.71,.78,.26,'rust');ball(.74,0,.74,.45,.31,.21,'glass')

def gentle_repairs():
    turntable(0,0,0,1.16,'cream')
    ball(0,.09,1.03,.80,.54,.51,'pearl')
    for side in (-1,1):
        pts=[(side*.87,.09,.29),(side*1.04,.09,.63),(side*1.06,.09,1.03),(side*.82,.09,1.43)]
        cable(pts,.10,'brass')
        ball(side*.75,.03,1.37,.27,.39,.39,'sage')
        for j in range(3):
            ball(side*(.71-.10*j),-.17+.12*j,1.49+.05*j,.12,.14,.19,'aqua')
    for i in range(4):post(-.49+i*.33,-.66,.16,.10,.052,'cyan')

def warm_wrench():
    engine(0,.12,.99,.82)
    for j in range(6):
        x=-.54+j*.208
        pts=[(x,.12+.57*cos(k*pi/18),.99+.55*sin(k*pi/18)) for k in range(19)]
        cable(pts,.103,'red' if j%3 else 'cream')
    for j in range(7):ball(-.63+j*.18,-.43,.92,.055,.062,.12,'wine')
    for side in (-1,1):
        rod((side*.95,.51,.10),(side*.63,.51,1.87),.047,'brass')
        ball(side*.63,.51,1.90,.096,.090,.09,'cream')
    box(.07,.42,.28,2.61,.22,.18,'wood')

def thaw_patch():
    box(-.23,0,.22,2.08,1.15,.44,'blue')
    for j in range(4):
        cone((-.98+j*.45,.12,.42),(-.81+j*.45,.12,1.12+.20*(j%2)),.28,.025,'ice',6,False)
    drum(.44,.04,1.67,.54,.77,'rust','x')
    cone((-.02,.04,1.67),(-.38,.04,1.53),.35,.20,'steel',20)
    rod((.51,.08,1.32),(.68,.08,.75),.16,'navy')
    for j in range(4):drum(.65+j*.08,.04,1.67,.53,.032,'brass','x')
    cable([(.68,.08,.75),(.94,.26,.28),(1.20,.30,.19),(1.25,.51,.77)],.052,'dark')
    for j in range(3):
        hoop(-.72,-.36-j*.07,1.46+j*.18,.20+j*.06,.09,.026,'flame',.1,pi-.1)

def exact_fitter():
    bench(0,.03,2.74)
    for x in (-1,1):
        post(x,0,1.20,.96,.09,'steel')
        box(x,0,2.13,.46,.54,.22,'orange')
    rod((-1.04,0,1.66),(1.0,0,1.66),.115,'steel')
    for j in range(13):drum(-.92+j*.065,0,1.66,.15,.035,'brass','x')
    box(.35,.02,1.71,.30,.58,.54,'iron')
    gauge(.36,-.36,2.04,.42)
    wheel(-1.06,-.30,1.68,.37,'navy')
    for j in range(4):post(.56+j*.14,-.20,1.20,.13+.045*j,.058,'brass',6)

def tea_break():
    box(0,.04,.35,2.40,1.28,.70,'mahogany')
    box(0,.04,.75,2.53,1.38,.13,'copper')
    ball(-.47,.08,1.11,.52,.43,.39,'brass')
    post(-.47,.08,1.48,.055,.29,'copper')
    ball(-.47,.08,1.59,.097,.097,.08,'wood')
    cone((-.82,.08,1.14),(-1.13,.08,1.52),.18,.085,'brass')
    hoop(-.06,.08,1.22,.24,.24,.055,'wood')
    for j in range(2):
        x=.38+j*.46
        post(x,-.10,.83,.048,.23,'cream')
        basin(x,-.10,.88,.17,.24,'cream')
        post(x,-.10,1.108,.01,.15,'mahogany')
        hoop(x+.165,-.1,1.01,.092,.08,.023,'cream')
    for j in range(3):
        x=.13+.30*j
        box(x,.44,.86,.22,.21,.07,'sand2')
    gauge(.78,-.64,.36,.20)

# Each tuple records the playable shop, architectural profile, finish, machine and fascia inscription.
FREIGHT_SHOPS=[
 ('Gravel Freight Yard','scorchmaw','depot','gantry',('basalt','rust','yellow'),quarry,'AGGREGATE INTAKE'),
 ('Ladle Harbor Freight','sloshwell','depot','sail',('teal','cream','copper'),ladle_freight,'HARBOUR WEIGHTS'),
 ('Bargain Roost Cargo Perch','amethyne','depot','steps',('purple','mahogany','gold'),perch_freight,'PERCH EXCHANGE'),
 ('Mellow Hollow Depot','toxibloom','depot','gable',('pine','leaf','rust'),spore_sorter,'SPORE SORTING'),
 ('Port Lament Cargo Dock','candara','depot','sawtooth',('wine','rose','copper'),lament_winch,'MOORING WINCH'),
 ('Drift Cargo Bubble','jovexa','depot','vault',('glass','aqua','pearl'),cargo_bubble,'FLOATING FREIGHT'),
 ('Fort Snuggle Cargo Hut','brrrindle','depot','gable',('blue','snow','red'),scarf_hut,'PARCEL WRAPPING'),
 ('Hush Receiving Bay','listening-post-hush','depot','vault',('navy','purple','bone'),quiet_receiver,'QUIET RECEIVING'),
 ('Precision Freight','calibration-spire','depot','sawtooth',('navy','steel','orange'),precision_freight,'DIMENSIONAL INTAKE'),
 ('Last Light Freight Office','beacon-far-wink','depot','gantry',('navy','wine','copper'),last_light_freight,'SIGNAL DISPATCH'),
 ('Fix-O-Matic 3000','verdanthia','garage','steps',('pine','teal','yellow'),fixomatic,'AUTOMATIC BODY SHOP'),
 ('Gentle Repairs','jovexa','garage','sail',('teal','cream','sage'),gentle_repairs,'SOFT HULL CRADLE'),
 ('Warm Wrench Garage','brrrindle','garage','gable',('blue','red','cream'),warm_wrench,'ENGINE WINTERISING'),
 ('Thaw & Patch','cryo-vault-rimeholm','garage','vault',('navy','ice','orange'),thaw_patch,'THERMAL BAY'),
 ('Exactly Right Repairs','calibration-spire','garage','gantry',('iron','steel','orange'),exact_fitter,'TORQUE LAB'),
 ('End of the Line Garage','beacon-far-wink','garage','sawtooth',('wine','copper','cream'),tea_break,'MECHANICS TEA ROOM'),
]

def build_service_workshop(spec):
    title,port,key,style,(wall,trim,accent),machine,inscription=spec
    pavilion(style,wall,trim,accent)
    part(title+' • back workshop')
    if key=='garage':
        bench(-2.23,.67,2.28)
        wall_tools(-2.26,1.80,1.83)
        tank(2.66,.66,.26,.34,1.60,trim)
        for j in range(3):box(1.76,.63,.45+j*.37,.78,.78,.32,wall)
    else:
        parcels()
        for j in range(3):
            x=-2.86+j*.50
            box(x,1.51,1.01,.36,.41,1.49,trim)
            for k in range(4):box(x,1.293,.49+k*.32,.28,.023,.036,accent)
        rack(2.50,.70,1.52,trim)
    board(title.upper(),0,1.84,2.91,6.61,.68,wall)

def fit_service_floor(spec):
    title,port,key,style,(wall,trim,accent),machine,inscription=spec
    # Depots have a rear-left equipment island clear of the twelve goods and both
    # droid lanes. Garage exhibits face the counter from outside the crew's stage.
    depot=key=='depot'
    x,y,size=(-1.20,9.35,1.65) if depot else (-4.18,4.68,1.36)
    part(title+' • '+inscription.title())
    machine()
    verts=parts[current][0]
    verts[:]=[(x+size*a,y+size*b,.29+size*c) for a,b,c in verts]
    part(title+' • equipment island')
    box(x,y,.15,3.0*size,1.83*size,.30,trim)
    box(x,y-.92*size,.19,2.85*size,.075,.102,accent)
    # The sign spans only the equipment island, leaving the sky over the
    # approach, the keeper's head and the packing-room threshold open.
    sign_y=y+1.00*size
    top=4.98 if depot else 4.41
    for xx in (x-1.52*size,x+1.52*size):
        post(xx,sign_y,0,top+.35,.084,trim)
        rod((xx,sign_y,top-.69),(xx+(x-xx)*.21,sign_y,top-.12),.057,accent)
    board(inscription,x,sign_y,top,3.25*size,.69,wall)
    lamp(x,sign_y-.10,top+.47,2.72)
