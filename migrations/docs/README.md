# Prop Type Migration System - User Guide

## Overview

The Prop Type Migration System is a powerful infrastructure for automatically migrating Elementor widget and element data when prop types change between versions. This system ensures backward compatibility and smooth transitions when schema changes occur.

### Key Features

- **Automatic Migration**: Migrations run automatically when documents are loaded
- **Bidirectional**: Supports both upgrade (`up`) and downgrade (`down`) migrations
- **Path-Based Operations**: Flexible path syntax with wildcard support
- **Conditional Execution**: Run operations based on data conditions
- **Type Graph Navigation**: Automatically finds migration paths between types
- **Performance Optimized**: Caching system prevents redundant migrations

## Quick Start

### Basic Migration Structure

A migration consists of two parts:

1. **Manifest Entry** (`manifest.json`): Defines the migration metadata
2. **Operations File**: Contains the actual transformation operations

```json
// manifest.json
{
  "propTypes": {
    "string-to-html": {
      "fromType": "string",
      "toType": "html",
      "path": "operations/string-to-html.json"
    }
  }
}
```

```json
// operations/string-to-html.json
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

### How Migrations Work

1. **Detection**: System detects type mismatches between stored data and expected schema
2. **Path Finding**: Finds the shortest migration path between source and target types
3. **Execution**: Applies operations in sequence (up or down direction)
4. **Caching**: Results are cached per document to avoid redundant work

## Important Concepts

### Migration Scope

- **Prop Type Migrations**: Operate on a single prop instance, paths start at prop root
- **Widget Key Migrations**: Operate on entire widget element, paths start at element root
- Migrations run **before** validation and transformation in the data processing pipeline

### Data Transformations

**Migrations do NOT support value transformations.** Migrations are purely structural - they create or update structure, but can't execute functions on data values.

- Migrations change structure: `{ "color": "#fff" }` → `{ "color": { "$$type": "color", "value": "#fff" } }`
- Transformers handle value changes: `{ "oldColor": "#fff" }` → `{ "newColor": { "gradient": "something", "value": "#fff" } }`

### Performance Considerations

- Migration state is cached per document with version + manifest hash
- Cache clears on Elementor version change, manifest change, or feature flag toggle
- Migrations only run when type mismatches are detected

## Getting Help

For detailed information on specific topics, refer to the documentation files listed above. Each document includes comprehensive examples and use cases.



