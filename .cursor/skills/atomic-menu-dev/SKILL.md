---
name: atomic-menu-dev
description: "Internal: Work on the v4 atomic Menu (e-menu, e-menu-items, e-menu-entry, e-menu-item, toggle, Submenu, nav menu) across Core and Pro. Map, cross-repo couplings, and which reference file to read for collapse, Submenu, editor, current-item or verification."
---

# Atomic Menu development

Scope: Internal. Experiment `e_nav_menu`. Core owns the Menu, Pro owns the real Submenu and its licence gate. Read the reference file for your area before changing code; update it in the same PR.

## Map

Core `modules/atomic-widgets/elements/atomic-menu/` (registered in `modules/atomic-widgets/module.php`, `register_menu_elements`):

| Element | Role |
|---|---|
| `e-menu` (`atomic-menu/`) | Settings, collapse CSS, script handles, default children |
| `e-menu-items` | Container the collapse CSS targets |
| `e-menu-entry` | One row: item, plus trigger and Submenu when its `submenu` prop is true. Renders nothing when empty |
| `e-menu-item` | Content slot: span, or link when `link` is set. Has style states |
| `e-menu-toggle` + `-closed` / `-open` | Collapse toggle; the children are locked elements (`base/atomic-menu-locked-element`) holding `Atomic_Svg` |
| `e-menu-submenu`, `e-menu-submenu-trigger` | Core: placeholders (`*-promotion`). Pro: real types |

Pro `modules/atomic-menu/`: `module.php`, `elements/` (Submenu, trigger, trigger closed/open), `assets/js/frontend/` (`submenu-handler`, `placement`, `dom`, `submenu-preview-handler`). Pro editor package: `packages/packages/pro/editor-atomic-menu`.

Runtime handlers (Vite entries in `scripts/vite/shared/entries.mjs`):

| Handle | File | Drives |
|---|---|---|
| `elementor-menu-handler` | Core `handlers/atomic-menu-handler.js` | Toggle, Alpine `eMenu<id>` |
| `elementor-menu-preview-handler` | Core `atomic-menu-preview-handler.js` | Editor only, `refreshTree` |
| `elementor-menu-current-handler` (+ preview) | Core `atomic-menu-current-handler.js` | `e--current`, `e--current-ancestor` |
| Pro submenu handler (+ preview) | Pro `submenu-handler.js` | Open/close, placement. No Alpine |

## Read next

- Collapse, toggle, items layout, breakpoints: `collapse.md`
- Submenu: entry layers, placeholders, licence gate, open/close, placement: `submenu.md`
- Editor panel, nesting rules, Pro editor package, known limitation: `editor.md`
- Current / current-ancestor marking: `current-item.md`
- Tests and browser checklist: `verify.md`

## If you change X, also change Y

| Change | Also |
|---|---|
| A `collapse-breakpoint` value or collapse media condition | Pro `get_collapsed_css()` builds its own blocks from `get_collapsible_breakpoints()` plus a hardcoded Desktop block. Mirror it in Pro and its PHPUnit |
| A setting key on a Pro Submenu or trigger type | Same key on the Core placeholder, or a save with Pro off drops it |
| `Atomic_Menu_Entry::SUBMENU_PROP`, `Atomic_Menu::get_collapsible_breakpoints`, `Submenu_Entitlement`, `registerSubmenuToggle`, `getSubmenuPromotion` | Pro reads these by name and silently turns the Submenu off (or skips collapsed CSS) if they are missing. Keep or version them |
| A new link-capable or container element that can hold a Menu | Menu nesting guard in `editor-canvas/src/menu-structure/` (see `editor.md`) |
| Anything the current handler selects (`e-menu`, `e-menu-item`, `e-menu-entry`) | `current-item.md`; only the menu's own items count |
| Atomic base styles | Regenerate CSS (cached per page and in WP Playground) |
| Licence tier or feature | Pro `module.php` and `.github/scripts/license-configs.js` |

## Gotchas

- A default that depends on active breakpoints cannot be a schema default: use `define_base_settings()` plus `applyBaseSettings()` in `assets/js/editor/atomic-element-base-model.js`.
- Core resolves `attributes` to null (Pro provides the transformer). Test a custom `aria-label` by rendering the Twig directly.
- Twig has no `string` test: use `is not empty`. `Breakpoint::DIRECTION_MAX` does not exist: use `'max'`.
- Never return `undefined` from an Alpine `x-bind` for `aria-label`: it removes the attribute. Return the current value.
- Default-content PHPUnit tests need the hydrate flag on child SVGs; assert the closed and open configs separately.
- Nothing in MCP targets the atomic Menu; the `woocommerce-menu-cart` map is the legacy widget.
- After changing atomic base styles in WP Playground: Regenerate CSS and restart with `--workers=1`.

## Sources (internal, Atlassian login required)

Product behaviour lives here, not in this skill. Check before changing behaviour.

- Spec: https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/2750840844/Menu+Nav+Menu+V4+Element+Spec
- Product decisions: https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/3140648972/Atomic+Menu+Developer+Questions+Product+Decisions
- Development plan (ED-25503): https://elementor.atlassian.net/wiki/spaces/RDDEP/pages/3141107834/Atomic+Menu+e-menu+Development+Plan+ED-25503
- Tickets: ED-26257 toggle, ED-26264 Submenu layers, ED-26265 Submenu open/close and current ancestor, ED-26302 nesting, ED-26471 licence gate, ED-26558 collapse Desktop/None.
