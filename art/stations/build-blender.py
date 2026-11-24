"""Build each station as an editable Blender scene from the architecture recipes.
From the repo root run node art/stations/write-recipes.mjs first, then
blender -b --python art/stations/build-blender.py -- <repo-root>.
The interactive Blender entry point is build_all(repo_root).
"""
import json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector, Matrix, Euler

def rgba(color):
    rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    return tuple((v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4) for v in rgb)+(1.,)

def geometry(p):
    # Construct in Three.js local axes; the object matrix below converts to Blender Z-up.
    kind=p['kind']; verts=[]; faces=[]
    if kind=='box':
        w,h,d=[x/2 for x in p['size']]
        verts=[(-w,-h,-d),(w,-h,-d),(w,h,-d),(-w,h,-d),(-w,-h,d),(w,-h,d),(w,h,d),(-w,h,d)]
        faces=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]
    elif kind in ('cylinder','beam'):
        n=p['segments']; h=(Vector(p['end'])-Vector(p['pos'])).length if kind=='beam' else p['height']
        for y,r in [(-h/2,p['radius']),(h/2,p['top'])]:
            for j in range(n):
                a=math.tau*j/n;verts.append((r*math.cos(a),y,r*math.sin(a)))
        for j in range(n): k=(j+1)%n;faces.append((j,n+j,n+k,k))
        faces.extend([tuple(range(n)),tuple(reversed(range(n,2*n)))])
    elif kind=='torus':
        for i in range(40):
            a=math.tau*i/40
            for j in range(8):
                b=math.tau*j/8;r=p['radius']+p['minor']*math.cos(b);verts.append((r*math.cos(a),r*math.sin(a),p['minor']*math.sin(b)))
        for i in range(40):
            for j in range(8): faces.append((i*8+j,(i+1)%40*8+j,(i+1)%40*8+(j+1)%8,i*8+(j+1)%8))
    elif kind=='rock':
        g=(1+math.sqrt(5))/2
        vv=[(-1,g,0),(1,g,0),(-1,-g,0),(1,-g,0),(0,-1,g),(0,1,g),(0,-1,-g),(0,1,-g),(g,0,-1),(g,0,1),(-g,0,-1),(-g,0,1)]
        verts=[tuple(Vector(v).normalized()) for v in vv]
        faces=[(0,11,5),(0,5,1),(0,1,7),(0,7,10),(0,10,11),(1,5,9),(5,11,4),(11,10,2),(10,7,6),(7,1,8),(3,9,4),(3,4,2),(3,2,6),(3,6,8),(3,8,9),(4,9,5),(2,4,11),(6,2,10),(8,6,7),(9,8,1)]
    else:
        dome=kind=='dome';n=24;bands=12 if dome else 16;verts=[(0,1,0)];limit=math.pi/2 if dome else math.pi
        end=bands+1 if dome else bands
        for j in range(1,end):
            b=limit*j/bands
            for i in range(n):
                a=math.tau*i/n;verts.append((math.cos(a)*math.sin(b),math.cos(b),math.sin(a)*math.sin(b)))
        for i in range(n): faces.append((0,1+(i+1)%n,1+i))
        rows=end-1
        for j in range(rows-1):
            for i in range(n):a=1+j*n+i;b=1+j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
        if not dome:
            endidx=len(verts);verts.append((0,-1,0))
            for i in range(n):faces.append((1+(rows-1)*n+i,1+(rows-1)*n+(i+1)%n,endidx))
    return verts,faces

def build_all(root):
    root=Path(root); data=json.loads((root/'art/stations/recipes.json').read_text())
    dest=root/'assets/stations/blender';dest.mkdir(parents=True,exist_ok=True)
    conversion=Matrix.Rotation(math.pi/2,4,'X')
    for item in data:
        sc=bpy.data.scenes.new(item['name']);collection=bpy.data.collections.new('Architecture');sc.collection.children.link(collection);materials={};created=[];meshes=[]
        for p in item['parts']:
            verts,faces=geometry(p);mesh=bpy.data.meshes.new(p['name']);mesh.from_pydata(verts,[],faces);mesh.update();meshes.append(mesh)
            obj=bpy.data.objects.new(p['name'],mesh);collection.objects.link(obj);created.append(obj)
            pos=Vector(p['pos']);size=(1,1,1) if p['kind']=='box' else p['size'];rot=Euler(p['rotation'],'ZYX').to_matrix().to_4x4()
            if p['kind']=='beam':
                d=Vector(p['end'])-pos;pos+=d*.5;rot=Vector((0,1,0)).rotation_difference(d.normalized()).to_matrix().to_4x4()
            obj.matrix_world=conversion@Matrix.Translation(pos)@rot@Matrix.Diagonal((*size,1))
            if p['kind'] in ('torus','sphere','dome'):
                for face in mesh.polygons:face.use_smooth=True
            if p['kind']=='box':
                mod=obj.modifiers.new('Machined edges','BEVEL');mod.width=min(.034,min(size if p['kind']!='box' else p['size'])*.13);mod.segments=2
                norm=obj.modifiers.new('Panel normals','WEIGHTED_NORMAL')
            col=p['color']
            if col not in materials:
                mat=bpy.data.materials.new('Finish '+col);mat.diffuse_color=rgba(col);mat.use_nodes=True;bs=mat.node_tree.nodes.get('Principled BSDF')
                bs.inputs['Base Color'].default_value=rgba(col);bs.inputs['Metallic'].default_value=.21;bs.inputs['Roughness'].default_value=.55;materials[col]=mat
            obj.data.materials.append(materials[col])
        sc['station_key']=item['id'];sc['inspiration']=item['inspiration'];sc['purpose']=item['habit'];sc.unit_settings.system='METRIC'
        cam=bpy.data.cameras.new('Station camera');cam.type='ORTHO';cam.ortho_scale=7.7;camera=bpy.data.objects.new('Station camera',cam);sc.collection.objects.link(camera);sc.camera=camera;camera.location=(5,-8,5.5);camera.rotation_euler=(Vector((0,0,.7))-camera.location).to_track_quat('-Z','Y').to_euler();created.append(camera)
        lamps=[]
        for name,xyz,power,size in [('Softbox',(-4,-5,7),750,5),('Fill',(3,-1,4),480,4),('Rim',(0,4,5),600,3)]:
            light=bpy.data.lights.new(name,'AREA');light.energy=power;light.shape='DISK';light.size=size;o=bpy.data.objects.new(name,light);sc.collection.objects.link(o);o.location=xyz;o.rotation_euler=(Vector((0,0,.6))-o.location).to_track_quat('-Z','Y').to_euler();created.append(o);lamps.append(light)
        sc.render.engine='CYCLES';sc.cycles.samples=16;sc.render.resolution_x=960;sc.render.resolution_y=720;sc.render.resolution_percentage=100
        out=dest/(item['id']+'.blend');bpy.data.libraries.write(str(out),{sc},fake_user=True,compress=True)
        bpy.data.scenes.remove(sc)
        for ob in created:bpy.data.objects.remove(ob,do_unlink=True)
        bpy.data.collections.remove(collection)
        for mesh in meshes:bpy.data.meshes.remove(mesh)
        for mat in materials.values():bpy.data.materials.remove(mat)
        for lamp in lamps:bpy.data.lights.remove(lamp)
        bpy.data.cameras.remove(cam)
        with bpy.data.libraries.load(str(out)) as (library,target):
            assert len(library.meshes)==len(item['parts']) and library.scenes, item['id']
    return len(data)
if __name__=='__main__' and '--' in sys.argv: build_all(sys.argv[sys.argv.index('--')+1])
