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
        'Wear':('#998875',.74,.12,'metal'),'Signal':('#b5372c',.6,.05,'felt'),
        'Paper':('#e6dcc3',.8,0,'felt'),'Moss':('#5d7a48',.8,0,'felt')}
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
        if key in ('left','right') and not self.walk:
            # a hood over the tube and a strip of toggles and lit push-buttons under it
            local_box(key+' hood',(0,h/2+rail+.007,.012),(w+2*rail+.012,.014,.105),'Panel',.005)
            local_box(key+' switch strip',(0,-(h/2+rail+.034),-.03),(w+2*rail,.05,.03),'Panel',.006)
            for i in range(6):
                x=(i-2.5)*w/6.4
                if i<4:local_box(key+' toggle',(x,-(h/2+rail+.034),.0),(.014,.014,.04),'Steel',.004)
                else:local_box(key+' button',(x,-(h/2+rail+.034),-.008),(.032,.028,.018),'Glow',.006)
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
        first=len(self.items);self.lived_in(k,half,height,w)
        # things on the aft bulkhead are hidden with it in the overview render
        for ob in self.items[first:]:
            if ob.location.y<-.59:ob['overview_cut']=True
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
                self.box((s*.83,.07,-.46),(.06,.44,.042),'Panel',.012)
                for i in range(6):
                    y=-.10+i*.068;taped=(s<0 and i in (1,4))
                    self.box((s*.83,y,-.425),(.014,.014,.04),'Steel',.004)
                    if taped:self.box((s*.83,y+.022,-.437),(.05,.016,.004),'Pale',.001)
                    else:
                        for e in [-1,1]:self.box((s*.83+e*.02,y,-.42),(.006,.03,.05),'Trim',.002)
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
                for q,(lx,lz) in enumerate([(.84,-.42),(.90,.02),(.74,.40)]):
                    self.ball((side*lx,-.46,lz),(.052,.03,.052),'Diffuser' if not (side>0 and q==1) else 'Pale')
                    self.rod((side*lx,-.475,lz),(side*lx,-.455,lz),.062,'Trim',n=20)
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
            if n.name.startswith(('lamp_','fill_')):
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
        if self.walk:self.bake_grime([o for o in export if o.type=='MESH' and o not in self.windows and o.name!='door'])
        bpy.ops.object.select_all(action='DESELECT')
        for ob in export:ob.select_set(True)
        folder=self.root/'assets'/self.group;folder.mkdir(parents=True,exist_ok=True);p=folder/(self.key+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',use_selection=True,export_extras=True,export_animations=False,**({'export_vertex_color':'ACTIVE','export_all_vertex_colors':False} if self.walk else {}))
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
def _bake_grime(self,meshes):
    """Bake short-range ambient occlusion into vertex colours, so parts darken where they meet walls, floor and each other."""
    scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=False
    scene.world.light_settings.distance=.7
    for ob in scene.objects:
        if ob.type in('MESH','CURVE','FONT') and ob not in meshes:ob.hide_render=True
    bpy.ops.object.select_all(action='DESELECT')
    lit=[]
    for ob in meshes:
        ob.hide_render=False;ob.data.color_attributes.new('Grime','BYTE_COLOR','CORNER')
        ob.data.color_attributes.active_color=ob.data.color_attributes['Grime'];ob.data.color_attributes.render_color_index=0
        if ob.data.materials[0].name in('Glow','Diffuser'):continue
        ob.select_set(True);lit.append(ob)
    bpy.context.view_layer.objects.active=lit[0]
    bpy.ops.object.bake(type='AO',target='VERTEX_COLORS')
    for ob in meshes:
        att=ob.data.color_attributes['Grime'];n=len(att.data);c=np.ones(n*4,dtype=np.float32)
        if ob in lit:
            att.data.foreach_get('color',c);v=c.reshape(n,4)
            f=np.clip(v[:,:1],0,1)**.8;v[:,:3]=.3+.7*f*np.array([1.,.985,.96])+(1-f)*np.array([.02,.0,-.02]);v[:,3]=1
        att.data.foreach_set('color',c)
Ship.bake_grime=_bake_grime
def _lived_in(self,k,H,T,sw):
    """Fifteen years of use: tactile hardware, three visible repairs and the owner's clutter, per hull."""
    bx,rod,ball=self.box,self.rod,self.ball
    def ringx(x,y,z,r,t,mat):
        bpy.ops.mesh.primitive_torus_add(major_segments=28,minor_segments=6,location=(x,y,z),rotation=(0,math.pi/2,0),major_radius=r,minor_radius=t)
        return self.put(bpy.context.object,mat)
    def ringz(x,y,z,r,t,mat):
        bpy.ops.mesh.primitive_torus_add(major_segments=28,minor_segments=6,location=(x,y,z),major_radius=r,minor_radius=t)
        return self.put(bpy.context.object,mat)
    def gauge(x,y,z,r,rim='Trim'):   # a round dial lying on a console top
        rod((x,y,z),(x,y,z+.02),r,rim,n=24);rod((x,y,z+.02),(x,y,z+.026),r*.82,'Pale',n=24)
        bx((x+r*.2,y+r*.2,z+.029),(.008,r*.8,.004),'Rubber',.001,rot=(0,0,-.7))
    def walldial(x,z,r,rim='Trim'):  # a round dial on the back wall, facing the pilot
        self.disc(x,-.655,z,r,.04,rim,24);self.disc(x,-.632,z,r*.82,.012,'Pale',24)
        bx((x,-.622,z+r*.25),(.01,.004,r*.6),'Rubber',.001,rot=(0,.6,0))
    def lever(x,y,z,l,mat='Steel',grip='Rubber',lean=.25):
        rod((x,y,z),(x,y+lean*l,z+l),.014,mat);ball((x,y+lean*l,z+l),(.032,.032,.032),grip)
    self.section('Wear and repairs')
    # worn-through deck at the heels and the door track, a wiring bundle zip-tied along the port sill
    bx((0,.5,-.966),(.5,.32,.006),'Wear',.002);bx((0,-.58,-.966),(.86,.14,.006),'Wear',.002)
    self.wire([(-H+.035,-.6,-.31),(-H+.045,.2,-.30),(-H+.06,1.15,-.31)],.024,'Rubber')
    for y in [-.4,-.05,.3,.65,1.0]:bx((-H+.05,y,-.305),(.064,.022,.064),'Pale',.004)
    # the start-up checklist: a board by the door with one step rewritten
    self.section('Owner clutter')
    cx=.47+(H-.47)/2
    o=.03 if k=='rustbucket' else 0   # stand clear of the rivet heads on the Rustbucket's bulkhead
    bx((cx,-.655+o/2,.12),(.30,.02+o,.44),'Pale',.008)
    for i in range(6):bx((cx-.01,-.642+o,.29-i*.065),(.21,.006,.024),'Signal' if i==3 else 'Rubber',.002)
    bx((cx,-.645+o,.325),(.1,.02,.04),'Steel',.008)
    if k=='rustbucket':
        self.section('Wear and repairs')
        # 1 an oversize collar on the copper line  2 a clamp holding the port instrument pan  3 a tin lid over a missing plate
        rod((.89,-.02,-.507),(.89,.12,-.507),.05,'Steel');rod((.89,-.04,-.507),(.89,-.02,-.507),.062,'Steel');rod((.89,.12,-.507),(.89,.14,-.507),.062,'Steel')
        bx((-.845,.80,-.30),(.03,.035,.2),'Steel',.006);bx((-.81,.80,-.21),(.1,.035,.03),'Steel',.006);bx((-.81,.80,-.39),(.1,.035,.03),'Steel',.006)
        rod((-.79,.80,-.44),(-.79,.80,-.36),.012,'Trim');bx((-.79,.80,-.45),(.08,.014,.014),'Trim',.003)
        self.disc(-cx,-.64,-.52,.15,.06,'Pale',24);self.disc(-cx,-.607,-.52,.11,.012,'Trim',24)
        for a in range(4):ball((-cx+.125*math.cos(a*1.571+.5),-.61,-.52+.125*math.sin(a*1.571+.5)),(.014+.004*(a%2),.012,.014+.004*(a%2)),'Steel')
        bx((-.3,.1,T-.035),(.34,.3,.006),'Rubber',.002,rot=(.071,0,.2))      # soot under the roof vent
        self.section('Owner clutter')
        # the knife switch for the main bus, and a two-lever throttle quadrant worn to bare metal
        bx((-cx,-.64,-.05),(.2,.06,.34),'Wood',.01);rod((-cx,-.61,-.16),(-cx,-.5,.04),.012,'Trim');ball((-cx,-.49,.055),(.03,.03,.03),'Rubber')
        for z in [-.16,.06]:bx((-cx,-.605,z),(.06,.03,.03),'Trim',.006)
        bx((-.84,-.2,-.52),(.2,.3,.2),'Steel',.02)
        for i,x in enumerate([-.89,-.79]):lever(x,-.26+i*.08,-.43,.24,'Wear','Wear')
        rod((-.44,-.19,T-.21),(-.44,-.19,T-.1),.14,'Pale',r2=.07,n=20)       # a shade that belongs to a different lamp
        bx((.34,-.22,T-.068),(.5,.4,.008),'Pale',.002,rot=(.071,0,-.12))       # paper star chart taped to the roof
        bx((.3,-.22,T-.075),(.34,.012,.004),'Signal',.001,rot=(.071,0,.5))
        for sx,sy in [(-1,-1),(1,-1),(-1,1),(1,1)]:bx((.34+sx*.23,-.22+sy*.18,T-.074),(.07,.03,.004),'Rubber',.001,rot=(.071,0,.6*sx*sy))
        bx((0,-.375,-.17),(sw+.05,.15,.07),'Upholstery',.03);bx((.1,-.43,-.32),(sw*.6,.03,.28),'Upholstery',.012)   # cardigan over the seat back
        rod((-.62,-.5,-.97),(-.62,-.5,-.8),.075,'Trim',n=20);rod((-.62,-.5,-.8),(-.62,-.42,-.68),.022,'Trim',r2=.008)  # oil can
    elif k=='dromedary':
        self.section('Wear and repairs')
        # 1 a too-narrow replacement case shimmed with card  2 a yellow strap bracing a cracked window  3 a breaker taped on
        bx((.845,.70,-.29),(.014,.1,.32),'Pale',.002,rot=(0,0,-.64))
        bx((H-.012,.33,.22),(.012,.07,1.02),'Trim',.003,rot=(.62,0,0));bx((H-.03,.33,.22),(.04,.12,.09),'Steel',.012,rot=(.62,0,0))
        bx((cx,-.645,-.36),(.4,.03,.14),'Panel',.008)
        for i in range(5):
            bx((cx-.14+i*.07,-.625,-.36),(.036,.03,.075),'Rubber',.006)
        bx((cx-.07,-.607,-.345),(.07,.008,.14),'Pale',.002,rot=(0,.3,0))
        self.section('Owner clutter')
        # fourteen lit push-buttons, one for each hold unit; three are dark
        bx((cx,-.648,-.62),(.4,.028,.2),'Panel',.008)
        for i in range(14):bx((cx-.15+(i%7)*.05,-.63,-.575-(i//7)*.09),(.034,.02,.034),'Rubber' if i in (3,8,12) else 'Glow',.006)
        lever(-.47,.36,-.97,.5,'Steel','Trim',.2);bx((-.47,.36,-.955),(.12,.12,.03),'Frame',.01)   # dead-man lever
        bx((.5,.47,T-.1),(.3,.014,.17),'Wood',.004,rot=(-.62,0,0));bx((.5,.455,T-.045),(.08,.03,.03),'Steel',.006)   # a clipboard for a sun visor
        for i in range(3):bx((-.74,-.46+i*.012,-.955+i*.028),(.24,.31,.026),'Pale',.004,rot=(0,0,.08*i))   # manifests under a wrench
        bx((-.74,-.45,-.868),(.045,.25,.018),'Steel',.006,rot=(0,0,.5));bx((-.80,-.345,-.868),(.08,.06,.018),'Steel',.006,rot=(0,0,.5))
        bx((.62,-.52,-.9),(.2,.14,.13),'Trim',.02,rot=(0,.35,0))                                        # wheel chock
        rod((.93,-.3,-.97),(.93,-.3,-.68),.05,'Steel');rod((.93,-.3,-.68),(.93,-.3,-.62),.04,'Trim')     # thermos
    elif k=='stoat':
        self.section('Wear and repairs')
        # 1 switch guards missing and taped (on the port bank)  2 the pocket door on one roller and a wedge  3 a patched cheek pane
        ball((-.25,-.655,.615),(.035,.03,.035),'Steel');bx((.25,-.655,.6),(.03,.03,.07),'Steel',.006)
        bx((.33,-.63,-.94),(.14,.07,.06),'Wood',.004,rot=(0,.3,0))
        ringx(-H+.012,.42,.16,.13,.02,'Pale');bx((-H+.012,.42,.16),(.006,.03,.3),'Pale',.001,rot=(.5,0,0))
        self.section('Owner clutter')
        # a dinner-plate tachometer on the port sill and a gated throttle with a red lock-out collar
        self.disc(-.62,1.13,-.1,.13,.05,'Trim',28);self.disc(-.62,1.1,-.1,.11,.012,'Pale',28)
        bx((-.59,1.09,-.06),(.012,.004,.11),'Signal',.001,rot=(0,.7,0))
        bx((-.86,-.26,-.5),(.16,.3,.12),'Panel',.02);bx((-.86,-.26,-.438),(.03,.22,.006),'Rubber',.001)
        lever(-.86,-.3,-.44,.2,'Steel','Rubber',.3);rod((-.86,-.285,-.39),(-.86,-.27,-.34),.024,'Signal')
        for lx in [-.44,.44]:bx((lx,-.19,T-.062),(.26,.2,.02),'Panel',.008)                       # shaded dome lamps
        self.wire([(.25,.3,T-.03),(.25,.3,T-.2)],.004,'Rubber',False);self.disc(.25,.3,T-.24,.045,.016,'Steel',20)   # stopwatch on the roof bow
        bx((cx,-.655,.47),(.36,.012,.15),'Trim',.004);bx((cx+.1,-.648,.47),(.06,.006,.15),'Pale',.001)          # a race pennant
        ball((.8,-.3,-.425),(.06,.1,.03),'Leather')                                                # one driving glove
        ball((-.72,-.46,-.83),(.14,.15,.14),'Pale');bx((-.72,-.34,-.82),(.2,.04,.07),'Rubber',.015)  # helmet
        for i in range(3):bx((-.80,.05+i*.05,-.437),(.09,.006,.004),'Pale',.001)                    # lap times in grease pencil
    elif k=='manatee':
        self.section('Wear and repairs')
        # 1 a plywood panel in the walnut  2 a curtain ring for a lost gauge bezel  3 a household switch for the seat heater
        bx((-.667,-.22,-.59),(.012,.32,.2),'Pale',.003)
        for a in range(4):ball((-.66,-.22+(.13 if a%2 else -.13),-.59+(.07 if a<2 else -.07)),(.012,.012,.012),'Steel')
        ringz(-.83,-.36,-.425,.068,.014,'Wood')
        bx((.667,.1,-.56),(.012,.085,.125),'Pale',.004);bx((.658,.1,-.55),(.02,.03,.045),'Pale',.004,rot=(.3,0,0))
        self.section('Owner clutter')
        # brass-rimmed gauges set into the port cabinet, levers with turned grips on the starboard one, a speaking tube
        for i,y in enumerate([-.36,-.21,-.06]):gauge(-.83,y,-.437,.055,'Trim' if i else 'Panel')
        for i in range(2):lever(.78+i*.1,-.33,-.437,.2,'Steel','Wood',.2)
        bx((.83,-.3,-.432),(.26,.16,.012),'Trim',.004)
        self.wire([(.62,-.66,.34),(.6,-.52,.3),(.58,-.44,.2)],.022,'Trim');rod((.58,-.44,.2),(.575,-.41,.14),.024,'Trim',r2=.055)
        self.wire([(.6,-.5,.28),(.66,-.5,.1),(.68,-.5,.02)],.004,'Rubber');ball((.68,-.5,0),(.03,.03,.035),'Wood')
        walldial(-cx,.2,.12);rod((-cx,-.66,.34),(-cx,-.66,.4),.01,'Trim')                           # barometer
        for lx in [-.44,.44]:rod((lx,-.19,T-.22),(lx,-.19,T-.11),.14,'Upholstery',r2=.08,n=20)       # fringed shades
        bx((sw/2+.014,-.07,-.6),(.056,.12,.012),'Pale',.003)                                        # a darned arm
        bx((-.5,.82,-.87),(.32,.27,.16),'Leather',.05)                                               # footstool
        for sx in [-1,1]:
            for sy in [-1,1]:rod((-.5+sx*.12,.82+sy*.1,-.97),(-.5+sx*.12,.82+sy*.1,-.94),.022,'Wood')
    else:
        self.section('Wear and repairs')
        # 1 a scaffold tube for a lost pearl support  2 dark push-buttons, the live ones dotted with varnish  3 a grey primer plate
        for name,(ax,ay) in {'mug':(-.76,.64),'clipboard':(-.79,.31)}.items():rod((ax,ay,-.97),(ax,ay,-.44),.028,'Pale')
        rod((.77,.53,-.97),(.77,.53,-.45),.036,'Steel');bx((.77,.53,-.6),(.11,.09,.05),'Steel',.01);bx((.77,.53,-.9),(.11,.09,.05),'Steel',.01)
        bx((cx,-.655,.22),(.44,.02,.5),'Steel',.006)
        for sx in [-1,1]:
            for sz in [-1,1]:ball((cx+sx*.19,-.642,.22+sz*.22),(.016,.012,.016),'Rubber')
        self.section('Owner clutter')
        # a bank of lit push-buttons, a two-handed warp lever in a pearl gate, and the ring-brake handwheel
        rod((-.9,-.02,-.97),(-.9,-.02,-.47),.03,'Pale');bx((-.9,-.02,-.45),(.2,.5,.035),'Panel',.01)
        for i in range(12):
            bx((-.94+(i%2)*.08,-.21+(i//2)*.075,-.428),(.045,.045,.02),'Rubber' if i in (1,2,5,6,9,10) else 'Glow',.008)
            if i in (0,3,4,7,8,11):ball((-.94+(i%2)*.08+.036,-.21+(i//2)*.075+.03,-.43),(.008,.008,.006),'Signal')
        bx((.92,-.24,-.5),(.18,.3,.14),'Pale',.03)
        for i in [-1,1]:rod((.92+i*.04,-.26,-.44),(.92+i*.04,-.2,-.22),.012,'Steel')
        rod((.82,-.2,-.22),(1.02,-.2,-.22),.022,'Pale')
        self.ring(-cx,-.63,-.12,.13,.016,'Trim');self.disc(-cx,-.64,-.12,.035,.05,'Steel',16)
        for a in range(3):bx((-cx,-.632,-.12),(.25,.012,.02),'Steel',.003,rot=(0,a*1.047,0))
        bx((0,-.02,-.69),(.4,.4,.06),'Signal',.028)                                                  # a cushion that does not match
        bx((0,-.375,-.17),(sw+.05,.15,.07),'Upholstery',.03);bx((-.1,-.43,-.34),(sw*.7,.03,.3),'Upholstery',.012)   # a blanket
        bx((-.7,1.22,-.238),(.2,.14,.006),'Pale',.001,rot=(0,0,.3));bx((-.7,1.22,-.234),(.06,.03,.004),'Rubber',.001,rot=(0,0,.3))   # the list
Ship.lived_in=_lived_in
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
