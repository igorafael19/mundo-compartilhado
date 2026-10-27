# Posto de Gasolina 3D - Three.js

Cena 3D interativa feita com [Three.js](https://threejs.org/) + [Vite](https://vitejs.dev/).
Quatro personagens animados num posto de gasolina estilo Toy Story, cada um com 3 animações controláveis por botões.

## Personagens

| Personagem | Responsável | Animações |
|---|---|---|
| Spider-Man 2099 | Igor | Parado / Andar / Ataque |
| Hulk | Danilo | Parado / Andar / Ataque |
| Rhino | Welberth | Parado / Inquieto / Ultimate |
| Goku | Emylle | Parado / Pose de luta / Kamehameha |

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (geralmente http://localhost:5173).

## Estrutura modular

Cada personagem é um arquivo independente em `src/personagens/`. O motor
(`src/characters.js`) detecta todos automaticamente — para adicionar um
personagem, basta criar um novo arquivo na pasta; nenhum outro arquivo
precisa ser editado.

```
src/
├── main.js            # integração + loop de renderização
├── scene.js           # câmera, renderer, luz
├── environment.js     # chão, céu, posto de gasolina
├── characters.js      # motor: carrega e anima os personagens
├── controls.js        # câmera orbital + painel de animações
└── personagens/
    ├── igor.js         # Spider-Man 2099
    ├── danilo.js       # Hulk
    ├── welberth.js     # Rhino
    └── emilly.js       # Goku
```

O personagem aparece sozinho na cena e no painel de controle.

## Tecnologias

- Three.js - renderização 3D
- Vite - build e servidor de desenvolvimento
- Modelos GLB do Sketchfab
