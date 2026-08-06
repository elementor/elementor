# Site Settings (React tabs)

> Audience: both
> Module: `core/kits/documents/tabs/`
> Related: [extending-editor.md](extending-editor.md), [core-packages.md](core-packages.md)

## What it is

Infrastructure for rendering **React** UI inside Elementor **Site Settings** tabs, instead of legacy PHP `Controls_Manager` fields.

| Package | Role |
|---------|------|
| `@elementor/editor-site-settings` | Tab registry, route listener, portal host in the Site Settings panel |
| Feature packages (e.g. `@elementor/editor-agents`) | One package per tab implementation |

The PHP kit tab class still registers the tab (title, icon, group, save hooks). React replaces only the tab **content** via a portal into `#elementor-kit-panel-content-controls`.

## Public API

| Symbol | Package | Purpose |
|--------|---------|---------|
| `injectSiteSettingsTab()` | `@elementor/editor-site-settings` | Register a React component for a Site Settings tab id |
| `registerSiteSettingsTab()` | `@elementor/editor-site-settings` | Lower-level tab registry (prefer `injectSiteSettingsTab`) |
| `init()` | `@elementor/editor-site-settings` | Injects `SiteSettingsTab` host via `injectIntoTop` |

Verified: `packages/packages/core/editor-site-settings/src/index.ts`.

## When to use it

- New Site Settings tab that needs design-system React controls (`@elementor/ui`)
- Feature already has a PHP `Tab_Base` subclass but should not add PHP controls
- Settings must persist in kit document meta (`_elementor_page_settings`)

## Key concepts

### Route matching

Site Settings routes follow `panel/global/{tab-id}`. Example: tab id `settings-colors` → route `panel/global/settings-colors`.

`useActiveSiteSettingsTab()` reads `window.$e.routes.getCurrent().panel`, strips the `panel/global/` prefix, and resolves the registered tab component.

### Portal rendering

`SiteSettingsTab` renders the active tab component into the legacy kit panel DOM node (`SITE_SETTINGS_PANEL_CONTENT_ID`). PHP `register_tab_controls()` can stay empty when React owns the UI.

### Settings I/O

Read/write through the v1 kit document settings bag:

```ts
getV1CurrentDocument()?.container?.settings
```

Call `setDocumentModifiedStatus(true)` after writes so the kit save flow picks up changes.

Use nested keys under a feature namespace in kit settings, for example:

```json
{
  "myFeature": {
    "optionA": "value"
  }
}
```

### PHP save sanitization

Implement `before_save()` on the tab class to sanitize and normalize settings written by React. Shape validation belongs on the server even when the UI is React-only.

### Package loading

Register `editor-site-settings` once per editor (safe to list from multiple modules). Add feature-specific packages via `elementor/editor/v2/packages`, typically gated by an experiment.

## Extension

### 1. PHP: register the kit tab

```php
// modules/my-feature/module.php
add_action( 'elementor/kit/register_tabs', function ( $kit ) {
    if ( ! Plugin::$instance->experiments->is_feature_active( 'my_feature' ) ) {
        return;
    }

    $kit->register_tab( 'settings-my-feature', Settings_My_Feature::class );
} );

add_filter( 'elementor/editor/v2/packages', fn ( $packages ) => array_merge( $packages, [
    'editor-site-settings',
    'editor-my-feature-settings',
] ) );
```

Tab class: implement metadata methods; leave `register_tab_controls()` empty if React renders the UI; add `before_save()` for server-side sanitization.

### 2. JS: register the React tab

```ts
// packages/packages/core/editor-my-feature-settings/src/init.ts
import { injectSiteSettingsTab } from '@elementor/editor-site-settings';

import { MyFeatureSettingsTab } from './components/my-feature-settings-tab';

export function init() {
    injectSiteSettingsTab( {
        id: 'settings-my-feature',
        component: MyFeatureSettingsTab,
    } );
}
```

Tab id must match the PHP tab `get_id()` return value.

### 3. Settings helpers pattern

Encapsulate read/write in a dedicated module per feature:

- `getSiteSettingsBag()` — null-safe access to v1 settings
- `read*()` / `write*()` — encapsulate key paths and `setDocumentModifiedStatus`
- Disable controls when the settings bag is unavailable (kit document not loaded)

First reference implementation: `@elementor/editor-agents`.

## See also

- [extending-editor.md](extending-editor.md)
- [core-packages.md](core-packages.md)
