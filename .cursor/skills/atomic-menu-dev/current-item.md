# Current item and current ancestor

Files in `handlers/`: `atomic-menu-current-handler.js` (frontend), `atomic-menu-current-preview-handler.js` (editor), `url-matcher.js`, `anchor-links.js`.

- Each `e-menu-item` that is a link matching the page gets `e--current` and `aria-current`. Anchor links (`#id`) are tracked against their target on scroll.
- Ancestors: for every item with `aria-current`, each parent entry's item (walking up through nested entries) gets `e--current-ancestor`.
- Only the menu's own items count (`item.closest(MENU) === menu`). A Menu nested in a Submenu neither marks nor is marked by its host.
- Editor preview state: items with `data-e-preview-state` keep `e--current`. The handler dispatches `elementor/menu/current-change`.
- Selectors used: `[data-element_type="e-menu"]`, `e-menu-item`, `e-menu-entry`. Renaming an element type or its entry nesting breaks marking silently.
- Scripts: `elementor-menu-current-handler` (always), `elementor-menu-current-preview-handler` (preview only), registered in `Atomic_Menu::register_frontend_handlers()`.
- Jest: `tests/jest/unit/modules/atomic-widgets/elements/atomic-menu/handlers/`.

Update this file when the matching rules, classes or event change.
