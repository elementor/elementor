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

### What the environment snapshot already contains

Repos live under `/agent/repos/elementor` (Core) and `/agent/repos/elementor-pro` (Pro, sibling — required for Pro's `../elementor` wp-playground mount). The snapshot has:

- Node from [.nvmrc](.nvmrc) (nvm), PHP 8.3 + extensions (mbstring, xml, zip, curl, dom, bcmath, mysqli), Composer 2.x, subversion, Docker CE (`fuse-overlayfs`, `containerd-snapshotter` disabled)
- Full `npm ci` + `composer install` + **built assets** for both Core and Pro (`npm run build:packages && npx grunt styles && npx grunt scripts`)
- MySQL 8.0 container `wp-mysql` (`root`/`root` @ `127.0.0.1:3306`) and WordPress PHPUnit lib under Core `tmp/` (from `bin/install-wp-tests.sh`)

### Update script (runs every session — deps only)

Refreshes Node PATH, then `npm ci --ignore-scripts --no-audit` + `composer install` for **both** repos. It intentionally does **not** rebuild assets, start Docker/MySQL/wp-playground, or re-provision `tmp/` (those are brittle / already snapshotted). After pulling JS/CSS/PHP package source changes, rebuild yourself:

```bash
# Core and/or Pro, from that repo root:
npm run build:packages && npx grunt styles && npx grunt scripts
# or continuous: npm run watch
```

### PATH

`/exec-daemon/node` may shadow nvm. Prefer `which node` → nvm binary matching `.nvmrc`. `~/.bashrc` prepends the nvm Node bin.

### Common commands

| Action | Command |
|--------|---------|
| Install deps | `npm ci --ignore-scripts && composer install` |
| Build packages | `npm run build:packages` |
| Build styles | `npx grunt styles` |
| Build scripts | `npx grunt scripts` |
| Full one-shot build | `npm run build:packages && npx grunt styles && npx grunt scripts` |
| Full dev watch | `npm run watch` |
| Lint JS/TS (root) | `npx eslint .` |
| Lint JS/TS (packages) | `cd packages && npx eslint . --report-unused-disable-directives-severity error` |
| Lint PHP | `vendor/bin/phpcs --extensions=php --standard=./ruleset.xml .` |
| Jest (main) | `npm run test:jest` |
| Jest (packages) | `npm run test:packages` |
| All Jest | `npm run test` |
| Fast DB-less PHPUnit (single/few files) | `tests/phpunit/run-unit.sh <test-file.php> [<test-file.php> ...] [--filter <pattern>]` |

### Fast DB-less PHPUnit for local dev

`tests/phpunit/run-unit.sh` runs a small set of PHPUnit files **without WordPress or MySQL** for a quick inner loop. It uses `tests/phpunit/unit-bootstrap.php`, which only defines `ABSPATH` and registers an `Elementor\` autoloader (same name->path transform as `includes/autoloader.php`), and ignores the project `phpunit.xml`. Pass any number of `test-*.php` files (added to a generated testsuite, which sidesteps PHPUnit's `test-*.php` ↔ `Test_*` filename/classname assumption) plus optional pass-through args like `--filter`.

```bash
tests/phpunit/run-unit.sh tests/phpunit/elementor/modules/atomic-widgets/css-converter/test-css-converter.php
tests/phpunit/run-unit.sh tests/phpunit/.../test-css-converter.php --filter test_convert
```

Only works for tests whose subjects don't touch WordPress at load/run time. Tests needing WordPress/MySQL (e.g. REST endpoints with `act_as_admin`/`WP_REST_Server`, or anything pulling `Style_Schema`) must use the full suite (`npm run test:setup:playwright` env, the standalone MySQL container below, or the wp-lite-env setup below).

## Full PHPUnit suite (standalone MySQL container)

Lightweight DB-backed PHPUnit (`vendor/bin/phpunit`) without wp-lite-env's two-instance stack — MySQL 8.0 container `wp-mysql` + WordPress test library from `bin/install-wp-tests.sh`. Container + `tmp/` + `vendor/` are snapshotted; fresh VMs only need the **service startup** below.

PHPUnit exercises PHP only: the plugin is activated in-process by `tests/bootstrap.php` (`wp_tests_options['active_plugins']` + `muplugins_loaded`). A JS/CSS build is **not** required for PHPUnit (verified: full suite 4037 tests / 0 failures with `assets/js` absent). The editor/wp-playground path **does** need the build (already in the snapshot; rebuild after source changes — see Update script above).

Startup after a fresh boot (Docker has no systemd here, so `dockerd` and the container must be started by hand; the update script must not do this):

```bash
sudo bash -c 'nohup dockerd >/tmp/dockerd.log 2>&1 &'   # if `docker info` fails
sudo chmod 666 /var/run/docker.sock                      # disposable env only
docker start wp-mysql                                     # MySQL 8.0 on 127.0.0.1:3306
# wait for readiness
until mysqladmin ping -h127.0.0.1 -P3306 -uroot -proot --protocol=tcp 2>/dev/null | grep -q "is alive"; do sleep 2; done
```

Run the suite (must run from the Core repo root so `phpunit.xml`'s `WP_TESTS_DIR=./tmp/wordpress-tests-lib` resolves):

```bash
vendor/bin/phpunit --filter '<Test_Class_Name>'          # a class/group; full run is very large
```

DB/connection facts (already wired into `tmp/wordpress-tests-lib/wp-tests-config.php`):
- DB `wordpress_test`, user `root`, pass `root`, host `127.0.0.1:3306`, `ABSPATH` → `tmp/wordpress/`.
- `tmp/` is gitignored; it holds WP core (`tmp/wordpress/`) and the test lib (`tmp/wordpress-tests-lib/`).

If the container is missing (snapshot lost it), recreate and re-provision:

```bash
docker run --name wp-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_ROOT_HOST=% \
  -p 3306:3306 -d --restart unless-stopped mysql:8.0 --default-authentication-plugin=mysql_native_password
WP_TESTS_DIR="$PWD/tmp/wordpress-tests-lib" WP_CORE_DIR="$PWD/tmp/wordpress/" \
  bash bin/install-wp-tests.sh wordpress_test root root 127.0.0.1:3306 latest
```

Gotchas:
- Docker 29 needs `containerd-snapshotter` disabled in `/etc/docker/daemon.json` for `fuse-overlayfs` to work in this nested VM (already configured in the snapshot).
- Passing a raw `test-*.php` path to `vendor/bin/phpunit` fails with "Class ... could not be found" because Elementor's class names don't match PHPUnit's filename convention; use `--filter <Class>` (or a group) against the configured testsuite instead.
- A harmless `WordPress database error: Table 'wordpress_test.wptests_options' doesn't exist` can print on shutdown — the bootstrap's `drop_tables` shutdown filter races Elementor's DB logger. It does not affect the test result line (`OK (...)`).
- Shell cwd can land inside the wp-playground site chroot (`/tmp/node-playground-cli-site-*`) where `/bin/bash` is missing; run agent shell commands with cwd `/agent` (or a real repo root) instead.
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

Requires **built** Core (and Pro, if testing Pro). From Core alone:

```bash
npm run wp-playground
```

From Pro (mounts both plugins; preferred for full product):

```bash
# cwd = /agent/repos/elementor-pro (sibling ../elementor must exist and be built)
npm run wp-playground
# → http://127.0.0.1:9400  admin/password
# Blueprint activates Elementor + Elementor Pro + Hello Elementor
```

Wait until the CLI prints that WordPress is running. If the SQLite site DB becomes malformed (`database disk image is malformed`), stop the process, `rm -rf /tmp/node-playground-cli-site-*`, and restart. Prefer running shell commands with cwd `/agent` so you don't inherit the playground chroot.

For CI-style mounted **build** output use `npm run wp-playground:ci` (expects `./build`).
## Gotchas

- `npm run lint` runs ESLint at the repo root and in the `elementor-packages` workspace (`npm run lint -w elementor-packages`); both must pass.
- PHPCS may report warnings without errors on the current tree; treat policy from maintainers, not only the exit summary.
- `composer install` post-install can run php-scoper (Twig prefixing); dev dependency `humbug/php-scoper` must be present for a full dev install.
- For a production-like plugin tree under `./build`, many flows use `composer install --no-scripts --no-dev` first, then `npx grunt copy`. Dev dependencies must be restored afterward with `composer install`.
- [package.json](package.json) `engines` and `.nvmrc` define the Node version; keep them aligned when troubleshooting.
- Husky pre-commit runs `lint-staged` with `NODE_OPTIONS=--max-old-space-size=8192` (see [.husky/pre-commit](.husky/pre-commit)).
