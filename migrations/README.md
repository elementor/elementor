# Prop Type Migrations
## Appendix
- [Structure](#structure)
- [Language Design](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation)
- [Paths](#paths)
- [Conditions](#conditions)
- [Functions](#functions)
- [Examples](#examples)

## Structure
### Manifest
Manifest describes the different migrations, it can contain widget key migrations and prop-type migrations
```json
{
  "widgetKeys": {
    "e-logo": [
        { "from": "svg", "to": "icon" }
      ]
  },
  "propTypes": {
    "string-to-html": {
      "fromType": "string",
      "toType": "html",
      "url": "string-to-html.json"
    }
  }
}
```
### Prop Type Migrations
Prop type migrations are a set of operations, **up** for upgrade and reverse **down** for downgrade.  
Prop type migrations support wildcard paths and conditions (see below)
```json
{
  "up": [
    {
      "op": {
        "fn": "set",
        "path": "$$type",
        "value": "html"
      }
    }
  ],
  "down": [
    {
      "op": {
        "fn": "set",
        "path": "$$type",
        "value": "string"
      }
    }
  ]
}
```

## Paths
Path parameter works with wildcard, starting from the **root of prop type or widget** (depending on the type of migration)

## Conditions
Conditions check whether to run the migration or not, with many helper functions such as `exists`, conditions can be compounded by `AND` and `OR`.  
Full list can be found [here](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#Available-Conditions)

## Important Notes

### Data Transformations
**Migrations do NOT support value transformations.** Migrations are purely structural - they create or update, but can't activate any functions on the data.

Handle transformations in transformer code
- Migrations change structure: `{ "color": "#fff" }` → `{ "color": { "$$type": "color", "value": "#fff" } }`
- Transformers can take current values, and transform them `{ "oldColor": "#fff", "newColor": {} }` -> `{ "oldColor": "#fff", "newColor": { "gradient": "something", "value": "#fff" }}`

### Migration Scope
- **Prop Type Migrations**: Operate on a single prop instance, paths start at prop root
- **Widget Key Migrations**: Operate on entire widget element, paths start at element root
- Migrations run **before** validation and transformation in the data processing pipeline

### Performance Considerations
- Migration state is cached per document with version + manifest hash
- Cache clears on Elementor version change, manifest change, or feature flag toggle

## Functions
### Set
`set` creates or updates data, it can update key / value or both. Full Documentation [here](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#set)  
Params:  
- key (optional)
- value (optional)
- merge **default** true - attempts to deep merge objects instead of replace

#### Usage
Replaces nested key and value
```json
{ "op": { "fn": "set", "path": "value.*.nested", "value": ["a"], "key": "nested2" } }
```
Appends to array
```json
{ "op": { "fn": "set", "path": "value.*.nested.[]", "value": "a" } }
```
Creates empty object at path
```json
{ "op": { "fn": "set", "path": "value.*.nested.[*]" } }
```

### Delete
`delete` removes keys/values at specified path. Full Documentation [here](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#delete)  
Params:  
- clean **default** true - deletes empty parent paths until reaching an object that has siblings

#### Usage
Delete specific nested key
```json
{ "op": { "fn": "delete", "path": "value.deprecated" } }
```
Delete all matching wildcard paths
```json
{ "op": { "fn": "delete", "path": "value.items[*].legacy" } }
```
Delete without cleaning empty parents
```json
{ "op": { "fn": "delete", "path": "value.old", "clean": false } }
```

### Move
`move` relocates values from one path to another. Full Documentation [here](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#move)  
Params:  
- src - Source path
- dest - Destination path
- clean **default** true - deletes source path after move (will delete empty paths until reaching an object that has siblings)

#### Usage
Move simple value to new location
```json
{ "op": { "fn": "move", "src": "value.oldField", "dest": "value.nested.newField" } }
```
Move without cleaning source
```json
{ "op": { "fn": "move", "src": "value.data", "dest": "value.backup", "clean": false } }
```
Move nested object structure
```json
{ "op": { "fn": "move", "src": "value.settings", "dest": "value.config.settings" } }
```

## Examples

### Prop Type Migration: Change Type

**Context**: Migrate `string` → `html` type. Paths start at **prop root**.

```json
{
  "up": [
    { "op": { "fn": "set", "path": "$$type", "value": "html" } }
  ],
  "down": [
    { "op": { "fn": "set", "path": "$$type", "value": "string" } }
  ]
}
```

**Before**: `{ "$$type": "string", "value": "Hello" }`  
**After**: `{ "$$type": "html", "value": "Hello" }`

### Prop Type Migration: Rename Keys (Simple and Wildcard)

**Context**: Rename keys using `key` parameter, with and without wildcards. Paths start at **prop root**.

**Simple key rename:**
```json
{
  "up": [
    { "op": { "fn": "set", "path": "value.oldName", "key": "newName" } }
  ],
  "down": [
    { "op": { "fn": "set", "path": "value.newName", "key": "oldName" } }
  ]
}
```

**Wildcard key rename across multiple objects:**
```json
{
  "up": [
    {
      "op": { "fn": "set", "path": "value.*.oldName", "key": "newName" },
      "condition": { "fn": "exists", "path": "value.*.oldName" }
    }
  ],
  "down": [
    {
      "op": { "fn": "set", "path": "value.*.newName", "key": "oldName" },
      "condition": { "fn": "exists", "path": "value.*.newName" }
    }
  ]
}
```

**Before** (wildcard example):
```json
{
  "$$type": "responsive",
  "value": {
    "desktop": { "oldName": "value1" },
    "tablet": { "oldName": "value2" },
    "mobile": { "oldName": "value3" }
  }
}
```

**After**:
```json
{
  "$$type": "responsive",
  "value": {
    "desktop": { "newName": "value1" },
    "tablet": { "newName": "value2" },
    "mobile": { "newName": "value3" }
  }
}
```

### Prop Type Migration: Wildcards with Array Items

**Context**: Update all color types in a gradient using array wildcards `[*]`. Paths start at **prop root**.

```json
{
  "up": [
    {
      "op": { "fn": "set", "path": "value.stops[*].color.$$type", "value": "color" },
      "condition": { "fn": "equals", "path": "value.stops[*].color.$$type", "value": "string" }
    }
  ],
  "down": [
    {
      "op": { "fn": "set", "path": "value.stops[*].color.$$type", "value": "string" },
      "condition": { "fn": "equals", "path": "value.stops[*].color.$$type", "value": "color" }
    }
  ]
}
```

**Before**:
```json
{
  "$$type": "gradient",
  "value": {
    "stops": [
      { "position": 0, "color": { "$$type": "string", "value": "#ff0000" } },
      { "position": 50, "color": { "$$type": "string", "value": "#00ff00" } },
      { "position": 100, "color": { "$$type": "string", "value": "#0000ff" } }
    ]
  }
}
```

**After**:
```json
{
  "$$type": "gradient",
  "value": {
    "stops": [
      { "position": 0, "color": { "$$type": "color", "value": "#ff0000" } },
      { "position": 50, "color": { "$$type": "color", "value": "#00ff00" } },
      { "position": 100, "color": { "$$type": "color", "value": "#0000ff" } }
    ]
  }
}
```

### Prop Type Migration: Compound Conditions (AND/OR)

**Context**: Use `and`/`or` conditions to selectively migrate items. Paths start at **prop root**.

```json
{
  "up": [
    {
      "op": { "fn": "set", "path": "value.items[*].type", "value": "enhanced" },
      "condition": {
        "fn": "and",
        "conditions": [
          { "fn": "equals", "path": "value.items[*].type", "value": "legacy" },
          { "fn": "exists", "path": "value.items[*].data" }
        ]
      }
    },
    {
      "op": { "fn": "set", "path": "value.items[*].migrated", "value": true },
      "condition": {
        "fn": "or",
        "conditions": [
          { "fn": "equals", "path": "value.items[*].type", "value": "enhanced" },
          { "fn": "not_exists", "path": "value.items[*].migrated" }
        ]
      }
    }
  ],
  "down": [
    {
      "op": { "fn": "set", "path": "value.items[*].type", "value": "legacy" },
      "condition": { "fn": "equals", "path": "value.items[*].type", "value": "enhanced" }
    },
    {
      "op": { "fn": "delete", "path": "value.items[*].migrated" }
    }
  ]
}
```

**Before**:
```json
{
  "$$type": "list",
  "value": {
    "items": [
      { "type": "legacy", "data": { "content": "Item 1" } },
      { "type": "legacy", "data": { "content": "Item 2" } },
      { "type": "new", "data": { "content": "Item 3" } }
    ]
  }
}
```

**After**:
```json
{
  "$$type": "list",
  "value": {
    "items": [
      { "type": "enhanced", "data": { "content": "Item 1" }, "migrated": true },
      { "type": "enhanced", "data": { "content": "Item 2" }, "migrated": true },
      { "type": "new", "data": { "content": "Item 3" }, "migrated": true }
    ]
  }
}
```
