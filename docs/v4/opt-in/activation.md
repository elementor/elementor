# v4 activation

> Audience: both
> Module: `modules/atomic-opt-in/`, `modules/atomic-widgets/opt-in/`
> Related: [../getting-started/experiments.md](../getting-started/experiments.md), [../migration/backward-compatibility.md](../migration/backward-compatibility.md)

## What it is

Editor v4 opt-in lets administrators enable or disable the Atomic Editor experience.

| Module | Role |
|--------|------|
| `atomic-opt-in` | Settings tab UI, panel alpha chip, welcome popover |
| `atomic-widgets/opt-in` | Experiment registration, bulk feature toggling, AJAX/REST handlers |

User-facing label: **Atomic Editor** (settings) / **Editor V4** (experiment title).

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Opt_In` | `EXPERIMENT_NAME` (`'e_opt_in_v4'`) | Main v4 opt-in experiment constant |
| `Opt_In` | `OPT_IN_FEATURES` | Experiments activated together on opt-in |
| `Opt_In` | `OPT_OUT_FEATURES` | Experiments deactivated together on opt-out |
| `Opt_In` | `ajax_opt_in_v4()` / `ajax_opt_out_v4()` | AJAX handlers (`manage_options` required) |
| `Module` (`atomic-opt-in`) | `is_atomic_experiment_active(): bool` | Whether `e_opt_in_v4` is active |
| `Module` (`atomic-opt-in`) | `WELCOME_POPOVER_DISPLAYED_OPTION` | User meta key `_e_welcome_popover_displayed` |

Verified: `modules/atomic-widgets/opt-in/opt-in.php`, `modules/atomic-opt-in/module.php`.

### `OPT_IN_FEATURES` (source)

| Experiment | Name |
|------------|------|
| Editor V4 flag | `e_opt_in_v4` |
| Container | `container` |
| Atomic widgets | `e_atomic_elements` |

### `OPT_OUT_FEATURES` (source)

| Experiment | Name |
|------------|------|
| Editor V4 flag | `e_opt_in_v4` |
| Atomic widgets | `e_atomic_elements` |

**Not toggled by opt-in/out:** `e_classes`, `e_variables`, `e_components`, `nested-elements`, `e_interactions`, `editor_mcp`. Opt-out does **not** deactivate `container`.

## When to use it

| Audience | Flow |
|----------|------|
| Administrators | **WP Admin → Elementor → Settings → Atomic Editor** |
| New installs (≥ 4.0.0) | `e_opt_in_v4` auto-activates via `new_site` rule |
| Developers | REST `POST elementor/v1/operations/opt-in-v4` or AJAX `editor_v4_opt_in` / `editor_v4_opt_out` |

## Key concepts

### Module bootstrap

`atomic-opt-in` constructor:

1. `PanelChip` — editor alpha chip (always)
2. `Opt_In` — experiment + AJAX/REST (always)
3. `OptInPage` — settings tab (always, `manage_options` only)
4. `WelcomeScreen` — when `e_opt_in_v4` is active and user not yet welcomed

### Settings page

Tab `editor-v4-opt-in` ("Atomic Editor"). React app at `#page-editor-v4-opt-in`.

Localized config (`elementorSettingsEditor4OptIn`): `features.editor_v4`, `urls.start_building`.

Flow: Activate → terms dialog → AJAX `editor_v4_opt_in` → reload. Deactivate → `editor_v4_opt_out`.

### Welcome screen

Package `v4-activation-modal`. Shown when editor visit ≥ 3, `_e_welcome_popover_displayed` unset, and not a new installation.

### API endpoints

| Channel | Opt-in | Opt-out |
|---------|--------|---------|
| AJAX | `editor_v4_opt_in` | `editor_v4_opt_out` |
| REST | `POST elementor/v1/operations/opt-in-v4` | AJAX only |

All require `manage_options`.

### New-site auto-enable

```php
'new_site' => [
    'default_active' => true,
    'minimum_installation_version' => '4.0.0',
],
```

Same pattern on `e_atomic_elements` and `e_classes`. Other experiments rely on module defaults.

### Data impact

| Action | Effect |
|--------|--------|
| Opt-in | Flips experiment flags only — no data migration in handler |
| Opt-out | Disables `e_opt_in_v4` + `e_atomic_elements`; atomic content stops rendering while off; data remains in DB |
| Re opt-in | Pure flag toggles — stored content becomes editable/renderable again |

Prop migrations may run on next document load ([backward-compatibility.md](../migration/backward-compatibility.md)).

## Extension

Bundle list is hard-coded in `Opt_In`. Check individual experiment flags (e.g. `e_atomic_elements`) rather than `e_opt_in_v4` alone.

## Internals

Key files: `opt-in.php`, `module.php`, `opt-in-page.php`, `welcome-screen.php`, `panel-chip.php`.

## See also

- [../getting-started/experiments.md](../getting-started/experiments.md)
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md)
