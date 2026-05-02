# soundcloud-front

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

Use Node.js 22, matching CI and the Docker build image. Vite 8 requires Node.js
20.19+ or 22.12+.

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## CD

В репозитории настроен GitHub Actions workflow [`.github/workflows/cd.yml`](.github/workflows/cd.yml).

Он запускается:

- при `push` в `main` или `master`;
- при пуше тега вида `v*`;
- вручную через `workflow_dispatch`.

Workflow собирает Docker-образ из [`Dockerfile`](Dockerfile) и публикует его в GHCR:

- `ghcr.io/<owner>/soundcloud-front:latest` для default branch;
- `ghcr.io/<owner>/soundcloud-front:<branch>`;
- `ghcr.io/<owner>/soundcloud-front:<tag>`;
- `ghcr.io/<owner>/soundcloud-front:sha-<commit>`.

Для веток `main` и `master` workflow также выполняет deploy на удаленный сервер по SSH.

Во время deploy workflow:

- обновляет `/opt/soundcloud-front` из `https://github.com/shoumq/soundcloud-front`;
- обновляет `/opt/soundcloud` из `https://github.com/shoumq/soundcloud`;
- запускает `docker compose -f docker-compose.prod.yml up -d --build --remove-orphans` в backend-репозитории.

Для работы deploy в GitHub repository secrets должны быть заданы:

- `DEPLOY_HOST`
- `DEPLOY_USERNAME`
- `DEPLOY_PASSWORD`
