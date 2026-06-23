# CSS Converter — Architecture & Flow

Converts raw CSS declarations (from a user or LLM) into Elementor's atomic PropValue tree.

---

## Entry Point

`Css_Converter::convert(string $css): array`

Returns `{ props, customCss, rejected }`.

- **props** — atomic prop values ready to deep-merge into the style tree
- **customCss** — declarations that couldn't be converted (passed through verbatim)
- **rejected** — declarations that were structurally invalid (e.g. wrong variable type)

---

## Pipeline (in order)

```
raw CSS string
  │
  ▼ parse()
list of rules  {property, value, declaration}
  │  'null' string → PHP null at this stage (magic reset sentinel)
  │  blocked properties/values are dropped here
  │
  ▼ expand_shorthands()
expanded rules  (e.g. border → border-width, border-style, border-color)
  │  each rule tries every registered Expander; first match wins
  │  expander declines (empty result) → rule kept as-is
  │
  ▼ dedupe()
deduplicated rules  (last declaration wins per property name)
  │  superseded declarations are dropped entirely — including invalid ones
  │  this is CSS cascade at the rule level, before conversion
  │
  ▼ converter loop  (try_convert per rule)
Conversion_Context  (accumulates props, cascade: last write wins)
  │  each rule tries every registered Converter; first match wins
  │  converter declines → rule goes to leftover (customCss)
  │
  ▼ variable_transformer  (optional)
  │  resolves var() tokens to typed PropValues
  │  unresolvable vars ejected to customCss or rejected
  │
  ▼ validate_props()
  │  Props_Parser validates non-null prop values against Style_Schema
  │  partial-null object props bypass Props_Parser (contain null leaves)
  │
  ▼ cleanup_props()
final props
  │  recursive: if ALL present sub-values of an object are null → collapse to null
  │  propagates upward; empty arrays are NOT collapsed
```

---

## Key Actors

### Expanders (`Shorthand_Expander_Base`)

Split one shorthand rule into multiple longhand rules **before** converters run.
Registered in `Expander_Registry_Factory`.

| Expander | Input | Output |
|---|---|---|
| `Physical_To_Logical_Expander` | `top`, `right`, `bottom`, `left` | `inset-block-start`, `inset-inline-end`, … |
| `Border_Shorthand_Expander` | `border`, `border-{side}` | `border-width`, `border-style`, `border-color` |
| `Background_Shorthand_Expander` | `background` | `background-color`, `background-image`, … |
| `Outline_Shorthand_Expander` | `outline` | `outline-width`, `outline-style`, `outline-color`, `outline-offset` |

Template method: `expand()` dispatches null → `expand_null()`, non-null → `do_expand()`.

### Converters (`Property_Converter_Base`)

Map a single longhand rule to a typed PropValue in the context.
Registered in `Converter_Registry_Factory`.

Key converters:

| Converter | What it does |
|---|---|
| `Dimensions_Property_Converter` | `padding`/`margin`/`border-width` shorthand → Dimensions PropValue |
| `Border_Radius_Property_Converter` | `border-radius` shorthand → Border_Radius PropValue |
| `Object_Side_Merge_Converter` | `padding-top` / `border-top-width` / … → merges one side into an existing aggregate prop |
| `Object_Field_Merge_Converter` | `background-color` / `background-clip` / … → merges one field into `background` aggregate |
| `Size_Property_Converter` | any length/size value → Size PropValue |
| `Color_Property_Converter` | color string → Color PropValue |
| `String_Property_Converter` | enum strings → String PropValue |

Template method: `convert()` dispatches null → `convert_null()` (default: `context.set_prop(property, null)`), non-null → `do_convert()`.

### Conversion_Context

Mutable accumulator. `set_prop(key, value)` always overwrites — **last declaration wins**, matching CSS cascade semantics.

---

## Null / Reset Semantics

`null` (PHP) or the string `"null"` means **delete this prop from the style tree**.

