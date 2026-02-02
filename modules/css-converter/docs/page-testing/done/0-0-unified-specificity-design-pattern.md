# Unified Specificity Design Pattern

## Overview

All CSS specificity handling is managed through a **single, shared instance** of `Unified_Style_Manager` that is passed through the processor pipeline via the `Css_Processing_Context`.

## Design Principles

### 1. Single Instance Pattern
- **ONE** `Unified_Style_Manager` instance per conversion
- Created by the `Style_Collection_Processor` (priority 60)
- Stored in context metadata as `unified_style_manager`
- All subsequent processors **MUST** use this instance
- **NEVER** create additional instances

### 2. Processor Execution Order

Processors run in **descending priority order** (higher numbers first):

```
Priority 60: Style_Collection_Processor
  ↓ Creates unified_style_manager
  ↓ Collects inline styles
  
Priority 55: Id_Selector_Processor
  ↓ Uses existing unified_style_manager
  ↓ Adds ID selector styles
  
Priority 50: Global_Classes_Processor
  ↓ Creates global CSS classes
  
Priority 10: Style_Resolution_Processor
  ↓ Uses unified_style_manager to resolve final styles
  ↓ Applies specificity rules
```

### 3. Specificity Weights

Defined in `Css_Specificity_Calculator`:

```php
const IMPORTANT_WEIGHT = 10000;  // !important flag
const INLINE_WEIGHT = 1000;      // Inline styles (highest normal specificity)
const ID_WEIGHT = 100;           // ID selectors (#id)
const CLASS_WEIGHT = 10;         // Class selectors (.class)
const ELEMENT_WEIGHT = 1;        // Element selectors (div, p)
```

### 4. Style Collection Methods

The `Unified_Style_Manager` provides specific methods for each style source:

```php
// Inline styles (specificity: 1000 + important flag)
$manager->collect_inline_styles( $element_id, $inline_styles );

// ID selector styles (specificity: calculated from selector + important flag)
$manager->collect_id_selector_styles( $selector, $properties, $matched_elements );

// CSS selector styles (specificity: calculated from selector + important flag)
$manager->collect_css_selector_styles( $selector, $properties, $matched_elements );
```

## Implementation Rules

### For Processor Developers

#### ✅ DO:
- Get the unified style manager from context: `$context->get_metadata( 'unified_style_manager' )`
- Throw an exception if the manager is not found
- Use the appropriate collection method for your style source
- Pass the manager through without modifying the context reference

#### ❌ DON'T:
- Create your own `Unified_Style_Manager` instance
- Store a manager instance in your processor's properties
- Overwrite the `unified_style_manager` in context
- Create fallback instances

### Example: Correct Implementation

```php
class Id_Selector_Processor implements Css_Processor_Interface {
    
    private $property_converter;
    
    // ✅ NO unified_style_manager property
    
    public function __construct( $property_converter = null ) {
        $this->property_converter = $property_converter;
        // ✅ NO manager instantiation
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        // ✅ Get the shared instance from context
        $unified_style_manager = $context->get_metadata( 'unified_style_manager' );
        
        if ( ! $unified_style_manager ) {
            // ✅ Fail fast - don't create fallback
            throw new \Exception( 'No unified style manager in context' );
        }
        
        // ✅ Use the shared instance
        $unified_style_manager->collect_id_selector_styles( $selector, $properties, $matched_elements );
        
        // ✅ Don't overwrite the context reference
        // $context->set_metadata( 'unified_style_manager', $unified_style_manager ); // ← WRONG
        
        return $context;
    }
}
```

### Example: Incorrect Implementation ❌

```php
class Bad_Processor implements Css_Processor_Interface {
    
    private $unified_style_manager; // ❌ Storing own instance
    
    public function __construct() {
        // ❌ Creating own instance
        $this->unified_style_manager = new Unified_Style_Manager( ... );
    }
    
    public function process( Css_Processing_Context $context ): Css_Processing_Context {
        // ❌ Using own instance instead of shared one
        $this->unified_style_manager->collect_styles( ... );
        
        // ❌ Overwriting the shared instance
        $context->set_metadata( 'unified_style_manager', $this->unified_style_manager );
        
        return $context;
    }
}
```

## Specificity Resolution

The `Unified_Style_Manager` resolves style conflicts using:

1. **Specificity weight** (higher wins)
2. **Cascade order** (later wins if specificity is equal)

```php
usort( $styles, function( $a, $b ) {
    if ( $a['specificity'] !== $b['specificity'] ) {
        return $b['specificity'] - $a['specificity']; // Higher specificity wins
    }
    return $b['order'] - $a['order']; // Later in cascade wins
});
```

## Testing Specificity

### Test Cases Covered

1. **Inline > ID**: Inline styles (1000) beat ID selectors (100)
2. **ID > Class**: ID selectors (100) beat class selectors (10)
3. **Class > Element**: Class selectors (10) beat element selectors (1)
4. **!important**: Adds 10000 to any specificity
5. **Descendant selectors**: `#outer #inner` (200) beats `#inner` (100)

### Example Test

```typescript
test( 'should respect inline > ID specificity', async ( { request } ) => {
    const html = '<p id="text" style="color: green;">Text</p>';
    const css = '#text { color: red; }';
    
    const result = await cssHelper.convertHtmlWithCss( request, html, css );
    
    // Inline style (specificity: 1000) should win over ID selector (specificity: 100)
    expect( result.widgets[0].resolved_styles.color.value ).toBe( 'green' );
    expect( result.widgets[0].resolved_styles.color.specificity ).toBe( 1000 );
});
```

## Benefits of This Design

1. **Single Source of Truth**: One manager instance = consistent specificity resolution
2. **Fail Fast**: Exceptions prevent silent bugs from multiple instances
3. **Testable**: Easy to verify specificity rules in isolation
4. **Maintainable**: Clear contract for processor developers
5. **Extensible**: New processors just use the existing manager

## Common Pitfalls

### Pitfall 1: Creating Multiple Instances
**Problem**: Each processor creates its own manager
**Result**: Styles are isolated, specificity comparison fails
**Solution**: Use the shared instance from context

### Pitfall 2: Wrong Priority Order
**Problem**: ID processor runs before Style Collection processor
**Result**: Manager doesn't exist yet, exception thrown
**Solution**: Ensure Style Collection (60) > ID Selector (55) > Resolution (10)

### Pitfall 3: Overwriting Context
**Problem**: Processor sets `unified_style_manager` in context
**Result**: Previous styles are lost
**Solution**: Only read from context, never write (except Style Collection processor)

## Debugging

### Check Processor Order
```php
error_log( 'Processor: ' . $processor->get_processor_name() . ' (priority: ' . $processor->get_priority() . ')' );
```

### Verify Manager Exists
```php
$manager = $context->get_metadata( 'unified_style_manager' );
if ( ! $manager ) {
    throw new \Exception( 'Manager not found - check processor order' );
}
```

### Inspect Collected Styles
```php
$styles = $manager->get_collected_styles();
error_log( 'Collected styles: ' . json_encode( $styles ) );
```

### Check Resolved Styles
```php
$resolved = $manager->resolve_styles_for_widget( $widget );
error_log( 'Resolved styles: ' . json_encode( $resolved ) );
```

## Summary

The unified specificity design pattern ensures:
- ✅ One manager instance per conversion
- ✅ Correct specificity resolution
- ✅ Clear processor contracts
- ✅ Fail-fast error handling
- ✅ Maintainable codebase

**Remember**: Never create your own `Unified_Style_Manager` instance. Always use the one from context.

