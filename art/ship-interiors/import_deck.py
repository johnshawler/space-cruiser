"""Make the game copy of a hand-built deck.

The source is a render master: about a million triangles, procedural materials, one object per fitting. The game
copy keeps its shapes and its look but is cut to a browser budget and has every surface baked to image maps, so
the game draws it unlit, exactly as lit in Blender.

    Blender -b --python art/ship-interiors/rustbucket.py -- prep      # optimise, unwrap, map what is solid
    Blender -b --python art/ship-interiors/rustbucket.py -- bake      # bake every room (or: bake "cargo hold")
    Blender -b --python art/ship-interiors/rustbucket.py -- export    # write the GLB and the manifest entry
    Blender -b --python art/ship-interiors/rustbucket.py              # all three

The source file is opened with scripts switched off. Working files go in IMPORT_WORK (a temporary folder by default)."""
import bpy,bmesh,re,sys,os,math,json,struct,time,tempfile,base64
import numpy as np
from pathlib import Path
from mathutils import Vector,Matrix
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
FLOOR=-.97
ROOMS={'corridor':(-.9,.9,.70,7.20),'passenger cabin':(-4.4,-.9,1.4,5.8),'galley':(.9,4.,1.4,5.),'cargo hold':(-3.4,3.4,7.2,14.2),
       'engine room':(-2.4,2.4,14.2,19.),'scrubber bay':(-4.4,-.9,5.8,7.2),'airlock':(.9,4.,5.,7.2),'port alley':(-3.4,-2.4,14.2,19.),'starboard alley':(2.4,3.4,14.2,19.)}
# the walking rectangles and repair points of src/09-walk.js (Interior.RECTS, FAULT_DEFS)
RECTS=[[-0.35,0.35,0.9,1.3],[-0.6,0.6,0.95,6.9],[-1.25,-0.5,3.2,4.0],[-3.15,-1.15,1.7,5.5],[0.5,1.25,2.7,3.5],[1.15,2.9,1.7,4.25],[-0.6,0.6,6.8,7.7],[-1.25,1.25,7.5,13.9],
       [-0.5,0.5,13.8,14.7],[-2.1,2.1,14.5,18.65],[-1.25,-0.5,6.2,6.8],[-3.1,-1.15,6.1,6.9],[0.5,1.25,5.85,6.35],[1.15,2.65,5.3,6.9],[2.5,3.3,5.85,6.35],[3.15,3.7,5.3,6.9],
       [-2.8,-2.0,14.8,15.4],[-3.1,-2.7,14.5,18.1],[2.0,2.8,14.8,15.4],[2.7,3.1,14.5,18.1]]
FAULTS={'coolant':(-3.,-.35,1.55),'thruster':(1.3,.35,18.85),'fuse':(2.45,.45,1.46),'scrubber':(-3.,.95,5.86),'crack':(-.86,.55,5.15),'strap':(1.55,.1,10.6),'seal':(2.82,.45,5.32)}
VARIANTS=r' / (working|broken|repaired)$';STATION='RB station /'
SHINE=.15;ATLAS=2048;CELL=.05;GX0,GX1,GZ0,GZ1=-4.6,4.2,.5,19.3
def work():
    p=Path(os.environ.get('IMPORT_WORK') or Path(tempfile.gettempdir())/'long-haul-import');p.mkdir(parents=True,exist_ok=True);return p
def game(v):return (v[0],v[2],-v[1])                    # Blender (x,-z,y) to game (x,y,z)
def room_at(x,z):
    for n,(a,b,c,d) in ROOMS.items():
        if a<=x<=b and c<=z<=d:return n
    return min(ROOMS,key=lambda n:max(ROOMS[n][0]-x,x-ROOMS[n][1],ROOMS[n][2]-z,z-ROOMS[n][3]))
def tris_of(me):return sum(len(p.vertices)-2 for p in me.polygons)
def world_tris(o):
    """World-space triangle corners of an object, as an (n,3,3) array."""
    me=o.data;me.calc_loop_triangles();n=len(me.loop_triangles)
    if not n:return np.zeros((0,3,3),np.float32)
    co=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',co);co=co.reshape(-1,3)
    M=np.array(o.matrix_world,np.float32);co=co@M[:3,:3].T+M[:3,3]
    ix=np.empty(n*3,np.int32);me.loop_triangles.foreach_get('vertices',ix);return co[ix.reshape(-1,3)]
