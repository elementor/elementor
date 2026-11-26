# Editor side

## Menu items panel (Core `packages/packages/core/editor-editing-panel/src/controls-registry/element-controls/`)

- `menu-items-control/`: `menu-items-control.tsx`, `use-actions`, `use-entry-item`, `use-submenu` (exports `getSubmenuPromotion()`), `submenu-toggle-registry` (`registerSubmenuToggle`), `submenu-toggle.tsx`. PHP: `modules/atomic-widgets/controls/types/elements/menu-items-control.php`, `submenu-toggle-control.php`; panel control in `submenu-toggle-control/`.
- Entry meta `submenu_entitlement` comes from `Submenu_Entitlement`, computed when the editor config is built. Locked toggle: unchecked switch with a crown that opens the promotion without flipping; renders nothing when unlocked. Used in the row popover and the Menu Item panel.
- Pro `packages/packages/pro/editor-atomic-menu` (`init.ts`, `core-submenu.ts`, `components/submenu-toggle.tsx`, `hooks/use-entry-submenu.ts`) registers the real toggle over the Core default. `core-submenu.ts` reads the Core API by name at runtime and returns null when it is missing.

## Nesting rules (`editor-canvas/src/menu-structure/`, `editor-elements/src/link-restriction.ts`)

- A Menu cannot be placed inside a link (an element with a link destination) or inside another Menu. A Menu inside a Submenu is allowed (`skipSubmenus`).
- `initMenuPlacementPrevention()` hooks `document/elements/create`, `move` and `paste`; `restricted-link-infotip.tsx` explains it in the UI. A new element that can carry a link or contain a Menu must be covered by `utils.ts` and its tests.

## Known limitation

A saved menu already on the page when the editor opens has no Alpine data stack: the editor keeps `x-ignore` on the nav. Menus added from the panel work after `refreshTree( element )` in the preview handler. Tried without success: listening to child render events, removing `x-ignore` before `refreshTree`, deferring the refresh. Next idea: inspect `_initAlpine` in `packages/packages/core/editor-canvas/src/legacy/create-nested-templated-element-type.ts`. Core Alpine handler only; the Pro Submenu handler does not use Alpine. Re-check before relying on this.

Update this file when the panel controls, the Submenu toggle API or the placement rules change.
