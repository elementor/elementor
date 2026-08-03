# Agent and cloud environment guide

Short reference for Cursor Cloud and other non-interactive agents. For full human onboarding use [CONTRIBUTING.md](CONTRIBUTING.md) and [tests/test-environment-setup.md](tests/test-environment-setup.md).

**Source of truth for commands:** root [package.json](package.json) scripts (and [composer.json](composer.json) for PHPUnit). Prefer those named scripts over raw `npm ci` / `grunt` / `composer` invocations.

## Choosing a WordPress environment

| Runtime | When to use | Ports / URL |
|--------|-------------|----------------|
| **wp-lite-env** (Docker) | Same stack as Playwright in CI (`.github/workflows/playwright.yml`). Full PHP/MySQL containers, two WP instances. | http://localhost:8888 and http://localhost:8889 |
| **WP Playground CLI** (`npm run wp-playground`) | No Docker. WordPress in WASM; quick editor and blueprint-driven setup. | http://127.0.0.1:9400 |
| **wp-env** (`npm run wp-env`, [.wp-env.json](.wp-env.json)) | Alternative Docker-based `@wordpress/env` setup. | See `@wordpress/env` defaults after `wp-env start` |

Use **wp-lite-env** for Docker parity with CI Playwright. Use **WP Playground** when Docker is missing/broken or for quick editor checks. Blueprint: [tests/playwright/blueprints/local.json](tests/playwright/blueprints/local.json).

## Cursor Cloud specifics

### Layout

- Core: `/agent/repos/elementor`
- Pro (sibling): `/agent/repos/elementor-pro` — Pro's `wp-playground` mounts `../elementor`

### Snapshot vs update script

| Layer | What |
|-------|------|
| **Snapshot** | Node (`.nvmrc` via nvm), PHP 8.3 + mysqli, Composer, svn, Docker; both repos already ran `npm run install` + `npm run start`; MySQL `wp-mysql` + Core `tmp/` from `bin/install-wp-tests.sh` |
| **Update script (every session)** | `npm run install` in Core and Pro ([package.json](package.json) → `npm ci --ignore-scripts --no-audit && composer install`). No builds, no service starts |

After JS/CSS source changes, use the dedicated [package.json](package.json) scripts — don't chain `build:packages` + `grunt` by hand:

```bash
npm run start    # dev one-shot: composer:no-dev + build:packages + styles + scripts
npm run watch    # dev watch (CONTRIBUTING.md local loop)
npm run build    # production build into ./build (CI: build-zip.sh)
```

Note: `npm run start` / `npm run watch` run `composer:no-dev`, which strips PHPUnit. Restore PHPUnit afterward with `composer install` (or re-run `npm run install`) before `vendor/bin/phpunit` / `composer run test`.

### PATH

`/exec-daemon/node` may shadow nvm. Confirm `which node` matches [.nvmrc](.nvmrc). Prefer shell cwd `/agent` (wp-playground chroots under `/tmp/node-playground-cli-site-*` break `/bin/bash`).

### Canonical scripts ([package.json](package.json) / CI)

| Goal | Script | Notes |
|------|--------|-------|
| Local / Cloud deps | `npm run install` | CONTRIBUTING.md; used by Cloud update script |
| CI deps | `npm run install:ci` then `npm run composer:no-dev` | `.github/workflows/install-dependencies` |
| **Build (dev one-shot)** | `npm run start` | `composer:no-dev` + `build:packages` + `styles` + `scripts` |
| **Build (production)** | `npm run build` | into `./build`; CI `build-zip.sh` |
| **Watch** | `npm run watch` | dev watch (CONTRIBUTING.md) |
| Lint | `npm run lint` | Root + packages workspace |
| Jest | `npm run test` / `test:jest` / `test:packages` | |
| Playwright env (Docker) | `SKIP_CONFIRMATION=true npm run env:setup` | → `scripts/setup-test-environment.sh` |
| Playwright run | `npm run test:playwright` | After env setup |
| Playground (no Docker) | `npm run wp-playground` | |
| PHPUnit (CI-like) | `composer run test` | After `bin/install-wp-tests.sh` + MySQL |
| Fast DB-less PHPUnit | `tests/phpunit/run-unit.sh <file…>` | No WP/MySQL |