def save_png(path,rgb):
    h,w=rgb.shape[:2];im=bpy.data.images.new('debug',w,h,alpha=False);px=np.ones((h,w,4),np.float32);px[:,:,:3]=rgb[::-1]
    im.pixels.foreach_set(px.ravel());im.filepath_raw=str(path);im.file_format='PNG';im.save();bpy.data.images.remove(im)

def solid_map(objs,lo,hi):
    """Which 5 cm cells of the deck have something in them between two heights above the floor."""
    nx=int(round((GX1-GX0)/CELL));nz=int(round((GZ1-GZ0)/CELL));grid=np.zeros((nz,nx),bool)
    for o in objs:
        T=world_tris(o)
        if not len(T):continue
        y=T[:,:,2];T=T[(y.max(1)>FLOOR+lo)&(y.min(1)<FLOOR+hi)]
        if not len(T):continue
        e=np.maximum(np.linalg.norm(T[:,0]-T[:,1],axis=1),np.maximum(np.linalg.norm(T[:,1]-T[:,2],axis=1),np.linalg.norm(T[:,2]-T[:,0],axis=1)))
        n=np.clip(np.ceil(e/(CELL*.7)).astype(int),1,160)
        for k in np.unique(n):
            S=T[n==k];i,j=np.meshgrid(np.arange(k+1),np.arange(k+1));m=(i+j)<=k;u=(i[m]/k)[None,:,None];v=(j[m]/k)[None,:,None]
            P=S[:,None,0]*(1-u-v)+S[:,None,1]*u+S[:,None,2]*v;P=P.reshape(-1,3);P=P[(P[:,2]>FLOOR+lo)&(P[:,2]<FLOOR+hi)]
            cx=((P[:,0]-GX0)/CELL).astype(int);cz=((-P[:,1]-GZ0)/CELL).astype(int);ok=(cx>=0)&(cx<nx)&(cz>=0)&(cz<nz);grid[cz[ok],cx[ok]]=True
    return grid
def grow(g,r):
    n=int(math.ceil(r/CELL));out=g.copy()
    for dz in range(-n,n+1):
        for dx in range(-n,n+1):
            if dx*dx+dz*dz>n*n+.5 or (dx==0 and dz==0):continue
            s=np.zeros_like(g);a=g[max(0,-dz):g.shape[0]-max(0,dz),max(0,-dx):g.shape[1]-max(0,dx)]
            s[max(0,dz):g.shape[0]-max(0,-dz),max(0,dx):g.shape[1]-max(0,-dx)]=a;out|=s
    return out
def cell(x,z):return int((z-GZ0)/CELL),int((x-GX0)/CELL)
def walking(objs,key):
    """Where the player can stand: the game's rectangles, less whatever the model puts in the way. Also where crates fit."""
    body=solid_map(objs,.3,1.7);nz,nx=body.shape
    zz,xx=np.mgrid[0:nz,0:nx];X=GX0+(xx+.5)*CELL;Z=GZ0+(zz+.5)*CELL
    rect=np.zeros_like(body)
    for a,b,c,d in RECTS:rect|=(X>=a)&(X<=b)&(Z>=c)&(Z<=d)
    free=rect&~grow(body,.17)
    reach=np.zeros_like(free);r0=cell(0,1.2);stack=[r0] if free[r0] else []
    while stack:
        i,j=stack.pop()
        if i<0 or j<0 or i>=nz or j>=nx or reach[i,j] or not free[i,j]:continue
        reach[i,j]=True;stack+=[(i+1,j),(i-1,j),(i,j+1),(i,j-1)]
    report={'cells_in_rects':int(rect.sum()),'cells_walkable':int(reach.sum()),'rects':{},'faults':{}}
    for n,(a,b,c,d) in enumerate(RECTS):
        m=(X>=a)&(X<=b)&(Z>=c)&(Z<=d);report['rects'][str(RECTS[n])]=round(float(reach[m].mean()),2)
    for f,(x,y,z) in FAULTS.items():
        d=np.hypot(X-x,Z-z);report['faults'][f]=round(float(d[reach].min()),2) if reach.any() else None
    crates=[];low=solid_map(objs,.08,1.6)
    for sx in(-1,1):
        for k in range(8):
            x=sx*2.35;z=7.9+k*.85;m=(np.abs(X-x)<.43)&(np.abs(Z-z)<.43);crates.append([x,round(z,2),bool(not low[m].any())])
    img=np.zeros((nz,nx,3),np.float32);img[rect]=(.25,.25,.3);img[reach]=(.2,.6,.3);img[body]=(.9,.85,.7)
    for x,z,ok in crates:
        i,j=cell(x,z);img[i-2:i+3,j-2:j+3]=(.2,.5,1.) if ok else (1.,.2,.2)
    for f,(x,y,z) in FAULTS.items():i,j=cell(x,z);img[i-1:i+2,j-1:j+2]=(1.,.3,1.)
    save_png(work()/(key+'-walk.png'),np.kron(img,np.ones((3,3,1),np.float32)))
    bits=np.packbits(reach.ravel())
    return {'x0':GX0,'z0':GZ0,'cell':CELL,'nx':nx,'nz':nz,'bits':base64.b64encode(bits.tobytes()).decode()},[c[:2] for c in crates if c[2]],report

