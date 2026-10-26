// ============================================================
//  PERSONAGEM DO DANILO
//  Hulk (Marvel Future Fight — Brand New Day)
//  https://sketchfab.com/3d-models/hulk-brand-new-day-marvel-future-fight-ce63f355567040f598107c137fd60718
// ============================================================
//  Coloque este arquivo em  src/personagens/  e o Hulk aparece
//  sozinho na cena. O modelo .glb deve estar em  public/models/.
// ============================================================

export default {
  key: 'hulk',
  dono: 'Danilo',
  nome: 'Hulk',
  cor: '#27ae60',
  ordem: 2,

  path: '/models/hulk_brand_new_day_-_marvel_future_fight.glb',
  targetHeight: 4.5,         // o maior de todos
  position: [6, 2],
  rotation: -0.3,

  moves: [
    { i: 6,  label: 'Parado' },
    { i: 18, label: 'Andar' },
    { i: 0,  label: 'Ataque' },
  ],
};
