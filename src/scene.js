// ============================================================
//  scene.js — DEV 1
//  Responsável: configuração base da cena (câmera, renderer)
// ============================================================

import * as THREE from 'three';

export function createScene() {
  // ── Cena ──────────────────────────────────────────────────
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x87ceeb, 40, 120);

  // ── Câmera ────────────────────────────────────────────────
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.set(0, 5, 15);

  // ── Renderer ──────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.appendChild(renderer.domElement);

  // ── Resize responsivo ──────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { scene, camera, renderer };
}
