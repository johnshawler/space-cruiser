"""The six freight garage workcells. Dimensions are metres in the shop's Blender frame."""

DRIVE = 'Live workpiece'
NOZZLE = 'Detachable coupling'
DRIVE_AT = (1., 4.2, 1.28)
NOZZLE_AT = (1.85, 4.2, 1.28)


def freight_deck(depot):
    # The old load-bearing slab tops out at 0.025 m. Leave its edge as the gasket.
    part('Replaceable deck plates, worn guide lines and drain slots')
    for row in range(8 if depot else 6):
        for col_i in range(6):
            x = (col_i - 2.5) * 2.56
            y = -2.2 + (row + .5) * 2.18
            box(x, y, .032, 2.50, 2.12, .012, 'workdeck')
            for s in (-1, 1):
                post(x + s*1.10, y + s*.91, .038, .006, .040, 'dark', 8)
        for x in (-2.65, 2.64):
            for k in range(3):
                # Broken paint at the wheel path, covered by the odd replacement plate.
                if (row+k+(x>0)) % 5:
                    box(x, -1.90+row*2.18+k*.58, .04, .084, .40, .008, 'safety')
    part('Wall kick plates and drip marks')
    for side in (-1, 1):
        for j in range(5):
            y=1.8+j*1.68
            box(side*7.32,y,.60,.055,1.62,1.08,'workskin')
            box(side*7.28,y,.22,.033,1.61,.17,'iron')


def press_cell():
    # Cast C-frame and a raised ram with yellow guard jaws.
    slab([(-.81,-.46),(.53,-.46),(.64,-.25),(-.30,-.23),(-.30,.41),
          (.38,.41),(.52,.71),(.34,.90),(-.73,.90),(-.88,.68)],-.36,.32,'teal')
    box(.09,0,.62,.73,.60,.27,'yellow')
    post(.17,0,.13,.41,.13,'steel')
    box(.17,0,.12,.51,.52,.14,'iron')
    for x in (-.62,.39):
        box(x,-.39,-.30,.23,.10,.24,'safety')
    gauge(-.55,-.37,.60,.16)


def cradle_cell():
    # Three padded yokes around an ivory hull segment. The gaps are visible from the counter.
    ball(.02,0,.03,.70,.44,.38,'pearl')
    for y in (-.42,.04,.46):
        arc=[(.86*cos(t*pi/18), y, .06+.77*sin(t*pi/18)) for t in range(16,38)]
        cable(arc,.075,'brass')
        for x in (-.72,.72):
            ball(x,y,.34,.14,.13,.22,'sage')
    for x in (-.39,.39):
        rod((x,-.39,-.48),(x,-.51,-.16),.075,'teal')
    box(0,.05,-.51,1.34,.72,.17,'teal')


def winter_cell():
    # Two separate, splayed cylinder banks, wrapped manifold and four exhaust stacks.
    box(0,.02,-.25,1.47,.84,.42,'iron')
    for j in range(4):
        x=-.55+.36*j
        for side in (-1,1):
            a=Vector((x,side*.16,-.16)); b=Vector((x,side*.48,.42))
            cone(a,b,.16,.15,'steel',12)
            for k in range(4):
                p=a.lerp(b,.2+.20*k)
                cone(p,p+(b-a)*.09,.215,.215,'iron',12)
        rod((x,.38,.37),(x,.49,.72+.10*(j%2)),.088,'copper')
    box(-.08,-.06,.21,1.51,.32,.26,'wine')
    for x in (-.53,-.16,.20,.55):
        box(x,-.06,.35,.075,.34,.04,'canvas')


def thaw_cell():
    # A vertical copper heat exchanger, one side still locked in faceted ice.
    post(-.21,.08,-.48,1.26,.38,'copper',24)
    for j in range(7):
        post(-.21,.08,-.38+j*.17,.068,.45,'brass',24)
    for x,y,h in ((-.63,-.28,.60),(-.36,-.34,.89),(-.08,-.40,.52)):
        cone((x,y,-.42),(x+.10,y+.03,h),.16,.012,'ice',5,False)
    cable([(-.20,.05,.76),(-.14,.05,.98),(.43,.05,.98),(.56,.05,.83),(.56,.05,.12)],.102,'rust')
    gauge(.44,-.34,.21,.24)


