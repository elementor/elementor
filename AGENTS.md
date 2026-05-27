# Elementor Development Guide

## Cursor Cloud specific instructions

### System Requirements (pre-installed in update script)
- Node.js 24.15.0 (via nvm, path prepended in `~/.bashrc`)
- npm 11.x (comes with Node 24)
- PHP 8.3 with extensions: mbstring, xml, zip, curl, dom, bcmath
- Composer 2.x
- Docker (with fuse-overlayfs + iptables-legacy for nested containers)

### PATH Note
The VM has a system Node at `/exec-daemon/node` (v22). The nvm-managed v24.15.0 is prepended to PATH via `~/.bashrc`. If commands fail with engine mismatch, verify `which node` points to `~/.nvm/versions/node/v24.15.0/bin/node`.

### Key Commands (see CONTRIBUTING.md and package.json for full list)
| Action | Command |
|--------|---------|
| Install all deps | `npm ci --ignore-scripts && composer install` |
| Build packages | `npm run build:packages` |
| Build styles | `npx grunt styles` |
| Build scripts | `npx grunt scripts` |
| Full dev watch | `npm run watch` |
| Lint JS/TS (root) | `npx eslint .` |
| Lint JS/TS (packages) | `cd packages && npx eslint . --report-unused-disable-directives-severity error` |
| Lint PHP | `vendor/bin/phpcs --extensions=php --standard=./ruleset.xml .` |
| Jest tests (main) | `npm run test:jest` |
| Jest tests (packages) | `npm run test:packages` |
| All Jest tests | `npm run test` |

### Starting the WordPress Dev Environment
The WordPress test environment uses `@elementor/wp-lite-env` (Docker-based). Before starting:
1. Docker daemon must be running: `sudo dockerd &>/tmp/dockerd.log &` then `sudo chmod 666 /var/run/docker.sock`
2. Build the plugin into `./build/`: `composer install --no-scripts --no-dev && composer dump-autoload && npx grunt copy`
3. Download hello-elementor theme if not present: `curl -L -o hello-elementor.zip https://downloads.wordpress.org/theme/hello-elementor.zip && unzip -o hello-elementor.zip && rm hello-elementor.zip`
4. Set up templates: `npm run setup-templates`
5. Start: `npx wp-lite-env start --config=./tests/playwright/.playwright-wp-lite-env.json --port=8888`
6. Run setup: `npm run test:setup:playwright`

WordPress will be available at http://localhost:8888 (admin/password).

### Gotchas
- The `npm run lint` command runs ESLint on root AND packages workspace (`npm run lint -w elementor-packages`). Both must pass.
- PHPCS reports only warnings (0 errors) on the current codebase - this is expected.
- The `composer install` post-install script runs `php-scoper` to prefix Twig. This requires the `humbug/php-scoper` dev dependency.
- For production-like builds (`./build` dir), use `composer install --no-scripts --no-dev` first, then `npx grunt copy`. Dev dependencies must be restored afterward with `composer install`.
- The `engines` field requires Node >=24.15.0. Do not downgrade.
- Husky pre-commit hook runs `lint-staged` with `NODE_OPTIONS=--max-old-space-size=8192`.
