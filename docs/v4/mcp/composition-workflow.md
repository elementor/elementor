# Composition workflow

> Audience: external  
> Module: `modules/mcp/abilities/build-composition-ability.php`, `build-composition/`  
> Related: [abilities/build-composition.md](abilities/build-composition.md), [resources.md](resources.md)

## What it is

Recommended sequence for an external MCP agent to add or redesign v4 content. Centerpiece: `elementor/build-composition` (XML skeleton + parallel config maps).

## Public API

| Symbol | Ability ID | Purpose |
|--------|------------|---------|
| `Build_Composition_Ability` | `elementor/build-composition` | Insert/replace element trees |
| `Manage_Classes_Ability` | `elementor/manage-classes` | Create global classes before composition |
| `Manage_Variable_Ability` | `elementor/manage-global-variable` | Create variables before composition |
| `List_Widget_Schemas_Ability` | `elementor/list-widget-schemas` | Discover widget types |
| `Get_Widget_Schema_Ability` | `elementor/get-widget-schema` | Per-type JSON schema |
| `Manage_Elements_Ability` | `elementor/manage-elements` | Post-composition surgical edits |

All extend `Abstract_Ability` → `register()` + `execute( $input )`.

Verified: `*-ability.php` files in `modules/mcp/abilities/`.

## When to use it

Full layouts from scratch or container redesigns. For single-element edits, use `manage-elements` after composition.

## Key concepts

### Call order

```
1. Read elementor://global-variables, elementor://global-classes, elementor://style/best-practices
2. elementor/manage-global-variable  (create missing tokens)
3. elementor/manage-classes          (create missing classes)
4. elementor/list-widget-schemas?summary=true
5. elementor/get-widget-schema       (per widget type)
6. elementor/build-composition       (dry_run first if unsure)
7. elementor/manage-elements         (optional follow-up)
```

### XML rules

```xml
<e-flexbox configuration-id="hero-section">
  <e-heading configuration-id="hero-title"></e-heading>
</e-flexbox>
```

- Tag = widget type; every element needs unique `configuration-id`
- No other attributes, classes, IDs, or text nodes
- Raw XML in JSON — no CDATA wrapper

### Parallel maps (keyed by `configuration-id`)

| Parameter | Content |
|-----------|---------|
| `element_config` | Plain widget settings (from `get-widget-schema`) |
| `style` | Raw CSS declarations → `Css_Converter` server-side |
| `classes` | Array of global class **labels** |

Unknown `element_config` keys skipped with warnings. Invalid variable refs in class CSS rejected.

### `dry_run` and `mode`

| Flag | Effect |
|------|--------|
| `dry_run: true` | Validate only — no `Composition_Persister` |
| `mode: append` (default) | Insert under `parent_id` |
| `mode: replace_children` | Remove direct children of `parent_id`, then insert |

`parent_id` defaults to `document`.

## Extension

N/A — workflow guide. Ability schemas in [abilities/](abilities/README.md).

## Internals

Pipeline: `Xml_Parser` → `Subtree_Builder` → `Element_Config_Applier` → `Class_Applier` → `Style_Applier` → `Composition_Persister`.

Subfolder: `modules/mcp/abilities/build-composition/`.

## See also

- [abilities/build-composition.md](abilities/build-composition.md)
- [design-guidance.md](design-guidance.md)
- [../css-converter/overview.md](../css-converter/overview.md)
