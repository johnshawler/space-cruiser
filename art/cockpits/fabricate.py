"""Author the five ships around live panel and walk-mode anchors, in metres."""
import json,math,struct
from pathlib import Path
import bpy
from mathutils import Matrix,Vector
from meshwork import Room,rgb
from ship_finish import camera,area,rgba_image
import numpy as np

FLEET={
'rustbucket':('Rustbucket Mk I','3d3a36','23211f','b5651d','ffb060','4a3426'),
'dromedary':('Dromedary 400','34383c','1d2024','e0b000','ffd27a','2e2e30'),
'stoat':('Stellar Stoat','2a3238','161b20','19b8a6','7ff5e6','1e2a30'),
'manatee':('Opulent Manatee','33252a','1a1416','c9a24a','ffd9a0','5a1f28'),
'empress':('Quasar Empress','9aa1aa','1b1f26','3fd0ff','9fe8ff','e8e4dc')}
BASIS=Matrix.Rotation(math.pi/2,4,'X')
def coord(x,y,z):return Vector((x,-z,y))
def game_pt(p):return [round(p.x,5),round(p.z,5),round(-p.y,5)]
def trim_point(pos,tx,ty):
    return Matrix.Translation(coord(*pos))@BASIS@Matrix.Rotation(ty,4,'Y')@Matrix.Rotation(tx,4,'X')
def palette(k):
    title,frame,panel,trim,glow,seat=FLEET[k]
    return {'Frame':('#'+frame,.56,.42,'metal'),'Panel':('#'+panel,.62,.22,'metal'),
        'Trim':('#'+trim,.39,.55,'metal'),'Leather':('#'+seat,.64,.02,'felt'),
        'Upholstery':('#'+({'rustbucket':'aa7052','dromedary':'827d69','stoat':'407b7c','manatee':'a95558','empress':'c4d8dd'}[k]),.72,.02,'felt'),
        'Pale':('#'+({'rustbucket':'a9aaa0','dromedary':'b7bdad','stoat':'96bbc0','manatee':'dfc496','empress':'ece9de'}[k]),.55,.2,'tile'),
        'Glow':('#'+glow,.3,0,None,2.6),'glass':('#c6e1e5',.15,.02,None,0,.085),
        'Diffuser':('#'+glow,.42,0,None,.34,1,.21),'Rubber':('#262c33',.84,0,'felt'),
        'Wood':('#805141',.52,0,'wood'),'Steel':('#73828b',.46,.55,'metal'),
        'Wear':('#998875',.74,.12,'metal')}
PANEL={
 'main':(.62,.34,(0,-.28,-1.04),-.38,0),'left':(.46,.34,(-.555,-.292,-.86),-.38,.64),
 'right':(.46,.34,(.555,-.292,-.86),-.38,-.64),'pedestal':(.24,.44,(0,-.55,-.90),-1.51,0),
 'overhead':(.62,.20,(0,.565,-.33),.927,0),'radio':(1.,.16,(0,-.022,-1.005),-.20,0)}
