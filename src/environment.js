import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createEnvironment(scene) {
  // ── Céu ───────────────────────────────────────────────────
  scene.background = new THREE.Color(0x87ceeb);

  // ── Chão (rua/asfalto) ────────────────────────────────────
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05; // logo abaixo da pista da cidade (evita z-fighting)
  ground.receiveShadow = true;
  scene.add(ground);

  // ── Luzes ─────────────────────────────────────────────────
  // Sol (luz direcional principal + sombras)
  const sun = new THREE.DirectionalLight(0xfff2d6, 3.0);
  sun.position.set(15, 25, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 0.5;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  scene.add(sun);

  // Luz de preenchimento vinda da frente (ilumina o rosto dos personagens)
  const fill = new THREE.DirectionalLight(0xffffff, 1.3);
  fill.position.set(0, 8, 20);
  scene.add(fill);

  // Luz ambiente (clareia tudo por igual)
  scene.add(new THREE.AmbientLight(0xffffff, 1.3));

  // Luz hemisférica (céu/chão)
  scene.add(new THREE.HemisphereLight(0x87ceeb, 0x555555, 0.7));

  // ── Modelo da Cidade (cenário) ────────────────────────────
  //  Modelo low-poly em public/models/lowpoly_city.glb
  const loader = new GLTFLoader();
  loader.load(
    '/models/lowpoly_city.glb',
    (gltf) => {
      const city = gltf.scene;

      // ── AUTO-ESCALA: ajusta a cidade para ~45 de largura ──
      let box = new THREE.Box3().setFromObject(city);
      let size = box.getSize(new THREE.Vector3());
      const larguraOriginal = Math.max(size.x, size.z) || 1;
      const LARGURA_ALVO = 45;
      city.scale.setScalar(LARGURA_ALVO / larguraOriginal);

      // Recalcula o box e posiciona a cidade AO REDOR dos personagens.
      box = new THREE.Box3().setFromObject(city);
      const center = box.getCenter(new THREE.Vector3());
      const profundidade = box.getSize(new THREE.Vector3()).z;
      city.position.x += -center.x;                        // centraliza em x
      city.position.z += -center.z - profundidade / 2 + 8; // traz a cidade para a frente, envolvendo os personagens

      // IMPORTANTE: esta cidade tem uma BASE elevada (~4.8) e a pista
      // fica no TOPO dela. Se assentássemos pela base (min.y = 0), a
      // pista ficaria ~5 acima do chão e os personagens (em y = 0)
      // sumiriam "no porão". Então abaixamos a cidade até a PISTA ficar
      // ~no nível do chão; a base afunda sob o plano do chão.
      const NIVEL_PISTA = 4.8; // altura da pista no modelo já escalado
      city.position.y += -box.min.y - NIVEL_PISTA;

      city.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(city);
      console.log('✅ Cidade carregada!');
    },
    (xhr) => {
      if (xhr.total > 0) {
        console.log(`Cidade: ${Math.round(xhr.loaded / xhr.total * 100)}% carregada`);
      }
    },
    (err) => {
      console.error('❌ Erro ao carregar a cidade:', err);
    }
  );
}
