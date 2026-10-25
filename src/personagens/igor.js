// ============================================================
//  PERSONAGEM DO IGOR
//  Spider-Man 2099 (Marvel Future Fight)
//  https://sketchfab.com/3d-models/spider-man-2099-marvel-future-fight-heroes-0ae1513e75d64c88824d93e66c9833b5
// ============================================================
//
//  Este arquivo define UM personagem. Ele aparece sozinho na
//  cena e na UI — não precisa editar nenhum outro arquivo.
//
//  Como adicionar o SEU personagem:
//   1. Baixe o modelo .glb do Sketchfab e coloque em public/models/
//   2. Copie este arquivo com o seu nome (ex: personagens/fulano.js)
//   3. Ajuste os campos abaixo
// ============================================================

export default {
  // identificação
  key: 'spiderman',          // id interno, único (sem espaços)
  dono: 'Igor',              // quem é responsável por este personagem
  nome: '🕷️ Spider-Man 2099', // nome mostrado na UI
  cor: '#c0392b',            // cor dos botões na UI
  ordem: 1,                  // ordem de exibição na lista (menor = primeiro)

  // modelo
  path: '/models/spider-man_2099_marvel_future_fight_heroes.glb',
  targetHeight: 3.5,         // altura final na cena (auto-escala)
  position: [-6, 2],         // posição no chão [x, z]  (y é automático)
  rotation: 0.3,             // giro em torno do eixo Y (radianos)

  // animações: índices reais do GLB. O 1º é o "parado" inicial.
  moves: [
    { i: 5,  label: 'Parado' },   // idle
    { i: 23, label: 'Andar' },    // walk
    { i: 0,  label: 'Ataque' },   // atk-01
  ],

  // esconde meshes de efeito (ex: teias que ficam esticadas na cena)
  hide: {
    materials: ['SpiderMan_web02'],
  },
};
