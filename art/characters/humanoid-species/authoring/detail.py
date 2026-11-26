import math, random, forms
from forms import part,bead,body,line
def setsp(name): forms.S=forms.CAST[name]
def blade(n,m,pts,th=.36,proj=True):
    forms.S.setdefault('blades',[]).append((n,m,[tuple(map(float,k.split(','))) for k in pts.split()],th,proj))
def band(n,m,y,l,r,d,dep,h):part(n,m,d,dep,f'{y-h},{l+1},{r-1} {y-h+1},{l},{r} {y+h-1},{l},{r} {y+h},{l+1},{r-1}')
def plate(n,m,y,l,r,d,h,depth=4):part(n,m,d,depth,f'{y-h},{l+3},{r-3} {y-h+2},{l},{r} {y+h-2},{l},{r} {y+h},{l+2},{r-2}')
def loop(n,m,pts,p=True):line(n,m,pts,p)
def relief(n,m,pts,th=.28):blade(n,m,pts,th)
def bag(n,m,x,y,d,w,h):
 part(n,m,d,w*.43,f'{y-h*.5},{x-w*.39},{x+w*.38} {y-h*.4},{x-w*.48},{x+w*.46} {y+h*.3},{x-w*.5},{x+w*.5} {y+h*.5},{x-w*.41},{x+w*.41}',True)
 plate('Pocket flap · '+n,m,y-h*.23,x-w*.48,x+w*.48,d+w*.33,h*.20,w*.12)
 bead('Press stud · '+n,'brass',x,y,d+w*.49,1,1,.65,False)
def horn(n,m,pts):blade(n,m,pts,.83)
def fan(n,m,cx,cy,depth,tips,wide):
 for i,(x,z) in enumerate(tips):
  dx=x-cx;dz=z-cy
  blade(n+' '+str(i+1),m,f'{cx},{cy},{depth},1.5 {cx+dx*.37},{cy+dz*.37-2},{depth-2},{wide} {cx+dx*.78},{cy+dz*.78-2},{depth-4},{wide*.63} {x},{z},{depth-8},.2',.27)
def chain(n,m,ps):line(n,m,' '.join(','.join(str(v) for v in p) for p in ps))
setsp('Taluun')
relief('Left indigo lapel','ink','147,54,12,2 155,64,16,3.5 166,82,20,3 181,100,26,2')
relief('Right indigo lapel','ink','205,62,9,2 211,78,12,2 205,97,20,3 195,120,27,2.5')
band('Tool belt','leather',131,137,222,0,28,4);plate('Square belt buckle','brass',130,176,189,28,4)
bag('Line knife sheath','leather',171,146,27,11,22)
for k in range(5):
 ps=[(147+k*1.5,58+k*.5,12,1.1),(138+k,57+k*.65,17,1.4),(128+k,78,18+k*.2,1.6),(128+k,106,20+k*.25,1.6),(133+k*.8,128+k,21,1.6),(142+k*.8,141+k,20,1.5),(153+k,127,17,1.2),(150+k,84,15,.9),(146+k,59,12,1)]
 chain('Coiled mooring rope '+str(k+1),'rope',ps)
for x,d in [(109,9),(273,9)]:bead('Orbital pupil','obsidian',x,16,d+4.3,2.5,2.8,1.7)
setsp('Orrek')
for j,(y,l,r) in enumerate([(15,104,203),(26,108,197),(37,103,156),(47,99,147),(58,108,150),(62,148,199)]):
 part('Cantilevered slate scute %02d'%j,'slate',1-(j%2)*2,26 if j<3 else 22,f'{y-4},{l+12},{r-14} {y-1},{l+4},{r-4} {y+1},{l},{r} {y+4},{l+9},{r-8}')
for x in (114,194):
 relief('Apron shoulder strap','leather',f'{x-16},54,-6,4 {x-10},63,11,4 {x},82,24,4 {x+6},100,32,4',.40)
for x in (137,169):
 bag('Riveted tool pocket','rust',x,183,34,25,32)
 line('Spanner handle','steel',f'{x},162,37,1.6 {x+1},146,38,2.1 {x+2},141,39,2.2')
 for s in (-1,1):line('Open spanner jaw','steel',f'{x+2},145,38,2.5 {x+2+s*4},141,39,1.8 {x+2+s*4},137,39,.8')
band('Waist band','leather',137,83,222,0,36,3)
setsp('Vessari')
fan('Occipital flight plume','plume',152,15,2,[(104,10),(88,25),(79,31),(99,36),(85,53),(101,49),(102,61),(117,51),(125,59)],5)
fan('Secondary forearm quill','plume',106,111,4,[(81,129),(80,142),(85,146),(89,150),(92,155)],2.4)
for x,t in [(123,0),(168,1)]:
 for s in range(3):
  delta=(-20+s*16) if t==0 else (-9+s*22)
  line('Articulated talon','horn',f'{x},241,0,2.6 {x+1},261,4,4 {x+delta*.72},269,{6+s*5},2.5 {x+delta},272,{9+s*8},1 {x+delta+2},273,{12+s*8},.35')
