"""Architecture and trade fittings for the second storefront collection.

Back workshops use the original kit's 8 m drawing frame. Foreground pieces are
authored directly in game metres so the counter camera can see the merchandise.
"""
def hoop(x,y,z,rx,rz,wire,color,start=0,end=2*pi):
    cable([(x+rx*cos(start+(end-start)*j/24),y,z+rz*sin(start+(end-start)*j/24)) for j in range(25)],wire,color)

def pavilion(style, wall, trim, accent):
    common_base(trim)
    part('Rear workshop • '+style)
    box(0,2.10,1.78,7.75,.20,3.09,wall)
    for side in (-1,1):
        box(side*3.76,.65,1.12,.20,3,1.77,wall)
        box(side*3.76,.66,2.04,.29,3.08,.11,trim)
    if style=='vault':
        for y in (-1.4,.1,1.65):
            vault(3.81,2.05,2.04,y,y+.13,.14,trim)
        vault(3.79,2.04,2.04,.95,2.24,.11,wall)
    elif style=='sawtooth':
        for j in range(4):
            x=-3.88+j*1.94
            slab([(x,3.04),(x+1.88,3.72),(x+1.88,3.89),(x,3.22)],-.9,2.20,trim)
            box(x+1.85,1.56,3.53,.10,1.16,.60,accent)
            box(x+.18,-.82,1.71,.12,.14,2.95,trim)
    elif style=='gable':
        for j in (-1,1):
            slab([(0,4.20),(j*4.04,2.89),(j*4.04,3.09),(0,4.40)],-.74,2.25,trim)
            for y in (-.67,1.03):rod((j*3.63,y,2.88),(0,y,4.12),.07,accent)
    elif style=='steps':
        for j in range(3):
            box(0,1.72,3.15+j*.32,8.02-j*1.12,1.12-j*.24,.39,trim if j!=1 else accent)
        for side in (-1,1):
            for j in range(3):box(side*(3.38+j*.18),-.84,1.84+j*.12,.10,.30,3.08+j*.25,trim)
    elif style=='sail':
        for j in range(4):
            x=-3.85+j*1.92
            put([(x,-1.2,3.88),(x+1.96,-1.2,3.07),(x+1.96,2.20,3.64),(x,2.20,3.70)],[(0,1,2),(0,2,3)],trim if j%2 else accent)
            rod((x,-1.2,.25),(x,-1.2,3.91),.055,trim)
    elif style=='gantry':
        for y in (-1.36,1.84):
            for side in (-1,1):box(side*3.56,y,1.91,.21,.28,3.38,trim)
            for h in (3.27,3.92):box(0,y,h,7.59,.27,.15,trim)
            for j in range(12):
                x=-3.60+j*.6
                rod((x,y,3.32+(j%2)*.53),(x+.60,y,3.85-(j%2)*.53),.055,accent)
    else:
        raise ValueError(style)
    for x in (-2.8,2.8):lamp(x,1.83,2.67,.82)

def turntable(x,y,z,r,col):
    post(x,y,z,.23,r,'iron',32)
    post(x,y,z+.23,.09,r*.98,col,32)
    for j in range(8):
        a=2*pi*j/8
        post(x+.85*r*cos(a),y+.85*r*sin(a),z+.32,.035,.042,'light',8)

def used_hulls(x,y,z,s):
    turntable(x,y,z,1.58*s,'yellow')
    small_ship(x,y,z+1.06*s,.65*s,'teal')
    for j in range(3):
        xx=x+(-1+j)*.63*s
        rod((xx,y+.96*s,z+.35*s),(xx,y+.96*s,z+2.0*s),.036*s,'steel')
        slab([(xx,z+2*s),(xx+.48*s,z+1.88*s),(xx,z+1.70*s)],y+.92*s,y+1*s,'yellow' if j%2 else 'red')

def wing_motors(x,y,z,s):
    # Feather-shaped brass wings sweep up from either side of the sales plinth.
    for side in (-1,1):
        for j in range(4):
            xx=x+side*(.43+j*.29)*s;h=(.9+j*.35)*s
            slab([(xx-.12*s,z+.24*s),(xx+side*.39*s,z+h),(xx+side*.66*s,z+h+.42*s),(xx+.16*s,z+.27*s)],y+.19*s,y+.39*s,'gold' if j%2 else 'copper')
    turntable(x,y,z,.99*s,'wine')
    small_ship(x,y-.12*s,z+.98*s,.48*s,'lilac')