class Ship(Room):
    def __init__(self,path,walk=False):
        key=Path(path).stem
        super().__init__(path,FLEET[key][0],palette(key))
        self.anchors=[];self.windows=[];self.proofs=[];self.cams={};self.walk=walk
        self.group='ship-interiors' if walk else 'cockpits'
    def anchor(self,name,pos,tilt=(0,0)):
        ob=bpy.data.objects.new(name,None);self.coll.objects.link(ob)
        ob.empty_display_type='ARROWS';ob.empty_display_size=.066
        # glTF node frame has local +Z normal and +Y panel-up. Blender's
        # exporter conjugates transforms by the basis rotation.
        ob.matrix_world=trim_point(pos,*tilt)@BASIS.inverted()
        self.anchors.append(ob);return ob
    def glaze(self,name,points):
        ob=self.mesh(points,[(0,1,2,3)],'glass',name)
        uv=ob.data.uv_layers.new(name='Window')
        for i,v in enumerate([(0,0),(1,0),(1,1),(0,1)]):uv.data[i].uv=v
        self.windows.append(ob);return ob
    def mount(self,key,w,h,pos,tx,ty):
        a=self.anchor('panel_'+key,pos,(tx,ty));a['width']=w;a['height']=h
        a['clearance']=.13 if key=='pedestal' else .04
        frame=trim_point(pos,tx,ty)
        self.section('Instrument housings')
        def local_box(name,loc,sz,mat,bevel):
            ob=self.box((0,0,0),sz,mat,bevel,name=name);ob.matrix_world=frame@Matrix.Translation(loc)
            return ob
        # Z=0 is the working face; the recess bottom is five centimetres in.
        local_box(key+' well',(0,0,-.059),(w+.022,h+.022,.018),'Panel',.007)
        rail=.012 if self.key=='stoat' else .018
        for side in [-1,1]:
            local_box(key+' cheek',(side*(w+rail)/2,0,-.027),(rail,h+2*rail,.055),'Frame',.005)
            local_box(key+' lip',(0,side*(h+rail)/2,-.027),(w,rail,.055),'Trim',.004)
        proof=local_box('Proof face '+key,(0,0,-.003),(w-.008,h-.008,.004),'Steel',.001)
        proof['proof_only']=True;self.proofs.append(proof)
    def front(self):
        k=self.key; profile={
            'rustbucket':(1.02,.68,.69,1.03),'dromedary':(1.11,.82,.75,1.13),
            'stoat':(1.08,.74,.81,1.03),'manatee':(1.20,.88,.78,1.26),
            'empress':(1.24,.97,.84,1.33)}[k]
        base,top,height,half=profile;self.section('Forward shell')
        # A continuous UV strip lets the live wiper texture traverse curved glass.
        bend={'rustbucket':0,'dromedary':.018,'stoat':.23,'manatee':.12,'empress':.085}[k]
        count=1 if k=='rustbucket' else 8
        pts=[];uvs=[];faces=[]
        for j in range(count+1):
            t=j/count;u=2*t-1;bulge=(1-u*u)*bend
            pts.extend([(u*base,1.44+bulge,-.25),(u*top,.44+bulge*.7,height+bulge*.38)])
            uvs.extend([(t,0),(t,1)])
            if j:faces.append((2*j-2,2*j,2*j+1,2*j-1))
        win=self.mesh(pts,faces,'glass','windshield');uv=win.data.uv_layers.new(name='Window')
        for loop in win.data.loops:uv.data[loop.index].uv=uvs[loop.vertex_index]
        self.windows.append(win)
        for j in range(count):
            self.rod(pts[j*2+1],pts[j*2+3],.031,'Frame')
            self.quad(pts[j*2+1],pts[j*2+3],(pts[j*2+3][0],.435,height-.005),(pts[j*2+1][0],.435,height-.005),'Frame')
        self.quad((-half,1.44,-.97),(half,1.44,-.97),(base,1.44,-.25),(-base,1.44,-.25),'Panel')
        for side in [-1,1]:
            r=side
            self.rod((r*base,1.44,-.25),(r*top,.44,height),.032 if k in ['stoat','empress'] else .048,'Trim')
            hi=(r*top,.44,height);lo=(r*base,1.44,-.25)
            hind=(r*half,-.68,height-.08); lowhind=(r*half,-.68,-.25)
            self.glaze('canopy_'+('left' if side<0 else 'right'),[lo,lowhind,hind,hi])
            self.quad(lo,lowhind,(r*half,-.68,-.97),(r*half,1.44,-.97),'Frame')
            self.wire([lo,lowhind,hind,hi],.035,'Frame',False)
            if k=='dromedary':
                for y in [-.38,.1,.56]:self.rod((r*half,y,-.25),(r*(half-.09),y,height-.065),.037,'Trim')
            if k=='rustbucket':
                self.wire([(r*half,-.45,-.23),(r*(half-.06),-.31,.30),(r*(top+.08),.28,height)],.045,'Frame')
            if k=='manatee':
                self.rod((r*half,-.65,.11),(r*(half-.11),.6,.14),.023,'Trim')
            if k=='empress':
                self.wire([(r*half,-.57,-.36),(r*half,-.24,.18),(r*(top+.06),.26,height-.02)],.052,'Pale')
        self.section('Roof',True)
        self.quad((-half,-.68,height-.08),(half,-.68,height-.08),(top,.44,height),(-top,.44,height),'Frame')
        self.rod((-top,.44,height),(top,.44,height),.033,'Frame')
        self.section('Deck');self.quad((-half,-.68,-.97),(half,-.68,-.97),(half,1.44,-.97),(-half,1.44,-.97),'Rubber')
        self.section('Aft bulkhead')
        for a,b in [(-half,-.42),(.42,half)]:self.back_panel(a,b,-.97,height-.08,-.68,'Frame')
        self.back_panel(-.42,.42,.62,height-.08,-.68,'Frame')
        self.box((0,-.706,-.175),(.837,.045,1.586),'Panel',.012,name='door')
        for x in [-.45,.45]:self.box((x,-.67,-.16),(.05,.07,1.66),'Trim',.012)
        self.box((0,-.652,.65),(.95,.08,.06),'Trim',.01)
        self.section('Pilot chair')
        w={'rustbucket':.45,'dromedary':.48,'stoat':.43,'manatee':.54,'empress':.49}[k]
        self.box((0,-.02,-.79),(w,.46,.16),'Leather',.068)
        self.box((0,-.35,-.42),(w,.09,.53),'Leather',.043)
        self.rod((0,-.09,-.97),(0,-.09,-.83),.13,'Frame')
        for side in [-1,1]:
            self.box((side*(w/2+.014),-.07,-.64),(.052,.29,.069),'Upholstery',.023)
        self.signature(k,half)
        for key,defn in PANEL.items():self.mount(key,*defn)
        self.section('Accessory mounts')
        for name,pos in {'stick':(.77,-.407,-.53),'mug':(-.76,-.40,-.64),'clipboard':(-.79,-.415,-.31),
                         'mascot':(.51,-.17,-.96)}.items():
            self.anchor(name,pos);w,d={'stick':(.13,.15),'mug':(.15,.15),'clipboard':(.23,.30),'mascot':(.095,.095)}[name]
            self.box((pos[0],-pos[2],pos[1]-.022),(w,d,.044),'Frame',.009)
        for name,x in [('left',-.43),('right',.13)]:
            self.anchor('wiper_'+name,(x,-.238,-1.421),(math.atan2(.44-1.44,height+.25),0))
        for x in [-.44,.44]:
            self.anchor('lamp_'+('port' if x<0 else 'starboard'),(x,height-.12,.19))
            self.box((x,-.19,height-.09),(.19,.13,.044),'Glow',.017)
        self.anchor('glow',(0,-.33,-1.08))
        for name,aim in [('pilot',(0,1,-math.tan(.12))),('left',(-1,0,-.08)),('right',(1,0,-.08)),('back',(0,-1,-.06))]:
            c=camera(bpy.context.scene,name,(0,0,0),aim);c.data.sensor_fit='VERTICAL';c.data.sensor_height=24
            c.data.lens=12/math.tan(math.radians(36));c.data.clip_start=.02;self.cams[name]=c
        c=camera(bpy.context.scene,'overview',(2.2,-3.6,2.5),(0,.18,-.18));c.data.type='ORTHO';c.data.ortho_scale=3.5;self.cams['overview']=c
    def signature(self,k,w):
        self.section('Ship fittings')
        if k=='rustbucket':
            self.box((-.80,.97,.20),(.16,.12,.31),'Pale',.023,rot=(.53,0,-.10))
            for i in range(4):
                self.rod((.89,-.52,-.57+i*.063),(.89,.43,-.57+i*.063),.024,'Trim')
            for i in range(6):self.box((-.185+i*.071,-.01,-.704),(.029,.34,.014),'Upholstery',.005)
            for x in [-.69,.69]:
                for z in [-.72,-.5,-.28,.0,.26,.48]:self.ball((x,-.64,z),(.030,.023,.030),'Steel')
            self.box((-.71,-.63,.28),(.35,.018,.24),'Wear',.01)
        elif k=='dromedary':
            for side in [-1,1]:
                for j in range(3):
                    self.box((side*(w-.028),-.44+j*.39,-.50),(.045,.31,.26),'Panel',.017)
                    self.box((side*(w-.058),-.44+j*.39,-.47),(.044,.19,.033),'Trim',.011)
            for i in range(5):self.box((0,-.288,-.58+i*.085),(.38,.029,.055),'Upholstery',.011)
            self.box((-.76,-.64,.17),(.34,.034,.22),'Pale',.015);self.rod((-.88,-.61,.12),(-.64,-.61,.22),.016,'Trim')
        elif k=='stoat':
            for s in [-1,1]:
                self.wire([(s*.26,-.34,-.18),(s*.27,-.27,-.49),(s*.24,.13,-.69)],.046,'Upholstery')
                self.wire([(s*.79,-.5,-.58),(s*.85,.02,-.45),(s*.72,.62,-.43)],.035,'Trim')
                self.box((s*.83,.07,-.46),(.038,.44,.042),'Glow',.012)
            self.disc(.73,-.58,-.17,.13,.06,'Steel',24)
        elif k=='manatee':
            for s in [-1,1]:
                self.box((s*.83,-.04,-.59),(.32,.88,.25),'Wood',.056)
                self.box((s*.83,-.04,-.45),(.32,.88,.025),'Trim',.009)
            for j in range(5):self.ball((-.21+j*.105,-.335,-.29),(.068,.063,.23),'Upholstery')
            self.rod((-.77,.64,-.47),(-.77,.64,-.425),.11,'Trim',n=28)
            for j in range(3):self.box((.75,-.615,-.30+j*.075),(.36,.10,.059),'Pale',.022)
        else:
            for side in [-1,1]:
                self.wire([(side*.88,-.50,-.76),(side*.98,-.50,-.11),(side*.82,-.50,.48),(side*.54,-.50,.68)],.064,'Pale')
                self.wire([(side*.76,-.49,-.70),(side*.85,-.49,-.12),(side*.70,-.49,.39)],.018,'Glow')
                self.box((side*.22,-.36,-.23),(.14,.08,.49),'Pale',.037,rot=(0,side*.17,0))
            self.ring(-.75,.68,-.43,.12,.019,'Trim')
    def finish(self):
        scene=bpy.context.scene
        scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=12;scene.cycles.use_denoising=True
        scene.cycles.max_bounces=6;scene.render.use_motion_blur=True;scene.render.motion_blur_shutter=.14
        scene.render.resolution_x=1024;scene.render.resolution_y=640;scene.render.resolution_percentage=100
        scene.view_settings.view_transform='Filmic';scene.render.image_settings.color_mode='RGB'
        # A high dynamic range space environment lights and reflects on the model.
        sky=np.zeros((64,128,3))+[.018,.032,.066]
        yy,xx=np.mgrid[:64,:128]
        sky+=np.exp(-((xx-24)**2+(yy-34)**2)/70)[:,:,None]*np.array([.35,.66,1.8])
        sky+=np.exp(-((xx-87)**2+(yy-43)**2)/3)[:,:,None]*np.array([11.,9.2,6.4])
        im=rgba_image('Space IBL',sky,False,True)
        world=bpy.data.worlds.new('Deep space');scene.world=world;world.use_nodes=True
        nt=world.node_tree;e=nt.nodes.new('ShaderNodeTexEnvironment');e.image=im;nt.links.new(e.outputs[0],nt.nodes['Background'].inputs[0])
        for n in self.anchors:
            if n.name.startswith('lamp_'):
                x,y,z=n.location;area(scene,'Preview '+n.name,(x,y,z-.04),(x,y+.2,z-2),'#'+FLEET[self.key][4],22 if not self.walk else 50,.31)
        if self.walk:
            for i,y in enumerate([-3.6,-9.5,-16.1]):area(scene,'Skylight '+str(i),(-.4,y,1.15),(0,y-.3,-.7),'#c6dcff',65,1)
        else:
            area(scene,'Planet bounce',(-1.2,2.2,1.7),(0,0,-.45),'#daeaff',148,1.72)
            area(scene,'Deck bounce',(.42,.30,.2),(0,-.65,-.42),'#fff1d8',16,.52)
        probe=bpy.data.lightprobes.new('Cabin reflections','SPHERE');ob=bpy.data.objects.new('Preview reflection probe',probe);self.coll.objects.link(ob)
        scene.eevee.use_raytracing=True;scene.eevee.ray_tracing_method='SCREEN'
        # A small participating volume catches the cabin light without filling the windshield.
        bpy.ops.mesh.primitive_cube_add(size=1,location=(0,-3.6 if self.walk else -.22,.05))
        air=bpy.context.object;air.name='Preview air';air.dimensions=(2.0,2.2 if self.walk else .72,1.60)
        air.display_type='WIRE';m=bpy.data.materials.new('Preview haze');m.use_nodes=True
        nt=m.node_tree;nt.nodes.remove(nt.nodes['Principled BSDF']);v=nt.nodes.new('ShaderNodeVolumeScatter');v.inputs['Density'].default_value=.015
        v.inputs['Anisotropy'].default_value=.35;nt.links.new(v.outputs[0],nt.nodes['Material Output'].inputs['Volume']);air.data.materials.append(m)
        scene.use_nodes=True;nt=scene.node_tree;nt.nodes.clear();layers=nt.nodes.new('CompositorNodeRLayers')
        bloom=nt.nodes.new('CompositorNodeGlare');bloom.glare_type='FOG_GLOW';bloom.quality='MEDIUM'
        nt.links.new(layers.outputs['Image'],bloom.inputs['Image']);nt.links.new(bloom.outputs['Image'],nt.nodes.new('CompositorNodeComposite').inputs['Image'])
        first=next(iter(self.cams.values()));scene.camera=first
        for name,c in self.cams.items():
            if name!='overview':
                c.data.dof.use_dof=True;c.data.dof.focus_distance=3.0 if self.walk else 1.0;c.data.dof.aperture_fstop=8.
        bpy.context.preferences.filepaths.save_version=0
        bpy.ops.wm.save_as_mainfile(filepath=str(self.file.with_suffix('.blend')),compress=True)
        image_dir=self.root/'docs'/self.group/self.key;image_dir.mkdir(parents=True,exist_ok=True)
        for name,c in self.cams.items():
            scene.camera=c
            for ob in self.items:ob.hide_render=(name=='overview' and (ob.get('overview_cut') or ob['assembly']=='Aft bulkhead' or ob.name=='door')) or False
            air.hide_render=name=='overview'
            scene.render.filepath=str(image_dir/(name+'.png'));bpy.ops.render.render(write_still=True)
            grade_ship(Path(scene.render.filepath),self)
        self.export_ship()
    def export_ship(self):
        for obj in self.proofs:bpy.data.objects.remove(obj,do_unlink=True)
        deps=bpy.context.evaluated_depsgraph_get();batches={};export=list(self.anchors)
        for ob in list(bpy.context.scene.objects):
            if not ob.get('assembly'):continue
            ob.hide_render=False
            if ob in self.windows or ob.name=='door':
                export.append(ob);continue
            mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(deps),depsgraph=deps);mesh.transform(ob.matrix_world)
            if not mesh.uv_layers.active:
                uv=mesh.uv_layers.new(name='Metre projection')
                for face in mesh.polygons:
                    axis=max(range(3),key=lambda i:abs(face.normal[i]));a,b=((1,2),(0,2),(0,1))[axis]
                    for li in face.loop_indices:
                        co=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(co[a]*2,co[b]*2)
            copy=bpy.data.objects.new('Export',mesh);self.coll.objects.link(copy)
            batches.setdefault((ob['assembly'],ob.data.materials[0].name),[]).append(copy)
        for (label,material),parts in batches.items():
            bpy.ops.object.select_all(action='DESELECT')
            for o in parts:o.select_set(True)
            bpy.context.view_layer.objects.active=parts[0]
            if len(parts)>1:bpy.ops.object.join()
            parts[0].name=label+' - '+material;export.append(parts[0])
        bpy.ops.object.select_all(action='DESELECT')
        for ob in export:ob.select_set(True)
        folder=self.root/'assets'/self.group;folder.mkdir(parents=True,exist_ok=True);p=folder/(self.key+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_extras=True,export_animations=False)
        b=p.read_bytes();g=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
        tri=sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives'])
        if not self.walk:
            assert tri<=60000 and len(g['meshes'])<=80 and len(g['materials'])<=14 and len(b)<=1500000,(tri,len(g['meshes']),len(g['materials']),len(b))
            names={o['name'] for o in g['nodes']};assert {'windshield','door',*['panel_'+k for k in PANEL]}<=names
            assert len(self.windows)>=3
        anchors={}
        for ob in self.anchors:
            node=next(n for n in g['nodes'] if n['name']==ob.name)
            anchors[ob.name]={'position':node.get('translation',[0,0,0]),'quaternion':node.get('rotation',[0,0,0,1])}
            if ob.name.startswith('panel_'):
                assert math.dist(anchors[ob.name]['position'],[0,0,0])<=1.1
        stat=dict(ship=self.key,name=self.title,file=p.relative_to(self.root).as_posix(),triangles=tri,meshes=len(g['meshes']),materials=len(g['materials']),bytes=len(b),anchors=anchors)
        manifest=folder/'manifest.json';data=json.loads(manifest.read_text()) if manifest.exists() else {'ships':[]}
        data['ships']=[s for s in data['ships'] if s['ship']!=self.key]+[stat];manifest.write_text(json.dumps(data,indent=2)+'\n')
        print('SHIP METRICS',json.dumps(stat))
