# interactions-schema-resource

> Audience: external  
> Module: `modules/mcp/abilities/interactions-schema-resource-ability.php`  
> Related: [../resources.md](../resources.md), [build-composition.md](build-composition.md)

## What it is

Ability ID: **`elementor/interactions-schema-resource`**  
Resource URI: **`elementor://interactions/schema`**

Read-only JSON Schema for native interaction items. MIME: `application/json`. Permission: `edit_posts`.

## Public API

| Symbol | Signature | Purpose |
|--------|-----------|---------|
| `Interactions_Schema_Resource_Ability` | `execute( array $input ): string` | Returns plain LLM JSON Schema |
| Ability ID | `elementor/interactions-schema-resource` | Stable MCP host identifier |
| Resource URI | `elementor://interactions/schema` | Fetch via `read-resource` |

Verified: `interactions-schema-resource-ability.php`.

## When to use it

- Before adding native interactions to elements via `build-composition`
- When you need the canonical interaction item shape instead of guessing field names or enum values

Fetch via `elementor/read-resource` with URI `elementor://interactions/schema`, or through your MCP host's resource mechanism.

## Key concepts

### Payload

Returns a plain LLM-oriented JSON Schema derived from `Interaction_Item_Prop_Type` via `Widget_Context_Helper::to_plain_llm_schema()`.

Use the schema to validate interaction objects before sending them in composition `element_config` or `manage-elements` updates.

## See also

- [../resources.md](../resources.md) — full URI catalog
- [build-composition.md](build-composition.md) — where interaction settings are applied