bag('Field radio pouch','leather',131,149,15,16,24)
bag('Receiver','blue',166,95,15,17,22)
for j in range(4):line('Receiver louvre','steel',f'159,{88+j*3},18,0.75 169,{88+j*3},18,.75')
setsp('Mothren')
for side,(start,tip) in enumerate([((151,48),(60,25)),((171,47),(255,29))]):
 x0,z0=start;x1,z1=tip;sg=-1 if side==0 else 1
 line('Antennal shaft','ochre',f'{x0},{z0},4,1.8 {x0+sg*18},25,3,1.8 {x0+sg*48},21,-1,1.45 {x1},{z1},-5,.65')
 for t in range(1,24):
  u=t/25; x=x0+(x1-x0)*u; y=24+(1-u)**4*22+4*u**3
  length=17*math.sin(math.pi*u)**.68
  for k in (-1,1):
   line('Antenna comb filament','ochre',f'{x},{y},1,.78 {x+sg*4},{y+k*length*.58},0,.8 {x+sg*11},{y+k*length},-1,.23')
for x in (158,165):horn('Curved feeding palp','horn',f'{x},73,22,1.7 {x+2},78,23,2.5 {x+4},88,22,1.5 {x+5},91,23,.4')
band('Lamp belt','leather',157,97,197,0,29,4)
for x in (129,175):relief('Bib brace','leather',f'{x-5},80,9,3.5 {x-2},92,18,3.7 {x},112,25,3.3')
bag('Lantern housing','brass',123,207,17,18,27)
bead('Amber burner glass','glow',123,208,23,6.8,8,4)
for k in [-7,-3.5,3.5,7]:line('Lantern cage rod','brass',f'{123+k},197,24,.65 {123+k},216,24,.65',False)
line('Lantern bail handle','brass','117,197,17,.8 116,189,16,.9 119,183,16,.8 126,182,16,.8 130,188,16,.8 130,197,16,.8')
setsp('Ureth')
blade('Translucent occipital sail','opal','184,15,-2,8 164,18,-4,15 144,23,-6,10 125,30,-10,6 104,45,-13,2 100,53,-15,.25',.36)
for x,y in [(106,47),(124,36),(143,32),(155,35),(166,43)]:
 line('Sail cartilage','ivory',f'177,15,-1,.85 {int((x+177)/2)},{y*.56},-2,.85 {x},{y},-4,.3')
relief('Draped cowl','wine','149,81,9,4 159,96,19,6 175,110,21,6 191,108,20,4 201,90,11,2')
band('Astrolabe belt','leather',146,134,211,0,20,4)
for xx,zz,rr in [(169,178,12),(181,132,6)]:
 bead('Astrolabe face','brass',xx,zz,22,rr,rr,2.4)
 for j in range(8):
  a=j*math.pi/4;line('Astrolabe spoke','brass',f'{xx},{zz},25,.55 {xx+rr*.82*math.cos(a)},{zz+rr*.82*math.sin(a)},25,.6',False)
line('Instrument chain','brass','182,146,21,.7 174,154,22,.8 168,164,23,.7')
setsp('Keld')
part('Quilted shoulder guard','leather',1,26,'56,82,109 61,76,118 73,61,131 82,54,136 96,63,128 111,82,111 119,89,100')
for k in range(4):
 line('Pad quilting','rope',f'{72+k*9},{70-k*1.6},18,.55 {81+k*9},{82-k*1.6},24,.7 {96+k*7},{102-k*3},20,.55')
band('Welder tool belt','leather',135,91,212,0,32,5)
for x in (118,196):relief('Suspender','leather',f'{x-9},68,6,2.6 {x-4},84,21,3 {x},107,30,3 {x+3},133,31,3')
plate('Roller belt buckle','brass',135,152,169,32,4.5)
setsp('Sovai')
for s in (-1,1):
 for j in range(8):
  x=(126+j*2.6) if s<0 else (165+j*2.0)
  endx=x+s*(9+j*1.7);y=25+j%3*3;ey=46+(j*7%30)
  line('External gill','vermilion',f'{x},{y},{6+j*.45},2.6 {x+s*(8+j*.5)},{y+8},{7+j*.4},1.85 {endx},{ey-8},{6+j*.6},1 {endx+s},{ey},{5+j*.4},.28')
