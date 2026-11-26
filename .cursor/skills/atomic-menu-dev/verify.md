# Verify

## Core

- PHP: `vendor/bin/phpunit --filter Test_Atomic_Menu` (and `Test_Submenu_Pro_Promotion`); needs the `wp-mysql` container (see AGENTS.md). `vendor/bin/phpcs` on touched files.
- JS: `npx eslint` on handlers; rebuild with `npm run scripts`. Jest: `npm run test:jest` (handlers) and `npm run test:packages` (editor-canvas `menu-structure`, `menu-items-control`, `link-restriction`).
- Playwright (`tests/playwright/sanity/modules/v4-tests/`): `atomic-menu`, `atomic-menu-collapse`, `atomic-menu-submenu-lock`, `menu-placement-restrictions`.

## Pro

- PHPUnit: `tests/phpunit/elementor-pro/modules/atomic-menu/` (`test-module.php`, `test-atomic-menu-submenu.php`).
- Jest: `tests/jest/unit/modules/atomic-menu/assets/js/frontend/`; package tests in `packages/packages/pro/editor-atomic-menu/src/`.
- Playwright: `tests/playwright/sanity/modules/v4/` (`atomic-menu-submenu-open-close`, `atomic-menu-in-popup`); gate new tests with `tests/playwright/assets/version-gates.ts`.

## Browser checklist (playground, Chromium; Pro playground mounts both plugins)

Seed pages via a blueprint: default and in-flow position, with and without Submenus. Check collapse at Desktop, Tablet, Mobile and None; `aria-expanded` and label switching; `aria-controls`; Escape closes and restores focus; outside click closes in overlay only; Enter on the toggle; Submenu click and hover, placement options, RTL; collapsed accordion with `one-per-level` and `multiple`; current and ancestor classes; widening the viewport; no page errors. After base-style changes: Regenerate CSS.
