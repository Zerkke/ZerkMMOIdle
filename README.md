# Zerk Idle MMORPG

MMORPG Idle original para navegador.

**Estado atual:** Fase 0 - Fundacao.

## Pre-requisitos

- Node.js >= 22.12.0
- npm >= 11.x

Recomendado: Node.js 24.x LTS.

## Instalacao

    npm install

## Comandos

| Comando | Descricao |
|---|---|
| npm run dev | Servidor de desenvolvimento em http://localhost:5173 |
| npm run build | Build de producao em dist/ |
| npm run preview | Pre-visualiza o build |
| npm run typecheck | Verifica tipos TypeScript |
| npm test | Testes em watch |
| npm run test:run | Testes uma vez (CI) |

## Verificacao manual

1. npm run dev
2. Abrir http://localhost:5173
3. Confirmar titulo, area de jogo, painel de personagem e navegacao inferior.
4. Redimensionar para testar responsividade.

## Tecnologias

- TypeScript (strict)
- Vite
- Phaser 3
- Vitest + jsdom