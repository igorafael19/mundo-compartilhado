import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Troca de animação (local — opera no char recebido, sem depender
// do estado de módulo de characters.js, evitando bugs de HMR).
function trocarAnimacao(char, animIndex) {
  if (!char || !char.anims[animIndex]) return;
  if (char.currentAction) char.currentAction.fadeOut(0.3);
  const next = char.mixer.clipAction(char.anims[animIndex]);
  next.reset().fadeIn(0.3).play();
  char.currentAction = next;
}

// ── Câmera orbital ────────────────────────────────────────
export function createControls(camera, domElement) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 4;
  controls.maxDistance = 40;
  controls.maxPolarAngle = Math.PI / 2.05; // não vai abaixo do chão
  controls.target.set(0, 2.5, 4);
  return controls;
}

// ── UI de troca de animações ──────────────────────────────
//  A lista de personagens vem do characters.js (cada módulo em
//  src/personagens/ traz seu nome e cor). A UI se monta sozinha
//  com quantos personagens existirem.

export function createAnimationUI(chars) {
  // Painel principal
  const panel = document.createElement('div');
  panel.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.75);
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 999;
    font-family: sans-serif;
    backdrop-filter: blur(8px);
    min-width: 420px;
  `;

  // Título do painel
  const titulo = document.createElement('p');
  titulo.textContent = '🎬 Controle de Animações — Posto de Gasolina';
  titulo.style.cssText = 'color: white; font-size: 13px; font-weight: bold; text-align: center; margin-bottom: 4px;';
  panel.appendChild(titulo);

  // Lista de personagens carregados, ordenada pelo campo "ordem"
  const lista = Object.entries(chars || {})
    .map(([key, c]) => ({ key, ...c }))
    .sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));

  if (lista.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Nenhum personagem em src/personagens/';
    vazio.style.cssText = 'color: #e74c3c; font-size: 12px; text-align: center;';
    panel.appendChild(vazio);
  }

  // Uma linha por personagem
  lista.forEach((char) => {
    const cor = char.cor || '#555';
    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 8px; flex-wrap: wrap;';

    const name = document.createElement('span');
    name.textContent = char.nome || char.key;
    name.style.cssText = `color: white; width: 140px; font-size: 13px; font-weight: bold;`;
    row.appendChild(name);

    // Um botão por movimento curado (label PT-BR + índice real da animação)
    (char.moves || []).forEach((move) => {
      const btn = document.createElement('button');
      btn.textContent = move.label;
      btn.style.cssText = `
        background: ${cor};
        color: white;
        border: none;
        border-radius: 6px;
        padding: 6px 14px;
        cursor: pointer;
        font-size: 12px;
        transition: opacity 0.2s;
        font-weight: bold;
      `;
      btn.onmouseenter = () => btn.style.opacity = '0.75';
      btn.onmouseleave = () => btn.style.opacity = '1';
      btn.onclick = () => trocarAnimacao(char, move.i);
      row.appendChild(btn);
    });

    panel.appendChild(row);
  });

  // Dica de navegação
  const tip = document.createElement('p');
  tip.textContent = '🖱️ Arraste para orbitar  •  Scroll para zoom  •  Clique direito para mover';
  tip.style.cssText = 'color: #aaa; font-size: 11px; text-align: center; margin-top: 4px;';
  panel.appendChild(tip);

  // Impede que cliques/scroll sobre o painel movam ou deem zoom na câmera
  ['pointerdown', 'pointerup', 'pointermove', 'wheel', 'touchstart', 'mousedown'].forEach(ev => {
    panel.addEventListener(ev, e => e.stopPropagation());
  });

  document.body.appendChild(panel);
}
