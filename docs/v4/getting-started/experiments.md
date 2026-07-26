# Experiments

> Audience: both
> Module: `modules/atomic-widgets/`, `modules/atomic-opt-in/`, `modules/global-classes/`, `modules/variables/`, `modules/components/`, `modules/interactions/`, `modules/mcp/`
> Status: draft
> Related: [what-is-v4.md](what-is-v4.md), [../opt-in/activation.md](../opt-in/activation.md), [../mcp/overview.md](../mcp/overview.md)

## What it is

Elementor v4 features are gated behind **WordPress experiments** (feature flags). Each experiment is registered via `Plugin::$instance->experiments->add_feature()` or returned from a module's `get_experimental_data()`. Experiments control whether PHP module code runs, which editor packages load, and which UI surfaces appear.

Two opt-in layers exist:

1. **`e_opt_in_v4_page`** — gates the atomic-opt-in module (settings page, welcome screen). Default: **active**.
2. **`e_opt_in_v4`** — the master "Editor V4" flag. Opt-in/out toggles a **bundle** of experiments together.

## When to use it

Consult this matrix when:

- Enabling v4 on a dev/staging site (`wp elementor experiments activate …`).
- Debugging why a feature is missing (check both the feature experiment and `e_atomic_elements`).
- Understanding what the opt-in button actually toggles.
- Clarifying MCP behavior (PHP abilities vs in-editor JS tools).

## Key concepts

### Experiment matrix

| Experiment | Title (UI) | Registered in | Module gate | Default | New site (≥ 4.0.0) | Requires |
|------------|-----------|---------------|-------------|---------|-------------------|----------|
| `e_opt_in_v4_page` | Editor v4 (Opt In Page) | `atomic-opt-in/module.php` | `atomic-opt-in` module | active | — | — |
| `e_opt_in_v4` | Editor V4 | `atomic-widgets/opt-in/opt-in.php` | JS: `ContainerHelper.isV4OptIn()` | inactive | **active** | — |
| `e_atomic_elements` | Atomic Widgets | `atomic-widgets/module.php` | `atomic-widgets` module | inactive | **active** | — |
| `container` | Container | (core) | Flexbox layout | varies | — | — |
| `e_classes` | Global Classes | `global-classes/module.php` | `global-classes` module | inactive | **active** | `e_atomic_elements` |
| `e_variables` | Variables | `variables/module.php` | `variables` module | active | — | `e_atomic_elements` |
| `e_variables_manager` | Variables Manager | `variables/module.php` | variables manager UI | active | — | `e_variables` (implicit) |
| `e_components` | Components | `components/module.php` | `components` module | active | — | `e_atomic_elements` |
| `e_interactions` | Interactions | `interactions/module.php` | `interactions` module | active | — | `e_atomic_elements` |
| `editor_mcp` | Editor MCP for atomic widgets | `atomic-widgets/module.php` | *see note below* | active | — | — |

**Release status** (from source): `e_opt_in_v4` and `e_opt_in_v4_page` are **alpha**; `e_atomic_elements` is **beta**; `e_classes` is **alpha**; `e_variables` / `e_variables_manager` are **alpha**; `e_components` is **beta**; `e_interactions` and `editor_mcp` are **dev**.

All listed experiments are `hidden: true` in source — they appear in WP Admin → Elementor → Settings → Experiments but are not marketed in-product.

### Opt-in bundle

When a user opts in (`Opt_In::opt_in_v4()`), these experiments are set to **active**:

```
e_opt_in_v4, container, e_atomic_elements, e_classes, e_variables, e_components
```

Opt-out (`opt_out_v4()`) deactivates:

```
e_opt_in_v4, e_atomic_elements, e_classes, e_variables, e_components
```

**Not toggled by opt-in/out:** `e_interactions`, `e_variables_manager`, `editor_mcp`, `e_opt_in_v4_page`.

AJAX actions: `editor_v4_opt_in`, `editor_v4_opt_out` (require `manage_options`).
REST: `POST /wp-json/elementor/v1/operations/opt-in-v4`.

### `e_opt_in_v4` runtime usage

`e_opt_in_v4` is exposed to the legacy editor JS as `elementorCommon.config.experimentalFeatures.e_opt_in_v4`. `ContainerHelper.isV4OptIn()` reads this flag to change default container behavior (e.g. default type `e-flexbox`).

### `editor_mcp` — two MCP systems

**PHP abilities** (`modules/mcp/module.php`) register unconditionally when `McpAdapter` and `wp_register_ability` exist. No experiment check in that module.

**JS in-editor MCP** (`editor-mcp` package) is listed in `core/editor/loader/editor-loader.php` `EXTENSIONS` array alongside `elementor-v3-mcp` and `elementor-kit-mcp`. The `editor_mcp` experiment is **registered** in `atomic-widgets/module.php` (`EXPERIMENT_EDITOR_MCP = 'editor_mcp'`, default active) but **TBD — verify with v4 team:** no `is_feature_active('editor_mcp')` gate was found in source at time of writing. The plan doc references gating at a line that no longer contains that logic.

### MCP PHP has no experiment gate

Confirmed: `modules/mcp/module.php` constructor registers abilities on `wp_abilities_api_init` with no experiment check. External MCP hosts can call abilities regardless of v4 opt-in state (subject to WP capabilities).

## Extension

To add a new v4 experiment:

1. Register via `add_feature()` in your module's constructor or `get_experimental_data()` for auto-discovery.
2. Gate module initialization with `Plugin::$instance->experiments->is_feature_active( 'your_experiment' )`.
3. If the feature adds editor UI, append package names via `elementor/editor/v2/packages`.
4. If opt-in should toggle your experiment, add it to `Opt_In::OPT_IN_FEATURES` / `OPT_OUT_FEATURES` in `opt-in/opt-in.php`.

## Internals

### Module activation patterns

```php
// atomic-widgets: entire module inactive without experiment
public static function is_active(): bool {
    return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
}

// variables, components, interactions: compound check
private function is_experiment_active(): bool {
    return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME )
        && Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
}

// global-classes: both flags checked in constructor
$is_feature_active = Plugin::$instance->experiments->is_feature_active( self::NAME );
$is_atomic_widgets_active = Plugin::$instance->experiments->is_feature_active( Atomic_Widgets_Module::EXPERIMENT_NAME );
```

### atomic-opt-in bootstrap

```
atomic-opt-in/module.php
  ├─ PanelChip (always)
  ├─ if e_opt_in_v4_page:
  │     ├─ Opt_In::init()  → registers e_opt_in_v4, AJAX/REST
  │     └─ OptInPage
  └─ if e_opt_in_v4 active: WelcomeScreen
```

### Hidden companion experiments

`atomic-widgets/module.php` also registers (not in main v4 matrix):

- `e_indications_popover` — V4 indication popovers
- `atomic_widgets_should_enforce_capabilities`
- `e_bc_migrations` — backward compatibility prop migrations (`Migrations_Orchestrator::EXPERIMENT_BC_MIGRATIONS`)
- `global_classes_should_enforce_capabilities` (in global-classes module)

## See also

- [what-is-v4.md](what-is-v4.md)
- [../opt-in/activation.md](../opt-in/activation.md) — UX details (planned)
- [../mcp/overview.md](../mcp/overview.md) — two MCP systems
- [../architecture/overview.md](../architecture/overview.md) — package loading
