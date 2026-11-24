import {startGallery} from './library-viewer.js';
import {cast,buildCharacter} from './characters.js';
import {residents,dressResident} from './residents.js';
startGallery({items:cast,make:buildCharacter,groups:[['Alien','Aliens'],['Robot','Robots']],people:residents,dress:dressResident});
