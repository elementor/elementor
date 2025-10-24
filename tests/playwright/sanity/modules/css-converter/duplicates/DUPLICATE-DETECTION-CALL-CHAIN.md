# Duplicate Detection Call Chain - Complete Unpacking

## The Problem Statement

**Line 93**: `$global_classes = $this->process_global_classes_with_unified_service( $css_class_rules );`

At this point, widgets already have `class="my-class"` in their HTML, but duplicate detection creates `my-class-2` in the database.

## Complete Call Chain

### 1. Entry Point (Line 93)
**File**: `unified-widget-conversion-service.php`  
**Line 93**: 
```php
$global_classes = $this->process_global_classes_with_unified_service( $css_class_rules );
```

**Input**: `$css_class_rules` - Array of CSS rules:
```php
[
    [
        'selector' => '.my-class',  // ← Original class name from CSS
        'properties' => [
            ['property' => 'color', 'value' => 'red'],
            ['property' => 'font-size', 'value' => '16px']
        ]
    ]
]
```

### 2. Process Global Classes (Line 512-520)
**File**: `unified-widget-conversion-service.php`  
**Line 512-520**:
```php
private function process_global_classes_with_unified_service( array $css_class_rules ): array {
    $provider = Global_Classes_Service_Provider::instance();
    
    if ( ! $provider->is_available() ) {
        return [];
    }
    
    $integration_service = $provider->get_integration_service();
    $result = $integration_service->process_css_rules( $css_class_rules );  // ← Goes to integration service
    // ...
}
```

### 3. Integration Service
**File**: `global-classes-integration-service.php`  
**Method**: `process_css_rules()`

This service:
1. Detects classes from CSS rules
2. Converts properties to atomic format
3. **Calls registration service** ← THIS IS WHERE DUPLICATE DETECTION HAPPENS

**Line ~56**:
```php
$result = $this->registration_service->register_with_elementor( $converted );
```

### 4. Registration Service - THE DUPLICATE DETECTION
**File**: `global-classes-registration-service.php`  
**Line 14-15**:
```php
public function register_with_elementor( array $converted_classes ): array {
    error_log( "DUPLICATE DEBUG: register_with_elementor called with " . count( $converted_classes ) . " classes" );
```

**Line 39-43**: Get existing classes from database
```php
$existing_labels = $this->extract_existing_labels( $items );
error_log( "DUPLICATE DEBUG: Found " . count( $existing_labels ) . " existing classes: ..." );

$result = $this->filter_new_classes_with_duplicate_detection( $converted_classes, $existing_labels, $items );
$new_classes = $result['new_classes'];
$class_name_mappings = $result['class_name_mappings'];  // ← THE MAPPINGS!
```

### 5. Duplicate Detection Logic
**File**: `global-classes-registration-service.php`  
**Line 115-150**: `filter_new_classes_with_duplicate_detection()`

```php
private function filter_new_classes_with_duplicate_detection( array $converted_classes, array $existing_labels, array $existing_items ): array {
    $new_classes = [];
    $class_name_mappings = []; // original_name => final_name
    
    foreach ( $converted_classes as $class_name => $class_data ) {
        // Check for duplicate class name
        if ( in_array( $class_name, $existing_labels, true ) ) {
            // DUPLICATE DETECTED!
            $final_class_name = $this->handle_duplicate_class( $class_name, $class_data, $existing_items );
            
            // If styles are different, create my-class-2
            if ( $final_class_name && $final_class_name !== $class_name ) {
                $new_classes[ $final_class_name ] = $class_data;
                $class_name_mappings[ $class_name ] = $final_class_name;  // 'my-class' => 'my-class-2'
            }
        }
    }
    
    return [
        'new_classes' => $new_classes,
        'class_name_mappings' => $class_name_mappings,  // ← RETURNED BUT NOT USED!
    ];
}
```

### 6. Handle Duplicate Class
**File**: `global-classes-registration-service.php`  
**Line 152-171**: `handle_duplicate_class()`

```php
private function handle_duplicate_class( string $class_name, array $class_data, array $existing_items ): ?string {
    $existing_class = $existing_items[ $class_name ];
    $existing_atomic_props = $this->extract_atomic_props( $existing_class );
    $new_atomic_props = $class_data['atomic_props'];
    
    // Compare atomic properties
    if ( $this->are_styles_identical( $existing_atomic_props, $new_atomic_props ) ) {
        // Styles are identical - reuse existing class
        return null;
    }
    
    // Styles are different - create new class with suffix
    return $this->find_next_available_suffix( $class_name, $existing_items );  // Returns 'my-class-2'
}
```

### 7. Find Next Available Suffix
**File**: `global-classes-registration-service.php`  
**Line 184-192**: `find_next_available_suffix()`

```php
private function find_next_available_suffix( string $base_name, array $existing_items ): string {
    $suffix = 2;
    
    while ( isset( $existing_items[ $base_name . '-' . $suffix ] ) ) {
        $suffix++;
    }
    
    return $base_name . '-' . $suffix;  // Returns 'my-class-2', 'my-class-3', etc.
}
```

## The Problem Visualized

### What Happens:

```
INPUT to Line 93:
  $css_class_rules = [
      ['selector' => '.my-class', 'properties' => [...]]
  ]
  
  $widgets = [
      ['settings' => ['_element_css_classes' => 'my-class'], ...]  ← Already set!
  ]

↓ Call process_global_classes_with_unified_service()
↓ Call integration_service->process_css_rules()
↓ Call registration_service->register_with_elementor()
↓ Duplicate detection finds 'my-class' already exists
↓ Creates 'my-class-2' in database
↓ Returns class_name_mappings: ['my-class' => 'my-class-2']

OUTPUT from Line 93:
  $global_classes = [...]  // Contains my-class-2
  
  BUT $widgets STILL HAVE:
  $widgets = [
      ['settings' => ['_element_css_classes' => 'my-class'], ...]  ← NOT UPDATED!
  ]
```

### The Disconnect:

1. **Database has**: `my-class-2` with styles
2. **Widgets have**: `class="my-class"` in HTML
3. **System looks for**: Global class named `my-class`
4. **System finds**: Different `my-class` (the original one)
5. **Result**: Falls back to widget inline styles

## The Missing Link

The `class_name_mappings` are returned from the registration service but **NEVER APPLIED** to the widgets!

**Line 43**: `$class_name_mappings = $result['class_name_mappings'];`  
**Problem**: This variable is created but never used to update the widgets

The mappings need to be:
1. Returned from `process_global_classes_with_unified_service()` (Line 93)
2. Used to update widget class names
3. Applied BEFORE widgets are finalized