def prep(src,key,budget,cockpit=False,drop=None):
    bpy.ops.wm.open_mainfile(filepath=str(src),use_scripts=False)
    sc=bpy.data.scenes[0];bpy.context.window.scene=sc;t0=time.time()
    if drop:      # lettering and plates the game copy is to go without
        for o in [o for o in sc.objects if re.search(drop,o.name)]:bpy.data.objects.remove(o,do_unlink=True)
    rooms={}
    for coll in sc.collection.children:
        for o in coll.objects:
            if o.type!='MESH' or not len(o.data.polygons):continue
            if cockpit:
                if coll.name=='cockpit':o['room']='cockpit'
            elif coll.name in ROOMS:o['room']=coll.name
            elif coll.name.startswith('Overhead') and not cockpit:
                c=sum((o.matrix_world@Vector(b) for b in o.bound_box),Vector())/8;o['room']=room_at(c.x,-c.y)
            if o.get('room'):rooms.setdefault(o['room'],[]).append(o)
    # Swappable fittings (the working, broken and repaired form of each repair station) are shown by the game one at a
    # time, so none of them belongs in the rooms or in their baked light. Fixed parts filed with a station (the two
    # lengths of heater pipe either side of the coupling) do belong.
    for coll in list(bpy.data.collections):
        if re.search(VARIANTS,coll.name):
            for o in list(coll.objects):bpy.data.objects.remove(o,do_unlink=True)
        elif coll.name.startswith(STATION) and not cockpit:
            for o in coll.objects:
                if o.type=='MESH' and len(o.data.polygons) and sc in o.users_scene:
                    c=sum((o.matrix_world@Vector(b) for b in o.bound_box),Vector())/8;o['room']=room_at(c.x,-c.y);rooms.setdefault(o['room'],[]).append(o)
    objs=[o for r in rooms.values() for o in r]
    print('IMPORT source',len(objs),'objects',sum(tris_of(o.data) for o in objs),'triangles',{k:len(v) for k,v in rooms.items()})
    if not cockpit:
        grid,crates,report=walking(objs,key);print('IMPORT walking',json.dumps(report));print('IMPORT crates',crates)
        (work()/(key+'-plan.json')).write_text(json.dumps({'walk':grid,'crates':crates,'report':report}))
    # ---- cut every mesh to a share of the budget that goes by its size, so small fittings keep their outline
    meshes={}
    for o in objs:
        d=(o.matrix_world.to_3x3()@Vector(o.dimensions)).length if False else Vector(o.dimensions).length
        e=meshes.setdefault(o.data.name,[o.data,0,[]]);e[1]=max(e[1],d);e[2].append(o)
    def cap(a,d,t):
        c=a*(40+700*d)
        if d<.045:c=min(c,14)
        return min(t,max(c,12))
    # Bedding lying flat is a thin closed shell. Cut down, its underside pokes up through its top, so the underside, which
    # nobody can see, goes first.
    for n,(m,d,u) in meshes.items():
        o=u[0];dim=o.dimensions
        if not any(k in (x.name if x else '').lower() for x in m.materials for k in('quilt','blanket','curtain')) or dim.z>.35*max(dim.x,dim.y):continue
        bm=bmesh.new();bm.from_mesh(m);R=o.matrix_world.to_3x3();dead=[f for f in bm.faces if (R@f.normal).normalized().z<-.25]
        bmesh.ops.delete(bm,geom=dead,context='FACES');bm.to_mesh(m);bm.free();m.update()
    tt={n:tris_of(m) for n,(m,d,u) in meshes.items()};lo,hi=.02,8.
    for _ in range(30):
        a=(lo+hi)/2;tot=sum(cap(a,d,tt[n])*len(u) for n,(m,d,u) in meshes.items())
        if tot>budget:hi=a
        else:lo=a
    a=lo;n_cut=0
    for n,(m,d,u) in meshes.items():
        ratio=cap(a,d,tt[n])/tt[n]
        if ratio>.92:continue
        o=u[0];target=cap(a,d,tt[n]);new=None
        def cut(**kw):
            mod=o.modifiers.new('cut','DECIMATE')
            for k,v in kw.items():setattr(mod,k,v)
            me=bpy.data.meshes.new_from_object(o.evaluated_get(bpy.context.evaluated_depsgraph_get()));o.modifiers.remove(mod);return me
        if ratio<.5 and tt[n]>600:
            # bedding, curtains and suits are subdivided thin shells: collapsing edges folds them through themselves, so
            # step them back down their subdivision levels instead
            # bedding is the thinnest: past one level its top and underside cut through each other
            soft=any(k in (x.name if x else '').lower() for x in m.materials for k in('quilt','blanket'))
            for it in((2,) if soft else (2,4,6)):
                me=cut(decimate_type='UNSUBDIV',iterations=it)
                if tris_of(me)>tris_of(new or m)*.45:bpy.data.meshes.remove(me);break
                if new:bpy.data.meshes.remove(new)
                new=me
                if tris_of(new)<=target*1.5:break
        if new is None:new=cut(ratio=ratio)
        new.name=n+' / game'
        for x in u:x.data=new
        meshes[n][0]=new;n_cut+=1
    print('IMPORT cut',n_cut,'meshes; now',sum(tris_of(o.data) for o in objs),'triangles in',round(time.time()-t0),'s')
    # ---- unwrap each mesh once, then give every object its own block of its room's atlas, sized by its real area
    bpy.ops.object.select_all(action='DESELECT')
    for n,(m,d,u) in meshes.items():
        o=u[0];uv=m.uv_layers.new(name='Bake',do_init=False);m.uv_layers.active=uv
        bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.02,area_weight=0,correct_aspect=True,scale_to_bounds=False)
        bpy.ops.object.mode_set(mode='OBJECT');o.select_set(False)
    print('IMPORT unwrapped',len(meshes),'meshes in',round(time.time()-t0),'s')
    for room,obs in rooms.items():
        area=[]
        for o in obs:
            if o.data.users>1:o.data=o.data.copy()
            T=world_tris(o);area.append(float(np.linalg.norm(np.cross(T[:,1]-T[:,0],T[:,2]-T[:,0]),axis=1).sum()/2) if len(T) else 0.)
        order=sorted(range(len(obs)),key=lambda i:-area[i]);pad=3/ATLAS;lo,hi=0.,2.
        def pack(k):
            x=y=row=0.;out={}
            for i in order:
                s=max(k*math.sqrt(area[i]),4/ATLAS)+pad
                if x+s>1:x=0;y+=row;row=0
                if s>1 or y+s>1:return None
                out[i]=(x,y,s-pad);x+=s;row=max(row,s)
            return out
        for _ in range(40):
            k=(lo+hi)/2
            if pack(k):lo=k
            else:hi=k
        P=pack(lo)
        for i,o in enumerate(obs):
            x,y,s=P[i];uv=o.data.uv_layers['Bake'];a=np.empty(len(uv.data)*2,np.float32);uv.data.foreach_get('uv',a);a=a.reshape(-1,2)
            mn=a.min(0);mx=a.max(0);a=(a-mn)/max(1e-6,float((mx-mn).max()))*s+(x,y);uv.data.foreach_set('uv',a.ravel())
        print('IMPORT atlas %-16s %4d objects %7d triangles %6.1f m2 %5.0f px/m'%(room,len(obs),sum(tris_of(o.data) for o in obs),sum(area),lo*ATLAS))
    bpy.ops.wm.save_as_mainfile(filepath=str(work()/(key+('-cockpit' if cockpit else '-game')+'.blend')),compress=True)

