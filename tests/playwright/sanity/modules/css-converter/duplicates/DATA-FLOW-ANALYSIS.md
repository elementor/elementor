# Data Flow Analysis - Where Class Names Are Set

## File: `unified-widget-conversion-service.php`

### 1. Where do we call the flattening filter?

**Line 87-90**: `apply_all_resolved_classes_to_widgets()`
```php
$widgets_with_applied_classes = $this->apply_all_resolved_classes_to_widgets(
    $resolved_widgets,
    $unified_processing_result
);
```

This calls the HTML class modifier which:
- Flattens nested classes
- Removes unused classes
- Applies compound class mappings

**Implementation at Line 710-721**:
```php
private function apply_all_resolved_classes_to_widgets( array $widgets, array $unified_processing_result ): array {
    // Get the HTML class modifier that was initialized with all the flattening and compound data
    $html_class_modifier = $unified_processing_result['html_class_modifier'] ?? null;
    
    if ( null === $html_class_modifier ) {
        return $widgets;
    }
    
    $widgets_with_applied_classes = $this->apply_html_class_modifications_to_widgets( $widgets, $html_class_modifier );
    
    return $widgets_with_applied_classes;
}
```

### 2. What is the existing data structure before that?

**Line 65**: Initial widget creation from HTML elements
```php
$mapped_widgets = $this->widget_mapper->map_elements( $elements );
```

**Data Structure**: Array of widgets with:
- `elType`: Widget type
- `widgetType`: Specific widget type
- `settings`: Widget settings including `_element_css_classes`
- `original_tag`: HTML tag
- `attributes`: HTML attributes including `class`

**Line 68-69**: CSS processing
```php
$unified_processing_result = $this->unified_css_processor->process_css_and_widgets( $all_css, $mapped_widgets );
$resolved_widgets = $unified_processing_result['widgets'];
```

**Data Structure of `$resolved_widgets`**: Same as above, but with:
- Resolved CSS styles attached
- Style sources tracked (inline, class, element, etc.)

**Line 70**: CSS class rules extraction
```php
$css_class_rules = $unified_processing_result['css_class_rules'] ?? [];
```

**Data Structure of `$css_class_rules`**: Array of CSS rules for classes
```php
[
    [
        'selector' => '.my-class',
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
]
```

### 3. Where can I find the styles, widgets and class data?

#### Widgets Data
**Line 69**: `$resolved_widgets`
- Contains all widgets with their settings and resolved styles
- Each widget has `settings['_element_css_classes']` with original class names

#### Styles Data
**Line 68**: `$unified_processing_result`
- Contains processed CSS styles
- Includes style sources (inline, class, element, ID, etc.)

#### Class Data
**Line 70**: `$css_class_rules`
- Contains CSS rules for all classes found in the CSS
- Used for global class creation

**Line 93**: `$global_classes` (after processing)
- Contains registered global classes
- Includes class name mappings from duplicate detection

### Current Problem

**Process Order**:
1. Line 65: Widgets created with `class="my-class"`
2. Line 87-90: HTML class modifier processes widgets (still `class="my-class"`)
3. Line 93: Duplicate detection creates `my-class-2` in database
4. ❌ Widgets still have `my-class`, system can't find matching global class

**Root Cause**: Widgets are created and classes are applied BEFORE duplicate detection happens.

### Solution Direction

The class names in `$css_class_rules` (Line 70) need to be updated with the final names from duplicate detection BEFORE they are used anywhere.

**Option 1**: Process global classes BEFORE applying classes to widgets
- Move Line 93 before Line 87
- Pass class name mappings to HTML class modifier

**Option 2**: Update `$css_class_rules` with final class names
- Process global classes first
- Update the selector names in `$css_class_rules`
- Then apply classes to widgets

**Option 3**: Update widget class names after global class processing
- Keep current order
- After Line 93, update all widget `_element_css_classes` with mappings

