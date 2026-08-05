# Kit Site Settings (React tabs)

> Audience: both
> Module: `modules/agents/`, `core/kits/documents/tabs/`
> Related: [extending-editor.md](extending-editor.md), [core-packages.md](core-packages.md)

## What it is

Infrastructure for rendering **React** UI inside Elementor **Site Settings** kit tabs, instead of legacy PHP `Controls_Manager` fields.

Two packages work together:

| Package | Role |
|---------|------|
| `@elementor/editor-kit-settings` | Tab registry, route listener, portal host in the kit panel |
| `@elementor/editor-kit-agents` | Reference implementation: Agents tab for `llms.txt` content |

The PHP kit tab class still registers the tab (title, icon, group, save hooks). React replaces only the tab **content** via a portal into `#elementor-kit-panel-content-controls`.

## Public API

| Symbol | Package | Purpose |
|--------|---------|---------|
| `injectKitTab()` | `@elementor/editor-kit-settings` | Register a React component for a kit tab id |
| `registerKitTab()` | `@elementor/editor-kit-settings` | Lower-level tab registry (prefer `injectKitTab`) |
| `init()` | `@elementor/editor-kit-settings` | Injects `KitSettingsTab` host via `injectIntoTop` |
| `init()` | `@elementor/editor-kit-agents` | Registers Agents tab when `agents_llms_txt` experiment is active |

Verified: `packages/packages/core/editor-kit-settings/src/index.ts`, `packages/packages/core/editor-kit-agents/src/init.ts`.

## When to use it

- New Site Settings tab that needs design-system React controls (`@elementor/ui`)
- Feature already has a PHP `Tab_Base` subclass but should not add PHP controls
- Settings must persist in kit document meta (`_elementor_page_settings`)

## Key concepts

### Route matching

Kit settings routes follow `panel/global/{tab-id}`. Example: Agents tab id `settings-agents` → route `panel/global/settings-agents`.

`useActiveKitTab()` reads `window.$e.routes.getCurrent().panel`, strips the `panel/global/` prefix, and resolves the registered tab component.

### Portal rendering

`KitSettingsTab` renders the active tab component into the legacy kit panel DOM node (`KIT_PANEL_CONTENT_ID`). PHP `register_tab_controls()` can stay empty when React owns the UI.

### Settings I/O

Read/write through the v1 kit document settings bag:

```ts
getV1CurrentDocument()?.container?.settings
```

Call `setDocumentModifiedStatus(true)` after writes so the kit save flow picks up changes.

Nested storage shape for Agents (served at `/llms.txt`):

```json
{
  "agents": {
    "llms": "# llms.txt content"
  }
}
```

### PHP save sanitization

`Settings_Agents::before_save()` normalizes both legacy flat `agents_llms` and nested `agents.llms`, applies `sanitize_textarea_field()`, and stores only the nested `agents` key. React saves must use the nested shape; the flat key remains for backward compatibility on ingest.

### Experiment gate

`modules/agents/module.php` registers:

- PHP kit tab + `/llms.txt` endpoint when `agents_llms_txt` is active
- Editor packages `editor-kit-settings` and `editor-kit-agents` via `elementor/editor/v2/packages`

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
    'editor-kit-settings', // once per editor; safe to list from multiple modules
    'editor-my-feature-settings',
] ) );
```

Tab class: implement metadata methods; leave `register_tab_controls()` empty if React renders the UI; add `before_save()` for server-side sanitization.

### 2. JS: register the React tab

```ts
// packages/packages/core/editor-my-feature-settings/src/init.ts
import { injectKitTab } from '@elementor/editor-kit-settings';

import { MyFeatureSettingsTab } from './components/my-feature-settings-tab';

export function init() {
    injectKitTab( {
        id: 'settings-my-feature',
        component: MyFeatureSettingsTab,
    } );
}
```

Tab id must match the PHP tab `get_id()` return value.

### 3. Settings helpers pattern

Follow `editor-kit-agents/src/llms-settings.ts`:

- `getKitSettingsBag()` — null-safe access to v1 settings
- `read*()` / `write*()` — encapsulate key paths and `setDocumentModifiedStatus`
- Disable controls when the settings bag is unavailable (kit document not loaded)

Reference: `packages/packages/core/editor-kit-agents/src/components/agents-settings-tab.tsx`.

## Agents llms.txt (reference)

| Layer | Location |
|-------|----------|
| Experiment | `agents_llms_txt` (`modules/agents/module.php`) |
| PHP tab | `core/kits/documents/tabs/settings-agents.php` |
| React UI | `@elementor/editor-kit-agents` |
| Public URL | `/llms.txt` (plain text, cache headers + invalidation on kit save) |

Enable the hidden experiment, open **Site Settings → Agents**, edit the multiline **llms.txt** field, save the kit. Empty content disables the endpoint.

Hooks:

- `elementor/agents/llms_txt/cache_max_age` — cache lifetime (seconds)
- `elementor/agents/llms_txt/cache_invalidated` — fired after kit save; use to purge CDN/page cache

## See also

- [extending-editor.md](extending-editor.md)
- [core-packages.md](core-packages.md)
- [../getting-started/experiments.md](../getting-started/experiments.md)
