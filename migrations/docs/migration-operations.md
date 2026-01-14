# Migration Operations Guide

## Overview

Migration operations are the building blocks of data transformations. Each operation defines a specific action to perform on the data structure. Operations are grouped into `up` (upgrade) and `down` (downgrade) arrays.

## Operation Structure

```json
{
  "up": [
    {
      "op": {
        "fn": "set",
        "path": "path.to.field",
        "value": "new value"
      },
      "condition": {
        "fn": "exists",
        "path": "path.to.field"
      }
    }
  ],
  "down": [
    {
      "op": {
        "fn": "set",
        "path": "path.to.field",
        "value": "old value"
      }
    }
  ]
}
```

### Operation Fields

- **`op`** (object, required): The operation definition
  - **`fn`** (string, required): Operation function name (`set`, `delete`, or `move`)
  - **`path`** (string, required for `set` and `delete`): Target path (see [Path Syntax](path-syntax.md))
  - Additional fields depend on the operation type
- **`condition`** (object, optional): Condition to check before executing (see [Conditions](conditions.md))

## Set Operation

The `set` operation creates or updates data at a specified path. It can update keys, values, or both.

### Parameters

- **`fn`**: `"set"` (required)
- **`path`** (string, required): Target path where to set the value
- **`key`** (string, optional): New key name (renames the key at the path)
- **`value`** (any, optional): Value to set
- **`merge`** (boolean, optional, default: `true`): If `true`, deep merges objects instead of replacing

### Behavior

- If `key` is provided: Renames the key at the path
- If `value` is provided: Sets the value at the path
- If both are provided: Renames the key and sets the value
- If neither is provided: Creates an empty object at the path
- If `merge` is `true` and both current and new values are objects: Deep merges instead of replacing

### Examples

#### Simple Value Update

```json
{
  "op": {
    "fn": "set",
    "path": "$$type",
    "value": "html"
  }
}
```

**Before:** `{ "$$type": "string", "value": "Hello" }`  
**After:** `{ "$$type": "html", "value": "Hello" }`

#### Key Rename

```json
{
  "op": {
    "fn": "set",
    "path": "value.oldName",
    "key": "newName"
  }
}
```

**Before:** `{ "value": { "oldName": "data" } }`  
**After:** `{ "value": { "newName": "data" } }`

#### Key Rename with Value Update

```json
{
  "op": {
    "fn": "set",
    "path": "value.oldName",
    "key": "newName",
    "value": "updated data"
  }
}
```

**Before:** `{ "value": { "oldName": "old data" } }`  
**After:** `{ "value": { "newName": "updated data" } }`

#### Deep Merge

```json
{
  "op": {
    "fn": "set",
    "path": "value.config",
    "value": { "newField": "value" },
    "merge": true
  }
}
```

**Before:** `{ "value": { "config": { "oldField": "old" } } }`  
**After:** `{ "value": { "config": { "oldField": "old", "newField": "value" } } }`

#### Replace (No Merge)

```json
{
  "op": {
    "fn": "set",
    "path": "value.config",
    "value": { "newField": "value" },
    "merge": false
  }
}
```

**Before:** `{ "value": { "config": { "oldField": "old" } } }`  
**After:** `{ "value": { "config": { "newField": "value" } } }`

#### Create Empty Object

```json
{
  "op": {
    "fn": "set",
    "path": "value.newObject"
  }
}
```

**Before:** `{ "value": {} }`  
**After:** `{ "value": { "newObject": {} } }`

#### Append to Array

```json
{
  "op": {
    "fn": "set",
    "path": "value.items.[]",
    "value": "new item"
  }
}
```

**Before:** `{ "value": { "items": ["item1", "item2"] } }`  
**After:** `{ "value": { "items": ["item1", "item2", "new item"] } }`

#### Create Object in Array

```json
{
  "op": {
    "fn": "set",
    "path": "value.items.[*]"
  }
}
```

Creates a new empty object at the end of the array.

## Delete Operation

The `delete` operation removes keys/values at a specified path.

### Parameters

- **`fn`**: `"delete"` (required)
- **`path`** (string, required): Path to delete
- **`clean`** (boolean, optional, default: `true`): If `true`, deletes empty parent paths until reaching an object that has siblings

### Behavior

- Removes the key/value at the specified path
- If `clean` is `true`: Recursively removes empty parent objects until finding one with siblings
- If `clean` is `false`: Only removes the exact path, leaving empty objects

### Examples

#### Simple Delete

