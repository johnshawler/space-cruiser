import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
export async function exportModel(model){return new GLTFExporter().parseAsync(model,{binary:true,onlyVisible:true});}