def gpu(sc):
    sc.render.engine='CYCLES'
    try:
        p=bpy.context.preferences.addons['cycles'].preferences;p.compute_device_type='METAL';p.get_devices()
        for d in p.devices:d.use=d.type=='METAL'
        sc.cycles.device='GPU'
    except Exception as e:print('IMPORT no GPU',e)
def bake(key,only=None,cockpit=False):
    bpy.ops.wm.open_mainfile(filepath=str(work()/(key+('-cockpit' if cockpit else '-game')+'.blend')),use_scripts=False)
    sc=bpy.data.scenes[0];bpy.context.window.scene=sc;gpu(sc);sc.cycles.samples=64;sc.cycles.use_denoising=True
    bk=sc.render.bake;bk.margin=3;bk.use_selected_to_active=False;bk.view_from='ABOVE_SURFACE';bk.target='IMAGE_TEXTURES'
    sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=88;sc.render.image_settings.color_mode='RGB'
    for room in (['cockpit'] if cockpit else ROOMS):
        if only and room!=only:continue
        obs=[o for o in sc.objects if o.type=='MESH' and o.get('room')==room]
        if not obs:continue
        t0=time.time();img=bpy.data.images.new('bake '+room,ATLAS,ATLAS,alpha=False,float_buffer=True);nodes=[]
        for m in {s.material for o in obs for s in o.material_slots if s.material}:
            m.use_nodes=True;n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=img;m.node_tree.nodes.active=n;nodes.append((m,n))
        # one object per room, at the world origin: baking object by object re-reads the whole scene for each one
        whole=bpy.data.objects.new(room+' / whole',bpy.data.meshes.new(room+' / whole'));sc.collection.objects.link(whole)
        bpy.ops.object.select_all(action='DESELECT')
        for o in obs:o.select_set(True)
        whole.select_set(True);bpy.context.view_layer.objects.active=whole;bpy.ops.object.join()
        uvs=whole.data.uv_layers;uvs.active=uvs['Bake']
        if 'UVMap' in uvs:uvs['UVMap'].active_render=True
        # Matt light and shine are baked apart. The shine is what a surface reflects straight back at you, which no single
        # image can hold for every viewpoint: painted surfaces get a little of it, bare metal (which has no matt colour) all
        def grab():
            a=np.empty(ATLAS*ATLAS*4,np.float32);img.pixels.foreach_get(a);return a.reshape(ATLAS,ATLAS,4)[:,:,:3].copy()
        bpy.ops.object.bake(type='COMBINED',pass_filter={'DIFFUSE','EMIT','DIRECT','INDIRECT','COLOR'},use_clear=True);matt=grab()
        bpy.ops.object.bake(type='GLOSSY',pass_filter={'DIRECT','INDIRECT','COLOR'},use_clear=True);shine=np.clip(grab(),0,6)
        ml=matt.mean(2,keepdims=True);sl=shine.mean(2,keepdims=True);metal=np.clip(1-3*ml/(sl+1e-4),0,1)
        out=matt+shine*(SHINE+(1-SHINE)*metal);px=np.ones((ATLAS,ATLAS,4),np.float32);px[:,:,:3]=out;img.pixels.foreach_set(px.ravel())
        img.save_render(str(work()/(key+'-'+room.replace(' ','-')+'.jpg')),scene=sc)       # through the file's own view transform
        for m,n in nodes:m.node_tree.nodes.remove(n)
        bpy.data.images.remove(img);print('IMPORT baked %-16s in %4d s'%(room,time.time()-t0),flush=True)