```json
{
  "op": {
    "fn": "delete",
    "path": "value.deprecated"
  }
}
```

**Before:** `{ "value": { "deprecated": "data", "active": "data" } }`  
**After:** `{ "value": { "active": "data" } }`

#### Delete with Cleanup

```json
{
  "op": {
    "fn": "delete",
    "path": "value.nested.deep.field",
    "clean": true
  }
}
```

**Before:** `{ "value": { "nested": { "deep": { "field": "data" } } } }`  
**After:** `{ "value": {} }` (empty parents removed)

#### Delete Without Cleanup

```json
{
  "op": {
    "fn": "delete",
    "path": "value.nested.deep.field",
    "clean": false
  }
}
```

**Before:** `{ "value": { "nested": { "deep": { "field": "data" } } } }`  
**After:** `{ "value": { "nested": { "deep": {} } } }` (empty objects remain)

#### Delete with Wildcards

```json
{
  "op": {
    "fn": "delete",
    "path": "value.items[*].legacy"
  }
}
```

**Before:**
```json
{
  "value": {
    "items": [
      { "legacy": "data1", "new": "data1" },
      { "legacy": "data2", "new": "data2" }
    ]
  }
}
```

**After:**
```json
{
  "value": {
    "items": [
      { "new": "data1" },
      { "new": "data2" }
    ]
  }
}
```

## Move Operation

The `move` operation relocates values from one path to another.

### Parameters

- **`fn`**: `"move"` (required)
- **`src`** (string, required): Source path
- **`dest`** (string, required): Destination path
- **`clean`** (boolean, optional, default: `true`): If `true`, deletes source path after move (with cleanup)

### Behavior

- Copies value from `src` to `dest`
- If `clean` is `true`: Deletes the source path (with cleanup of empty parents)
- If `clean` is `false`: Keeps the source path (duplicates the value)

### Examples

#### Simple Move

```json
{
  "op": {
    "fn": "move",
    "src": "value.oldField",
    "dest": "value.nested.newField"
  }
}
```

**Before:** `{ "value": { "oldField": "data" } }`  
**After:** `{ "value": { "nested": { "newField": "data" } } }`

#### Move Without Cleanup

```json
{
  "op": {
    "fn": "move",
    "src": "value.data",
    "dest": "value.backup",
    "clean": false
  }
}
```

**Before:** `{ "value": { "data": "important" } }`  
**After:** `{ "value": { "data": "important", "backup": "important" } }`

#### Move Nested Structure

```json
{
  "op": {
    "fn": "move",
    "src": "value.settings",
    "dest": "value.config.settings"
  }
}
```

**Before:**
```json
{
  "value": {
    "settings": {
      "option1": "value1",
      "option2": "value2"
    }
  }
}
```

**After:**
```json
{
  "value": {
    "config": {
      "settings": {
        "option1": "value1",
        "option2": "value2"
      }
    }
  }
}
```

## Value References

Operations support referencing current values using special syntax:

### `$$current`

References the entire current value at the operation path.

```json
{
  "op": {
    "fn": "set",
    "path": "value.wrapped",
    "value": { "content": "$$current" }
  }
}
```

**Before:** `{ "value": "Hello" }`  
**After:** `{ "value": { "wrapped": { "content": "Hello" } } }`

### `$$current.path`

References a nested value within the current value.

```json
{
  "op": {
    "fn": "set",
    "path": "value.newField",
    "value": "$$current.oldField"
  }
}
```

**Before:** `{ "value": { "oldField": "data" } }`  
**After:** `{ "value": { "oldField": "data", "newField": "data" } }`

### Array References

References work within arrays when using wildcards:

```json
{
  "op": {
    "fn": "set",
    "path": "value.items[*].newField",
    "value": "$$current.oldField"
  }
}
```

**Before:**
```json
{
  "value": {
    "items": [
      { "oldField": "data1" },
      { "oldField": "data2" }
    ]
  }
}
```

**After:**
```json
{
  "value": {
    "items": [
      { "oldField": "data1", "newField": "data1" },
      { "oldField": "data2", "newField": "data2" }
    ]
  }
}
```

## Operation Execution Order

Operations within an array execute sequentially:

```json
{
  "up": [
    { "op": { "fn": "set", "path": "value.field1", "value": "value1" } },
    { "op": { "fn": "set", "path": "value.field2", "value": "value2" } },
    { "op": { "fn": "delete", "path": "value.oldField" } }
  ]
}
```

Each operation sees the results of previous operations.




