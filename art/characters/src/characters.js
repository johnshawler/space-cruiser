import {newCast} from './new-cast.js';
import {neru,caelo,rusk,plover,fenn,koro,myrr,sarra,ilex,kepp,yarro,nacre,tacca,sova,pavo,kipp,marlo,aril,sura} from './outer-aliens.js';
import {lyre,iris,crimp,relay,kiln,wick,fathom,dolly,orlo,chime,shuttle,cairn,pinion,tempo,glint,purl,latch,plume,prong} from './outer-robots.js';
import { Group, Box3, Vector3 } from 'three';
import { orris,vela,obo,silt,mica,nim } from './aliens.js';
import { tally,lichen,parallax,hush,rivet,spool } from './robots.js';

export const cast=[
  ['orris','Orris','Alien','Field botanist','E.T. the Extra-Terrestrial','Orris turns every leaf over before declaring a seedling healthy.',12],
  ['vela','Vela','Alien','Ink interpreter','Arrival','Vela leaves a finger-width gap in a greeting so the other speaker can finish the circle.',-12],
  ['obo','Obo','Alien','Cantina reed player','Star Wars','Obo tests a new reed on the last three notes of the closing-time tune.',14],
  ['silt','Silt','Alien','Desert listener','Dune','Silt puts a tuning fork to the sand and waits for the answer through four planted feet.',32],
  ['mica','Mica','Alien','Route surveyor','Mass Effect','Mica keeps a brass sextant for the days when the ship insists it knows where it is.',24],
  ['nim','Nim','Alien','Seed courier','Pikmin','Nim holds the mailbag shut with both hands whenever a crosswind catches the seed crest.',-16],
  ['tally','Tally','Robot','Salvage sorter','WALL-E','Tally weighs every bent teaspoon before deciding whether it belongs back in the galley.',-22],
  ['lichen','Lichen','Robot','Conservatory keeper','Castle in the Sky','Lichen kneels to tuck a stray frond back into the crack in its shoulder.',14],
  ['parallax','Parallax','Robot','Spatial surveyor','Portal','Parallax checks the calibration cube again if anyone breathes near the gauge.',16],
  ['hush','Hush','Robot','Acoustics technician','The Iron Giant','Hush cups one ear to hear the smallest tooth on a clockwork bird’s gear.',-16],
  ['rivet','Rivet','Robot','Airborne seam welder','*batteries not included','Rivet keeps a little scrap of hull plate on hand to test the iron before each repair.',24],
  ['spool','Spool','Robot','Switchboard operator','Doctor Who','Spool patches through the late call with one hand while the other catches the slack.',-17]
].concat(newCast).map(([id,name,type,role,inspiration,habit,angle])=>({id,name,type,role,inspiration,habit,angle}));
const sculptors={orris,vela,obo,silt,mica,nim,tally,lichen,parallax,hush,rivet,spool,neru,caelo,rusk,plover,fenn,koro,myrr,sarra,ilex,kepp,yarro,nacre,tacca,sova,pavo,kipp,marlo,aril,sura,lyre,iris,crimp,relay,kiln,wick,fathom,dolly,orlo,chime,shuttle,cairn,pinion,tempo,glint,purl,latch,plume,prong};
export function buildCharacter(id){
  const info=cast.find(c=>c.id===id);if(!info)throw new Error('Unknown character '+id);
  const root=new Group();root.name=info.name;root.userData={role:info.role,inspiration:info.inspiration};
  const parts=new Group();parts.name=info.name+' sculpture';root.add(parts);sculptors[id](parts);
  const bounds=new Box3().setFromObject(root,true),center=bounds.getCenter(new Vector3());
  // Ground the feet; retain the air gap on the hovering characters.
  const hover=['vela','parallax','rivet','fenn','sura','pinion','plume','shuttle'].includes(id)?.13:0;
  parts.position.set(-center.x,-bounds.min.y+hover,-center.z);root.updateMatrixWorld(true);return root;
}
