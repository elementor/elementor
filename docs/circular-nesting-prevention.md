# Circular Component Nesting Prevention (ED-21066)

This document explains how circular component nesting is prevented at each critical point in the system.

---

## Overview

Circular component nesting occurs when:
- Component A contains Component A (self-reference)
- Component A contains Component B, which contains Component A (indirect cycle)

We prevent this at **three levels**:
1. **Drop/Create Prevention** - Block adding circular components in the editor (first-level only)
2. **Rendering Prevention** - Prevent infinite loops if circular data exists (server-side)
3. **Save Prevention** - Server-side validation before persisting data (full recursive check)

---

## 1. Drop/Create Prevention (Client-Side)

**Goal:** Prevent users from adding a component that would create a circular reference.

> **Note:** This is a **first-level check only**. The client checks against the current editing path but does not check if nested components inside the added component would create indirect cycles. Full validation happens on the server during save.

### Files Modified
- `packages/packages/core/editor-components/src/prevent-circular-nesting.ts`
- `packages/packages/core/editor-components/src/components/components-tab/components-item.tsx`

### How It Works

#### Command Blocking (`prevent-circular-nesting.ts`)

Uses `blockCommand` to intercept Elementor commands before they execute:

```typescript
export function initCircularNestingPrevention() {
    blockCommand({
        command: 'document/elements/create',
        condition: blockCircularCreate,
    });

    blockCommand({
        command: 'document/elements/move',
        condition: blockCircularMove,
    });

    blockCommand({
        command: 'document/elements/paste',
        condition: blockCircularPaste,
    });
}
```

#### Detection Logic (`wouldCreateCircularNesting`)

Checks if adding a component would create a circular reference by comparing against:
1. The **current component being edited** (`selectCurrentComponentId`)
2. The **editing path** (parent components in the navigation stack)

```typescript
export function wouldCreateCircularNesting(componentIdToAdd: number | string | undefined): boolean {
    const currentComponentId = selectCurrentComponentId(state);
    const path = selectPath(state);

    // Can't add the component we're currently editing
    if (componentIdToAdd === currentComponentId) {
        return true;
    }

    // Can't add any component from our parent chain
    return path.some((item) => item.componentId === componentIdToAdd);
}
```

#### Click Prevention (`components-item.tsx`)

When clicking a component in the panel to add it:

```typescript
const handleClick = () => {
    if (wouldCreateCircularNesting(component.id)) {
        notify({
            type: 'default',
            message: __('Cannot add this component here - it would create a circular reference.', 'elementor'),
            id: 'circular-component-nesting-blocked',
        });
        return;
    }
    addComponentToPage(componentModel);
};
```

### User Experience

When blocked, the user sees a notification:
> "Cannot add this component here - it would create a circular reference."

---

## 2. Rendering Prevention (Server-Side)

**Goal:** Prevent infinite loops if circular data somehow exists in the database.

### Files Modified
- `modules/components/transformers/component-instance-transformer.php`

### How It Works

Uses a static `$rendering_stack` array to track components during server-side rendering:

```php
class Component_Instance_Transformer extends Transformer_Base {
    private static array $rendering_stack = [];

    public function transform($value, Props_Resolver_Context $context) {
        $component_id = $value['component_id'];

        if ($this->is_circular_reference($component_id)) {
            return '<!-- Circular component reference detected -->';
        }

        self::$rendering_stack[] = $component_id;
        $content = $this->get_rendered_content($component_id);
        array_pop(self::$rendering_stack);

        return $content;
    }

    private function is_circular_reference(int $component_id): bool {
        return in_array($component_id, self::$rendering_stack, true);
    }
}
```

### Output When Detected

- **Server:** `<!-- Circular component reference detected -->`

---

## 3. Save Prevention (Server-Side)

**Goal:** Validate component content before saving to prevent circular data from being persisted.

> **Note:** This performs **full recursive validation** - it checks indirect circular references by loading nested component content from the database.

### Files Modified
- `modules/components/module.php`
- `modules/components/circular-dependency-validator.php` (existing, now used)
- `modules/components/components-rest-api.php` (existing)

### How It Works

#### Hook Registration (`module.php`)

```php
add_action(
    'elementor/document/before_save',
    fn(Document $document, array $data) => $this->validate_circular_dependencies($document, $data),
    10,
    2
);
```

#### Validation Method (`module.php`)

```php
private function validate_circular_dependencies(Document $document, array $data) {
    if (!$document instanceof Component_Document) {
        return;
    }

    if (!isset($data['elements'])) {
        return;
    }

    $component_id = $document->get_main_id();
    $elements = $data['elements'];

    $result = Circular_Dependency_Validator::make()->validate($component_id, $elements);

    if (!$result['success']) {
        throw new \Exception(esc_html(implode(', ', $result['messages'])));
    }
}
```

#### Circular Dependency Validator (`circular-dependency-validator.php`)

The validator performs deep recursive validation:

```php
public function validate(int $component_id, array $elements): array {
    // 1. Extract all component IDs referenced in the elements
    $referenced_ids = $this->extract_component_ids($elements);

    // 2. Check for direct self-reference
    if (in_array($component_id, $referenced_ids, true)) {
        return $this->build_error_response($component_id);
    }

    // 3. Check for indirect circular references through nested components
    foreach ($referenced_ids as $ref_id) {
        if ($this->component_contains_reference($ref_id, $component_id, [])) {
            return $this->build_error_response($component_id, $ref_id);
        }
    }

    return ['success' => true, 'messages' => []];
}
```

The `component_contains_reference` method recursively checks up to 50 levels deep.

### Validation Points

| Scenario | Method Used | Location |
|----------|-------------|----------|
| Creating new components | `validate_new_components()` | `components-rest-api.php` |
| Updating existing component | `validate()` | `module.php` (before_save hook) |

---

## Test Coverage

### Client-Side Tests
- `packages/packages/core/editor-components/src/__tests__/prevent-circular-nesting.test.ts`

### Server-Side Tests
- `tests/phpunit/elementor/modules/components/test-circular-dependency-validator.php`
- `tests/phpunit/elementor/modules/components/transformers/test-component-instance-transformer.php`

---

## Summary Table

| Prevention Point | Location | Type | Mechanism | Checks Indirect? |
|-----------------|----------|------|-----------|------------------|
| Drop/Create | `prevent-circular-nesting.ts` | Client | Command blocking | No (first-level) |
| Click to add | `components-item.tsx` | Client | Event handler check | No (first-level) |
| Frontend rendering | `component-instance-transformer.php` | Server | Static rendering stack | Yes (runtime) |
| Create new component | `components-rest-api.php` | Server | REST API validation | Yes (recursive) |
| Update component | `module.php` (before_save) | Server | Document hook validation | Yes (recursive) |

---

## Error Messages

- **Client notification:** "Cannot add this component here - it would create a circular reference."
- **Server validation:** "Circular dependency detected: Component X references itself." or "Circular dependency detected: Component X would create a cycle via component Y."
- **Render fallback (server):** `<!-- Circular component reference detected -->`
