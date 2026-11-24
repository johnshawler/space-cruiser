import { cast } from './characters.js';

// Keep these planet keys stable across saves and UI translations.
export const homeworlds=['Verdanthia','Scorchmaw','Dunemoor','Sloshwell','Amethyne','Toxibloom','Candara','Jovexa','Brrrindle'];
// Each line names ten individuals from one model family. Names are authored identifiers,
// so adding another family never renames any existing resident.
const families={
 orris:['Loam','Eda Moss Tavi Mina Cato Wren Tula Ari Fern Sol'],
 vela:['Inkring','Umi Nera Osa Viri Enna Tel Rou Iri Sen Yune'],
 obo:['Reed','Pip Remi Clef Basie Fen Luma Ivo Tess Bram Della'],
 silt:['Sandwell','Hessa Ruun Teth Kesh Voro Abba Nemm Isha Mako Tull'],
 mica:['Facet','Voss Keva Iven Nira Sil Pell Orra Renn Veya Miro'],
 nim:['Seedpost','Pelo Lumi Tika Ceri Otto Winn Pippa Fia Holl Timo'],
 tally:['Halfounce','Nickel Penny Sprig Thimble Tink Clover Midge Button Clip Dot'],
 lichen:['Fernwell','Frond Hazel Willow Sorrel Reed Laurel Moss Alder Briar Olive'],
 parallax:['Sightline','Delta Opal Iris Focus Vector Echo Finch Axial Meridian Pearl'],
 hush:['Bellfound','Murmur Thrush Oriel Wren Cricket Linnet Dove Minnow Piper Chord'],
 rivet:['Patchbay','Ash Copper Ember Flick Spark Glaze Tin Solder Clove Tack'],
 spool:['Crossline','Bell Coda Pulse Dial Patch Trill Link Vox Coil Signal'],
 neru:['Tidemark','Nali Toma Kell Oona Pell Evi Senn Uma Tika Norr'],
 caelo:['Wickfen','Elva Otti Minna Iril Sav Rola Aini Pero Linn Itha'],
 rusk:['Ochrebank','Garn Rika Dorn Nemi Orru Vedra Tann Kelo Dora Jann'],
 plover:['Reedbank','Lali Tern Sella Asto Piri Ferni Vela Riva Tem Minta'],
 fenn:['Ballast','Olli Sena Milo Nara Kemi Bera Willa Tavo Pellu Del'],
 koro:['Ambergap','Roka Dessi Tarn Mura Nola Kalto Irem Yara Torvi Brann'],
 myrr:['Gillwick','Perri Enna Cress Nel Aven Lira Saffi Rudi Opal Bren'],
 sarra:['Glasspool','Esha Kavi Suna Nesh Raya Isen Liss Zeda Imri Tasso'],
 ilex:['Branchmere','Eryn Korra Arlo Niva Oriel Finn Mira Grell Selka Tirr'],
 kepp:['Spiralfen','Ludo Nelda Fenn Orli Pera Noll Dari Tuli Karo Osti'],
 yarro:['Sailridge','Vira Senn Loft Davi Hessa Evin Mira Nari Leto Rinn'],
 nacre:['Reefbell','Sora Anni Mael Piri Iona Talla Nelvi Cora Yari Voss'],
 tacca:['Burrowby','Kes Tamar Elsi Fara Rolo Ivo Otta Bex Cira Thal'],
 sova:['Quillfold','Willa Lenn Caro Rumi Ves Asta Minn Thea Orvi Olan'],
 pavo:['Brightfan','Rafi Ilna Corin Vani Joss Olva Pello Mena Sevi Yel'],
 kipp:['Girderwell','Hett Ludo Kiva Rann Omri Siva Tyne Odo Grell Tess'],
 marlo:['Frostwharf','Ulla Boro Nemi Korr Nell Rann Esk Nia Wulfe Siri'],
 aril:['Leafstep','Ovie Peta Noll Vim Mara Sena Fern Liri Ori Teva'],
 sura:['Eddybend','Mavi Luro Isha Renn Kori Nym Bela Aro Eri Dossa'],
 lyre:['Fretwell','Alto Viola Coda Brass Quaver Octave Key Harmonic Treble Drone'],
 iris:['Silverplate','Sepia Grain Focal Prism Slate Silver Bloom Frame Flint Flash'],
 crimp:['Lockjaw','Buckle Twist Ferrule Pin Tin Notch Burr Bolt Crank Toggle'],
 relay:['Waveband','Pulse Murmur Cobalt Sine Crest Static Coil Echo Loop Copper'],
 kiln:['Firebrick','Brick Ash Umber Ember Pumice Cinder Flint Glaze Luster Feldspar'],
 wick:['Lampline','Amber Halo Gleam Glow Dusk Lantern Ray Ember Glint Lumen'],
 fathom:['Sounding','Lead Pearl Diver Skiff Plumb Salt Keel Float Kelp Gull'],
 dolly:['Handcart','Label Crate Parcel Twine Clip Tag Tape Chit Ribbon Quill'],
 orlo:['Axiswell','Roll Tilt Zenith Nadir North South Level Pivot Gimbal Plumb'],
 chime:['Clapper','Bronze Fifth Peal Alto Chord Clink Mezzo Tenor Tacet Ring'],
 shuttle:['Warpwood','Weft Tow Skein Pick Warp Twill Flax Hem Loop Welt'],
 cairn:['Benchpin','Datum Mark Cap Fault Plinth Slate Strata Stake Chalk Level'],
 pinion:['Skybrace','Kite Fin Rudder Slip Lift Pitch Gale Vane Gust Kitelet'],
 tempo:['Beatwood','Downbeat Largo Lilt Allegro Triplet Tick Swing Rest Upbeat Cadence'],
 glint:['Sunframe','Prism Solar Gleam Arc Beam Ray Flare Gold Glaze Dawn'],
 purl:['Softwire','Rib Stitch Loop Knit Cable Skein Bobbin Hem Patch Needle'],
 latch:['Turnkey','Hasp Ward Shank Tumbler Bolt Catch Hinge Lever Spring Pawl'],
 plume:['Airwell','Mist Cirrus Cumulus Virga Cloud Drift Zephyr Rain Sleet Dew'],
 prong:['Forklift','Tine Axle Crate Skid Pallet Lift Jack Spur Pin Wedge']
};
const dyes=['#d77b65','#68a8ae','#ac93c4','#dfbc69','#91b275','#759cca','#cb91a3','#9fc1af','#d99c73','#93a0bf'];
export const residents=cast.flatMap((model,index)=>{
 const [surname,given]=families[model.id];return given.split(' ').map((first,i)=>({
   id:model.id+'-'+String(i+1).padStart(2,'0'),base:model.id,name:first+' '+surname,
   home:homeworlds[(index*10+i)%homeworlds.length],slot:i,
   accent:dyes[(i+index)%10],height:[.981,1.024,.969,1.035,1.012,.987,1.030,.977,1.004,1.017][i],
   width:[1.022,.978,1.015,.991,1.027,.981,1.011,1.033,.974,.996][i]
 }));
});
export function dressResident(root,person,Color){
 const dye=new Color(person.accent),colors=new Map();
 root.traverse(m=>{if(!m.isMesh)return;const old=m.material;
   if(!colors.has(old)){const mat=old.clone();const hsl={};mat.color.getHSL(hsl);
     const amount=hsl.s<.14?.035:(mat.metalness>.23?.175:.115);mat.color.lerp(dye,amount);colors.set(old,mat);}
   m.material=colors.get(old);
 });root.scale.set(person.width,person.height,1/person.width);root.name=person.name;root.userData.resident=person.id;return root;
}
