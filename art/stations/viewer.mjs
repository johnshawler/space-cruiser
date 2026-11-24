import {stations} from './stations.mjs';
import {buildStation} from './three-stations.mjs';
import {startGallery} from '../characters/src/library-viewer.js';
startGallery({items:stations,make:buildStation,groups:[['Outpost','Outposts'],['Research station','Research stations']],elevation:.47,blenderPath:id=>'../../assets/stations/blender/'+id+'.blend'});
