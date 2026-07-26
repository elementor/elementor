# v4 activation

> Audience: both
> Module: `modules/atomic-opt-in/`, `modules/atomic-widgets/opt-in/`
> Status: draft
> Related: [../getting-started/experiments.md](../getting-started/experiments.md), [../migration/backward-compatibility.md](../migration/backward-compatibility.md)

## What it is

The **Editor v4 opt-in** flow lets site administrators enable or disable the Atomic Editor experience. Two PHP modules cooperate:

| Module | Role |
|--------|------|
| `atomic-opt-in` | Settings tab UI, panel alpha chip, welcome popover |
| `atomic-widgets/opt-in` | Experiment registration, bulk feature toggling, AJAX/REST handlers |

The user-facing label is **Atomic Editor** (settings tab) / **Editor V4** (experiment title).

## When to use it

- **Administrators** — opt in via **WP Admin → Elementor → Settings → Atomic Editor** to enable v4 building blocks on an existing site.
- **New installs** — sites first installed on Elementor ≥ 4.0.0 auto-activate `e_opt_in_v4` (and other `new_site` experiments) without visiting the settings page.
- **Developers** — call the REST or AJAX endpoints programmatically (requires `manage_options`).

## Key concepts

### Module bootstrap (`atomic-opt-in`)

Experiment **`e_opt_in_v4_page`** (title: "Editor v4 (Opt In Page)") gates the settings UI. Default: **active**, hidden.

Constructor order:

1. `PanelChip` — always loads editor alpha chip script.
2. If `e_opt_in_v4_page` active → init `Opt_In` (experiment + AJAX) and `OptInPage` (settings tab).
3. If `e_opt_in_v4` (`Opt_In::EXPERIMENT_NAME`) also active → init `WelcomeScreen`.

`Module::is_atomic_experiment_active()` checks `e_opt_in_v4`.

### Settings page

`OptInPage` adds tab **`editor-v4-opt-in`** ("Atomic Editor") to Elementor Settings. React app mounts at `#page-editor-v4-opt-in`.

Localized config (`elementorSettingsEditor4OptIn`):

- `features.editor_v4` — whether `e_opt_in_v4` is currently active
- `urls.start_building` — "Try out" link to create a new page/post in the editor

User flow:

1. Click **Activate the new experience** → terms dialog (checkbox required).
2. Confirm → AJAX `editor_v4_opt_in` → page reload with success toast.
3. When enrolled, primary button becomes **Try out the new experience**; **Deactivate** opens opt-out terms.

Opt-in terms UI copy notes that **Containers** will also be activated (see bundled features below). Opt-out warns that atomic elements, classes, and variables content will no longer appear on the site.

### Welcome screen

Package: `v4-activation-modal` (`WelcomeScreen::PACKAGE_NAME`).

Shown in the editor when **all** of:

- User is on editor visit ≥ 3 (`Elementor_Counter::EDITOR_COUNTER_KEY`)
- User meta `_e_welcome_popover_displayed` is not set
- Site is **not** a new installation (`Upgrade_Manager::is_new_installation()`)

Sets `_e_welcome_popover_displayed` after first display.

### Panel chip

`PanelChip` enqueues `editor-v4-opt-in-alphachip` on `elementor/editor/before_enqueue_scripts`. Listens for `alphachip:open` custom event to mount a promotion popover on panel category headings.

### Bundled experiment toggles

`Opt_In::opt_in_v4()` / `opt_out_v4()` bulk-update WordPress options for every experiment in the respective constant.

**`OPT_IN_FEATURES`** (activated together on opt-in):

| Experiment | Constant / name |
|------------|-----------------|
| Editor V4 flag | `e_opt_in_v4` |
| Container | `container` |
| Atomic widgets | `e_atomic_elements` |
| Global classes | `e_classes` |
| Variables | `e_variables` |
| Components | `e_components` |

**`OPT_OUT_FEATURES`** (deactivated together on opt-out):

| Experiment | Constant / name |
|------------|-----------------|
| Editor V4 flag | `e_opt_in_v4` |
| Atomic widgets | `e_atomic_elements` |
| Global classes | `e_classes` |
| Variables | `e_variables` |
| Components | `e_components` |

**Not in either list** (confirmed in source — must be toggled separately):

| Experiment | Notes |
|------------|-------|
| `e_interactions` | Requires `e_atomic_elements`; default active but not bundled |
| `e_variables_manager` | Sub-feature of variables; default active but not bundled |
| `editor_mcp` | Gates JS `editor-mcp` package only |
| `e_bc_migrations` | BC migrations; separate from opt-in |
| `container` | Opt-out does **not** deactivate containers |

The opt-in terms dialog mentions "Containers and Nested Elements", but **`nested-elements` is not in `OPT_IN_FEATURES`** — only `container` is toggled. TBD — verify with v4 team whether nested-elements activation is intentional omission or handled elsewhere.

### API endpoints

AJAX actions `editor_v4_opt_in` / `editor_v4_opt_out`, and REST `POST elementor/v1/operations/opt-in-v4` — all require `manage_options` and delegate to the same PHP handlers. Page reload follows client-side success.

### New-site auto-enable

`e_opt_in_v4` registers `new_site`:

```php
'new_site' => [
    'default_active' => true,
    'minimum_installation_version' => '4.0.0',
],
```

Same `minimum_installation_version: 4.0.0` pattern exists for `e_atomic_elements` and `e_classes`. Other v4 experiments (`e_variables`, `e_components`, `e_interactions`) use module-level defaults (typically active) but are **not** toggled by the opt-in bundle unless the admin uses the settings page or Experiments screen.

### Data impact

| Action | Effect on stored data |
|--------|----------------------|
| **Opt-in** | Enables experiment flags only — no automatic data migration from the opt-in handler itself. Existing pages are unchanged; new atomic elements/classes/variables become available. BC migrations (`e_bc_migrations`) may upgrade prop shapes on next document load (see [backward-compatibility.md](../migration/backward-compatibility.md)). |
| **Opt-out** | Disables v4 experiments. Per opt-out terms: atomic element content, global classes, and variables **will not render** on the frontend while features are off. Data remains in the database (meta/kit JSON) but is inaccessible to the v4 editor surfaces. Containers stay in their current state. |
| **Re opt-in** | TBD — verify with v4 team whether previously created atomic content is fully restored without manual intervention. |

Opt-in does not delete post meta. Opt-out does not run a cleanup migration.

## Extension

N/A for third-party opt-in — the bundle list is hard-coded in `Opt_In`. To depend on v4 being active, check individual experiment flags (e.g. `e_atomic_elements`) rather than `e_opt_in_v4` alone.

## Internals

Key files: `modules/atomic-widgets/opt-in/opt-in.php` (feature bundles, AJAX/REST), `modules/atomic-opt-in/module.php` (wiring), `opt-in-page.php` (settings tab), `welcome-screen.php`, `panel-chip.php`. `is_atomic_experiment_active()` drives the enrolled state on the settings page.

## See also

- [../getting-started/experiments.md](../getting-started/experiments.md) — complete experiment dependency matrix
- [../getting-started/what-is-v4.md](../getting-started/what-is-v4.md) — user-facing overview
- [../migration/backward-compatibility.md](../migration/backward-compatibility.md) — post-enable data upgrades
- [../atomic-widgets/overview.md](../atomic-widgets/overview.md) — what `e_atomic_elements` unlocks
