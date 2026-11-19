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
- Items layout defaults: the items' base style has no `flex-direction` (the browser default `row` applies). `get_collapse_css()` defaults the collapsed layout to `column;flex-basis:100%;width:100%` through `:where(<scope> > items)` in each collapse breakpoint block. Zero specificity means anything the author sets on `e-menu-items` in the Style tab wins, including a desktop value without a breakpoint, as with any Atomic element; the author sets a smaller-breakpoint value to change it. Toggle rules stay forced, so authors cannot override the toggle's `order`, `flex` or `width` while collapsed. Base styles are cached per page, so after changing them run Regenerate CSS.

## Submenu lock (Free and not-connected Pro)

- Types `e-menu-submenu` and `e-menu-submenu-trigger` are children of `e-menu-entry`. Without Pro, Core registers placeholders (`Atomic_Menu_Submenu_Promotion`, `Atomic_Menu_Submenu_Trigger_Promotion`, built on `Atomic_Pro_Promotion_Element_Base`): hidden from the panel, render nothing, data kept on save by `Pro_Promotion_Data_Preservation`. Pro must register the same types and schema.
- `Submenu_Entitlement` decides the lock: Core locks only when Pro is missing or does not register the Submenu type; Pro owns license and tier rules through the `elementor/atomic-widgets/menu/submenu/is_locked` filter. The Go URL lives in `Submenu_Entitlement::UPGRADE_URL`, overridable with the `elementor/atomic-widgets/menu/submenu/upgrade_url` filter.
- The entry type exposes the result as meta `submenu_entitlement`, computed when the editor config is built. The editor reads it with `getSubmenuPromotion()` (`menu-items-control/use-submenu.ts`, exported by `@elementor/editor-editing-panel`); `SubmenuToggle` renders the lock in the row popover and in the Menu Item panel (`submenu-toggle` control); it is an unchecked switch with the crown that opens the promotion without flipping, and renders nothing when unlocked. Both places render the component from `registerSubmenuToggle` (exported by `@elementor/editor-editing-panel`), so Pro registers its real toggle over the Core default.

## Submenu layers (Pro, ED-26264)

- `e-menu-entry` owns the boolean `submenu` (`Atomic_Menu_Entry::SUBMENU_PROP`). Its `define_children_dependencies()` adds `e-menu-submenu-trigger` after the item and `e-menu-submenu` after the trigger when it is true, and removes both when it is false. Removed layers are stashed in session storage per entry, so off then on (and undo) restores them until the editor reloads. A child dependency only sees the declaring element's own settings, which is why the setting is on the entry and not on the Menu Item.
- Pro (`modules/atomic-menu`) registers the real `e-menu-submenu`, `e-menu-submenu-trigger` and the trigger's closed/open content types whenever `e_nav_menu` is on and Core has `SUBMENU_PROP`, regardless of the licence, so a not-connected site keeps editing existing Submenus. It locks new ones through the `is_locked` filter (unlocked for an active or expired licence). Its editor package registers the real toggle: it writes the entry's `submenu` and shows Edit Submenu.
- The Core placeholders declare the same setting keys as the Pro types (trigger: `show-indicator`, `closed-angle`, `open-angle`, `label-open`, `label-close`; submenu: `position-relative-to`, `horizontal-alignment`). The parser drops keys a schema does not know, so a key added to a Pro type must also be added to its placeholder, or a save with Pro off loses it.
- A new Menu built while unlocked gets `submenu: true` on the Products entry (`Atomic_Menu::DEFAULT_SUBMENU_ENTRY`); the entry's rules then insert the trigger and the Submenu with their own default children. Update this section when the Submenu types, their keys or the toggle change.

## Verify

- PHP: `vendor/bin/phpunit --filter Test_Atomic_Menu` (needs the `wp-mysql` Docker container; see AGENTS.md). `vendor/bin/phpcs` on touched files.
- JS: `npx eslint` on handlers; rebuild handlers with `npm run scripts`.
- Browser (playground, Chromium): seed pages with a menu (default and in-flow position) via a blueprint, then check collapse at the Tablet and Mobile breakpoints, `aria-expanded` and label switching, `aria-controls`, Escape closes and restores focus, outside click closes in overlay only, Enter on the toggle, RTL placement, widening the viewport, and no page errors.

## Known limitation

A saved menu already on the page when the editor opens has no Alpine data stack: the editor keeps `x-ignore` on the nav. Menus added from the panel work after `refreshTree( element )` in the preview handler. Already tried without success: listening to child render events, removing `x-ignore` before `refreshTree`, deferring the refresh with a timeout. Next idea: inspect `_initAlpine` in `packages/packages/core/editor-canvas/src/legacy/create-nested-templated-element-type.ts` and whether the editor re-renders the menu and re-adds `x-ignore` after load.

## Sources (internal, Atlassian login required)

The skill describes how the code works. Product behaviour lives in these pages; check them before changing behaviour, and do not copy their content here.

- Spec: https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/2750840844/Menu+Nav+Menu+V4+Element+Spec
- Product decisions (developer questions): https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/3140648972/Atomic+Menu+Developer+Questions+Product+Decisions
- Development plan (ED-25503): https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/3141107834/Atomic+Menu+e-menu+Development+Plan+ED-25503
- This work: ED-26257 (toggle).