def rock_drill(x,y,z,s):
    box(x,y,z+.17*s,2.05*s,1.39*s,.34*s,'basalt')
    for a in (-.68,.68):post(x+a*s,y,z+.28*s,1.96*s,.095*s,'steel')
    box(x,y,z+2.15*s,1.77*s,.66*s,.43*s,'orange')
    post(x,y,z+1.46*s,.58*s,.22*s,'dark')
    for j in range(5):
        cone((x,y,z+(1.10+j*.10)*s),(x,y,z+(1.21+j*.10)*s),(.05+j*.041)*s,(.15+j*.035)*s,'steel')
    grain(x,y,z+.34*s,.70*s,'stone')
    cable([(x+.68*s,y,z+2.30*s),(x+.92*s,y,z+2.0*s),(x+.98*s,y,z+.63*s)],.052*s,'coal')

def emporium(x,y,z,s):
    for j,(dx,h,c) in enumerate(((-.95,1.26,'aqua'),(.02,1.95,'pearl'),(.92,1.0,'lilac'))):
        xx=x+dx*s
        post(xx,y,z,h*s,.28*s,'purple')
        post(xx,y,z+h*s,.105*s,.43*s,'gold',12)
        cone((xx,y,z+(h+.13)*s),(xx,y,z+(h+.43)*s),.023*s,.35*s,c,7,False)
        cone((xx,y,z+(h+.43)*s),(xx,y,z+(h+.69)*s),.35*s,.16*s,c,7,False)
        hoop(xx,y+.24*s,z+(h+.45)*s,.44*s,.48*s,.032*s,'brass')

def croutons(x,y,z,s):
    for j,dx in enumerate((-.67,.63)):
        xx=x+dx*s
        post(xx,y,z,.65*s,.24*s,'teal')
        cone((xx,y,z+.65*s),(xx,y,z+1.20*s),.29*s,.70*s,'copper' if j else 'cream',24)
        post(xx,y,z+1.19*s,.04*s,.62*s,'sand' if j else 'wood')
        for i in range(6):
            a=i*pi/3
            box(xx+.37*s*cos(a),y+.36*s*sin(a),z+(1.25+.06*(i%2))*s,.22*s,.19*s,.21*s,'sand2' if j else 'stone')
    rod((x,y+.47*s,z+.65*s),(x+.48*s,y+.47*s,z+1.98*s),.055*s,'brass')
    ball(x+.49*s,y+.47*s,z+1.99*s,.23*s,.12*s,.18*s,'brass')

def sunken_scale(x,y,z,s):
    box(x,y,z+.18*s,2.55*s,1.45*s,.35*s,'basalt')
    scale(x,y,z+.35*s,1.34*s)
    for dx in (-1,1):
        rod((x+dx*1.05*s,y+.49*s,z+.27*s),(x+dx*.96*s,y+.49*s,z+1.94*s),.062*s,'copper')
    hoop(x,y+.49*s,z+1.33*s,1.09*s,.87*s,.062*s,'copper',0,pi)
    for j in range(3):grain(x+(-.85+.44*j)*s,y-.42*s,z+.35*s,.24*s,'basalt')

def snowball(x,y,z,s):
    for j,(dx,dy,r) in enumerate(((-.68,0,.62),(.43,.14,.72),(-.12,.15,.52))):
        zz=z+(1.28 if j==2 else r)*s
        ball(x+dx*s,y+dy*s,zz,r*s,r*s,.88*r*s,'ice' if j==1 else 'snow')
    for side in (-1,1):
        xx=x+side*1.10*s
        box(xx,y,z+.65*s,.45*s,.65*s,1.20*s,'blue')
        ball(xx-side*.19*s,y,z+1.24*s,.34*s,.38*s,.43*s,'rose')
    gauge(x,y-.59*s,z+.56*s,.32*s)

def shimmer(x,y,z,s):
    for j,(rad,col) in enumerate(((1.15,'aqua'),(.91,'lilac'),(.68,'pearl'))):
        yy=y+j*.22*s
        hoop(x,yy,z+.78*s,rad*s,rad*s,.074*s,col,-.12,pi+.12)
        for sign in (-1,1):rod((x+sign*rad*s,yy,z+.17*s),(x+sign*rad*s,yy,z+.78*s),.065*s,col)
    turntable(x,y,z,.70*s,'pearl')
    ball(x,y,z+.60*s,.51*s,.29*s,.23*s,'purple')