def only(keep):
    """Leave nothing in the file but these objects, selected: an export by selection otherwise takes hidden selected ones too."""
    keep=set(keep)
    for o in list(bpy.data.objects):
        if o not in keep:bpy.data.objects.remove(o,do_unlink=True)
    for o in keep:o.select_set(True)
def welded(name,obs):
    """One mesh from many objects: world positions and the bake layout only, welded where both agree."""
    P=[];U=[]
    for o in obs:
        me=o.data;me.calc_loop_triangles();n=len(me.loop_triangles)
        if not n:continue
        co=np.empty(len(me.vertices)*3,np.float32);me.vertices.foreach_get('co',co);co=co.reshape(-1,3);M=np.array(o.matrix_world,np.float32);co=co@M[:3,:3].T+M[:3,3]
        vi=np.empty(n*3,np.int32);me.loop_triangles.foreach_get('vertices',vi);li=np.empty(n*3,np.int32);me.loop_triangles.foreach_get('loops',li)
        uv=np.empty(len(me.loops)*2,np.float32);me.uv_layers['Bake'].data.foreach_get('uv',uv);P.append(co[vi]);U.append(uv.reshape(-1,2)[li])
    P=np.concatenate(P);U=np.concatenate(U)
    keyv=np.concatenate((np.round(P*2000),np.round(U*8192)),axis=1).astype(np.int64);_,first,inv=np.unique(keyv,axis=0,return_index=True,return_inverse=True)
    me=bpy.data.meshes.new(name);me.from_pydata(P[first].tolist(),[],inv.reshape(-1,3).tolist());me.update()
    uv=me.uv_layers.new(name='UVMap');loops=np.empty(len(me.loops),np.int32);me.loops.foreach_get('vertex_index',loops);uv.data.foreach_set('uv',U[first][loops].ravel())
    return me
