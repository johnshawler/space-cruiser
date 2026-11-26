"""Check the solid surfaces at the game's actual service and movement anchors."""
import math
import bpy
from mathutils import Vector
from mathutils.bvhtree import BVHTree

def check_scene(room):
    deps=bpy.context.evaluated_depsgraph_get()
    solids=[]
    for ob in room.items:
        ev=ob.evaluated_get(deps);mesh=ev.to_mesh()
        pts=[ev.matrix_world@v.co for v in mesh.vertices]
        faces=[tuple(f.vertices) for f in mesh.polygons]
        if faces:
            tree=BVHTree.FromPolygons(pts,faces)
            solids.append((ob,tree,[min(p[i] for p in pts) for i in range(3)],
                           [max(p[i] for p in pts) for i in range(3)],pts))
        ev.to_mesh_clear()
    def clear(name,lo,hi,skip=()):
        # Both crossing triangles and small parts wholly inside the test volume count.
        v=[(x,y,z) for z in (lo[2],hi[2]) for y in (lo[1],hi[1]) for x in (lo[0],hi[0])]
        f=[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)]
        box=BVHTree.FromPolygons(v,f)
        for ob,tree,mn,mx,pts in solids:
            if ob['assembly'] in skip or any(mx[i]<=lo[i] or mn[i]>=hi[i] for i in range(3)):continue
            assert not box.overlap(tree) and not any(all(lo[i]<p[i]<hi[i] for i in range(3)) for p in pts),(name,ob.name,mn,mx)
    def height(x,y,top,start):
        hits=[]
        for obj,tree,mn,mx,_ in solids:
            if mn[0]-.001<=x<=mx[0]+.001 and mn[1]-.001<=y<=mx[1]+.001:
                pt,*_=tree.ray_cast(Vector((x,y,start)),Vector((0,0,-1)),40)
                if pt is not None:hits.append(pt.z)
        assert hits and abs(max(hits)-top)<.025,('height',x,y,top,hits)
    for x,y in [(0,0),(.4,0),(1.15,0),(1.9,0)]:height(x,y,1.05,2)
    for x,y in [(-1.55,.85),(3.4,-.7),(0,3.6),(2.35,3.6),(-.4,4),(3.3,3.8)]:height(x,y,0,.4)
    clear('clear counter top',(-2.17,-.385,1.052),(2.17,.385,1.48))
    clear('port plate',(-1.5,-.425,.12),(1.5,-.401,.92))
    # The mandated counter projects .15 m into the keeper's nominal footprint.
    # Check the entire standing envelope against every other piece of room art.
    clear('keeper',(-2.15,.251,.03),(-.95,1.45,2.2),('Counter',))
    clear('signpost',(2.9,-1.2,.025),(3.9,-.2,3.5))
    if room.key=='garage':clear('engine performance',(-2,2.5,.025),(4.5,5.5,3.5))
    if room.key=='cantina':clear('mug performance',(-2,2.5,.025),(4,5,3.5))
    if room.key=='depot':
        for z in [1,2.15,3.3]:
            for x in [-6.025,-4.975,-3.925,-2.875]:
                height(x,.9,z,z+.28)
                clear('goods slot',(x-.40,.50,z+.012),(x+.40,1.30,z+.98))
        clear('door',(3.402,8.02,.025),(5.598,8.38,3.498))
        clear('stock aisle',(3.801,8.21,.025),(5.199,13.19,1.05))
        height(4.5,13.6,1.25,1.6)
        for route in [[(3.6,1.4),(3.4,-1.5),(-4.45,-1.5),(-4.45,-.55)],
                      [(3.6,1.4),(4.5,7.0),(4.5,12.67)],
                      [(-4.45,3.6),(2.8,5.3),(4.3,7),(4.5,9)]]:
            for a,b in zip(route,route[1:]):
                steps=math.ceil(math.dist(a,b)/.16)
                for i in range(steps+1):
                    x,y=[a[j]+(b[j]-a[j])*i/steps for j in range(2)]
                    clear('one-metre route',(x-.5,y-.5,.025),(x+.5,y+.5,1.025))
    print('Verified floor, interaction and prop clearances:',room.title)