def coin_slot(x,y,z,s):
    # Table jukebox, coin return and a fan of perforated speaker slats.
    box(x,y,z+.83*s,1.68*s,.85*s,1.61*s,'teal')
    for rad,col in ((.87,'copper'),(.77,'light'),(.68,'wine')):
        hoop(x,y-.40*s,z+1.51*s,rad*s,rad*s,.066*s,col,0,pi)
    for j in range(7):
        xx=x+(j-3)*.17*s
        rod((x,y-.48*s,z+.45*s),(xx,y-.48*s,z+1.19*s),.035*s,'brass')
    box(x,y-.46*s,z+1.46*s,.85*s,.12*s,.31*s,'cream')
    box(x+.58*s,y-.48*s,z+1.22*s,.13*s,.08*s,.041*s,'dark')
    for j in range(4):post(x+1.08*s,y,z+j*.055*s,.06*s,.22*s,'gold',16)

def rubber_stamp(x,y,z,s):
    for j,h in enumerate((1.38,1.88,1.20)):
        xx=x+(j-1)*.79*s
        box(xx,y,z+.22*s,.76*s,.73*s,.43*s,'mahogany')
        box(xx,y,z+.45*s,.69*s,.64*s,.06*s,'red')
        post(xx,y,z+.48*s,h*.44*s,.093*s,'brass')
        ball(xx,y,z+(.49+h*.45)*s,.28*s,.22*s,.17*s,'red' if j==1 else 'wood')
    for j in range(4):box(x+.08*j*s,y-.65*s,z+(.065+j*.046)*s,.85*s,.48*s,.045*s,'bone')

def bottomless(x,y,z,s):
    # A soup tureen with a hollow mouth and a visible broth surface.
    post(x,y,z,.38*s,.55*s,'navy')
    cone((x,y,z+.38*s),(x,y,z+1.03*s),.57*s,1.15*s,'cream',32)
    post(x,y,z+1.035*s,.035*s,1.04*s,'orange',32)
    for j in range(8):
        a=2*pi*j/8
        ball(x+.66*s*cos(a),y+.63*s*sin(a),z+1.08*s,.095*s,.12*s,.06*s,'sage' if j%2 else 'sand2')
    for side in (-1,1):hoop(x+side*1.07*s,y,z+.83*s,.26*s,.20*s,.06*s,'copper')
    rod((x+.52*s,y+.10*s,z+.90*s),(x+1.15*s,y+.10*s,z+2.01*s),.058*s,'brass')
    ball(x+1.14*s,y+.10*s,z+2.03*s,.13*s,.10*s,.07*s,'brass')

def damp_log(x,y,z,s):
    rod((x-1.32*s,y,z+.46*s),(x+1.02*s,y,z+.65*s),.40*s,'wood',15)
    for j,(dx,h,r) in enumerate(((-.77,1.18,.41),(.06,1.68,.70),(.81,1.05,.40))):
        xx=x+dx*s
        cone((xx,y,z+.51*s),(xx+.10*s,y,z+h*s),.14*s,.092*s,'bone',12)
        ball(xx+.10*s,y,z+h*s,r*s,.81*r*s,.43*r*s,'rose' if j==1 else 'orange')
        for i in range(5):
            a=i*2*pi/5
            ball(xx+(.10+.52*r*cos(a))*s,y+.47*r*s*sin(a),z+(h+.31*r)*s,.06*s,.06*s,.035*s,'cream')
    for j in range(6):
        xx=x-1.12*s+j*.36*s
        ball(xx,y-.27*s,z+.75*s,.22*s,.19*s,.12*s,'leaf')

def sunk_cost(x,y,z,s):
    # A ship's anchor has become the tavern's brass-and-iron bar back.
    hoop(x,y,z+1.95*s,.23*s,.23*s,.063*s,'copper')
    rod((x,y,z+.32*s),(x,y,z+1.77*s),.088*s,'iron')
    rod((x-.63*s,y,z+1.42*s),(x+.63*s,y,z+1.42*s),.086*s,'wood')
    for side in (-1,1):
        cable([(x,y,z+.32*s),(x+side*.50*s,y,z+.40*s),(x+side*.92*s,y,z+.89*s)],.10*s,'iron')
        xx=x+side*.93*s
        slab([(xx-side*.27*s,z+.81*s),(xx+side*.12*s,z+1.12*s),(xx+side*.09*s,z+.68*s)],y-.10*s,y+.10*s,'copper')
    for j in range(5):
        hoop(x+(.81+.10*j)*s,y-.09*s,z+(.87-.14*j)*s,.085*s,.12*s,.021*s,'brass')

