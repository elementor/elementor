# Composition workflow

> Audience: external  
> Module: `modules/mcp/abilities/build-composition-ability.php`, `build-composition/`  
> Status: draft  
> Related: [abilities/build-composition.md](abilities/build-composition.md), [resources.md](resources.md), [../fundamentals/prop-value.md](../fundamentals/prop-value.md)

## What it is

The recommended end-to-end sequence for an external MCP agent to add or redesign v4 content on a page. The centerpiece is `elementor/build-composition`, which accepts an XML skeleton plus parallel configuration maps for settings, styles, and global classes.

## When to use it

Follow this workflow when an agent needs to create new sections, replace a container's children, or build multi-element layouts from scratch. For surgical edits to existing elements (update one heading, move a block), use `elementor/manage-elements` after composition.

## Key concepts

### Recommended call order

```
1. Read elementor://global-variables     (and elementor://style/best-practices for design context)
2. Read elementor://global-classes
3. elementor/manage-global-variable      (create missing tokens)
4. elementor/manage-classes              (create missing classes)
5. elementor/list-widget-schemas?summary=true   (discover v4 widgets)
6. elementor/get-widget-schema           (per widget type used)
7. elementor/build-composition           (XML + element_config + style + classes)
8. elementor/manage-elements             (optional follow-up edits on returned element IDs)
```

Use `dry_run: true` on step 7 to validate without persisting.

### Phase 1 — Globals (variables)

Read `elementor://global-variables`. Create or update tokens with `elementor/manage-global-variable` before referencing them in CSS.

- Reference variables by **label** in `style`: `color: var(--brand-primary)`
- Do not use internal `e-gv-*` ids in author-facing input

See [abilities/manage-global-variable.md](abilities/manage-global-variable.md).

### Phase 2 — Globals (classes)

Read `elementor://global-classes`. Create reusable classes with `elementor/manage-classes` before attaching them in composition.

- Map `configuration-id` → array of class **labels** in the `classes` parameter
- Global classes are prepended; local `style` wins on conflicts

See [abilities/manage-classes.md](abilities/manage-classes.md) and [../global-classes/applying-classes.md](../global-classes/applying-classes.md).

### Phase 3 — XML composition

Build `xml_structure` with widget tags and unique `configuration-id` attributes on every element:

```xml
<e-flexbox configuration-id="hero-section">
  <e-heading configuration-id="hero-title"></e-heading>
  <e-button configuration-id="hero-cta"></e-button>
</e-flexbox>
```

Rules (enforced by `Xml_Parser` / `Subtree_Builder`):

- Tag names are widget types (`e-flexbox`, `e-heading`, `e-button`, …)
- Every element **must** have a unique `configuration-id` attribute
- No other attributes, no classes, no IDs, no text nodes in XML
- Pass raw XML in the JSON string — do not wrap in CDATA (causes `empty_composition`)
- Respect `llm_guidance.nesting` from widget schemas (`allowed_child_types`, `required_direct_children`)

### Phase 4 — Parallel maps

Three optional objects keyed by `configuration-id`:

| Parameter | Content | Schema source |
|-----------|---------|---------------|
| `element_config` | Plain widget settings | `elementor/get-widget-schema` for each tag |
| `style` | Raw CSS declarations (`property` → value) | Converted server-side via `Css_Converter` |
| `classes` | Array of global class labels | Labels from `elementor://global-classes` |

Unknown `element_config` keys are **skipped with warnings** (composition still succeeds). Invalid variable references in class CSS are **rejected**.

Dynamic values: where the widget schema allows, use `{ "name": "<tag>", "settings": { ... } }` per [../dynamic-tags/binding-propvalues.md](../dynamic-tags/binding-propvalues.md). Read `elementor://dynamic-tags` for tag schemas.

### configuration-id rules

- Keys in `element_config`, `style`, and `classes` **must** match `configuration-id` attributes in `xml_structure`
- IDs are author-visible labels — use meaningful names (`hero-title`, not `node-1`)
- After persist, the response includes `resolved_xml` with real Elementor element IDs embedded

### dry_run

When `dry_run: true`, the ability validates XML, resolves configs/styles/classes, and returns the resolved tree **without** calling `Composition_Persister`. Use this to catch nesting errors and schema mismatches before mutating the document.

### mode: append vs replace_children

| Mode | Behavior |
|------|----------|
| `append` (default) | Insert new subtrees under `parent_id`, preserving existing children |
| `replace_children` | Remove all **direct** children of `parent_id`, then insert; response includes `removed_element_ids` |

- `parent_id` defaults to `document` (page root)
- `parent_id: 'document'` + `replace_children` redesigns the entire page top level

## Extension

N/A — this is a workflow guide. Implementation details for each ability are in [abilities/](abilities/README.md).

## Internals

Pipeline inside `Build_Composition_Ability::execute()`:

1. `Xml_Parser::parse()` → `Widget_Type_Resolver` (collect types, validate child types)
2. `Subtree_Builder::build()` → index by configuration-id
3. `Element_Config_Applier` → plain settings via `Plain_Values_Resolver`
4. `Class_Applier` → global class labels
5. `Style_Applier` → `Css_Converter` (+ `Variable_Prop_Value_Transformer` when variables active)
6. `Composition_Persister::insert_and_save()` (unless `dry_run`)

Subfolder: `modules/mcp/abilities/build-composition/`.

## See also

- [abilities/build-composition.md](abilities/build-composition.md) — full input/output schema
- [design-guidance.md](design-guidance.md) — agent design principles
- [abilities/manage-elements.md](abilities/manage-elements.md) — post-composition edits
- [../css-converter/overview.md](../css-converter/overview.md) — style conversion behavior
