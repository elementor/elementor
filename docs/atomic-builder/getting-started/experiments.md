# Experiments

> Audience: both
> Module: `modules/atomic-widgets/`, `modules/atomic-opt-in/`
> Related: [what-is-v4.md](what-is-v4.md), [../opt-in/activation.md](../opt-in/activation.md), [../mcp/overview.md](../mcp/overview.md)

## What it is

v4 features are gated by **WordPress experiments**. Each is registered via `Plugin::$instance->experiments->add_feature()` or a module's `get_experimental_data()`.

Two flags matter most:

1. **`e_opt_in_v4`** — "Editor V4" opt-in; controls welcome screen and default container behavior.
2. **`e_atomic_elements`** — "Atomic Widgets"; gates the atomic-widgets module and all dependent v4 modules (global classes, variables, components, interactions).

There are **no separate experiments** for `e_classes`, `e_variables`, `e_components`, or `e_interactions` — those modules check `e_atomic_elements` only.

## When to use it

- Enabling v4 on dev/staging (`wp elementor experiments activate …`)
- Debugging missing features (check `e_atomic_elements` first)
- Understanding what the opt-in button toggles
- Clarifying MCP behavior (PHP abilities vs in-editor JS tools)

## Key concepts

### Experiment matrix

| Experiment | Title | Registered in | Default | New site (≥ 4.0.0) | Gates |
|------------|-------|---------------|---------|-------------------|-------|
| `e_opt_in_v4` | Editor V4 | `opt-in/opt-in.php` | inactive | **active** | Welcome screen; JS `ContainerHelper.isV4OptIn()` |
| `e_atomic_elements` | Atomic Widgets | `atomic-widgets` `get_experimental_data()` | inactive | **active** | atomic-widgets + global-classes, variables, components, interactions |
| `e_icon_button` | Icon Button | `atomic-widgets/module.php` | inactive | — | V4 icon button element (dev) |
| `agents_llms_txt` | Agents llms.txt | `agents` `get_experimental_data()` | inactive | — | `/llms.txt` endpoint + Agents Site Settings tab |
| `container` | Container | core | varies | — | Flexbox layout (toggled with opt-in) |

All are `hidden: true` in source. Release status: `e_opt_in_v4` = alpha; `e_atomic_elements` = beta; `e_icon_button` = dev; `agents_llms_txt` = dev.

### Opt-in bundle

`Opt_In::opt_in_v4()` activates:

```
e_opt_in_v4, container, e_atomic_elements
```

`Opt_In::opt_out_v4()` deactivates:

```
e_opt_in_v4, e_atomic_elements
```

(`container` is **not** deactivated on opt-out.)

AJAX: `editor_v4_opt_in`, `editor_v4_opt_out`. REST: `POST /wp-json/elementor/v1/operations/opt-in-v4`.

### `e_opt_in_v4` in JS

Exposed as `elementorCommon.config.experimentalFeatures.e_opt_in_v4`. `ContainerHelper.isV4OptIn()` reads it to default new containers to `e-flexbox`.

### MCP and experiments

| System | Experiment gate |
|--------|----------------|
| PHP abilities (`modules/mcp/`) | None — requires `McpAdapter` + `wp_register_ability` |
| In-editor MCP (`editor-mcp` package) | None — loads via `Editor_Loader::EXTENSIONS` |

### Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Opt_In::EXPERIMENT_NAME` | `'e_opt_in_v4'` | Opt-in experiment constant (`opt-in/opt-in.php`) |
| `Opt_In::OPT_IN_FEATURES` | `string[]` | Experiments activated on opt-in |
| `Opt_In::OPT_OUT_FEATURES` | `string[]` | Experiments deactivated on opt-out |
| `Module::is_active()` | `static is_active(): bool` | Check `e_atomic_elements` (`atomic-widgets/module.php`) |
| `Plugin::$instance->experiments->is_feature_active()` | `is_feature_active( string $name ): bool` | Core experiment check |
| `Plugin::$instance->experiments->add_feature()` | `add_feature( array $data ): void` | Register a new experiment |

## Extension

1. Register via `add_feature()` or `get_experimental_data()`.
2. Gate module init with `is_feature_active( 'your_experiment' )`.
3. Append editor packages via `elementor/editor/v2/packages`.
4. To include in opt-in bundle, add to `Opt_In::OPT_IN_FEATURES` / `OPT_OUT_FEATURES` in `opt-in/opt-in.php`.

## Internals

### Module activation pattern

```php
// atomic-widgets: entire module inactive without experiment
public static function is_active(): bool {
    return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
}

// global-classes, variables, components, interactions: same flag
Plugin::$instance->experiments->is_feature_active( AtomicWidgetsModule::EXPERIMENT_NAME );
```

### atomic-opt-in bootstrap

```
atomic-opt-in/module.php
  ├─ PanelChip (always)
  ├─ Opt_In::init() → registers e_opt_in_v4, AJAX/REST
  ├─ OptInPage (always)
  └─ WelcomeScreen (when e_opt_in_v4 active)
```

## See also

- [what-is-v4.md](what-is-v4.md)
- [../opt-in/activation.md](../opt-in/activation.md)
- [../mcp/overview.md](../mcp/overview.md)
- [../architecture/overview.md](../architecture/overview.md)