def final_blink(x,y,z,s):
    for j,(dx,h) in enumerate(((-.92,1.10),(0,2.05),(.92,1.41))):
        xx=x+dx*s
        post(xx,y,z,h*s,.20*s,'navy')
        post(xx,y,z+h*s,.10*s,.40*s,'brass',12)
        ball(xx,y,z+(h+.29)*s,.25*s,.25*s,.27*s,'light' if j==1 else 'cyan',12,6)
        for k in range(4):
            a=k*pi/2
            post(xx+.30*s*cos(a),y+.30*s*sin(a),z+(h+.08)*s,.47*s,.023*s,'dark')
        cone((xx,y,z+(h+.57)*s),(xx,y,z+(h+.78)*s),.44*s,.06*s,'copper',12)

# Order matches the agreed first pass: all eight stock-only shops, then all remaining cantinas.
NEW_SHOPS=[
 ('Gently Used Hulls','verdanthia','yard','gantry',('pine','teal','yellow'),used_hulls),
 ('Wing & Prayer Motors','amethyne','yard','sail',('wine','purple','gold'),wing_motors),
 ('The Crouton Exchange','sloshwell','assay','sail',('teal','copper','cream'),croutons),
 ('The Sunken Scale','candara','assay','vault',('navy','copper','basalt'),sunken_scale),
 ('Snowball Assay','brrrindle','assay','gable',('blue','snow','rose'),snowball),
 ('Hard Rock Outfitters','scorchmaw','outfit','sawtooth',('basalt','rust','orange'),rock_drill),
 ('Shiny Things Emporium','amethyne','outfit','steps',('purple','wine','gold'),emporium),
 ('Shimmer & Shine','jovexa','livery','vault',('glass','teal','pearl'),shimmer),
 ('The Coin Slot','verdanthia','bar','steps',('teal','wine','brass'),coin_slot),
 ('The Rubber Stamp','dunemoor','bar','steps',('mahogany','sand','wine'),rubber_stamp),
 ('The Bottomless Bowl','sloshwell','bar','vault',('blue','cream','copper'),bottomless),
 ('The Damp Log','toxibloom','bar','gable',('pine','wood','leaf'),damp_log),
 ('The Sunk Cost','candara','bar','sawtooth',('navy','rust','copper'),sunk_cost),
 ('The Final Blink','beacon-far-wink','bar','gantry',('navy','copper','cyan'),final_blink),
]

def back_workshop(spec):
    title,port,key,style,(wall,trim,accent),feature=spec
    pavilion(style,wall,trim,accent)
    part(title+' • rear fittings')
    if key=='yard':
        for side in (-1,1):
            bench(side*2.1,.07,1.8)
            small_ship(side*2.1,.07,1.66,.48,accent if side==1 else wall)
        rod((-2.65,1.49,2.18),(2.65,1.49,2.18),.061,trim)
    elif key=='bar':
        for j in range(2):
            z=1.1+j*.71
            box(0,1.40,z,6.55,.55,.11,trim)
            for i in range(5):drinks(-2.92+i*1.22,1.39,z+.06,3)
        for side in (-1,1):
            post(side*2.55,-1.15,.24,.59,.092,'brass')
            post(side*2.55,-1.15,.83,.12,.39,trim)
    elif key=='assay':
        for j in range(3):
            xx=(j-1)*1.82
            bench(xx,.48,1.62)
            for i in range(3):grain(xx-.44+i*.42,.48,1.20,.34+.09*i,('stone','basalt',accent)[i])
    elif key=='outfit':
        for side in (-1,1):
            bench(side*2.15,.35,2.12)
            wall_tools(side*2.22,1.86,1.80)
        feature(0,.80,.25,.75)
    elif key=='livery':
        for j,c in enumerate(('pearl','teal','lilac','aqua','rose')):
            tank(-2.40+j*1.18,.62,.24,.34,1.60,c)
    board(title.upper(),0,1.85,2.96,6.75,.57,wall)

def counter_display(spec):
    title,port,key,style,(wall,trim,accent),feature=spec
    part(title+' • signature display')
    # Stage left of the two actors, visible between the keeper and the screen edge.
    x,y=-4.55,4.45
    box(x,y,.31,3.54,2.28,.62,trim)
    box(x,y,.66,3.66,2.36,.11,wall)
    feature(x,y,.73,1.24)
    part(title+' • illuminated trade sign')
    for xx in (x-1.68,x+1.68):post(xx,y+.91,.72,3.56,.063,trim)
    board(title.upper(),x,y+.86,3.90,4.24,.61,wall)
    lamp(x,y+.82,4.28,2.65)