band('Tied apron band','leather',125,123,179,0,20,4)
bag('Cutlery pocket','canvas',154,156,17,23,21)
part('Side towel','ivory',11,3,'127,173,182 138,174,186 158,175,190 179,177,196 190,177,195')
for xx,zz in [(105,267),(168,263)]:
 for j in range(3):
  delta=(-12+j*13) if xx==105 else (8+j*15)
  line('Webbed toe','reef',f'{xx},{zz-7},3,4 {xx+delta*.43},{zz},8,4.7 {xx+delta},{zz+5},14,3 {xx+delta+2},{zz+7},19,.8')
setsp('Brunn')
for pts in ['129,29,20,8 123,31,24,7 121,42,30,6 128,56,33,4.7 142,64,32,3 151,65,28,.45','198,28,12,6 207,33,16,5.5 211,45,21,4.6 206,56,26,3.7 195,64,26,2.2 188,65,23,.4']:
 horn('Curled ivory cheek tusk','ivoryhorn',pts)
for x in (114,187):relief('Towing shoulder strap','denim',f'{x-12},50,-5,6 {x-8},62,10,7 {x},82,25,7 {x+4},100,33,6 {x+8},124,35,7')
band('Load harness belt','leather',154,82,207,0,35,5)
plate('Tow belt buckle','brass',154,160,181,34,8)
for j in range(5):
 x=96+j*2
 chain('Coiled tow line','rope',[(x,145,26,1.6),(x-7,155,29,1.7),(x-14,180,29,1.8),(x-10,197+j*1.3,29,1.9),(x,203+j*1.3,30,1.7),(x+6,192,31,1.6),(x+7,159,29,1.6),(x+6,144,26,1.6)])
setsp('Pelrin')
for x,tip in [(165,98),(205,255)]:
 sign=1 if tip>x else -1
 blade('Translucent ear pinna','ear',f'{x},35,0,5 {x+12*sign},28,-2,15 {x+32*sign},26,-4,25 {tip-4*sign},25,-6,15 {tip},25,-7,1',.16)
 for k in range(8):
  a=(-.85+k*1.72/7);ex=x+sign*(43+10*math.cos(a*2));ey=26+math.sin(a)*24
  line('Auricular vessel','fawn',f'{x},34,2,.6 {x+sign*20},{31+math.sin(a)*6},0,.8 {ex},{ey},-3,.4')
relief('Courier crossbody strap','leather','203,79,12,3.4 193,104,20,3.6 179,132,24,3.6 159,166,20,3.8 148,189,14,3')
bag('Dispatch satchel','leather',153,164,21,27,28)
setsp('Zhavet')
for j,(x,tx) in enumerate([(165,107),(184,235)]):
 line('Sensory antenna','chitin',f'{x},11,2,1.7 {(x+tx)/2},0,0,.9 {tx},10,-2,.25')
for x,s in [(168,-1),(180,1)]:
 horn('Mandible','chitin',f'{x},33,14,3 {x+s*5},38,16,2 {x+s*4},44,16,.9 {x+s*2},46,17,.3')
relief('Woven surveyor baldric','copper','181,66,6,6 173,81,15,7 158,96,17,8 142,110,16,8 126,120,11,8')
part('Brocade survey sash','copper',6,6,'110,125,139 122,117,140 144,108,131 169,99,123 195,90,120 211,83,117 222,103,117 238,103,113',True)
bead('Survey dial','brass',116,149,20,8.5,10,3)
for x,y,d,sgn in [(70,182,6,-1),(217,178,-5,1)]:
 for j in range(3):
  line('Fine grasping digit','chitin',f'{x+j*2},{y}, {d},2 {x+sgn*(1+j*2)},{y+17},{d+2},1.6 {x+sgn*(j*3-2)},{y+35+j*6},{d+4},1 {x-sgn*4},{y+41+j*6},{d+5},.25'.replace(', ',','))
setsp('Koruun')
part('Lichen-covered cranial shield','turtle',-3,33,'3,143,166 8,124,184 16,100,205 26,87,216 36,74,225 44,71,232 48,82,224 49,95,214')
for x,y,rx in [(85,48,14),(103,35,17),(121,23,19),(144,16,18),(166,15,18),(187,21,16),(212,33,13)]:
 bead('Crown scute','turtle',x,y,8,rx,6.8,7)
line('Wide lower lip','turtle','130,49,28,1.5 146,58,34,2 171,61,36,2.4 193,57,31,2 209,49,23,1')
part('Folded kitchen towel','ivory',30,9,'104,78,95 108,68,102 119,61,108 141,58,103 161,55,100 181,53,94 195,49,94 204,55,86',True)
bag('Utensil pocket','rust',201,179,27,42,30)
for x,y,k in [(186,149,0),(201,142,1),(215,134,2)]:
 line('Utensil handle','steel',f'{x+1},161,34,1.7 {x},152,35,1.5 {x}, {y},35,1.4'.replace(', ',','))
 bead('Utensil bowl','steel',x,y,35,3+k*.55,5+k,1.2)