def grade_ship(path,ship):
    from ship_finish import linear_srgb,srgb_linear
    # Store and interpolate a per-ship display-space LUT. The grain is fixed for stills.
    folder=ship.root/'assets'/ship.group/'finish'/ship.key;folder.mkdir(parents=True,exist_ok=True)
    g,x=np.mgrid[:16,:256];c=np.stack([x%16,g,x//16],axis=-1)/15
    tint=np.array(rgb('#'+FLEET[ship.key][4]));l=(c*np.array([.2126,.7152,.0722])).sum(axis=-1,keepdims=True)
    table=np.clip(c+l*(1-l)*(tint-tint.mean())*.095,0,1)
    dest=folder/'grade.png'
    if not dest.exists():
        lut=rgba_image('Ship grade',table);dest.write_bytes(Path(bpy.path.abspath(lut.filepath_raw)).read_bytes())
        sky=bpy.data.images['Space IBL'];(folder/'space.hdr').write_bytes(Path(bpy.path.abspath(sky.filepath_raw)).read_bytes())
    im=bpy.data.images.load(str(path),check_existing=False);w,h=im.size
    p=np.empty(w*h*4,dtype=np.float32);im.pixels.foreach_get(p);p=p.reshape((h,w,4))
    c=np.clip(linear_srgb(p[:,:,:3]),0,1)*15;lo=np.minimum(c.astype(int),14);f=c-lo;s=np.zeros_like(c)
    for a in [0,1]:
        for b in [0,1]:
            for d in [0,1]:s+=table[lo[:,:,1]+b,(lo[:,:,2]+d)*16+lo[:,:,0]+a]*np.prod(np.where([a,b,d],f,1-f),axis=-1)[:,:,None]
    y,x=np.mgrid[-1:1:complex(h),-1:1:complex(w)];v=np.clip((x*x+y*y-.40)/1.6,0,1)**2
    noise=np.random.default_rng(197).normal(0,.00135,(h,w))
    p[:,:,:3]=srgb_linear(np.clip(s*(1-.04*v[:,:,None])+noise[:,:,None],0,1))
    im.pixels.foreach_set(p.flatten());im.save();bpy.data.images.remove(im)
def build(path):
    ship=Ship(path);ship.front();ship.finish()
