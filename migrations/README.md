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

## Functions
- [Set](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#set)
- [Delete](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#delete)
- [Move](https://elementor.atlassian.net/wiki/spaces/UE/pages/1999110146/Prop+Types+Migration+Schema+Design+Investigation#move)

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

### Prop Type Migration: Rename Nested Field

**Context**: Rename `value.value` → `value.size` in a size prop. Paths start at **prop root**.

```json
{
  "up": [
    {
      "op": { "fn": "set", "path": "value.value", "key": "size" }
    }
  ],
  "down": [
    {
      "op": { "fn": "set", "path": "value.size", "key": "value" }
    }
  ]
}
```

**Before**: `{ "$$type": "size", "value": { "value": 150, "unit": "px" } }`  
**After**: `{ "$$type": "size", "value": { "size": 150, "unit": "px" } }`

### Prop Type Migration: Wildcards with Array Items

**Context**: Update all color values in a gradient prop using wildcards. Paths start at **prop root**.

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

### Prop Type Migration: Wildcards with Nested Objects

**Context**: Rename keys across all nested objects using wildcards. Paths start at **prop root**.

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

**Before**:
```json
{
  "$$type": "complex",
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
  "$$type": "complex",
  "value": {
    "desktop": { "newName": "value1" },
    "tablet": { "newName": "value2" },
    "mobile": { "newName": "value3" }
  }
}
```

### Prop Type Migration: Complex Conditions

**Context**: Migrate only specific nested types with compound conditions. Paths start at **prop root**.

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

### Prop Type Migration: Migrate Nested Prop Type

**Context**: Change nested color type in background prop. Paths start at **prop root**.

```json
{
  "up": [
    {
      "op": { "fn": "set", "path": "value.color.$$type", "value": "color" },
      "condition": { "fn": "equals", "path": "value.color.$$type", "value": "string" }
    },
    {
      "op": { "fn": "set", "path": "value.background-type", "value": "classic" }
    }
  ],
  "down": [
    {
      "op": { "fn": "set", "path": "value.color.$$type", "value": "string" },
      "condition": { "fn": "equals", "path": "value.color.$$type", "value": "color" }
    },
    {
      "op": { "fn": "delete", "path": "value.background-type" }
    }
  ]
}
```

**Before**:
```json
{
  "$$type": "background",
  "value": {
    "color": { "$$type": "string", "value": "#8aaccb" }
  }
}
```

**After**:
```json
{
  "$$type": "background",
  "value": {
    "color": { "$$type": "color", "value": "#8aaccb" },
    "background-type": "classic"
  }
}
```
