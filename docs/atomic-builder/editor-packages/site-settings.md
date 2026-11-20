# Site Settings (React tabs)

> Audience: both
> Module: `core/kits/documents/tabs/`
> Related: [extending-editor.md](extending-editor.md), [core-packages.md](core-packages.md)

## What it is

Infrastructure for rendering **React** UI inside Elementor **Site Settings** tabs, instead of legacy PHP `Controls_Manager` fields. The PHP `Tab_Base` subclass still registers the tab (title, icon, group, save hooks) and sanitizes on `before_save()`; React owns only the tab **content** via a portal.

| Package | Role |
|---------|------|
| `@elementor/editor-site-settings` | Tab registry + portal host; loads with atomic widgets |
| Feature packages | One package per tab, gated by its own experiment |

API surface is small — read it directly in `packages/packages/core/editor-site-settings/src/index.ts` (`injectSiteSettingsTab`, `registerSiteSettingsTab`).

## How to add a tab

1. PHP: register a `Tab_Base` subclass on `elementor/kit/register_tabs` (gated by your experiment); leave `register_tab_controls()` empty and add `before_save()` sanitization.
2. JS: create a feature package that calls `injectSiteSettingsTab( { id, component } )` from `init()`. The `id` must match the PHP tab `get_id()`.
3. PHP: add your feature package to `elementor/editor/v2/packages` (gated by the same experiment). `editor-site-settings` itself already loads with atomic widgets.

The pattern follows the same architecture as other editor extension packages: feature detection via experiment, conditional package loading, and registration through a central registry.

## See also

- [extending-editor.md](extending-editor.md)
- [core-packages.md](core-packages.md)
