"""Render Blender's evaluated skinned geometry with its packed pigments, microrelief and expression channels."""
from pathlib import Path
import shutil
import argparse,ctypes as C,json,subprocess,sys,time
import bpy,numpy as np
from mathutils import Vector,Matrix
d=Path(__file__).resolve().parent;sys.path.insert(0,str(d))
from humanoid_motion import CAST,FPS,TOTAL,coords,WALK,BODY_END
W,H=960,480
V=C.c_void_p;F=C.c_float;I=C.c_int
lib=C.CDLL(str(d/'preview_gpu.dylib'))
lib.init_gpu.argtypes=[I,I];lib.init_gpu.restype=I
lib.set_actor.argtypes=[I,I,V,V,I,I,V,I,I,V];lib.set_actor.restype=None
lib.frame_gpu.argtypes=[V,V,V,V,V,F,V];lib.frame_gpu.restype=None
def ptr(x):return x.ctypes.data
def floats(a):return np.ascontiguousarray(a,dtype='f')
def get_array(items,field,k,dt='f'):
    out=np.empty((len(items),k),dt);items.foreach_get(field,out.ravel());return out
def existing_img(img):
    w,h=img.size;a=np.empty((h,w,4),'f');img.pixels.foreach_get(a.ravel());return a
def encode_srgb(a):return np.clip(np.where(a<.0031308,12.92*a,1.055*np.maximum(a,0)**(1/2.4)-.055)*255+.5,0,255).astype('u1')
def uv_per_vertex(mesh,name,loop_idx):
    result=np.zeros((len(mesh.vertices),2),'f');layer=mesh.uv_layers.get(name)
    if layer:result[loop_idx]=get_array(layer.data,'uv',2)
    return result
def micro_atlas():
    images=sorted([im for im in bpy.data.images if im.name.startswith('Microrelief / ')],key=lambda im:im.name)
    data=[];ids={}
    for im in images:
        a=existing_img(im)[:,:,0];rows=np.linspace(0,a.shape[0]-1,256).astype(int);cols=np.linspace(0,a.shape[1]-1,256).astype(int)
        data.append(np.clip(a[rows[:,None],cols]*255+.5,0,255).astype('u1'));ids[im.name]=len(data)-1
    return np.ascontiguousarray(data),ids
def gpu_inputs(o,indices,ids):
    mesh=o.data;n=len(mesh.vertices);s=np.zeros((n,27),'f');s[:,:3]=coords(o)
    s[:,3:5]=uv_per_vertex(mesh,'Concept registration',indices)
    w=mesh.attributes.get('Reference weight')
    if w:s[:,5]=get_array(w.data,'value',1)[:,0]
    m=mesh.materials[0];bs=next(b for b in m.node_tree.nodes if b.type=='BSDF_PRINCIPLED')
    s[:,7:10]=m.diffuse_color[:3];s[:,10]=bs.inputs['Roughness'].default_value
    atlas=next((n.image.name for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image and n.image.name.startswith('Microrelief / ')),None)
    s[:,6]=ids.get(atlas,30);s[:,18]=9.
    if ' / floor' in m.name:s[:,6]=90
    elif ' / signal' in m.name:s[:,6]=91
    elif 'basalt' in m.name.lower():s[:,26]=2.
    elif 'stripe' in m.name.lower():s[:,26]=3.
    ap=mesh.attributes.get('Eye aperture')
    if ap:
        s[:,11:13]=get_array(ap.data,'vector',3)[:,:2]
        s[:,13:15]=uv_per_vertex(mesh,'Lid tissue',indices)
        name=o.name.split('.')[0]
        # Decode the actual material driver at the three individual endpoints. This includes eye asymmetry.
        tree=m.node_tree;value={node.label:node for node in tree.nodes if node.type=='VALUE'}
        for j,prop in enumerate(('Happy','Bored','Sad')):
            def at(label,base):
                node=value[label];f=next(f for f in tree.animation_data.drivers if f.data_path==node.outputs[0].path_from_id('default_value'))
                expression=f.driver.expression
                env=dict(happy=float(j==0),bored=float(j==1),sad=float(j==2))
                # These are the simple numeric driver expressions authored in the expression master.
                import re
                terms=re.findall(r'\(([-+0-9.eE]+)\*(happy|sad|bored)\)',expression)
                return base+sum(float(v)*env[k] for v,k in terms)
            s[:,15+j]=at('Upper lid',1.1);s[:,19+j]=at('Lower lid',-1.1)
            if j==2:s[:,18]=at('Upper tilt',0.)
            if j==1:s[:,22]=at('Upper tilt',0.)
        color=next((x.inputs[1].default_value[:3] for x in tree.nodes if x.label=='Local skin tone'),m.diffuse_color[:3]);s[:,23:26]=color
    return s
def ortho(w,h,near,far):
    return np.array([[2/w,0,0,0],[0,2/h,0,0],[0,0,-2/(far-near),-(far+near)/(far-near)],[0,0,0,1.]])
def camera_matrix(cam):
    width=cam.data.ortho_scale
    return floats((ortho(width,width*H/W,.01,35)@np.asarray(cam.matrix_world.inverted())).T)
