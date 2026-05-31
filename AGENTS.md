# Agent and cloud environment guide

Short reference for Cursor Cloud and other non-interactive agents. For full human onboarding use [CONTRIBUTING.md](.github/CONTRIBUTING.md) and [tests/test-environment-setup.md](tests/test-environment-setup.md).

## Choosing a WordPress environment

| Runtime | When to use | Ports / URL |
|--------|-------------|----------------|
| **wp-lite-env** (Docker) | Same stack as Playwright in CI (`.github/workflows/playwright.yml`). Full PHP/MySQL containers, two WP instances. | http://localhost:8888 and http://localhost:8889 |
| **WP Playground CLI** (`npm run wp-playground`) | No Docker. WordPress in WASM; quick editor and blueprint-driven setup. Default listen address matches local Playwright dev base URL. | http://127.0.0.1:9400 |
| **wp-env** (`npm run wp-env`, [.wp-env.json](.wp-env.json)) | Alternative Docker-based `@wordpress/env` setup used in other workflows and docs. | See `@wordpress/env` defaults after `wp-env start` |

Use **wp-lite-env** when you need Docker parity with CI (full Playwright against 8888/8889, `setup.sh`, theme on disk). Use **WP Playground** when Docker is missing or broken; it is sufficient for many editor checks and aligns with `tests/playwright/playwright.config.ts` local `localDevServer` / `localTestServer` (both `http://127.0.0.1:9400` when not in CI). WP Playground still uses a blueprint ([tests/playwright/blueprints/local.json](tests/playwright/blueprints/local.json)) so PHP/WordPress versions may differ from [tests/playwright/.playwright-wp-lite-env.json](tests/playwright/.playwright-wp-lite-env.json).

## Cursor Cloud specifics

### System requirements (typical VM image)

- Node.js version from [.nvmrc](.nvmrc) (via nvm; PATH in `~/.bashrc`)
- PHP >= 7.4 with extensions: mbstring, xml, zip, curl, dom, bcmath (see [composer.json](composer.json))
- Composer 2.x
- Docker only if you use wp-lite-env or wp-env (often needs fuse-overlayfs and iptables-legacy in nested setups)

### PATH

The image may ship a system Node under `/exec-daemon/node` that does not match `.nvmrc`. If installs or engines fail, confirm `which node` points at the nvm-managed binary.

### Common commands

| Action | Command |
|--------|---------|
| Install deps | `npm ci --ignore-scripts && composer install` |
| Build packages | `npm run build:packages` |
| Build styles | `npx grunt styles` |
| Build scripts | `npx grunt scripts` |
| Full dev watch | `npm run watch` |
| Lint JS/TS (root) | `npx eslint .` |
| Lint JS/TS (packages) | `cd packages && npx eslint . --report-unused-disable-directives-severity error` |
| Lint PHP | `vendor/bin/phpcs --extensions=php --standard=./ruleset.xml .` |
| Jest (main) | `npm run test:jest` |
| Jest (packages) | `npm run test:packages` |
| All Jest | `npm run test` |

## wp-lite-env (Docker): full setup

Non-interactive one-shot (skips container cleanup prompt):

```bash
SKIP_CONFIRMATION=true npm run env:setup
```

That script installs deps, builds, downloads Hello Elementor, runs `npm run start-local-server` (8888 **and** 8889), then `npm run test:setup:playwright`. Do not start only 8888 and then run `npm run test:setup:playwright` alone; [package.json](package.json) expects both ports.

Manual equivalent: see [tests/test-environment-setup.md](tests/test-environment-setup.md) (steps: `npm run start-local-server` then `npm run test:setup:playwright`).

If Docker is not running on the VM yet, a typical pattern is `sudo dockerd &>/tmp/dockerd.log &` in the background, then ensure the Docker socket is usable for the agent user (for example `sudo chmod 666 /var/run/docker.sock` in **disposable** environments only). For a manual plugin tree under `./build/` without the setup script, flows often use `composer install --no-scripts --no-dev && composer dump-autoload && npx grunt copy`, then `npm run setup-templates`, then start **both** wp-lite-env instances (see `npm run start-local-server` in [package.json](package.json)).

Admin: http://localhost:8888/wp-admin/ — user `admin`, password `password` (see test environment doc).

## WP Playground CLI (no Docker)

After `npm ci` (or full install per repo):

```bash
npm run wp-playground
```

Wait until the CLI prints that WordPress is running, then open http://127.0.0.1:9400 . This flow was smoke-tested with the same CLI flags as [package.json](package.json) `wp-playground` in a clean agent-style environment without Docker.

For CI-style mounted **build** output use `npm run wp-playground:ci` (expects `./build`).

## Gotchas

- `npm run lint` runs ESLint at the repo root and in the `elementor-packages` workspace (`npm run lint -w elementor-packages`); both must pass.
- PHPCS may report warnings without errors on the current tree; treat policy from maintainers, not only the exit summary.
- `composer install` post-install can run php-scoper (Twig prefixing); dev dependency `humbug/php-scoper` must be present for a full dev install.
- For a production-like plugin tree under `./build`, many flows use `composer install --no-scripts --no-dev` first, then `npx grunt copy`. Dev dependencies must be restored afterward with `composer install`.
- [package.json](package.json) `engines` and `.nvmrc` define the Node version; keep them aligned when troubleshooting.
- Husky pre-commit runs `lint-staged` with `NODE_OPTIONS=--max-old-space-size=8192` (see [.husky/pre-commit](.husky/pre-commit)).