setsp('Eskel')
for pts in ['140,59,7,1.5 151,69,13,2.2 169,78,15,2 183,82,10,1','128,76,7,1.6 140,86,14,2 159,93,18,2.6 181,96,12,1','124,89,9,2 145,104,17,2 172,111,17,2.2 186,121,9,1']:
 relief('Mantle bias fold','ivory',pts,.5)
band('Courier belt','leather',127,137,185,0,18,3.3)
plate('Small brass clasp','brass',127,162,173,18,3.5)
setsp('Rhovi')
fan('Indigo crown quill','indigo',170,10,-5,[(99,4),(89,21),(88,38),(94,48),(103,53),(109,67),(123,51),(137,42)],3.3)
for x in (178,200):
 bead('Aviator goggle rim','brass',x,80,22,9,9,4)
 bead('Smoked glass lens','smoke',x,80,25.5,6.8,6.8,2)
line('Goggle bridge','leather','186,79,24,1.4 189,77,26,1.4 193,79,25,1.4')
bag('Flight jacket pocket','mustard',158,124,18,19,12)
band('Trouser belt','leather',141,150,215,0,24,3.7)
setsp('Nemeya')
bead('Luminous central organ','glow',160,29,13,14,12,10,False)
for j in range(19):
 x=116+j*4.9; u=(x-160)/50
 line('Bell margin lappet','coral',f'{x},43,{15-abs(u)*8},2 {x+2},49,{17-abs(u)*8},2.3 {x+u*4},57-{0},{15-abs(u)*7},1.4 {x+u*4-2},{60-abs(u)*6},{15-abs(u)*7},.35'.replace('57-0','57'))
for s in (-1,1):
 for k in range(3):
  x=99 if s<0 else 207;y=179;d=6 if s<0 else -3
  off=(k-1)*4.7
  chain('Tapered long finger','coral',[(x+off,y,d,2.8),(x+off+2*s,y+19,d+2,2.2),(x+off-3*s,y+37+k*4,d+4,1.8),(x+off-8*s,y+49+k*3,d+7,.5)])
setsp('Dathri')
part('Layered carapace crown','shell',-3,26,'2,128,157 6,113,177 16,99,193 25,89,208 34,81,220 40,78,218 46,102,208 53,124,201')
for i,(x,z,r) in enumerate([(94,36,14),(111,30,19),(139,21,22),(169,22,19),(197,32,19),(211,50,13)]):
 bead('Carapace overlapping plate','shell',x,z,10,r,7.1,6)
for xx,zz,rr in [(112,83,18),(99,96,17),(89,107,14)]:
 bead('Articulated shoulder plate','shell',xx,zz,2,rr,8,11)
part('Major chela body','shell',7,17,'108,85,98 115,77,103 126,66,104 141,61,105 154,60,98 169,63,89 179,67,81')
horn('Fixed chela digit','shell','75,156,12,13 74,171,16,11 78,186,18,7 86,198,19,3.7 93,204,20,.45')
horn('Opposing chela digit','shell','92,124,13,10 103,128,17,8 109,140,21,5 109,154,22,3.8 104,169,22,2 99,179,22,.35')
for x,s in [(156,-1),(176,1)]:horn('Mouth plate','shell',f'{x},54,24,5 {x+s*5},60,26,3.6 {x+s*4},70,27,1.5 {x+s},76,27,.3')
bag('Bib patch pocket','denim',159,117,24,27,18)
setsp('Ulnor')
blade('Rearward cranial wedge','stripe','153,14,-4,10 139,13,-7,11 125,12,-10,7 111,15,-13,4 106,19,-16,.45',.74)
for j in range(6):
 x=145+j*6.5
 line('Fluted gular rib','ochre',f'{x},38,{8+math.sin(j*.55)*10},1.45 {x+2},56,{9+math.sin(j*.55)*10},2 {x+4},76,{10+math.sin(j*.55)*9},2 {x+5},{90+math.sin(j*.55)*11},{11+math.sin(j*.55)*8},.6')
relief('Brocade lapel','wine','128,64,9,4.5 132,81,20,4.5 149,100,23,5 164,118,24,3')
relief('Crossbody lanyard','khaki','119,78,8,2.5 130,90,16,2.7 151,110,23,2.9 171,128,25,2.5 183,136,23,2')
bead('Port authority seal','brass',179,124,24,8.5,9,2.8)
band('Duty belt','leather',129,117,204,0,24,3.3)
