# MCP abilities (v4 subset)

> Status: final

## Purpose

Reference for the **v4-specific** PHP abilities registered in `modules/mcp/module.php`. These are server-side tools exposed to external MCP hosts via the WordPress Abilities API.

General, non-v4 abilities (`get-page-structure`, `create-page`, `update-page-settings`, `list-resources`, `read-resource`) are **not** documented here — they belong in a future separate MCP docs folder.

## Files

| File | Ability ID | Covers |
|------|------------|--------|
| [build-composition.md](build-composition.md) | `elementor/build-composition` | XML composition, styles, classes, modes |
| [get-widget-schema.md](get-widget-schema.md) | `elementor/get-widget-schema` | Single widget JSON schema + `llm_guidance` |
| [list-widget-schemas.md](list-widget-schemas.md) | `elementor/list-widget-schemas` | v4 widget discovery, summary mode |
| [manage-classes.md](manage-classes.md) | `elementor/manage-classes` | Global class CRUD via raw CSS |
| [manage-global-variable.md](manage-global-variable.md) | `elementor/manage-global-variable` | Global variable CRUD |
| [manage-elements.md](manage-elements.md) | `elementor/manage-elements` | Update/delete/move/duplicate existing elements |
| [list-components.md](list-components.md) | `elementor/list-components` | Component discovery and overridable prop schemas (Components experiment) |
| [interactions-schema-resource.md](interactions-schema-resource.md) | `elementor/interactions-schema-resource` | Native interaction item JSON Schema (resource) |

## Recommended call order

For new page content, follow [../composition-workflow.md](../composition-workflow.md):

1. Read resources (`elementor://global-variables`, `elementor://global-classes`, `elementor://style/best-practices`)
2. `elementor/manage-global-variable` — create missing tokens
3. `elementor/manage-classes` — create missing classes
4. `elementor/list-widget-schemas` (`summary: true`) — discover widgets
5. `elementor/list-components` — discover components (when using `<e-component>`)
6. `elementor/get-widget-schema` — per widget type
7. Read `elementor://interactions/schema` — when adding native interactions
8. `elementor/build-composition` — insert layout (`dry_run` first if unsure)
9. `elementor/manage-elements` — surgical follow-up edits

`elementor/list-dynamic-tags` is documented under [../../dynamic-tags/discovery.md](../../dynamic-tags/discovery.md).

## Reading order

1. [build-composition.md](build-composition.md) — primary mutation ability
2. [get-widget-schema.md](get-widget-schema.md) + [list-widget-schemas.md](list-widget-schemas.md) — schema discovery
3. [manage-global-variable.md](manage-global-variable.md) + [manage-classes.md](manage-classes.md) — kit globals
4. [manage-elements.md](manage-elements.md) — post-composition edits

## Related

- [../overview.md](../overview.md) — two systems disambiguation
- [../resources.md](../resources.md) — resource URIs
- [../../fundamentals/prop-value.md](../../fundamentals/prop-value.md) — PropValue shape for dynamic bindings