def repairs(key):
    """The swappable repair fittings that come ready-made beside the deck: where each goes and its three models."""
    d=ROOT/'assets'/'ship-interiors'/(key+'-repairs');mf=d/'manifest.json'
    if not mf.exists():return None
    m=json.loads(mf.read_text());base='assets/ship-interiors/'+key+'-repairs/'
    return {s['fault_id']:{'pos':s['game_position'],'yaw':s['game_rotation_y_radians'],'models':{k:base+v['file'] for k,v in s['states'].items()}} for s in m['stations']}
def export(key,title):
    bpy.ops.wm.open_mainfile(filepath=str(work()/(key+'-game.blend')),use_scripts=False)
    sc=bpy.data.scenes[0];bpy.context.window.scene=sc;out=[];finish=ROOT/'assets'/'ship-interiors'/'finish'/key;finish.mkdir(parents=True,exist_ok=True)
    for room in ROOMS:
        obs=[o for o in sc.objects if o.type=='MESH' and o.get('room')==room]
        if not obs:continue
        me=welded(room,obs)
        jpg=finish/(room.replace(' ','-')+'.jpg');jpg.write_bytes((work()/(key+'-'+room.replace(' ','-')+'.jpg')).read_bytes())
        mat=bpy.data.materials.new('baked '+room);mat.use_nodes=True;p=mat.node_tree.nodes.get('Principled BSDF');t=mat.node_tree.nodes.new('ShaderNodeTexImage')
        t.image=bpy.data.images.load(str(jpg));mat.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=1;p.inputs['Metallic'].default_value=0
        me.materials.append(mat);ob=bpy.data.objects.new(room,me);sc.collection.objects.link(ob);out.append(ob)
    marks=[o for o in sc.objects if o.type=='EMPTY' and o.name.startswith(('fault_','lamp_','passenger_','cockpit_door')) and o.name!='lamp_cockpit']
    only(out+marks)
    glb=ROOT/'assets'/'ship-interiors'/(key+'.glb')
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_normals=False,export_animations=False,export_image_format='NONE',export_extras=False)
    b=glb.read_bytes();g=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
    tri=sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives'])
    anchors={n['name']:{'position':n.get('translation',[0,0,0]),'quaternion':n.get('rotation',[0,0,0,1])} for n in g['nodes'] if 'mesh' not in n}
    plan=json.loads((work()/(key+'-plan.json')).read_text())
    stat=dict(ship=key,name=title,file='assets/ship-interiors/'+key+'.glb',triangles=tri,meshes=len(g['meshes']),materials=len(g['materials']),bytes=len(b),anchors=anchors,
              repairs=repairs(key),baked={m['name']:'assets/ship-interiors/finish/'+key+'/'+m['name'].replace(' ','-')+'.jpg' for m in g['meshes']},walk=plan['walk'],crates=plan['crates'])
    mf=ROOT/'assets'/'ship-interiors'/'manifest.json';data=json.loads(mf.read_text());data['ships']=[s for s in data['ships'] if s['ship']!=key]+[stat];mf.write_text(json.dumps(data,indent=2)+'\n')
    print('IMPORT exported',tri,'triangles',len(b),'bytes; maps',sum((finish/(m['name'].replace(' ','-')+'.jpg')).stat().st_size for m in g['meshes']),'bytes')

