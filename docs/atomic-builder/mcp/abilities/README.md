# MCP abilities (v4 subset)

## Purpose

v4 PHP abilities in `modules/mcp/module.php`, exposed to external MCP hosts.

## Public API

All abilities extend `Abstract_Ability`:

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Abstract_Ability` | `register(): void` | `wp_register_ability()` with `execute_callback` |
| `*Ability` subclasses | `execute( $input = [] )` | Ability implementation |

Verified: `abstract-ability.php`.

## Files

| File | Ability ID |
|------|------------|
| [build-composition.md](build-composition.md) | `elementor/build-composition` |
| [get-widget-schema.md](get-widget-schema.md) | `elementor/get-widget-schema` |
| [list-widget-schemas.md](list-widget-schemas.md) | `elementor/list-widget-schemas` |
| [manage-classes.md](manage-classes.md) | `elementor/manage-classes` |
| [manage-global-variable.md](manage-global-variable.md) | `elementor/manage-global-variable` |
| [manage-elements.md](manage-elements.md) | `elementor/manage-elements` |
| [list-components.md](list-components.md) | `elementor/list-components` |
| [interactions-schema-resource.md](interactions-schema-resource.md) | `elementor/interactions-schema-resource` |

## Recommended call order

See [../composition-workflow.md](../composition-workflow.md):

1. Read resources (`global-variables`, `global-classes`, `style/best-practices`)
2. `manage-global-variable` → `manage-classes`
3. `list-widget-schemas` (`summary: true`) → `list-components` (if using `<e-component>`)
4. `get-widget-schema` per type → read `interactions/schema` if needed
5. `build-composition` (`dry_run` first) → `manage-elements` for follow-up

`list-dynamic-tags`: [../../dynamic-tags/discovery.md](../../dynamic-tags/discovery.md).
