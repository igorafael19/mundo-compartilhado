// ============================================================
//  characters.js — MOTOR DE PERSONAGENS
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ── Setup dos loaders ─────────────────────────────────────
const loader = new GLTFLoader();
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(draco);

// ── Exportações globais ───────────────────────────────────
export const mixers = [];
export const chars = {};

// ── Carrega AUTOMATICAMENTE todos os personagens da pasta ──
//  Cada arquivo em personagens/ exporta (default) a config de um
//  personagem. O Vite importa todos de uma vez com import.meta.glob,
//  então basta adicionar/remover um arquivo para incluir/tirar alguém.
const modulos = import.meta.glob('./personagens/*.js', { eager: true });

const CONFIG = {};
export const PERSONAGENS = []; // lista ordenada (usada pela UI)

for (const caminho in modulos) {
  const cfg = modulos[caminho].default;
  if (!cfg || !cfg.key) {
    console.warn(`⚠️ ${caminho} não exporta um personagem válido (falta "key").`);
    continue;
  }
  CONFIG[cfg.key] = cfg;
  PERSONAGENS.push(cfg);
}
PERSONAGENS.sort((a, b) => (a.ordem ?? 99) - (b.ordem ?? 99));

console.log(`🦸 ${PERSONAGENS.length} personagem(ns) encontrado(s):`,
  PERSONAGENS.map(p => `${p.key} (${p.dono || '?'})`).join(', '));

// ── Limpa as animações problemáticas do Sketchfab ─────────
//  Remove tracks que "estouram" o personagem:
//   • .scale  → impede que a animação mude o tamanho (fica gigante)
//   • .position do osso-raiz → impede root motion (personagem "some")
function limparAnimacoes(model, anims) {
  // Acha o osso-raiz do esqueleto
  let rootBone = null;
  model.traverse(o => { if (o.isBone && !rootBone) rootBone = o; });
  if (rootBone) {
    while (rootBone.parent && rootBone.parent.isBone) rootBone = rootBone.parent;
  }
  const rootName = rootBone ? rootBone.name : null;

  anims.forEach(clip => {
    clip.tracks = clip.tracks.filter(track => {
      // remove qualquer track de escala
      if (track.name.endsWith('.scale')) return false;
      // remove a posição do osso-raiz (root motion)
      if (rootName && track.name === `${rootName}.position`) return false;
      return true;
    });
  });
}

// ── Nome "bonito" para um clipe de animação ───────────────
function nomeAnimacao(clip, i) {
  let n = (clip.name || '').trim();
  // nomes feios do Mixamo/Sketchfab viram "Movimento N"
  if (!n || /armature|mixamo|layer|take|^animation$/i.test(n)) {
    return `Movimento ${i + 1}`;
  }
  // capitaliza
  return n.charAt(0).toUpperCase() + n.slice(1);
}

