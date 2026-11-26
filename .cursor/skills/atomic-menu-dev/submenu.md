# Submenu (Core placeholders, Pro runtime)

## Types and layers

- Core `e-menu-entry` owns the boolean `submenu` (`Atomic_Menu_Entry::SUBMENU_PROP`). `define_children_dependencies()` adds `e-menu-submenu-trigger` after the item and `e-menu-submenu` after the trigger when true, and removes both when false. Removed layers are stashed in session storage per entry, so off then on (and undo) restores them until reload. The setting is on the entry because a child dependency only sees the declaring element's own settings.
- Under `e_nav_menu` Core always registers placeholders (`Atomic_Menu_Submenu_Promotion`, `Atomic_Menu_Submenu_Trigger_Promotion`, on `Atomic_Pro_Promotion_Element_Base`): hidden from the panel, render nothing, data kept by `Pro_Promotion_Data_Preservation`. Pro replaces them on `elementor/elements/elements_registered`.
- Placeholder keys must match the Pro types. Trigger: `show-indicator`, `closed-angle`, `open-angle`, `label-open`, `label-close`. Submenu: `position-relative-to`, `horizontal-alignment`. The parser drops unknown keys.
- A new Menu built while unlocked gets `submenu: true` on the Products entry (`Atomic_Menu::DEFAULT_SUBMENU_ENTRY`).

## Pro module (`modules/atomic-menu/module.php`)

- Registers types only when `is_supported_core()` passes (Core has `SUBMENU_PROP`) and `e_nav_menu` is on, regardless of licence, so existing Submenus stay editable and render.
- Lock: Core `Submenu_Entitlement::is_locked()` locks only when Pro is missing or lacks the type. Pro adds to it through the `elementor/atomic-widgets/menu/submenu/is_locked` filter (`$is_locked || is_submenu_creation_locked()`), so Pro can only add a lock. Active licence needs the `atomic-menu` feature (`LICENSE_FEATURE_NAME`); an expired licence is unlocked; not-connected is locked for new Submenus. The feature also lives in `.github/scripts/license-configs.js`.
- Upgrade URL: `Submenu_Entitlement::UPGRADE_URL`, filter `elementor/atomic-widgets/menu/submenu/upgrade_url`.
- Inline CSS (`get_inline_css()`): static rules (hidden unless `data-e-open`, placement variables, indicator angles, reduced motion) plus the collapsed accordion rules (see `collapse.md`).

## Runtime (Pro `assets/js/frontend/`)

Registered with `register()` from `@elementor/frontend-handlers`, no Alpine, on `e-menu`.

- Settings: `open-submenus-on` (`click` or `hover`), `collapsed-submenus`.
- Sets `aria-controls` on each trigger; state is `data-e-open` on the Submenu and `aria-expanded` on the trigger (`dom.js`: `getSubmenuEntries`, `setState`, `isOpen`, `isCollapsed`).
- Hover: 300 ms timers, mouse pointers only, never while the Menu is collapsed or in the editor. Click: trigger toggles. Escape closes, outside click closes, resize re-evaluates.
- Siblings close when one opens, except `multiple` while collapsed.
- Placement (`placement.js`, `keepInViewport`): `position-relative-to` is `menu-item`, `menu-container` or `viewport`; `horizontal-alignment` is `start`, `center` or `end`; RTL via logical insets. Submenu base style: absolute, `top:100%`, `z-index:10`.

## Editor

Core panel code in `editor.md`. Pro package registers the real toggle (writes the entry's `submenu`, shows Edit Submenu).

Update this file when a Submenu type, key, filter or handler setting changes.
