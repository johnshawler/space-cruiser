/* Three.js builders for the nine homeworld species. Their identities, voices and encounter keys live in 01-data. */
const OriginalFolk = (() => {
  const sides=[-1,1];
  function joint(parent,x,y,z){
    const g=new THREE.Group();
    g.position.set(x,y,z); parent.add(g);
    return g;
  }
  function oval(parent,material,x,y,z,rx,ry,rz){
    const m=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),material);
    m.position.set(x,y,z); m.scale.set(rx,ry,rz); parent.add(m);
    return m;
  }
  // Each horizontal ring can change width, depth and center, giving the skin a continuous outer contour.
  function loft(parent,mat,rings,n=32){
    const xyz=[],tri=[];
    for(const [y,rx,rz,x=0,z=0] of rings){
      for(let i=0;i<n;i++){
        const a=i*Math.PI*2/n;
        xyz.push(x+rx*Math.cos(a),y,z+rz*Math.sin(a));
      }
    }
    const top=(rings.length-1)*n;
    for(let i=0;i<n;i++){
      const j=(i+1)%n;
      for(let k=0;k<top;k+=n) tri.push(k+i,k+n+i,k+j,k+j,k+n+i,k+n+j);
      if(i>0&&i<n-1) tri.push(0,i,i+1,top,top+i+1,top+i);
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
    g.setIndex(tri); g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat); parent.add(m);
    return m;
  }
  // A rounded taper along a spatial curve. The fourth coordinate at each station is its radius.
  function taper(parent,mat,stations){
    const path=new THREE.CatmullRomCurve3(stations.map(([x,y,z])=>new THREE.Vector3(x,y,z)));
    const n=(stations.length-1)*6, around=10, g=new THREE.TubeGeometry(path,n,1,around,false);
    const p=g.attributes.position, v=new THREE.Vector3();
    for(let i=0;i<=n;i++){
      const u=i/n, center=path.getPointAt(u), t=path.getUtoTmapping(u)*(stations.length-1);
      const k=Math.min(stations.length-2,Math.floor(t)), f=t-k;
      const radius=stations[k][3]*(1-f)+stations[k+1][3]*f;
      for(let j=0;j<=around;j++){
        const at=i*(around+1)+j;
        v.fromBufferAttribute(p,at).sub(center).multiplyScalar(radius).add(center);
        p.setXYZ(at,v.x,v.y,v.z);
      }
    }
    g.computeVertexNormals();
    const m=new THREE.Mesh(g,mat); parent.add(m); return m;
  }
  function eyes(T,spread,y,z,r,lids=T.body){
    for(const side of sides){
      T.eye(T.head,T.U,side*spread,y,z,r,lids,T.iris);
      T.brow(T.head,T.U,side*spread,y+r*1.26,z+.025,r*1.12,.021,T.browM,side);
    }
  }
  function litEyes(T,mat,x,y,z,rx,ry,rz){
    for(const side of sides){
      const look=joint(T.head,side*x,y,z); T.U.looks.push(look);
      const eye=oval(look,mat,0,0,0,rx,ry,rz);
      eye.userData.sy=ry; T.U.eyes.push(eye);
      oval(look,T.catchM,-rx*.28,ry*.34,rz*.92,.014,.014,.008);
      T.brow(T.head,T.U,side*x,y+ry+.055,z+.007,rx*1.4,.018,mat,side);
    }
  }
  function arms(T,x,y,z,len,r,mat,hand){
    T.U.arms=sides.map(side=>T.limb(T.rig,side*x,y,z,len,r,mat,hand));
  }
  function blorpax(T){
    const {U,head,rig,body,light}=T;
    const sole=loft(rig,body,[[.001,.36,.25],[.04,.47,.34], [.12,.54,.38], [.22,.49,.35,.035],[.32,.36,.27,.05]]);
    head.position.set(.014,.62,.015);
    // The crest hooks back over a real gap. The third eye rides on its tip.
    loft(head,body,[[-.44,.38,.29],[-.32,.48,.33],[-.1,.46,.32],[.13,.38,.29,-.035],
      [.32,.28,.237,-.115],[.45,.20,.18,-.177],[.54,.144,.135,-.178],[.59,.106,.105,-.12]]);
    taper(head,body,[[-.19,.41,-.01,.17],[-.16,.54,-.01,.145],[-.045,.64,-.008,.122],[.09,.65,.01,.099],[.158,.575,.045,.073]]);
    T.eye(head,U,.157,.556,.077,.095,light,T.iris);
    eyes(T,.162,.10,.245,.137);
    T.mouth(head,U,0,-.075,.333,1.04); T.blush(head,.267,-.018,.249,.066);
    arms(T,.37,.62,.012,.267,.069,body,light);
    const ripple=oval(rig,light,-.13,.103,.263,.267,.043,.088);
    U.gait=(p,a)=>{
      const surge=Math.sin(p)*a, press=(1-Math.cos(p))*.5*a;
      rig.position.y=0; rig.rotation.z=0;
      sole.scale.set(1+.13*press,1-.16*press,1+.12*press);
      ripple.position.x=-.13+.10*surge;
      head.rotation.z=.115*surge; head.scale.set(1+.065*press,1-.095*press,1+.055*press);
    };
  }
  function zkthar(T){
    const {rig,head,U,body,dark,light}=T;
    head.position.set(0,1.025,.09);
    const abdomen=oval(rig,body,0,.59,-.16,.242,.328,.25); abdomen.rotation.x=-.42;
    oval(rig,dark,0,.79,-.022,.157,.165,.128);
    loft(head,body,[[-.195,.091,.104],[-.085,.19,.169],[.07,.252,.163],[.15,.227,.134],[.204,.096,.082]]);
    const glass=T.phys('#1c2026',{roughness:.19,clearcoat:1});
    eyes(T,.171,.071,.125,.123,glass);
    T.mouth(head,U,0,-.079,.178,.77);
    const feelers=sides.map(s=>{
      const antenna=joint(head,s*.145,.15,-.025);
      taper(antenna,dark,[[0,0,0,.028],[s*.068,.198,-.022,.024],[s*.19,.32,-.026,.018],[s*.205,.41,.05,.009]]);
      oval(antenna,light,s*.205,.41,.05,.03,.034,.03); return antenna;
    });
    // One group controls each alternating tripod, so all six legs can also fold into a seat.
    U.legs=sides.map(s=>{
      const tripod=joint(rig,0,.506,0);
      for(const [side,z,reach] of [[s,.13,.43],[-s,-.02,.54],[s,-.19,.43]]){
        taper(tripod,dark,[[side*.105,0,z,.055],[side*.27,-.045,z-.01,.048],
          [side*(reach-.055),.02,z-.03,.037],[side*reach,-.45,z+.015,.024],[side*(reach+.045),-.482,z+.075,.019]]);
      }
      return tripod;
    });
    U.arms=sides.map(s=>{
      const arm=joint(rig,s*.186,.861,.058);
      taper(arm,body,[[0,0,0,.06],[s*.13,-.15,.025,.057],[s*.109,-.215,.081,.043],[0,-.27,.014,.04]]);
      oval(arm,light,0,-.27,.014,.06,.045,.048); arm.userData.len=.27; return arm;
    });
    U.gait=(p,a)=>{
      const step=Math.sin(p)*a; rig.rotation.z=0; rig.position.y=0;
      U.legs.forEach((leg,i)=>{const v=step*sides[i];leg.rotation.x=0;leg.position.z=.106*v;leg.position.y=.506+.098*Math.max(0,Math.cos(p)*sides[i])*a;});
      abdomen.rotation.x=-.42+.12*step;
      feelers.forEach((g,i)=>g.rotation.z=.16*Math.sin(p+sides[i]*.65)*a);
    };
  }
  function momwump(T){
    const {rig,head,U,body,light}=T;
    head.position.y=.79;
    oval(rig,body,0,.52,-.036,.347,.359,.303);
    oval(rig,light,0,.553,.155,.271,.253,.154);
    oval(head,body,0,.084,0,.36,.313,.288);
    const earLining=T.phys('#ef9fbd',{roughness:.83});
    const ears=sides.map(s=>{
      const ear=joint(head,s*.236,.255,-.055);
      taper(ear,body,[[0,0,0,.094],[s*.12,.073,-.005,.112],[s*.212,-.012,.004,.122],[s*.248,-.176,.003,.098],[s*.221,-.262,.023,.034]]);
      oval(ear,earLining,s*.228,-.106,.093,.056,.111,.024).rotation.z=-s*.17; return ear;
    });
    for(const s of sides){
      const tuft=oval(head,light,s*.075,.37,-.002,.069,.148,.077); tuft.rotation.z=-s*.37;
    }
    oval(rig,body,0,.416,-.318,.144,.132,.119);
    eyes(T,.151,.101,.236,.136);
    oval(head,T.phys('#513447'),0,-.018,.288,.055,.041,.041);
    T.mouth(head,U,0,-.084,.327,.83); T.blush(head,.24,-.011,.215,.072);
    U.legs=sides.map(s=>T.limb(rig,s*.16,.236,.007,.177,.069,body,null,light));
    arms(T,.315,.638,.068,.242,.073,body,light);
    U.gait=(p,a)=>{
      const sway=Math.sin(p)*a, shuffle=Math.abs(sway);
      rig.rotation.z=.033*sway; rig.position.y=.022*shuffle;
      U.legs.forEach((leg,i)=>{leg.rotation.x=sides[i]*.35*sway;leg.userData.foot.rotation.x=-leg.rotation.x;});
      ears.forEach((ear,i)=>{ear.rotation.z=.13*sway+sides[i]*.16*Math.sin(p*2-.5)*a;});
      head.rotation.x=.085*shuffle;
    };
  }
  function vrell(T){
    const {head,rig,U,body,dark,light}=T;
    head.position.y=.965;
    loft(head,body,[[-.339,.145,.13],[-.245,.233,.194],[-.052,.272,.217],[.126,.249,.202,-.015],
      [.27,.191,.158,-.045],[.42,.123,.095,-.10],[.577,.05,.042,-.18],[.635,.009,.011,-.219]]);
    const fins=sides.map(s=>{
      const fin=joint(head,s*.153,.13,-.063);
      loft(fin,light,[[-.134,.03,.026,s*.018],[-.04,.119,.073,s*.055],[.092,.129,.084,s*.09],
        [.194,.087,.061,s*.12],[.296,.011,.012,s*.158]]);
      return fin;
    });
    eyes(T,.135,-.09,.167,.127,dark); T.mouth(head,U,0,-.235,.202,.83);
    const curls=[];
    for(const [i,x,z,dy] of [[0,-.125,-.096,.005],[1,.126,-.09,.06],[2,-.068,.065,.03],[3,.075,.075,0]]){
      const s=Math.sign(x), t=joint(rig,x,.715+dy,z);
      const idle=joint(t,0,0,0); idle.userData.a=i*Math.PI/2; U.tent.push(idle);
      taper(idle,body,[[0,0,0,.087],[s*.022,-.23,-.025,.078],[-s*.031,-.437,.02,.062],[s*.012,-.629,.032,.048],
        [s*.104,-.68,.01,.034],[s*.161,-.61,-.012,.01]]);
      curls.push(t);
    }
    U.arms=sides.map(s=>{
      const arm=joint(rig,s*.206,.793,.015);
      taper(arm,body,[[0,0,0,.086],[s*.081,-.156,.014,.076],[s*.132,-.29,.025,.06],[s*.115,-.389,.025,.056],[0,-.426,0,.038]]);
      arm.userData.len=.426; return arm;
    });
    U.gait=(p,a)=>{
      const push=(1-Math.cos(p))*.5*a;
      rig.position.y=.104*push; rig.rotation.z=.042*Math.sin(p)*a;
      curls.forEach((t,i)=>{t.rotation.x=.22*Math.sin(p+i*.78)*a;t.rotation.z=Math.sign(t.position.x)*.28*push;});
      fins.forEach((fin,i)=>fin.rotation.z=sides[i]*.31*push);
      head.scale.y=1-.065*push;
    };
  }
  function grondar(T){
    const {rig,head,U,body,dark,light}=T;
    const slab=(g,m,y,x,w,h,d)=>loft(g,m,[[y,w*.78,d*.8,x],[y+h*.16,w,d,x-.013],
      [y+h*.76,w*.98,d*.96,x+.009],[y+h,w*.83,d*.83,x+.021]],8);
    const stack=joint(rig,0,.34,0); stack.add(head); head.position.y=.61;
    slab(stack,dark,0,-.008,.315,.16,.237);
    slab(stack,body,.104,-.042,.41,.28,.272);
    slab(stack,light,.355,.045,.40,.096,.258);
    slab(head,body,-.19,.03,.417,.26,.282);
    slab(head,dark,.044,-.043,.362,.076,.25);
    slab(head,body,.105,-.098,.368,.186,.253);
    slab(head,light,.258,-.191,.208,.084,.164);
    const amber=T.glow('#ffb54f',2);
    litEyes(T,amber,.155,-.038,.267,.095,.047,.023);
    T.mouth(head,U,.017,-.137,.278,.91,T.glow('#ff832a',1.7));
    U.legs=sides.map(s=>{
      const leg=joint(rig,s*.212,.363,0);
      slab(leg,body,-.243,0,.113,.257,.147);
      slab(leg,dark,-.362,0,.166,.149,.204); return leg;
    });
    U.arms=sides.map(s=>{
      const arm=joint(stack,s*.356,.374,.005);
      slab(arm,body,-.231,s*.044,.105,.267,.14);
      slab(arm,dark,-.295,s*.05,.083,.08,.119);
      slab(arm,body,-.39,s*.046,.134,.135,.154);
      arm.userData.len=.36; return arm;
    });
    U.gait=(p,a)=>{
      const weight=Math.sin(p)*a;
      rig.rotation.z=0; rig.position.y=0;
      stack.position.x=.071*weight; stack.rotation.z=-.069*weight;
      U.legs.forEach((leg,i)=>{
        const lift=Math.max(0,-sides[i]*Math.sin(p))**2*a;
        leg.rotation.x=0; leg.position.y=.363+.093*lift; leg.position.z=.093*sides[i]*Math.cos(p)*a;
      });
      U.arms.forEach((arm,i)=>arm.rotation.x=.124*sides[i]*weight);
    };
  }
  function qeeble(T){
    const {head,rig,U,body,dark,light}=T;
    head.position.set(0,.965,.077);
    oval(rig,body,0,.664,-.027,.249,.319,.224).rotation.x=.19;
    oval(rig,light,0,.661,.108,.197,.217,.145);
    oval(head,body,0,.04,0,.257,.223,.212);
    const bill=T.phys('#ffbb57'), feet=T.phys('#d58a46');
    const top=loft(head,bill,[[0,.105,.081],[.095,.119,.087],[.206,.076,.06],[.302,.009,.009]]);
    top.rotation.x=Math.PI/2; top.position.set(0,-.013,.155);
    const jaw=joint(head,0,-.064,.154);
    const lower=loft(jaw,bill,[[0,.082,.048],[.074,.091,.046],[.227,.008,.009]]);
    lower.rotation.x=Math.PI/2; U.beak=jaw;
    const crest=joint(head,0,.195,-.084);
    for(const s of [-1,0,1]){
      const plume=oval(crest,s===0?dark:light,s*.083,.102,-.053,.049,.181-Math.abs(s)*.028,.049);
      plume.rotation.x=-.55; plume.rotation.z=-s*.39-.24;
    }
    eyes(T,.143,.099,.147,.123);
    T.mouth(head,U,0,-.089,.203,.54);
    const tail=joint(rig,0,.54,-.152);
    for(const side of [-1,0,1]){
      const f=joint(tail,.11+side*.074,.126,-.08);
      f.rotation.z=-.93-side*.24; f.rotation.x=-.34;
      oval(f,side===0?dark:body,0,.09,0,.071,.238,.042);
      oval(f,side===0?light:dark,0,.237,.023,.047,.063,.02);
    }
    U.arms=sides.map(s=>{
      const wing=joint(rig,s*.213,.812,-.012);
      loft(wing,body,[[-.335,.018,.025,s*.099,-.041],[-.217,.073,.122,s*.071,-.026],
        [-.068,.095,.16,s*.049,-.016],[.027,.067,.095]]);
      wing.userData.len=.32; return wing;
    });
    U.legs=sides.map(s=>{
      const leg=joint(rig,s*.12,.42,.019);
      taper(leg,feet,[[0,0,0,.041],[0,-.123,-.052,.036],[s*.018,-.217,.032,.032],[0,-.385,0,.031]]);
      const foot=joint(leg,0,-.385,0);
      for(const toe of [-1,1]){
        taper(foot,feet,[[0,0,0,.032],[toe*.041,-.01,.075,.023],[toe*.066,-.018,.13,.01]]);
      }
      leg.userData.foot=foot; return leg;
    });
    U.gait=(p,a)=>{
      const step=Math.sin(p)*a, hop=Math.sin(p)**2*a;
      rig.position.y=.107*hop; rig.rotation.z=.027*step;
      head.position.z=.077+.067*Math.sin(2*p)*a;
      crest.rotation.x=-.20*Math.sin(2*p-.28)*a; tail.rotation.x=.28*step;
      U.legs.forEach((leg,i)=>{leg.rotation.x=sides[i]*.62*step;leg.userData.foot.rotation.x=-leg.rotation.x;});
      U.arms.forEach((wing,i)=>wing.rotation.y=sides[i]*.25*hop);
    };
  }
  function ooloo(T){
    const {head,rig,U,body,light}=T;
    head.position.y=.905;
    const core=T.glow('#95f9d7',1.12);
    function bell(parent,r,h){
      loft(parent,body,[[-.04,r*.86,r*.73],[0,r,r*.82],[h*.27,r*.97,r*.805],
        [h*.61,r*.79,r*.68],[h*.89,r*.42,r*.38],[h,r*.08,r*.075]]);
      oval(parent,core,0,h*.30,-.012,r*.29,h*.37,r*.31);
    }
    bell(head,.318,.32);
    taper(rig,light,[[-.32,1.14,-.091,.032],[-.247,1.056,-.076,.037],[0,.994,-.075,.044],[.187,.799,-.075,.036],[.34,.774,-.082,.03]]);
    const bells=sides.map((s,i)=>{
      const satellite=joint(rig,s*(i?.356:.336),i?.747:1.11,-.09);
      bell(satellite,i?.172:.198,i?.175:.216); return satellite;
    });
    eyes(T,.127,.11,.193,.114,light); T.mouth(head,U,0,-.001,.259,.80);
    const threads=[];
    for(const [i,x,z,length] of [[0,-.175,-.045,.826],[1,-.08,.05,.657],[2,.037,-.068,.872],[3,.167,.016,.70]]){
      const strand=joint(rig,x,.905,z), side=i%2?1:-1;
      const idle=joint(strand,0,0,0); idle.userData.a=i*Math.PI/2; U.tent.push(idle);
      taper(idle,light,[[0,0,0,.038],[side*.051,-length*.28,0,.035],[-side*.044,-length*.65,.029,.028],[side*.026,-length,.018,.014]]);
      oval(idle,core,side*.026,-length,.018,.021,.029,.022); threads.push(strand);
    }
    U.arms=sides.map((s,i)=>{
      const arm=joint(bells[i],s*.035,-.015,.034);
      const len=i?.385:.484;
      taper(arm,light,[[0,0,0,.05],[s*.045,-len*.33,.007,.045],[-s*.025,-len*.70,.013,.035],[0,-len,0,.043]]);
      arm.userData.len=len; return arm;
    });
    U.gait=(p,a)=>{
      const pulse=(1-Math.cos(p))*.5*a;
      rig.position.y=.096*pulse; rig.rotation.z=0;
      head.scale.set(1-.12*pulse,1+.13*pulse,1-.12*pulse);
      bells.forEach((bell,i)=>{
        const squeeze=(1-Math.cos(p-(i+1)*.78))*.5*a;
        bell.scale.set(1-.18*squeeze,1+.17*squeeze,1-.18*squeeze);
        bell.rotation.z=sides[i]*.12*squeeze;
      });
      threads.forEach((t,i)=>t.rotation.z=.12*Math.sin(p+i*.67)*a);
    };
  }
  function sporrin(T){
    const {rig,head,U,body,light}=T;
    const cream=T.phys('#ebd2a6'), gill=T.phys('#ba906a');
    head.position.set(0,.63,0);
    loft(head,cream,[[-.447,.214,.171,-.037],[-.32,.169,.146,-.058],[-.12,.128,.131,-.052],
      [.112,.137,.136,.037],[.31,.111,.117,.058],[.403,.151,.132,.026]]);
    function shelf(parent,x,y,z,r,h,tilt){
      const cap=joint(parent,x,y,z); cap.rotation.z=tilt;
      const profile=[[-.033,r*.72,r*.56],[0,r,r*.72],[h*.31,r*.94,r*.69],
        [h*.72,r*.63,r*.51,-.027],[h,r*.13,r*.12,-.065]];
      loft(cap,body,profile);
      loft(cap,gill,[[-.051,r*.28,r*.24],[-.046,r*.68,r*.54],[-.03,r*.85,r*.63],[.002,r*.97,r*.70]]);
      return cap;
    }
    const cap=shelf(head,.042,.442,-.031,.492,.233,-.13);
    shelf(head,-.192,.20,-.025,.208,.11,.19);
    shelf(head,.175,-.047,-.052,.151,.09,-.22);
    for(const [x,y,z,r] of [[-.14,.165,.088,.048],[.068,.195,.052,.041],[.205,.115,.13,.04]]){
      oval(cap,light,x,y,z,r,.024,r*.77);
    }
    eyes(T,.114,.109,.099,.114,cream); T.mouth(head,U,.025,-.028,.152,.70);
    U.legs=sides.map(s=>{
      const leg=joint(rig,s*.113,.226,.01);
      taper(leg,cream,[[0,0,0,.092],[s*.012,-.087,.005,.087],[s*.033,-.15,.037,.076]]);
      const foot=oval(leg,cream,s*.055,-.16,.04,.106,.065,.132); leg.userData.foot=foot;
      return leg;
    });
    arms(T,.178,.623,.012,.225,.052,cream,light);
    U.gait=(p,a)=>{
      const step=Math.sin(p)*a;
      rig.position.y=.026*Math.abs(step); rig.rotation.z=.028*step;
      head.rotation.z=.09*step; cap.rotation.z=-.13-.086*Math.sin(p-.54)*a;
      U.legs.forEach((leg,i)=>{leg.rotation.x=sides[i]*.34*step;leg.userData.foot.rotation.x=-leg.rotation.x;});
    };
  }
  function beepul(T){
    const {rig,head,U,body,light,dark}=T;
    const chassis=joint(rig,0,.301,0), screen=T.phys('#14232c',{roughness:.18,clearcoat:.93});
    const nickel=T.phys('#b3bec1',{metalness:.69,roughness:.27}), mint=T.glow('#7bf6ce',1.6);
    rig.add(T.rbox(.428,.184,.329,.034,dark,0,.237,0));
    chassis.add(T.rbox(.629,.604,.337,.05,body,0,.41,0));
    chassis.add(T.rbox(.535,.082,.367,.026,light,0,.113,0));
    chassis.add(T.cyl(.089,.11,.098,nickel,0,.782,0));
    chassis.add(head); head.position.y=.97;
    head.add(T.rbox(.48,.231,.276,.038,body),T.rbox(.405,.173,.04,.014,screen,0,.012,.142));
    litEyes(T,mint,.106,.023,.166,.042,.044,.011); T.mouth(head,U,0,-.047,.169,.61,mint);
    taper(head,nickel,[[.112,.115,-.019,.016],[.132,.22,-.019,.014],[.19,.264,-.016,.011]]);
    oval(head,T.glow('#ff8866',1.8),.19,.264,-.016,.035,.035,.035);
    chassis.add(T.rbox(.376,.25,.034,.014,screen,-.049,.468,.18));
    const stock=[T.phys('#efb755'),T.phys('#81cace'),T.phys('#e493a1')];
    for(let i=0;i<3;i++){
      const packet=T.rbox(.073,.124,.03,.01,stock[i],-.163+i*.111,.471,.202);
      packet.rotation.z=(i-1)*.082; chassis.add(packet);
    }
    chassis.add(T.rbox(.347,.074,.076,.014,dark,-.027,.236,.193),
      T.rbox(.355,.032,.105,.009,nickel,-.027,.199,.207),T.bx(.035,.104,.018,nickel,.224,.473,.185));
    const wheels=[];
    for(const s of sides){
      for(const z of [-.144,.144]){
        const axle=joint(rig,s*.241,.137,z);
        const tire=T.cyl(.136,.136,.126,dark,0,0,0,24); tire.rotation.z=Math.PI/2;axle.add(tire);
        const hub=T.cyl(.087,.087,.016,nickel,s*.069,0,0,24); hub.rotation.z=Math.PI/2; axle.add(hub);
        axle.add(T.bx(.019,.102,.023,body,s*.08,0,0));
        wheels.push(axle);
      }
    }
    U.arms=sides.map(s=>{
      const arm=T.limb(chassis,s*.326,.621,0,.303,.045,nickel,dark);
      arm.add(T.rbox(.097,.152,.108,.021,body,0,-.118,0)); return arm;
    });
    U.gait=(p,a)=>{
      wheels.forEach(w=>w.rotation.x=p*a);
      const bump=Math.sin(p*2)*a;
      rig.position.y=0; rig.rotation.z=0; chassis.rotation.x=.041*bump;
      head.rotation.z=.033*Math.sin(p-.31)*a;
      U.arms.forEach((arm,i)=>arm.rotation.x=.065*sides[i]*bump);
    };
  }
  return {blorpax,zkthar,momwump,vrell,grondar,qeeble,ooloo,sporrin,beepul};
})();
