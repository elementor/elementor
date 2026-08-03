# Elementor Core — local & agent development

Works for **laptop local development** and **Cursor Cloud / non-interactive agents**. Commands are the same; Cloud-only notes are at the bottom.

**Source of truth:** root [package.json](package.json) scripts (and [composer.json](composer.json) for PHPUnit). Prefer named scripts over raw `npm ci` / `grunt` / `composer` chains.

Longer human onboarding: [CONTRIBUTING.md](CONTRIBUTING.md), Playwright Docker: [tests/test-environment-setup.md](tests/test-environment-setup.md).

## Layout (Core + Pro)

Clone as siblings so Pro can see Core at `../elementor`:

```text
parent/
├── elementor/          # this repo
└── elementor-pro/      # Pro mounts ../elementor in wp-playground
```

Cloud paths: `/agent/repos/elementor` and `/agent/repos/elementor-pro`.

## How to do everything (local recipe)

Use Node from [.nvmrc](.nvmrc). From **this repo root**:

### 1. Install dependencies

```bash
npm run install
# = npm ci --ignore-scripts --no-audit && composer install
```

### 2. Build once (dev assets)

```bash
npm run start
# = composer:no-dev + build:packages + styles + scripts
```

Production zip-style build into `./build`:

```bash
npm run build
```

### 3. Watch while coding

```bash
npm run watch
```

Note: `start` / `watch` / `build` run `composer:no-dev` and strip PHPUnit. Before PHPUnit, restore with `composer install` or `npm run install`.

### 4. Run WordPress (pick one)

| Goal | Command | URL |
|------|---------|-----|
| Quick editor (no Docker) | `npm run wp-playground` | http://127.0.0.1:9400 |
| Core **and** Pro together | from `../elementor-pro`: `npm run wp-playground` | same — mounts Pro + `../elementor` |
| Playwright CI parity (Docker) | `SKIP_CONFIRMATION=true npm run env:setup` | http://localhost:8888 and :8889 |

Playground login: `admin` / `password`. After asset changes, rebuild (`start`) or keep `watch` running.

### 5. Lint & unit tests

```bash
npm run lint          # ESLint root + packages
npm run test          # all Jest
npm run test:jest     # main Jest only
npm run test:packages # packages Jest only
```

### 6. PHPUnit

Fast, no WordPress/MySQL (only for pure PHP subjects):

```bash
tests/phpunit/run-unit.sh tests/phpunit/elementor/.../test-something.php
```

Full suite (CI-like: MySQL + WordPress test lib):

```bash
# once: MySQL + bin/install-wp-tests.sh (see "Full PHPUnit suite" below)
composer run test
# or filtered:
vendor/bin/phpunit --filter '<Test_Class_Name>'
```

### 7. Working with Pro day-to-day

From **elementor-pro** (after both repos `npm run install` + at least one `npm run start`):

```bash
npm run watch:with-core   # watch Core + Pro together
npm run wp-playground     # WordPress with both plugins
# or all-in-one:
npm run full-e2e-local    # watch:with-core + playground + Playwright UI
```

Details live in Pro [AGENTS.md](../elementor-pro/AGENTS.md).

## Script cheat sheet

| Goal | Script |
|------|--------|
| Deps | `npm run install` |
| CI deps | `npm run install:ci` then `npm run composer:no-dev` |
| Dev one-shot build | `npm run start` |
| Production build | `npm run build` |
| Dev watch | `npm run watch` |
| Lint | `npm run lint` |
| Jest | `npm run test` |
| Playground (Core only) | `npm run wp-playground` |
| Playwright Docker setup | `SKIP_CONFIRMATION=true npm run env:setup` |
| Playwright run | `npm run test:playwright` |
| PHPUnit (CI-like) | `composer run test` |
| PHPUnit (docker-compose) | `npm run test:php` |
| Fast DB-less PHPUnit | `tests/phpunit/run-unit.sh <file…>` |

## WordPress environments

| Runtime | When | URL |
|---------|------|-----|
| **WP Playground** (`npm run wp-playground`) | No Docker; quick editor | http://127.0.0.1:9400 |
| **wp-lite-env** (`env:setup`) | Same as Playwright CI | :8888 and :8889 |
| **wp-env** (`npm run wp-env`) | Alternative Docker `@wordpress/env` | after `wp-env start` |

Blueprint: [tests/playwright/blueprints/local.json](tests/playwright/blueprints/local.json).

If playground SQLite corrupts (`database disk image is malformed`): stop it, `rm -rf /tmp/node-playground-cli-site-*`, restart.

## Full PHPUnit suite (MySQL)

Matches `.github/workflows/phpunit-runner.yml`.

```bash
# MySQL (example container name used in Cloud snapshot)
docker start wp-mysql   # or create:
# docker run --name wp-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_ROOT_HOST=% \
#   -p 3306:3306 -d --restart unless-stopped mysql:8.0 \
#   --default-authentication-plugin=mysql_native_password

WP_TESTS_DIR="$PWD/tmp/wordpress-tests-lib" WP_CORE_DIR="$PWD/tmp/wordpress/" \
  bash bin/install-wp-tests.sh wordpress_test root root 127.0.0.1:3306 latest

composer run test
```

`phpunit.xml` → `WP_TESTS_DIR=./tmp/wordpress-tests-lib`. DB: `wordpress_test`, `root`/`root`, `127.0.0.1:3306`.

Do not pass raw `test-*.php` paths to PHPUnit; use `--filter <Class>`.

## PR conventions (CI-enforced)

`PR Linter` runs commitlint on the **PR title** with [commitlint.config.js](commitlint.config.js), and `PR Jira Ticket Check` needs an `ED-XXXXX` key in the title, branch, or body. So the title must be:

```text
Internal: Sentence case description [ED-XXXXX]
```

Allowed types: `Feature`, `CI`, `New`, `Tweak`, `Fix`, `Experiment`, `Deprecate`, `Deprecated`, `Revert`, `Internal` (sentence case, header <= 100 chars). Conventional-commit style like `docs(agents): …` fails. Both checks only re-run on push, not on title edits.

## Gotchas

- Prefer package.json script names; do not invent ad-hoc install/build chains.
- `npm run lint` must pass at root **and** packages.
- PHPCS may warn; treat policy from maintainers.
- `composer install` post-install runs php-scoper; needs `humbug/php-scoper` (dev install).
- Keep `engines` and `.nvmrc` aligned.
- Husky pre-commit: `lint-staged` with `NODE_OPTIONS=--max-old-space-size=8192`.

## Cursor Cloud specific instructions

Same commands as local. Extra context for this VM only:

| Layer | What |
|-------|------|
| **Snapshot** | Node (`.nvmrc` via nvm), PHP 8.3 + mysqli, Composer, svn, Docker; both repos already ran `npm run install` + `npm run start`; MySQL `wp-mysql` + Core `tmp/` from `bin/install-wp-tests.sh` |
| **Update script (every session)** | `npm run install` in Core and Pro only. No builds, no service starts |

- `/exec-daemon/node` may shadow nvm — confirm `which node` matches `.nvmrc`.
- Prefer shell cwd `/agent` (wp-playground chroots under `/tmp/node-playground-cli-site-*` break `/bin/bash`).
- If `docker info` fails: `sudo bash -c 'nohup dockerd >/tmp/dockerd.log 2>&1 &'` then `sudo chmod 666 /var/run/docker.sock` (disposable env), then `docker start wp-mysql`.
- Nested Docker: `fuse-overlayfs` + `containerd-snapshotter: false` already in snapshot daemon.json.
