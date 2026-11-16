import * as THREE from 'three';
import { createScene } from './scene.js';
import { createEnvironment } from './environment.js';
import { loadAllCharacters, mixers, chars, aplicarRootLocks } from './characters.js';
import { createControls, createAnimationUI } from './controls.js';

// ── Hot-reload: sempre recarrega a página inteira ─────────
if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload());
}

// ── Inicialização (async para evitar top-level await no build) ──
async function init() {
  const { scene, camera, renderer } = createScene();

  createEnvironment(scene);
  await loadAllCharacters(scene);

  const controls = createControls(camera, renderer.domElement);
  createAnimationUI(chars);

  window.__chars = chars;
  window.__THREE = THREE;

  // ── Loop principal ────────────────────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixers.forEach(m => m.update(delta));
    aplicarRootLocks();   // trava escala/posição dos nós raiz
    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

init();