def lathe_cell():
    # Chuck, three stepped jaws and an exposed leadscrew between the head and tailstock.
    box(-.62,.07,-.05,.57,.79,.93,'navy')
    drum(-.34,0,.12,.48,.27,'steel','x')
    for k in range(3):
        a=k*2*pi/3
        rod((-.22,.20*cos(a),.12+.20*sin(a)),(-.22,.42*cos(a),.12+.42*sin(a)),.078,'iron',8)
    rod((-.3,0,.12),(.66,0,.12),.095,'steel')
    for j in range(7): drum(.01+j*.076,0,.12,.132,.031,'brass','x')
    slab([(.44,-.42),(.83,-.42),(.79,.25),(.60,.36),(.48,.24)],-.29,.31,'orange')
    box(0,-.16,-.49,1.81,1.0,.16,'iron')
    wheel(-.64,-.48,-.05,.24,'brass')


def beacon_cell():
    # A ship's flywheel seen broadside, with spokes, balance weight, rocker and oiler.
    wheel(-.23,-.20,.06,.61,'copper')
    hoop(-.23,-.32,.06,.61,.61,.077,'iron')
    rod((-.64,-.37,.34),(.33,-.37,.59),.070,'brass')
    post(.36,.06,-.43,1.08,.19,'wine')
    basin(.36,.06,.64,.23,.18,'brass')
    ball(.36,.06,.84,.15,.15,.12,'copper')
    box(.08,.08,-.53,1.70,.68,.18,'mahogany')


CELLS = {
    'verdanthia': (press_cell, 'sage', 'yellow', 'press'),
    'jovexa': (cradle_cell, 'teal', 'cream', 'cradle'),
    'brrrindle': (winter_cell, 'wine', 'copper', 'boiler'),
    'cryo-vault-rimeholm': (thaw_cell, 'blue', 'ice', 'thaw'),
    'calibration-spire': (lathe_cell, 'navy', 'orange', 'metrology'),
    'beacon-far-wink': (beacon_cell, 'mahogany', 'brass', 'beacon'),
}