- `parse()` normalises `"null"` → PHP `null` immediately.
- `dedupe()` runs after expansion — a later `null` supersedes an earlier valid value for the same property, and vice versa.
- Expanders fan out null to all their longhands via `expand_null()`.
- Converters set their prop to null via `convert_null()`.  
  `Object_Side_Merge_Converter` and `Object_Field_Merge_Converter` override this to merge null into the correct slot of the aggregate object.
- `validate_props()` bypasses Props_Parser for any prop value containing a null leaf.
- `cleanup_props()` collapses object props where every present sub-value is null into a top-level `null`.

Result: `padding: null` → `{ padding: null }`. `padding: 10px; padding-top: null` → dedupe leaves only `padding-top: null` (last wins), producing a partial Dimensions with `block-start: null`.

---

## Context as a Shared Build Surface

`Conversion_Context` is a key-value map that converters read **and** write during the same pass.
This is how multi-field aggregate props (like `background`) are assembled across separate CSS declarations.

`context->get_prop(key)` / `context->set_prop(key, value)` — last write wins (cascade order preserved).

### Example: `background-color: red`

```
Input CSS:  background-color: red;
```

1. **No expander** handles `background-color` — rule passes through unchanged.

2. **`Object_Field_Merge_Converter`** (registered for `background-color`) runs:
   - Calls `context->get_prop('background')` — returns `null` (nothing set yet).
   - `current_fields(null)` returns `[]` (fresh object).
   - Generates leaf: `Color_Prop_Type::generate('red')` → `{$$type: 'color', value: 'red'}`.
   - Merges: `fields['color'] = {$$type: 'color', value: 'red'}`.
   - Calls `context->set_prop('background', Background_Prop_Type::generate(fields))`.

3. **Context now holds:**
   ```json
   {
     "background": {
       "$$type": "background",
       "value": {
         "color": { "$$type": "color", "value": "red" }
       }
     }
   }
   ```

4. **`cleanup_props()`** — `color` is non-null, nothing to collapse. Prop survives as-is.

5. **Final output:**
   ```json
   { "props": { "background": { "$$type": "background", "value": { "color": { "$$type": "color", "value": "red" } } } } }
   ```

### Example: `background-color: red; background-image: url(img.png)`

Both converters are `Object_Field_Merge_Converter` instances with different `field_key` values.
Each one reads the **current** `background` prop from context and merges its own field in.

```
After background-color:
  context['background'] = { $$type: 'background', value: { color: <red> } }

After background-image:
  context['background'] = { $$type: 'background', value: { color: <red>, background-overlay: [<image layer>] } }
```

The second converter found the existing `background` object (type matches), extracted its current fields, and added `background-overlay` without losing `color`.

### The merge pattern (used by multiple converters)

Both `Object_Field_Merge_Converter` (flat fields) and `Object_Side_Merge_Converter` (logical sides) follow the same read-modify-write pattern:

```
existing = context->get_prop(target)
fields   = extract current fields/sides from existing (or start fresh)
fields[my_key] = new leaf value
context->set_prop(target, ObjectPropType::generate(fields))
```

This means any number of independent longhand declarations can collaborate to build a single rich object prop, in CSS cascade order, without any coordination between converters.

---

## Variable Promotion

When a `var(--token)` is encountered:

1. `Css_Var_Token_Resolver` looks up the variable in `Variables_Service`.
2. If the resolved type matches the expected prop type → emitted as a typed variable PropValue.
3. If type mismatches or the variable is unknown → ejected to `customCss` (or `rejected`).
4. `Variable_Prop_Value_Transformer` runs post-conversion to handle vars that survive to the props map.

---

## Extension Points

| What to extend | How |
|---|---|
| Support a new shorthand | Add a `Shorthand_Expander_Base` subclass, register in `Expander_Registry_Factory` |
| Support a new property | Add/extend a `Property_Converter_Base` subclass, register in `Converter_Registry_Factory` and add to `covered_properties()` |
| Custom null behaviour for a converter | Override `convert_null()` |
| Custom null behaviour for an expander | Override `expand_null()` |

`covered_properties()` must stay aligned with `Style_Schema` keys — it is the single source of truth for the coverage test.
