/* ===================== MATERIAL HELPERS ===================== */
/* The game uses the original lit look (MeshStandardMaterial, no outlines). Toon.mat and Toon.ink.mark are kept as
   plain pass-throughs so code written against them still works. */
const Toon = {
  mat(p){ return new THREE.MeshStandardMaterial(p||{}); },
  ink:{ on:false, mark(root){ return root; } },
};
