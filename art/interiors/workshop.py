"""Shared fabrication tools. Coordinates are Blender metres (right, back, up)."""
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from finish import make_material, prepare_finish, render_views, write_metrics

def rgb(code):
    value = tuple(int(code.lstrip('#')[i:i+2], 16) / 255 for i in (0, 2, 4))
    return tuple(v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in value)

class Room:
    def __init__(self, script, title, palette):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        self.file = Path(script).resolve()
        self.root = self.file.parents[3]
        self.key = self.file.stem
        self.title = title
        self.place = self.file.parent.name
        self.materials = {key: make_material(key, *spec) for key, spec in palette.items()}
        self.part = 'Shell'
        self.cut = False
        self.items = []
        self.markers = []
        self.coll = bpy.context.scene.collection
        self.shelf = None
        self.groups = {}
        self.back = 8.2 if self.key == 'depot' else 7.15

    def section(self, name, cut=False):
        self.part, self.cut = name, cut

    def put(self, obj, mat, name=None):
        obj.name = name or self.part
        obj.data.materials.append(self.materials[mat])
        obj['assembly'] = self.part
        if self.cut:
            obj['overview_cut'] = True
        self.items.append(obj)
        return obj

    def box(self, pos, size, mat, bevel=.06, rot=None, name=None):
        bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
        ob = bpy.context.object
        for v in ob.data.vertices:
            for i in range(3):
                v.co[i] *= size[i]
        if rot:
            ob.rotation_euler = rot
        if bevel:
            mod = ob.modifiers.new('Rounded edges', 'BEVEL')
            mod.width = min(bevel, min(size) * .44)
            mod.segments = 3
            mod.harden_normals = True
            ob.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
        return self.put(ob, mat, name)

    def mesh(self, verts, faces, mat, name=None, smooth=False):
        data = bpy.data.meshes.new(name or self.part)
        data.from_pydata(verts, [], faces)
        data.update()
        ob = bpy.data.objects.new(name or self.part, data)
        self.coll.objects.link(ob)
        if smooth:
            for p in data.polygons:
                p.use_smooth = True
        return self.put(ob, mat, name)

    def quad(self, a, b, c, d, mat, name=None):
        """Bilinear patch. Adjacent vertices are at most half a metre apart."""
        a,b,c,d = map(Vector, (a,b,c,d))
        nx = max(1, math.ceil(max((a-b).length,(c-d).length)*2))
        ny = max(1, math.ceil(max((a-d).length,(b-c).length)*2))
        verts = [tuple(a.lerp(b,i/nx).lerp(d.lerp(c,i/nx),j/ny))
                 for j in range(ny+1) for i in range(nx+1)]
        faces = []
        for j in range(ny):
            for i in range(nx):
                k = j*(nx+1)+i
                faces.append((k,k+1,k+nx+2,k+nx+1))
        return self.mesh(verts,faces,mat,name)

    def back_panel(self, x0,x1,h0,h1, y, mat):
        return self.quad((x0,y,h0),(x1,y,h0),(x1,y,h1),(x0,y,h1),mat)

    def side(self, x, y0,y1,h0,h1, mat):
        points=[(x,y0,h0),(x,y1,h0),(x,y1,h1),(x,y0,h1)]
        if x>0: points.reverse()
        return self.quad(*points,mat)

    def floor(self, mat, trim):
        for start,end,cut in [(-17,-3.4,True),(-3.4,self.back,False)]:
            self.section('Floor extension' if cut else 'Floor',cut)
            self.quad((-9.6,start,0),(9.6,start,0),(9.6,end,0),(-9.6,end,0),mat)
        self.section('Section edge')
        self.box((0,-3.4,-.15),(19.2,.13,.3),trim,.04)

    def ball(self,pos,scale,mat,rot=None):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=8,radius=1,location=pos)
        o=bpy.context.object
        o.scale=scale
        if rot: o.rotation_euler=rot
        for p in o.data.polygons: p.use_smooth=True
        return self.put(o,mat)

    def rod(self,a,b,r,mat,r2=None,n=16):
        a,b=Vector(a),Vector(b)
        bpy.ops.mesh.primitive_cone_add(vertices=n,radius1=r,radius2=r if r2 is None else r2,
                                       depth=(b-a).length,location=(a+b)*.5)
        o=bpy.context.object
        o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
        for p in o.data.polygons:
            p.use_smooth=len(p.vertices)==4
        return self.put(o,mat)

    def wire(self, pts, radius, mat, smooth=True):
        cu=bpy.data.curves.new(self.part,'CURVE')
        cu.dimensions='3D'
        cu.resolution_u=6
        cu.bevel_depth=radius
        cu.bevel_resolution=2
        cu.use_fill_caps=True
        if smooth:
            sp=cu.splines.new('BEZIER'); sp.bezier_points.add(len(pts)-1)
            for p,co in zip(sp.bezier_points,pts):
                p.co=co
                p.handle_left_type=p.handle_right_type='AUTO'
        else:
            sp=cu.splines.new('POLY'); sp.points.add(len(pts)-1)
            for p,co in zip(sp.points,pts): p.co=(*co,1)
        obj=bpy.data.objects.new(self.part,cu); self.coll.objects.link(obj)
        return self.put(obj,mat)

    def disc(self,x,y,h,r,depth,mat,n=48):
        return self.rod((x,y+depth/2,h),(x,y-depth/2,h),r,mat,n=n)

    def ring(self,x,y,h,r,t,mat):
        bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=8,location=(x,y,h),
                                        rotation=(math.pi/2,0,0),major_radius=r,minor_radius=t)
        return self.put(bpy.context.object,mat)

    def label(self,text,pos,height,mat,align='CENTER'):
        cu=bpy.data.curves.new(text,'FONT'); cu.body=text
        cu.align_x=align; cu.align_y='CENTER'; cu.size=1
        cu.extrude=.008; cu.resolution_u=3
        o=bpy.data.objects.new(text,cu); self.coll.objects.link(o)
        o.location=pos; o.rotation_euler.x=math.pi/2
        bpy.context.view_layer.update()
        # Font metrics differ between lowercase and capitals.
        local_height=max(v[1] for v in o.bound_box)-min(v[1] for v in o.bound_box)
        o.scale=(height/max(.01,local_height),)*3
        return self.put(o,mat,text)

    def counter(self,body,top,panel,edge):
        self.section('Counter')
        self.box((0,0,.525),(4.36,.76,.99),body,.11)
        self.box((0,0,.999),(4.4,.8,.102),top,.018,name='Flat counter top')
        self.box((0,-.385,.52),(3.10,.03,.82),panel,.006,name='Port plate mounting face')
        for x in [-1.99,1.99]:
            self.box((x,-.375,.52),(.14,.04,.72),edge,.02)
        self.box((0,0,.065),(4.18,.72,.13),edge,.03)

    def marker(self,name,pos,color,intensity,distance):
        o=bpy.data.objects.new('light_'+name,None); self.coll.objects.link(o); o.location=pos
        o.empty_display_type='SPHERE'; o.empty_display_size=.18
        o['color']=color; o['intensity']=intensity; o['distance']=distance
        self.markers.append(o)
        return o

    def end(self):
        from verification import check_scene
        bpy.context.view_layer.update()
        check_scene(self)
        scene=bpy.context.scene
        scene.render.engine='CYCLES'
        scene.cycles.device='CPU'
        scene.cycles.samples=16
        scene.cycles.use_denoising=True
        scene.cycles.max_bounces=6
        scene.cycles.volume_bounces=1
        if self.key=='depot':
            self.shelf=bpy.data.objects.new('shelf',None); self.coll.objects.link(self.shelf)
            self.shelf.location=(-4.45,.9,0);bpy.context.view_layer.update()
            for obj in self.items:
                if obj['assembly']=='Goods shelf':
                    obj.parent=self.shelf;obj.matrix_parent_inverse=self.shelf.matrix_world.inverted()
        prepare_finish(self)
        scene.render.resolution_x=1152; scene.render.resolution_y=720; scene.render.resolution_percentage=100
        bpy.context.preferences.filepaths.save_version=0
        bpy.ops.wm.save_as_mainfile(filepath=str(self.file.with_suffix('.blend')),compress=True)
        render_views(self)
        self.export()

    def export(self):
        # Keep separate editable parts in the .blend. For runtime, batch by assembly
        # and finish so a live emissive or glass surface never gets baked with a wall.
        deps=bpy.context.evaluated_depsgraph_get()
        batches={}
        shelf_objects=[]
        for ob in self.items:
            target=ob.evaluated_get(deps)
            mesh=bpy.data.meshes.new_from_object(target,depsgraph=deps)
            mesh.transform(ob.matrix_world)
            # Metre-scale planar UVs also cover lettering and curved primitives.
            uv=mesh.uv_layers.active or mesh.uv_layers.new(name='Surface')
            for p in mesh.polygons:
                axis=max(range(3),key=lambda i:abs(p.normal[i]))
                axes=((1,2),(0,2),(0,1))[axis]
                for li in p.loop_indices:
                    v=mesh.vertices[mesh.loops[li].vertex_index].co
                    uv.data[li].uv=(v[axes[0]]*.55,v[axes[1]]*.55)
            copy=bpy.data.objects.new('Export part',mesh); self.coll.objects.link(copy)
            mat=ob.data.materials[0]
            group=ob['assembly']
            batches.setdefault((group,mat.name),[]).append(copy)
        export=[]
        for (group,material),parts in batches.items():
            bpy.ops.object.select_all(action='DESELECT')
            for o in parts:o.select_set(True)
            bpy.context.view_layer.objects.active=parts[0]
            if len(parts)>1:bpy.ops.object.join()
            item=parts[0]; item.name=group+' - '+material
            if group=='Goods shelf':shelf_objects.append(item)
            export.append(item)
        if shelf_objects:
            shelf=self.shelf
            shelf.location=(-4.45,.9,0)
            bpy.context.view_layer.update()
            for item in shelf_objects:
                item.parent=shelf; item.matrix_parent_inverse=shelf.matrix_world.inverted()
            export.append(shelf)
        bpy.ops.object.select_all(action='DESELECT')
        for obj in export+self.markers:obj.select_set(True)
        directory=self.root/'assets/interiors'/self.place
        directory.mkdir(parents=True,exist_ok=True)
        path=directory/(self.key+'.glb')
        bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,
            export_extras=True,export_yup=True,export_texcoords=True,export_tangents=False,
            export_animations=False,export_cameras=False,export_lights=False)
        write_metrics(self,path)