def shadow_matrix(at,h):
    direction=Vector((-.543,-.472,.694)).normalized();rot=(-direction).to_track_quat('-Z','Y').to_matrix().to_4x4()
    rot.translation=Vector(at)+direction*(h*3.)
    return floats((ortho(2.70*h,2.70*h,.01,h*7.)@np.asarray(rot.inverted())).T)
def run_scene(name,out,maps,ids,pilot):
    sc=bpy.data.scenes[name];bpy.context.window.scene=sc;sc.frame_set(1)
    rig=bpy.data.objects[name+' | Rig'];graph=bpy.context.evaluated_depsgraph_get()
    character=bpy.data.collections[name+' | character']
    objects=[o for o in character.objects if o.type=='MESH']+[o for o in bpy.data.collections[name+' | motion stage'].objects if o.type=='MESH']
    h=max(coords(o)[:,2].max() for o in character.objects if o.type=='MESH');parts=[];tri=[];offset=0;spans=[]
    for ob in objects:
        me=ob.data;me.calc_loop_triangles()
        ix=get_array(me.loops,'vertex_index',1,'i').ravel()
        parts.append(gpu_inputs(ob,ix,ids));tri.append(get_array(me.loop_triangles,'vertices',3,'i')+offset)
        spans.append(slice(offset,offset+len(me.vertices)));offset+=len(me.vertices)
    stat=np.ascontiguousarray(np.concatenate(parts));tri=np.ascontiguousarray(np.concatenate(tri),dtype=np.uint32)
    im=bpy.data.images[name+' / proof pigmentation'];pixels=existing_img(im)[:,:,:3]
    tex=np.ascontiguousarray(encode_srgb(pixels) if im.is_float else (np.clip(pixels,0,1)*255+.5).astype('u1'))
    lib.set_actor(offset,tri.size,ptr(stat),ptr(tri),tex.shape[1],tex.shape[0],ptr(tex),maps.shape[1],maps.shape[0],ptr(maps))
    dyn=np.empty((offset,6),'f');raw=np.empty((H,W,3),'u1')
    # Allocations are reused across frames; primitive topology, UVs and pigment never change.
    pos=[np.empty((sl.stop-sl.start,3),'f') for sl in spans];norm=[np.empty_like(p) for p in pos]
    proc=None
    if not pilot:
        proc=subprocess.Popen([shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg','-v','error','-y','-f','rawvideo','-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),'-i','-','-vf','vflip','-c:v','libx264','-threads','3','-preset','veryfast','-crf','14','-pix_fmt','yuv420p','-movflags','+faststart',str(out/(name+'.mp4'))],stdin=subprocess.PIPE)
    frames=([1,9,19,29,118,144,180,205,233,270,320] if pilot else range(1,TOTAL+1))
    start=time.monotonic()
    for f in frames:
        sc.frame_set(f)
        for ob,sl,a,b in zip(objects,spans,pos,norm):
            if ob.hide_render:
                dyn[sl,:3]=1000.;dyn[sl,3:]=0.;continue
            e=ob.evaluated_get(graph);e.data.vertices.foreach_get('co',a.ravel());e.data.vertices.foreach_get('normal',b.ravel())
            dyn[sl,:3]=a;dyn[sl,3:]=b
            if ob.parent and ob.parent.type=='EMPTY':dyn[sl,:3]+=np.asarray(e.matrix_world.translation,dtype='f')
        cam=sc.camera;vp=camera_matrix(cam);eye=floats(cam.matrix_world.to_quaternion()@Vector((0,0,1)))
        root=rig.pose.bones['Root'].head;at=(root.x,root.y,.45*h)
        lp=shadow_matrix(at,h)
        moods=floats([rig.pose.bones['Expression'][k] for k in ('Happy','Bored','Sad')])
        lib.frame_gpu(ptr(dyn),ptr(vp),ptr(lp),ptr(eye),ptr(moods),float(h),ptr(raw))
        if pilot:
            path=out/(name+'-'+str(f)+'.ppm')
            with path.open('wb') as file:file.write(f'P6\n{W} {H}\n255\n'.encode()+raw[::-1].tobytes())
        else:proc.stdin.write(raw.tobytes())
        if not pilot and f%96==0:print('FRAME',name,f,round(time.monotonic()-start,1),flush=True)
    if proc:
        proc.stdin.close()
        if proc.wait():raise RuntimeError('Encoder failed for '+name)
    print('RENDERED MOTION',name,round(time.monotonic()-start,1),flush=True)
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--dir',required=True,type=Path);ap.add_argument('--only',nargs='*');ap.add_argument('--pilot',action='store_true')
    args=ap.parse_args(sys.argv[sys.argv.index('--')+1:]);args.dir.mkdir(parents=True,exist_ok=True)
    result=lib.init_gpu(W,H)
    if result:raise RuntimeError(f'OpenGL setup failed ({result})')
    maps,ids=micro_atlas()
    for name in (args.only or CAST):run_scene(name,args.dir,maps,ids,args.pilot)
if __name__=='__main__':main()
