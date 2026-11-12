---
name: atomic-menu-dev
description: "Internal: Work on the v4 atomic Menu (e-menu, items, toggle) in Core. Structure, Alpine handlers, collapse CSS, gotchas, verification recipe, known editor limitation."
---

# Atomic Menu development

Scope: Internal (Core). Experiment: `e_nav_menu`.

## Structure

- `modules/atomic-widgets/elements/atomic-menu/`: `atomic-menu` (parent), `atomic-menu-items` (items), `atomic-menu-toggle` with locked children `atomic-menu-toggle-closed` and `atomic-menu-toggle-open`. Each of those holds an `Atomic_Svg` default child, hydrated client-side (`hydrate_default_children( true )`).
- Registration: `modules/atomic-widgets/module.php` (`register_menu_elements`).
- Handlers: `handlers/atomic-menu-handler.js` registers `Alpine.data( 'eMenu' + id )` per element. `atomic-menu-preview-handler.js` is editor-only. Both are Vite entries in `scripts/vite/shared/entries.mjs`; PHP registers them as `elementor-menu-handler` and `elementor-menu-preview-handler` (`get_script_depends`, `register_frontend_handlers`).
- Collapse CSS: `Atomic_Menu::get_collapse_css()`, injected globally by `add_inline_styles()` in `module.php`. It does not depend on cached per-page CSS.

## Gotchas

- A default that depends on active breakpoints cannot be a schema default. Use `define_base_settings()` plus `applyBaseSettings()` in `assets/js/editor/atomic-element-base-model.js` so it is stored on element creation.
- Default-content PHPUnit tests need the hydrate flag on child SVGs; assert the closed and open configs separately.
- Core resolves `attributes` to null (Pro provides the transformer). Test a custom `aria-label` by rendering the Twig directly.
- Twig has no `string` test: use `is not empty`. `Breakpoint::DIRECTION_MAX` does not exist: use `'max'`.
- Never return `undefined` from an Alpine `x-bind` for `aria-label`: it removes the attribute. Return the current attribute value.
- Atomic base styles are cached per page and in WP Playground. After changing them: Elementor > Tools > Regenerate CSS, and restart the playground (use `--workers=1`).
- Toggle width: the collapse CSS sets `flex:0 0 auto;width:auto` on the toggle so themes cannot stretch it.

## Verify

- PHP: `vendor/bin/phpunit --filter Test_Atomic_Menu` (needs the `wp-mysql` Docker container; see AGENTS.md). `vendor/bin/phpcs` on touched files.
- JS: `npx eslint` on handlers; rebuild handlers with `npm run scripts`.
- Browser (playground, Chromium): seed pages with a menu (default and in-flow position) via a blueprint, then check collapse at the Tablet and Mobile breakpoints, `aria-expanded` and label switching, `aria-controls`, Escape closes and restores focus, outside click closes in overlay only, Enter on the toggle, RTL placement, widening the viewport, and no page errors.

## Known limitation

A saved menu already on the page when the editor opens has no Alpine data stack: the editor keeps `x-ignore` on the nav. Menus added from the panel work after `refreshTree( element )` in the preview handler. Already tried without success: listening to child render events, removing `x-ignore` before `refreshTree`, deferring the refresh with a timeout. Next idea: inspect `_initAlpine` in `packages/packages/core/editor-canvas/src/legacy/create-nested-templated-element-type.ts` and whether the editor re-renders the menu and re-adds `x-ignore` after load.