// ── Função interna de carregamento ────────────────────────
function loadCharacter(scene, key) {
  const cfg = CONFIG[key];
  return new Promise((resolve) => {
    loader.load(
      cfg.path,
      (gltf) => {
        const model = gltf.scene;
        const anims = gltf.animations;

        // 1) Limpa animações ANTES de medir/tocar
        limparAnimacoes(model, anims);

        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.frustumCulled = false; // evita sumir fora do frustum
          }
        });

        // Esconde meshes de efeito (ex: teias do Spider-Man) ANTES de medir,
        // senão as teias esticadas inflam o bbox e o personagem fica minúsculo.
        if (cfg.hide) {
          model.traverse(o => {
            if (!(o.isMesh || o.isSkinnedMesh)) return;
            const porMat = cfg.hide.materials && o.material && cfg.hide.materials.includes(o.material.name);
            const porNome = cfg.hide.nodes && cfg.hide.nodes.includes(o.name);
            if (porMat || porNome) o.visible = false;
          });
        }

        // 2) AUTO-ESCALA: mede o bbox SÓ dos meshes visíveis (ignora teias).
        // Usa setFromObject POR mesh (respeita o skinning; geometry.boundingBox
        // cru daria a pose não-deformada, inflando a altura de skinned meshes).
        model.updateMatrixWorld(true);
        const box = new THREE.Box3();
        const _tmp = new THREE.Box3();
        model.traverse(o => {
          if ((o.isMesh || o.isSkinnedMesh) && o.visible) {
            _tmp.setFromObject(o);
            box.union(_tmp);
          }
        });
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const alturaOriginal = size.y || 1;
        const escala = cfg.targetHeight / alturaOriginal;

        console.log(`📏 ${key}: altura original = ${alturaOriginal.toFixed(2)}, escala = ${escala.toFixed(4)}`);

        // 3) Estrutura de 2 grupos:
        //    outer  → escala + rotação + posição na cena
        //    inner  → recentragem (a animação NÃO controla este nó)
        const inner = new THREE.Group();
        inner.position.set(-center.x, -box.min.y, -center.z);
        inner.add(model);

        const [x, z] = cfg.position;
        const outer = new THREE.Group();
        outer.add(inner);
        outer.scale.setScalar(escala);
        outer.rotation.y = cfg.rotation;
        outer.position.set(x, 0, z);

        scene.add(outer);

        // 4) Mixer + animações
        const mixer = new THREE.AnimationMixer(model);

        console.log(`\n🎭 ${key.toUpperCase()} — ${anims.length} animações:`);
        anims.forEach((clip, i) => console.log(`  [${i}] "${clip.name}"`));

        // Toca a animação inicial (primeira da lista curada = "Parado")
        const moves = cfg.moves || anims.map((_, i) => ({ i, label: `Movimento ${i + 1}` }));
        let currentAction = null;
        const inicial = moves[0] ? moves[0].i : 0;
        if (anims[inicial]) {
          currentAction = mixer.clipAction(anims[inicial]);
          currentAction.play();
        }

        // Captura ESCALA e POSIÇÃO base de TODOS os nós (bones inclusos).
        // No loop resetamos após cada update do mixer:
        //  • escala travada → mata inflação
        //  • posição travada → mata root-motion (ex: hips que arrasta o
        //    personagem pra cima da câmera no Kamehameha)
        // A animação continua, pois é feita por ROTAÇÃO (quaternion),
        // que deixamos livre.
        const locks = [];
        model.traverse(n => locks.push({
          node: n,
          pos: n.position.clone(),
          scale: n.scale.clone(),
        }));

        // Meshes com morph targets — certas animações (ex: aura de
        // energia do Goku no Kamehameha/Ossu) inflam a geometria via
        // morph. Zeramos a cada frame para matar essas "auras" bugadas.
        const morphMeshes = [];
        model.traverse(o => {
          if (o.morphTargetInfluences && o.morphTargetInfluences.length) {
            morphMeshes.push(o);
          }
        });

        mixers.push(mixer);
        chars[key] = {
          model, mixer, anims, moves, currentAction, locks, morphMeshes,
          nome: cfg.nome || key,      // usado pela UI
          cor: cfg.cor || '#555',
          ordem: cfg.ordem ?? 99,
        };

        console.log(`✅ ${key} carregado`);
        resolve(chars[key]);
      },
      (xhr) => {
        if (xhr.total > 0) {
          console.log(`${key}: ${Math.round(xhr.loaded / xhr.total * 100)}% carregado`);
        }
      },
      (err) => {
        console.error(`❌ Erro ao carregar ${key}:`, err);
        resolve(null);
      }
    );
  });
}

// ── Carrega todos os personagens registrados na pasta ─────
export async function loadAllCharacters(scene) {
  await Promise.all(PERSONAGENS.map(cfg => loadCharacter(scene, cfg.key)));
  console.log('\nTodos os personagens carregados!');
}

// ── Trava os nós raiz (chamar no loop, após mixer.update) ──
//  Neutraliza root-motion/escala que fazem o personagem crescer
//  ou sair do lugar durante certas animações.
export function aplicarRootLocks() {
  Object.values(chars).forEach(c => {
    if (c.locks) {
      c.locks.forEach(l => {
        l.node.position.copy(l.pos);
        l.node.scale.copy(l.scale);
      });
    }
    // Zera morph targets (mata auras de energia que inflam a geometria)
    if (c.morphMeshes) {
      c.morphMeshes.forEach(m => m.morphTargetInfluences.fill(0));
    }
  });
}

// ── Troca de animação (usado pelo controls.js) ────────────
export function playAnimation(charKey, animIndex) {
  const char = chars[charKey];
  if (!char || !char.anims[animIndex]) return;

  if (char.currentAction) {
    char.currentAction.fadeOut(0.3);
  }

  const next = char.mixer.clipAction(char.anims[animIndex]);
  next.reset().fadeIn(0.3).play();
  char.currentAction = next;
}
