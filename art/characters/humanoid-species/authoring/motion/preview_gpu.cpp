// Offscreen rasterization of the evaluated Blender meshes. OpenGL 4.1 on Apple's Metal driver.
#include <OpenGL/OpenGL.h>
#include <OpenGL/gl3.h>
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <algorithm>
#include <cmath>
#include <cstring>
static CGLContextObj ctx,previous;
static GLuint mainProgram,shadowProgram,vao,positions,attributes,indices,pigment,micro,shadowTex,shadowFbo,msFbo,resolveFbo,frameTex;
static int W,H,N,I;
static const char* vert=R"GLSL(#version 330 core
layout(location=0) in vec3 position;layout(location=1) in vec3 normal;
layout(location=2) in vec3 rest;layout(location=3) in vec4 tex;layout(location=4) in vec4 base;
layout(location=5) in vec4 eye;layout(location=6) in vec4 upper;layout(location=7) in vec4 lower;layout(location=8) in vec4 skin;
uniform mat4 vp;uniform mat4 lp;
out vec3 P;out vec3 N;out vec3 R;out vec4 T;out vec4 B;out vec4 E;out vec4 U;out vec4 D;out vec4 K;out vec4 L;
void main(){P=position;N=normal;R=rest;T=tex;B=base;E=eye;U=upper;D=lower;K=skin;L=lp*vec4(position,1);gl_Position=vp*vec4(position,1);}
)GLSL";
static const char* frag=R"GLSL(#version 330 core
in vec3 P,N,R;in vec4 T,B,E,U,D,K,L;out vec4 color;
uniform sampler2D pigment;uniform sampler2DArray relief;uniform sampler2D depthTex;
uniform vec3 eyeDir;uniform vec3 moods;uniform float height;uniform vec2 viewport;
const vec3 light=vec3(-.543,-.472,.694);
float shadow(vec3 n){
 vec3 s=L.xyz/L.w*.5+.5;if(any(lessThan(s,vec3(.001)))||any(greaterThan(s,vec3(.999))))return 1.;
 float bias=.00028+.00090*(1.-max(0.,dot(n,light)));float occ=0.;
 const vec2 taps[8]=vec2[8](vec2(.54,.32),vec2(-.36,.79),vec2(-.84,-.22),vec2(.38,-.86),vec2(.80,-.29),vec2(-.12,-.42),vec2(-.69,.35),vec2(.1,.89));
 for(int k=0;k<8;k++){float z=texture(depthTex,s.xy+taps[k]*.0028).r;occ+=smoothstep(.0,.0019,s.z-bias-z);}
 return 1.-occ/8.;
}
float lineWidth(float x,float width){float f=abs(fract(x+.5)-.5);return 1.-smoothstep(width,width+max(.001,fwidth(x)),f);}
vec3 srgb(vec3 c){return mix(12.92*c,1.055*pow(max(c,0.),vec3(1./2.4))-.055,step(vec3(.0031308),c));}
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
 float code=floor(T.w+.5);vec3 n=normalize(N);if(dot(n,eyeDir)<0.)n=-n;
 if(code==90.){
   vec2 f=P.xy/height;float grid=max(lineWidth(f.x*1.7,.0017),lineWidth(f.y*1.7,.0027));
   float track=1.-smoothstep(.002,.004,abs(abs(f.x)-.36));float tick=lineWidth(f.y*3.4,.015)*(1.-smoothstep(.020,.026,abs(abs(f.x)-.36)));
   vec3 ground=mix(vec3(.70,.719,.687),vec3(.55,.579,.55),grid*.45);
   ground=mix(ground,vec3(.53,.53,.43),.42*track+.5*tick);
   float shade=shadow(vec3(0,0,1));ground*=.79+.21*shade;
   float farFade=smoothstep(1.8,5.,abs(P.x)/height);ground=mix(ground,vec3(.788,.794,.756),farFade);
   color=vec4(ground,1);return;
 }
 vec3 sampleColor=texture(pigment,T.xy).rgb;
 vec3 base=B.rgb;
 float grain=.5;
 if(code>=0. && code<20.){
   vec3 w=pow(abs(normalize(N)),vec3(3));w/=max(.001,w.x+w.y+w.z);
   vec3 uv=R*(code==1.||code==3.?6.8:4.5);
   grain=texture(relief,vec3(uv.yz,code)).r*w.x+texture(relief,vec3(uv.xz,code)).r*w.y+texture(relief,vec3(uv.xy,code)).r*w.z;
   base*=.69+.68*grain;
 }
 if(K.a==2.)base=mix(base,vec3(.105,.057,.027),smoothstep(.36,.69,grain)*.42);
 if(K.a==3.)base*=.81+.26*sin(84.*R.x+5.*sin(14.*R.z));
 vec3 albedo=mix(base,sampleColor,clamp(T.z,0.,1.));float rough=B.a;
 if(U.w!=9.){
    float total=max(1.,moods.x+moods.y+moods.z);vec3 wt=moods/total;
    float top=1.1+dot(wt,U.xyz-vec3(1.1))+E.x*(wt.y*D.w+wt.z*U.w-wt.x*.025);
    float bottom=-1.1+dot(wt,D.xyz+vec3(1.1))+E.x*(wt.x*.03+wt.y*.04+wt.z*U.w*.24);
    float coverage=smoothstep(-.025,.025,max(E.y-top,bottom-E.y));
    vec3 lid=mix(K.rgb,texture(pigment,E.zw).rgb,.78);
    albedo=mix(albedo,lid,coverage);rough=mix(rough,.69,coverage);
 }
 float sh=shadow(n);float diff=max(0.,dot(n,light));float fill=max(0.,dot(n,normalize(vec3(.65,-.64,.42))));
 float rim=max(0.,dot(n,normalize(vec3(.42,.78,.66))))*pow(1.-max(0.,dot(n,eyeDir)),2.);
 vec3 illumination=vec3(.38,.40,.43)+vec3(1.11,.99,.84)*diff*(.38+.62*sh)+vec3(.34,.39,.44)*fill+vec3(.34,.27,.16)*rim;
 vec3 h=normalize(eyeDir+light);float spec=pow(max(0.,dot(n,h)),mix(110.,12.,rough))*(1.-.78*rough)*.28*sh;
 vec3 linear=albedo*illumination+vec3(spec)*(.20+.75*albedo);
 if(code==91.)linear+=base*.72;
 color=vec4(srgb(film(linear)),1.);
}
)GLSL";
static void check(GLuint obj,bool prog){
 int ok=0; if(prog)glGetProgramiv(obj,GL_LINK_STATUS,&ok);else glGetShaderiv(obj,GL_COMPILE_STATUS,&ok);
 if(!ok){char msg[6000];if(prog)glGetProgramInfoLog(obj,sizeof(msg),nullptr,msg);else glGetShaderInfoLog(obj,sizeof(msg),nullptr,msg);fprintf(stderr,"Shader: %s\n",msg);abort();}
}
static GLuint program(const char*vs,const char*fs){
 GLuint v=glCreateShader(GL_VERTEX_SHADER),f=glCreateShader(GL_FRAGMENT_SHADER);glShaderSource(v,1,&vs,nullptr);glCompileShader(v);check(v,0);
 glShaderSource(f,1,&fs,nullptr);glCompileShader(f);check(f,0);GLuint p=glCreateProgram();glAttachShader(p,v);glAttachShader(p,f);glLinkProgram(p);check(p,1);glDeleteShader(v);glDeleteShader(f);return p;
}
static void bind(){previous=CGLGetCurrentContext();CGLSetCurrentContext(ctx);}
static void release(){CGLSetCurrentContext(previous);}
static void textureparams(GLenum target,GLint wrap){glTexParameteri(target,GL_TEXTURE_MIN_FILTER,GL_LINEAR);glTexParameteri(target,GL_TEXTURE_MAG_FILTER,GL_LINEAR);glTexParameteri(target,GL_TEXTURE_WRAP_S,wrap);glTexParameteri(target,GL_TEXTURE_WRAP_T,wrap);}
extern "C" int init_gpu(int width,int height){
 W=width;H=height;CGLPixelFormatAttribute a[]={kCGLPFAOpenGLProfile,(CGLPixelFormatAttribute)kCGLOGLPVersion_3_2_Core,kCGLPFAAccelerated,(CGLPixelFormatAttribute)0};
 CGLPixelFormatObj pf=nullptr;GLint count=0;if(CGLChoosePixelFormat(a,&pf,&count)||!pf)return 1;if(CGLCreateContext(pf,nullptr,&ctx))return 2;CGLDestroyPixelFormat(pf);bind();
 mainProgram=program(vert,frag);
 shadowProgram=program("#version 330 core\nlayout(location=0)in vec3 p;uniform mat4 vp;void main(){gl_Position=vp*vec4(p,1);}","#version 330 core\nvoid main(){}");
 glGenVertexArrays(1,&vao);glBindVertexArray(vao);glGenBuffers(1,&positions);glGenBuffers(1,&attributes);glGenBuffers(1,&indices);
 glGenTextures(1,&pigment);glGenTextures(1,&micro);glGenTextures(1,&shadowTex);glBindTexture(GL_TEXTURE_2D,shadowTex);
 glTexImage2D(GL_TEXTURE_2D,0,GL_DEPTH_COMPONENT24,1024,1024,0,GL_DEPTH_COMPONENT,GL_UNSIGNED_INT,nullptr);textureparams(GL_TEXTURE_2D,GL_CLAMP_TO_EDGE);
 glGenFramebuffers(1,&shadowFbo);glBindFramebuffer(GL_FRAMEBUFFER,shadowFbo);glFramebufferTexture2D(GL_FRAMEBUFFER,GL_DEPTH_ATTACHMENT,GL_TEXTURE_2D,shadowTex,0);glDrawBuffer(GL_NONE);glReadBuffer(GL_NONE);
 glGenFramebuffers(1,&msFbo);glBindFramebuffer(GL_FRAMEBUFFER,msFbo);GLuint ms[2];glGenRenderbuffers(2,ms);
 glBindRenderbuffer(GL_RENDERBUFFER,ms[0]);glRenderbufferStorageMultisample(GL_RENDERBUFFER,4,GL_RGBA8,W,H);glFramebufferRenderbuffer(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_RENDERBUFFER,ms[0]);
 glBindRenderbuffer(GL_RENDERBUFFER,ms[1]);glRenderbufferStorageMultisample(GL_RENDERBUFFER,4,GL_DEPTH_COMPONENT24,W,H);glFramebufferRenderbuffer(GL_FRAMEBUFFER,GL_DEPTH_ATTACHMENT,GL_RENDERBUFFER,ms[1]);
 if(glCheckFramebufferStatus(GL_FRAMEBUFFER)!=GL_FRAMEBUFFER_COMPLETE)return 3;
 glGenFramebuffers(1,&resolveFbo);glBindFramebuffer(GL_FRAMEBUFFER,resolveFbo);glGenTextures(1,&frameTex);glBindTexture(GL_TEXTURE_2D,frameTex);
 glTexImage2D(GL_TEXTURE_2D,0,GL_RGBA8,W,H,0,GL_RGBA,GL_UNSIGNED_BYTE,nullptr);glFramebufferTexture2D(GL_FRAMEBUFFER,GL_COLOR_ATTACHMENT0,GL_TEXTURE_2D,frameTex,0);
 glEnable(GL_DEPTH_TEST);glEnable(GL_MULTISAMPLE);glPixelStorei(GL_PACK_ALIGNMENT,1);glPixelStorei(GL_UNPACK_ALIGNMENT,1);
 release();return 0;
}
extern "C" void set_actor(int vertices,int count,float*stat,unsigned*idx,int tw,int th,unsigned char*tex,int msize,int layers,unsigned char*maps){
 bind();N=vertices;I=count;glBindVertexArray(vao);glBindBuffer(GL_ARRAY_BUFFER,positions);glBufferData(GL_ARRAY_BUFFER,N*6*4,nullptr,GL_STREAM_DRAW);
 for(int i=0;i<2;i++){glEnableVertexAttribArray(i);glVertexAttribPointer(i,3,GL_FLOAT,GL_FALSE,24,(void*)(long)(12*i));}
 glBindBuffer(GL_ARRAY_BUFFER,attributes);glBufferData(GL_ARRAY_BUFFER,N*27*4,stat,GL_STATIC_DRAW);
 int off=0;for(int i=2;i<=8;i++){int size=i==2?3:4;glEnableVertexAttribArray(i);glVertexAttribPointer(i,size,GL_FLOAT,GL_FALSE,108,(void*)(long)(4*off));off+=size;}
 glBindBuffer(GL_ELEMENT_ARRAY_BUFFER,indices);glBufferData(GL_ELEMENT_ARRAY_BUFFER,I*4,idx,GL_STATIC_DRAW);
 glActiveTexture(GL_TEXTURE0);glBindTexture(GL_TEXTURE_2D,pigment);glTexImage2D(GL_TEXTURE_2D,0,GL_SRGB8,tw,th,0,GL_RGB,GL_UNSIGNED_BYTE,tex);textureparams(GL_TEXTURE_2D,GL_CLAMP_TO_EDGE);glGenerateMipmap(GL_TEXTURE_2D);glTexParameteri(GL_TEXTURE_2D,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);
 glActiveTexture(GL_TEXTURE1);glBindTexture(GL_TEXTURE_2D_ARRAY,micro);glTexImage3D(GL_TEXTURE_2D_ARRAY,0,GL_R8,msize,msize,layers,0,GL_RED,GL_UNSIGNED_BYTE,maps);
 textureparams(GL_TEXTURE_2D_ARRAY,GL_REPEAT);glGenerateMipmap(GL_TEXTURE_2D_ARRAY);glTexParameteri(GL_TEXTURE_2D_ARRAY,GL_TEXTURE_MIN_FILTER,GL_LINEAR_MIPMAP_LINEAR);release();
}
extern "C" void frame_gpu(float*dyn,float*view,float*lamp,float*dir,float*moods,float h,unsigned char*out){
 bind();glBindVertexArray(vao);glBindBuffer(GL_ARRAY_BUFFER,positions);glBufferData(GL_ARRAY_BUFFER,N*6*4,dyn,GL_STREAM_DRAW);
 glBindFramebuffer(GL_FRAMEBUFFER,shadowFbo);glViewport(0,0,1024,1024);glClear(GL_DEPTH_BUFFER_BIT);glUseProgram(shadowProgram);
 glUniformMatrix4fv(glGetUniformLocation(shadowProgram,"vp"),1,GL_FALSE,lamp);glDrawElements(GL_TRIANGLES,I,GL_UNSIGNED_INT,nullptr);
 glBindFramebuffer(GL_FRAMEBUFFER,msFbo);glViewport(0,0,W,H);glClearColor(.788,.794,.756,1);glClear(GL_COLOR_BUFFER_BIT|GL_DEPTH_BUFFER_BIT);glUseProgram(mainProgram);
 glUniformMatrix4fv(glGetUniformLocation(mainProgram,"vp"),1,GL_FALSE,view);glUniformMatrix4fv(glGetUniformLocation(mainProgram,"lp"),1,GL_FALSE,lamp);
 glUniform3fv(glGetUniformLocation(mainProgram,"eyeDir"),1,dir);glUniform3fv(glGetUniformLocation(mainProgram,"moods"),1,moods);
 glUniform1f(glGetUniformLocation(mainProgram,"height"),h);glActiveTexture(GL_TEXTURE0);glBindTexture(GL_TEXTURE_2D,pigment);glUniform1i(glGetUniformLocation(mainProgram,"pigment"),0);
 glActiveTexture(GL_TEXTURE1);glBindTexture(GL_TEXTURE_2D_ARRAY,micro);glUniform1i(glGetUniformLocation(mainProgram,"relief"),1);
 glActiveTexture(GL_TEXTURE2);glBindTexture(GL_TEXTURE_2D,shadowTex);glUniform1i(glGetUniformLocation(mainProgram,"depthTex"),2);
 glDrawElements(GL_TRIANGLES,I,GL_UNSIGNED_INT,nullptr);
 glBindFramebuffer(GL_READ_FRAMEBUFFER,msFbo);glBindFramebuffer(GL_DRAW_FRAMEBUFFER,resolveFbo);glBlitFramebuffer(0,0,W,H,0,0,W,H,GL_COLOR_BUFFER_BIT,GL_NEAREST);
 glBindFramebuffer(GL_READ_FRAMEBUFFER,resolveFbo);glReadPixels(0,0,W,H,GL_RGB,GL_UNSIGNED_BYTE,out);release();
}
