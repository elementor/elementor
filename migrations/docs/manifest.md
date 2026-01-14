# Manifest File Reference

## Overview

The `manifest.json` file is the central registry for all migrations in the system. It defines both prop type migrations and widget key migrations, providing metadata and file paths for operation definitions.

## File Structure

```json
{
  "widgetKeys": {
    "widget-type-name": [
      { "from": "oldKey", "to": "newKey" }
    ]
  },
  "propTypes": {
    "migration-id": {
      "fromType": "source-type",
      "toType": "target-type",
      "path": "operations/migration-file.json"
    }
  }
}
```

## Prop Types Section

The `propTypes` section defines migrations between different prop type identifiers.

### Structure

```json
{
  "propTypes": {
    "migration-id": {
      "fromType": "string",
      "toType": "html",
      "path": "operations/string-to-html.json"
    }
  }
}
```

### Fields

- **`migration-id`** (string, required): Unique identifier for the migration. Used internally to reference the migration.
- **`fromType`** (string, required): The source prop type identifier (e.g., `"string"`, `"html"`, `"color"`).
- **`toType`** (string, required): The target prop type identifier after migration.
- **`path`** (string, required): Relative path from the migrations directory to the operations JSON file.

### Example

```json
{
  "propTypes": {
    "string-to-html": {
      "fromType": "string",
      "toType": "html",
      "path": "operations/string-to-html.json"
    },
    "color-string-to-color": {
      "fromType": "string",
      "toType": "color",
      "path": "operations/color-string-to-color.json"
    }
  }
}
```

### Migration Path Finding

The system automatically builds a graph from prop type migrations and finds the shortest path between any two types. This means:

- Direct migrations: `string` → `html` (one step)
- Indirect migrations: `string` → `html` → `rich-text` (two steps, automatically chained)
- Bidirectional: The system can traverse the graph in either direction

## Widget Keys Section

The `widgetKeys` section defines migrations for widget property key names. This is used when widget schemas change and property keys are renamed.

### Structure

```json
{
  "widgetKeys": {
    "e-logo": [
      { "from": "svg", "to": "icon" },
      { "from": "imageUrl", "to": "image.url" }
    ],
    "e-button": [
      { "from": "title", "to": "text" }
    ]
  }
}
```

### Fields

- **Widget Type** (string, required): The widget type identifier (e.g., `"e-logo"`, `"e-button"`).
- **Mappings** (array, required): Array of key migration mappings.
  - **`from`** (string, required): The old property key name.
  - **`to`** (string, required): The new property key name.

### Key Migration Behavior

- Widget key migrations are applied when a widget has an "orphaned" key (exists in data but not in schema) and a "missing" key (exists in schema but not in data).
- The system checks if a migration path exists between the orphaned and missing keys.
- If exactly one valid target is found, the migration is applied automatically.

### Example

```json
{
  "widgetKeys": {
    "e-logo": [
      { "from": "svg", "to": "icon" }
    ]
  }
}
```

**Before:**
```json
{
  "widgetType": "e-logo",
  "settings": {
    "svg": { "$$type": "icon", "value": "..." }
  }
}
```

**After:**
```json
{
  "widgetType": "e-logo",
  "settings": {
    "icon": { "$$type": "icon", "value": "..." }
  }
}
```

## Best Practices

### Naming Conventions

- Use descriptive migration IDs: `"string-to-html"` is better than `"migration1"`
- Use kebab-case for migration IDs
- Keep operation file names consistent with migration IDs

### File Organization

```
migrations/
├── manifest.json
└── operations/
    ├── string-to-html.json
    ├── color-string-to-color.json
    └── ...
```

### Migration Paths

- Keep migration paths simple and direct when possible
- Document complex migration chains in comments
- Test both `up` and `down` directions

### Widget Key Migrations

- Only define migrations for actual key renames
- Ensure `from` and `to` keys are mutually exclusive (one orphaned, one missing)
- Use dot notation for nested key migrations: `"imageUrl"` → `"image.url"`

## Manifest Hash

The system generates a hash of the manifest content for cache invalidation. When the manifest changes:

1. All cached migration states are cleared
2. Migrations re-run on next document load
3. New migration state is cached with the new hash

This ensures that manifest changes trigger re-migration of all documents.



