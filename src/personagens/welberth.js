// ============================================================
//  PERSONAGEM DO WELBERTH
//  Rhino (Marvel Strike Force)
//  https://sketchfab.com/3d-models/rhino-marvel-strike-force-c823f16878684b3eb72ce94d96cfcab0
// ============================================================
//  Coloque este arquivo em  src/personagens/  e o Rhino aparece
//  sozinho na cena. O modelo .glb deve estar em  public/models/.
// ============================================================

export default {
  key: 'rhino',
  dono: 'Welberth',
  nome: '🦏 Rhino',
  cor: '#7f8c8d',
  ordem: 3,

  path: '/models/rhino_-_marvel_strike_force.glb',
  targetHeight: 4.0,         // grande, menor que o Hulk
  position: [-3, 6],
  rotation: 0.5,

  moves: [
    { i: 3, label: 'Parado' },     // Shell — pose estática
    { i: 2, label: 'Inquieto' },   // Shell_Fidget
    { i: 4, label: 'Ultimate' },
  ],
};
