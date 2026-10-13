# Project contracts (by-design behavior; not findings)

Append entries when a review finding was wrong. Format: `- <behavior> (source: PR/file)`.

- `interactions: []` in MCP `manage-elements` is the documented way to clear interactions; it is a real change, not an empty field (Core #37636).
- Atomic prop aliases (`text`/`content` on `e-heading`, `url`/`video` on `e-youtube`) are agent-input conveniences resolved by editor/MCP canonicalizers, not by PHP props parsing (Core #37622).
- Published `@elementor/*` workspace packages keep caret peer ranges (`^18.3.1`); exact pins belong to root `overrides`/devDependencies only (Core #37665).
- Core never decides a feature is licensed. License state lives in Pro `license/`; Core only reads filtered promotion data (inferred from code).
- Pro extends V4 via Core registries/filters (see `elementor-pro/modules/variables/hooks.php`, `atomic-carousel/module.php`); V3 via `Module_Base` and `elementor/element/{widget}/section_*` hooks (inferred).