### Fast DB-less PHPUnit

```bash
tests/phpunit/run-unit.sh tests/phpunit/elementor/modules/atomic-widgets/css-converter/test-css-converter.php
tests/phpunit/run-unit.sh tests/phpunit/.../test-css-converter.php --filter test_convert
```

Only for subjects that never touch WordPress at load/run time. Otherwise use the MySQL suite below.

## Full PHPUnit suite (standalone MySQL — CI-aligned)

Matches `.github/workflows/phpunit-runner.yml`: MySQL + `bin/install-wp-tests.sh` + `composer run test` (or `vendor/bin/phpunit`).

Fresh-boot service start (not in the update script):

```bash
sudo bash -c 'nohup dockerd >/tmp/dockerd.log 2>&1 &'   # if `docker info` fails
sudo chmod 666 /var/run/docker.sock                      # disposable env only
docker start wp-mysql
until mysqladmin ping -h127.0.0.1 -P3306 -uroot -proot --protocol=tcp 2>/dev/null | grep -q "is alive"; do sleep 2; done
```

From Core repo root (`phpunit.xml` → `WP_TESTS_DIR=./tmp/wordpress-tests-lib`):

```bash
composer run test                                        # full suite (CI)
vendor/bin/phpunit --filter '<Test_Class_Name>'          # filtered
```

DB facts in `tmp/wordpress-tests-lib/wp-tests-config.php`: DB `wordpress_test`, user/pass `root`/`root`, host `127.0.0.1:3306`.

Recreate if missing:

```bash
docker run --name wp-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_ROOT_HOST=% \
  -p 3306:3306 -d --restart unless-stopped mysql:8.0 --default-authentication-plugin=mysql_native_password
WP_TESTS_DIR="$PWD/tmp/wordpress-tests-lib" WP_CORE_DIR="$PWD/tmp/wordpress/" \
  bash bin/install-wp-tests.sh wordpress_test root root 127.0.0.1:3306 latest
```

Gotchas:
- Docker 29 needs `containerd-snapshotter` disabled for `fuse-overlayfs` (already in snapshot).
- Do not pass raw `test-*.php` paths to PHPUnit; use `--filter <Class>` (filename ≠ classname).
- Harmless shutdown noise: `wptests_options` missing after bootstrap `drop_tables` races Elementor's DB logger — ignore if the result line is `OK (...)`.
- PHPUnit needs Composer **dev** deps; if you just ran `npm run start`/`watch`, run `composer install` (or `npm run install`) again first.

## wp-lite-env (Docker): full Playwright setup

CI-like one-shot ([tests/test-environment-setup.md](tests/test-environment-setup.md)):

```bash
SKIP_CONFIRMATION=true npm run env:setup
```

That runs `install:ci` → `build:packages` → `composer:no-dev` → `grunt scripts styles` → hello-elementor → `start-local-server` (8888 **and** 8889) → `test:setup:playwright`.

Manual equivalent: same doc / [package.json](package.json) `start-local-server` + `test:setup:playwright`.

Admin: http://localhost:8888/wp-admin/ — `admin` / `password`.

## WP Playground CLI (no Docker)

Needs a prior `npm run start` (or equivalent assets). Core alone:

```bash
npm run wp-playground
```

Pro (mounts both; preferred for full product) — from `/agent/repos/elementor-pro`:

```bash
npm run wp-playground
# → http://127.0.0.1:9400  admin/password
```

If SQLite corrupts (`database disk image is malformed`): stop playground, `rm -rf /tmp/node-playground-cli-site-*`, restart. Keep shell cwd at `/agent`.

CI mount of built Core: `npm run wp-playground:ci` (expects `./build`).

## Gotchas

- Prefer [package.json](package.json) script names (`install`, `start`, `watch`, `env:setup`, `test`, `lint`) over inventing raw command chains.
- `npm run lint` must pass at root **and** packages workspace.
- PHPCS may report warnings; treat policy from maintainers.
- `composer install` post-install runs php-scoper; needs `humbug/php-scoper` (dev install).
- `engines` + `.nvmrc` must stay aligned.
- Husky pre-commit: `lint-staged` with `NODE_OPTIONS=--max-old-space-size=8192`.