def export_cockpit(key,title,panels=None):
    """The cockpit keeps the game's own glass, sliding door and named points, taken from the cockpit model already in
    the repository; everything solid is replaced by the baked copy of the hand-built cockpit."""
    bpy.ops.wm.open_mainfile(filepath=str(work()/(key+'-cockpit.blend')),use_scripts=False)
    sc=bpy.data.scenes[0];bpy.context.window.scene=sc
    obs=[o for o in sc.objects if o.type=='MESH' and o.get('room')=='cockpit'];me=welded('cockpit shell',obs)
    jpg=ROOT/'assets'/'cockpits'/'finish'/key/'cockpit.jpg';jpg.parent.mkdir(parents=True,exist_ok=True);jpg.write_bytes((work()/(key+'-cockpit.jpg')).read_bytes())
    mat=bpy.data.materials.new('baked cockpit');mat.use_nodes=True;p=mat.node_tree.nodes.get('Principled BSDF');t=mat.node_tree.nodes.new('ShaderNodeTexImage')
    t.image=bpy.data.images.load(str(jpg));mat.node_tree.links.new(t.outputs['Color'],p.inputs['Base Color']);p.inputs['Roughness'].default_value=1
    me.materials.append(mat);shell=bpy.data.objects.new('cockpit shell',me);sc.collection.objects.link(shell)
    glb=ROOT/'assets'/'cockpits'/(key+'.glb');before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(glb))
    donor=[o for o in bpy.data.objects if o not in before];keep=[o for o in donor if o.type=='EMPTY' or o.name=='windshield' or o.name=='door' or o.name.startswith('canopy_')]
    for o in keep:
        if panels and o.name in panels:
            pos,tx,ty,k=panels[o.name];o.matrix_world=Matrix.Translation(Vector((pos[0],-pos[2],pos[1])))@Matrix.Rotation(math.pi/2,4,'X')@Matrix.Rotation(ty,4,'Y')@Matrix.Rotation(tx,4,'X')@Matrix.Rotation(math.pi/2,4,'X').inverted()@Matrix.Scale(k,4)
    only(keep+[shell])
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_normals=False,export_animations=False,export_extras=True,export_image_format='NONE')
    b=glb.read_bytes();g=json.loads(b[20:20+struct.unpack_from('<I',b,12)[0]])
    tri=sum(g['accessors'][p['indices']]['count']//3 for m in g['meshes'] for p in m['primitives'])
    anchors={n['name']:{'position':n.get('translation',[0,0,0]),'quaternion':n.get('rotation',[0,0,0,1])} for n in g['nodes'] if 'mesh' not in n}
    stat=dict(ship=key,name=title,file='assets/cockpits/'+key+'.glb',triangles=tri,meshes=len(g['meshes']),materials=len(g['materials']),bytes=len(b),anchors=anchors,baked='assets/cockpits/finish/'+key+'/cockpit.jpg')
    mf=ROOT/'assets'/'cockpits'/'manifest.json';data=json.loads(mf.read_text());data['ships']=[x for x in data['ships'] if x['ship']!=key]+[stat];mf.write_text(json.dumps(data,indent=2)+'\n')
    print('IMPORT cockpit exported',tri,'triangles',len(b),'bytes',sorted(n['name'] for n in g['nodes']))

def build(path,src,title,budget=200000,panels=None,drop=None):
    key=Path(path).stem;args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    stage=args[0] if args else 'all'
    if stage in('prep','all'):prep(src,key,budget,False,drop)
    if stage in('bake','all'):bake(key,args[1] if len(args)>1 else None)
    if stage in('export','all'):export(key,title)
    if stage in('cockpit-prep','all'):prep(src,key,38000,True)
    if stage in('cockpit-bake','all'):bake(key,None,True)
    if stage in('cockpit-export','all'):export_cockpit(key,title,panels)