def service_wall(kind, coat, trim):
    y=7.48
    part('Service wall • '+kind)
    for j in range(5):
        x=(j-2)*1.23+.36
        panel(x,y,1.78,1.20,.18,3.49,'workskin')
        panel(x,y-.104,.48,1.04,.052,.65,coat)
    if kind=='press':
        for x in (-1.75,2.55):
            box(x,y-.30,1.76,.32,.37,3.48,'teal')
            rod((x,y-.52,.28),(x,y-.52,3.39),.085,'steel')
        box(.40,y-.34,3.43,4.83,.52,.41,'yellow')
        for x in (-1.24,-.42,.4,1.22,2.04):
            rod((x-.17,y-.61,3.28),(x+.10,y-.61,3.60),.053,'dark',6)
        for i in range(3): gauge(-.66+i*.78,y-.16,2.05,.27)
    elif kind=='cradle':
        for j in range(3):
            x=-1.03+j*1.45
            hoop(x,y-.30,2.16,.69,1.04,.105,'brass')
            ball(x,y-.22,2.17,.58,.14,.91,'glass')
            for dx in (-.34,.34):ball(x+dx,y-.38,1.43,.22,.11,.27,'sage')
        cable([(-2.37,y-.28,.96),(-1.69,y-.28,.85),(.6,y-.28,.82),(2.60,y-.28,1.07)],.088,'copper')
    elif kind=='boiler':
        for i in range(3):
            x=-1.28+i*1.57
            tank(x,y-.41,.29,.43,2.12+.24*(i%2), 'rust' if i%2 else 'copper')
            for z in (.67,1.58):post(x,y-.41,z,.1,.46,'iron',18)
            cable([(x,y-.42,2.27),(x,y-.42,2.96),(x+.24,y-.42,3.16),(x+.61,y-.42,3.16)],.13,'brass')
    elif kind=='thaw':
        for x in (-1.07,1.71):
            hoop(x,y-.22,2.14,1.04,1.04,.11,'ice')
            drum(x,y-.21,2.14,.91,.16,'dark')
            for j in range(7):
                a=j*2*pi/7
                slab([(x+.17*cos(a),2.14+.17*sin(a)),(x+.79*cos(a+.12),2.14+.79*sin(a+.12)),(x+.68*cos(a+.61),2.14+.68*sin(a+.61))],y-.39,y-.31,'steel')
            drum(x,y-.45,2.14,.18,.16,'orange')
    elif kind=='metrology':
        for x in (-1.72,2.48):
            box(x,y-.31,1.97,.30,.28,2.89,'steel')
            for j in range(11):box(x,y-.47,.74+j*.25,.27 if j%2==0 else .16,.035,.044,'navy')
        box(.38,y-.37,2.43,4.54,.34,.28,'orange')
        for x in (-1.04,.40,1.84):
            rod((x,y-.39,1.09),(x,y-.39,2.50),.077,'steel')
            gauge(x,y-.42,2.57,.42)
    else:
        for x,z,r in ((-1.11,2.03,.77),(.66,2.27,.54),(1.87,1.66,.41)):
            wheel(x,y-.37,z,r,'copper')
        cable([(-2.22,y-.25,.91),(-2.22,y-.25,2.84),(-2.02,y-.25,3.07),(2.54,y-.25,3.07),(2.64,y-.25,2.89)],.079,'brass')
        for x in (-1.86,2.36):
            post(x,y-.62,2.92,.09,.19,'brass')
            ball(x,y-.62,2.78,.14,.14,.18,'light')
    lamp(.4,y-.48,3.82,2.8)


def garage_bay(port, marks):
    model,coat,trim,kind=CELLS[port]
    parts.pop('Wayfinding mast')
    marks['signpost']=(5.85,3.90,-2.80)
    if port=='beacon-far-wink':marks['keeper']=(0,0,-.85)
    part('Suspended destination rail')
    box(6.41,2.8,4.18,2.34,.19,.15,coat)
    rod((5.85,2.8,4.2),(5.85,2.8,3.9),.041,'steel')
    service_wall(kind,coat,trim)
    part('Machine feet and fixed pedestal')
    for x in (.46,1.49):
        for y in (3.94,4.46):
            box(x,y,.10,.29,.30,.13,'iron')
            rod((x,y,.14),(1+(x-1)*.74,y,.83),.088,'steel')
    box(1,4.2,.78,1.65,.86,.16,coat)
    part(port+' '+DRIVE)
    model()
    absolute_part(port+' '+DRIVE,DRIVE_AT)
    part(port+' '+NOZZLE)
    # The coupling has the same working mating face on each prop, but a different casing.
    sides={'press':6,'cradle':24,'boiler':10,'thaw':16,'metrology':8,'beacon':12}[kind]
    cone((-.06,0,0),(.19,0,0),.29,.24,coat,sides)
    cone((.17,0,0),(.51,0,0),.24,.31,trim,sides)
    for x,r in ((.02,.32),(.48,.32)):
        cone((x,0,0),(x+.051,0,0),r,r,'iron',sides)
    for j in range(4):
        a=j*pi/2+pi/4
        rod((.08,.24*cos(a),.24*sin(a)),(.43,.29*cos(a),.29*sin(a)),.027,'steel',6)
    absolute_part(port+' '+NOZZLE,NOZZLE_AT)
    return [{'name':'bench_task_lamp','position':[.4,3.7,-6.85],'color':'#ffdeb3','intensity':1.12,'distance':13}]


def absolute_part(name, origin):
    x,y,z=origin
    vs=parts[name][0]
    vs[:]=[(a+x,b+y,c+z) for a,b,c in vs]
