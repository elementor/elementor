# Prop Dependency System - Complete Guide

## Overview

The Prop Dependency System is a declarative mechanism that allows properties (props) to depend on each other. When one prop changes, dependent props can be automatically hidden, disabled, or have their values changed.

---

## Architecture

The system consists of two main parts:

### **TypeScript (Frontend)** - `@elementor/editor-props`
- **Types** (`types.ts`): Defines the core data structures
- **Utils** (`prop-dependency-utils.ts`): Implements dependency checking and value computation logic

### **PHP (Backend)** - `PropDependencies\Manager`
- Builds the dependency graph
- Detects circular dependencies
- Exports the structure to the frontend

---

## Dependency Effects

There are **3 types of effects** a dependent prop can have:

### **A. `hide` Effect** - Hide Control
When the condition is **not met**, the control **completely disappears** from the panel.

**Example:** Email fields are hidden when "email" is not selected in actions-after-submit

```typescript
{
  operator: 'contains',
  path: ['actions-after-submit'],
  value: 'email',
  effect: 'hide'  // ← If email is not in the list, control is hidden
}
```

### **B. `disable` Effect** - Lock Control (Default)
When the condition is **not met**, the control **remains visible but cannot be edited**.

**Example:** When link has a value, the tag control is locked to `a`

```typescript
{
  operator: 'not_exist',
  path: ['link', 'destination'],
  effect: 'disable'  // ← Default effect
}
```

### **C. `newValue` Effect** - Automatic Value Change
When the condition is **not met**, the prop **automatically receives a new value**.

**Example:** When link has a value, tag automatically becomes `a`

```php
// div-block.php
$tag_dependencies = Dependency_Manager::make( Dependency_Manager::RELATION_AND )
  ->where([
    'operator' => 'not_exist',
    'path' => ['link', 'destination'],
    'newValue' => [
      '$$type' => 'string',
      'value' => 'a',  // ← When link exists, tag becomes 'a'
    ],
  ])->get();
```

---

## Supported Operators

```typescript
type DependencyOperator =
  | 'eq'        // Equal to
  | 'ne'        // Not equal to
  | 'lt'        // Less than
  | 'lte'       // Less than or equal
  | 'gt'        // Greater than
  | 'gte'       // Greater than or equal
  | 'exists'    // Exists (includes 0 and false)
  | 'not_exist' // Does not exist (null or undefined)
  | 'in'        // In array
  | 'nin'       // Not in array
  | 'contains'  // Contains (for strings or arrays)
  | 'ncontains' // Does not contain
```

---

## Relations

```typescript
relation: 'or' | 'and'
```

- **`and`**: All conditions must be met
- **`or`**: At least one condition must be met

Dependencies can be nested with different relations:

```typescript
{
  relation: 'and',
  terms: [
    { operator: 'eq', path: ['status'], value: 'active' },
    {
      relation: 'or',  // ← Nested relation
      terms: [
        { operator: 'gt', path: ['priority'], value: 5 },
        { operator: 'contains', path: ['title'], value: 'urgent' }
      ]
    }
  ]
}
```

---

## Type Definitions

### DependencyTerm
```typescript
type DependencyTerm = {
  operator: DependencyOperator;
  path: string[];                    // Path to the source prop
  nestedPath?: string[];             // Optional nested path within the value
  value: PropValue;                  // Value to compare against
  newValue?: TransformablePropValue; // New value to set when condition fails
  effect?: 'disable' | 'hide';       // Effect type (default: 'disable')
};
```

### Dependency
```typescript
type Dependency = {
  relation: 'or' | 'and';
  terms: (DependencyTerm | Dependency)[]; // Can nest dependencies
  newValue?: TransformablePropValue;
};
```

---

## Complete Example: Link → Tag Dependency

Here's how the link-to-tag dependency works in div-block/flexbox:

### **PHP - Defining the Dependency:**

```php
// modules/atomic-widgets/elements/div-block/div-block.php
$tag_dependencies = Dependency_Manager::make( Dependency_Manager::RELATION_AND )
  ->where([
    'operator' => 'ne',
    'path' => ['link', 'destination'],
    'nestedPath' => ['group'],
    'value' => 'action',
    'newValue' => [
      '$$type' => 'string',
      'value' => 'button',
    ],
  ])->where([
    'operator' => 'not_exist',
    'path' => ['link', 'destination'],
    'newValue' => [
      '$$type' => 'string',
      'value' => 'a',
    ],
  ])->get();
```

**Translation:**
1. **Condition 1:** If `link.destination.group !== 'action'` → `tag = 'button'`
2. **Condition 2:** If `link.destination` does not exist → `tag = 'a'`
3. **Relation:** `AND` - Both conditions are checked

### **TypeScript - Implementing the Dependency:**

