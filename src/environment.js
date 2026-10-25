// ============================================================
//  environment.js — DEV 2
//  Responsável: mapa (posto de gasolina), chão, luzes, céu
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createEnvironment(scene) {
  // ── Fundo / Céu estilo Toy Story ──────────────────────────
  scene.background = new THREE.Color(0x87ceeb);

  // ── Chão (asfalto) ────────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Linhas de estacionamento ──────────────────────────────
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (let i = -3; i <= 3; i += 3) {
    const line = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 6), lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(i, 0.01, 4);
    scene.add(line);
  }

  // ── Luzes ─────────────────────────────────────────────────
  // Sol da tarde (luz quente e direcional)
  const sun = new THREE.DirectionalLight(0xffe0a0, 2.5);
  sun.position.set(15, 25, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -20;
  sun.shadow.camera.right = 20;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  scene.add(sun);

  // Luz ambiente quente
  scene.add(new THREE.AmbientLight(0xffd580, 0.8));

  // Luz hemisférica (céu/chão)
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x444400, 0.5));

  // ── Modelo do Posto de Gasolina ───────────────────────────
  // ⬇️ Baixe o modelo em: https://sketchfab.com/3d-models/toy-story-gas-station-d6c29c1128cc424382330072a2dc78e2
  // ⬇️ Salve como: public/models/gas_station.glb
  const loader = new GLTFLoader();
  loader.load(
    '/models/toy_story_gas_station.glb',
    (gltf) => {
      const map = gltf.scene;

      // ── AUTO-ESCALA: ajusta o posto para ~30 unidades de largura ──
      let box = new THREE.Box3().setFromObject(map);
      let size = box.getSize(new THREE.Vector3());
      const larguraOriginal = Math.max(size.x, size.z) || 1;
      const LARGURA_ALVO = 30;
      map.scale.setScalar(LARGURA_ALVO / larguraOriginal);

      // Recalcula o box e assenta o posto no chão, centralizado atrás
      box = new THREE.Box3().setFromObject(map);
      const center = box.getCenter(new THREE.Vector3());
      map.position.x += -center.x;          // centraliza em x
      map.position.z += -8 - center.z;      // empurra para trás
      map.position.y += -box.min.y;         // base no y = 0

      map.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(map);
      console.log('✅ Posto de gasolina carregado!');
    },
    (xhr) => {
      console.log(`Posto: ${Math.round(xhr.loaded / xhr.total * 100)}% carregado`);
    },
    (err) => {
      console.error('❌ Erro ao carregar o posto:', err);
    }
  );
}