```typescript
// When link value changes:
const setValue = (newValue: Values) => {
  // 1. Extract all dependent props (including 'tag')
  const dependents = extractOrderedDependencies(dependenciesPerTargetMapping);
  
  // 2. Check each dependent prop
  const settings = getUpdatedValues(
    newValue, 
    dependents, 
    propsSchema, 
    settingsWithDefaults, 
    elementId
  );
  
  // 3. Update element settings
  updateElementSettings({ id: elementId, props: settings });
};
```

**What happens when link changes:**
1. `setValue` is called with the new link value
2. `extractOrderedDependencies` returns all dependent props (including `tag`)
3. `getUpdatedValues` iterates through dependents and checks:
   - Was the condition met **before** the change?
   - Is the condition met **after** the change?
4. If condition **fails now** but **passed before**:
   - Save the previous value to sessionStorage
   - Replace with the new value from `newValue`
5. If condition **passes now** but **failed before**:
   - Restore the previous value from sessionStorage

---

## Dependency Mapping (`dependenciesPerTargetMapping`)

This object maps **who affects whom**:

```typescript
{
  'link': ['tag', 'isTargetBlank'],  // ← Changing link affects tag and isTargetBlank
  'tag': []                          // ← tag doesn't affect anyone
}
```

**How it's built:**
- In PHP: `Manager::get_source_to_dependents()` builds the map
- Detects circular dependencies
- Passed to frontend via `ElementType.dependenciesPerTargetMapping`

---

## Use Cases

### **A. Conditional Controls**

```typescript
// Email field shown only if email is selected in actions
{
  operator: 'contains',
  path: ['actions-after-submit'],
  value: 'email',
  effect: 'hide'
}
```

### **B. Disabled Controls**

```typescript
// isTargetBlank is disabled if there's no link
{
  operator: 'exists',
  path: ['link', 'destination']
  // effect: 'disable' ← Default
}
```

### **C. Automatic Values**

```typescript
// tag becomes 'a' when link exists
{
  operator: 'not_exist',
  path: ['link', 'destination'],
  newValue: { $$type: 'string', value: 'a' }
}
```

### **D. Value Restoration**
When removing a link, the system **restores** the original tag value from sessionStorage!

---

## Advanced Features

### **A. Nested Paths**
Access nested values:

```php
[
  'path' => ['link', 'destination'],
  'nestedPath' => ['group'],  // ← Access link.destination.group
  'value' => 'action'
]
```

### **B. Circular Dependency Detection**
The system detects circular dependencies at build time:

```php
// ⚠️ This will throw an exception:
'a' => depends on 'b'
'b' => depends on 'c'
'c' => depends on 'a'  // ← Circular!
```

### **C. Session Storage Persistence**
Values are saved to session storage to enable restoration:

```typescript
// When locking a control, value is saved:
savePreviousValueToStorage({ path: 'tag', elementId, value: 'section' })

// When unlocking, value is restored:
retrievePreviousValueFromStorage({ path: 'tag', elementId })
```

---

## Key Files

### **TypeScript:**
- `packages/libs/editor-props/src/types.ts` - Type definitions
- `packages/libs/editor-props/src/utils/prop-dependency-utils.ts` - Checking logic
- `packages/core/editor-editing-panel/src/utils/prop-dependency-utils.ts` - Update logic
- `packages/core/editor-editing-panel/src/controls-registry/settings-field.tsx` - Implementation

### **PHP:**
- `modules/atomic-widgets/prop-dependencies/manager.php` - Dependency manager
- `modules/atomic-widgets/elements/div-block/div-block.php` - Usage example
- `modules/atomic-widgets/elements/flexbox/flexbox.php` - Another example
- `modules/atomic-widgets/prop-types/link-prop-type.php` - Link dependencies

### **Tests:**
- `packages/libs/editor-props/src/utils/__tests__/prop-dependency-utils.test.ts`
- `packages/core/editor-editing-panel/src/controls-registry/__tests__/settings-field.test.tsx`
- `tests/playwright/sanity/modules/atomic-widgets/prop-dependencies/link-dependencies.test.ts`

---

## How It Works: Step by Step

1. **Define Dependencies (PHP):**
   - Use `Dependency_Manager` to define conditions
   - Specify operators, paths, values, and effects
   - Build dependency graph and check for circular dependencies

2. **Export to Frontend:**
   - PHP exports `propsSchema` with dependencies
   - Exports `dependenciesPerTargetMapping` showing relationships

3. **Check Dependencies (TypeScript):**
   - `isDependencyMet()` evaluates if conditions are satisfied
   - Returns whether dependency is met and which terms failed

4. **Apply Effects:**
   - **Hide:** Component returns `null` if `isHidden`
   - **Disable:** Control receives `disabled` prop
   - **NewValue:** Value is automatically changed

5. **Handle Value Changes:**
   - When a prop changes, check all its dependents
   - Update dependent values based on conditions
   - Save/restore values to/from sessionStorage

---

## Summary

The Prop Dependency System is a powerful, declarative mechanism that enables complex logic between props. It supports hiding, disabling, automatic value changes, and value restoration when conditions change. Everything is defined in PHP and automatically handled in the frontend! 🎯
