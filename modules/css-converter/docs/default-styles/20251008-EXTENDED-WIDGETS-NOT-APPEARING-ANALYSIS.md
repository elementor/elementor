# Extended Widgets Not Appearing in Editor - Root Cause Analysis

## 🚨 **Critical Question**

**Can the Elementor editor edit an extended widget (`e-paragraph-converted`)?**
**Or will the editor always look for the unextended version (`e-paragraph`)?**

---

## 🔍 **Problem Statement**

### **Observed Behavior**

1. ✅ **API creates converted widgets**: Server logs confirm `e-paragraph-converted` is created
2. ✅ **Widget data saved**: `widgetType: 'e-paragraph-converted'` stored in post meta
3. ❌ **Editor doesn't show converted widgets**: Playwright test finds 0 converted widgets
4. ❌ **DOM shows original widgets**: Only `e-paragraph` elements found, not `e-paragraph-converted`

### **Critical Discovery**

```typescript
// Test finds 0 converted widgets
const convertedParagraphs = elementorFrame.locator( 
    '.e-paragraph-converted, [data-widget_type="e-paragraph-converted"]' 
);
const convertedParagraphCount = await convertedParagraphs.count();  // Returns: 0
```

But server logs show:
```php
🔥 CONVERTED_FACTORY: Using converted widget type: e-paragraph-converted (original: e-paragraph)
🔥 WIDGET_CREATOR: Final widget type: e-paragraph-converted
```

**Question**: Where does the `e-paragraph-converted` get converted back to `e-paragraph`?

---

## 🏗️ **How Elementor Editor Loads Widgets**

### **Step 1: Post Data is Loaded**

```php
// In Document or similar
$elementor_data = get_post_meta( $post_id, '_elementor_data', true );

// Contains:
[
    [
        'elType' => 'widget',
        'widgetType' => 'e-paragraph-converted',  // ← Saved correctly!
        'settings' => [...],
        'editor_settings' => ['disable_base_styles' => true],
    ]
]
```

### **Step 2: Widget Manager Resolves Widget Type**

```php
// In Elements_Manager::create_element_instance()
if ( 'widget' === $element_data['elType'] ) {
    $element_type = Plugin::$instance->widgets_manager->get_widget_types( 
        $element_data['widgetType']  // 'e-paragraph-converted'
    );
}
```

**Critical Point**: `widgets_manager->get_widget_types()` must return the **converted widget class**, not the original!

### **Step 3: Widget Instance is Created**

```php
// From get_widget_types('e-paragraph-converted')
// Should return: Atomic_Paragraph_Converted instance

$element_class = $element_type->get_class_name();
$element = new $element_class( $element_data, $args );
```

### **Step 4: Editor Config is Generated**

```php
// In Widget_Base::get_initial_config()
$config = [
    'widget_type' => $this->get_name(),  // ← KEY: What does this return?
    // ...
];
```

**Critical Question**: Does `Atomic_Paragraph_Converted::get_name()` return `'e-paragraph-converted'` or `'e-paragraph'`?

---

## 🎯 **Root Cause Hypothesis**

### **Hypothesis 1: Widget Not Registered**

**Issue**: `e-paragraph-converted` widget is not registered in the widgets manager when the editor loads.

**Evidence Needed**:
- Check if `widgets_manager->get_widget_types('e-paragraph-converted')` returns `null`
- Verify registration hook `elementor/widgets/register` is called

**Test**:
```php
// In module.php or during editor load
$converted_widget = Plugin::$instance->widgets_manager->get_widget_types('e-paragraph-converted');
if ( null === $converted_widget ) {
    error_log( "❌ e-paragraph-converted NOT REGISTERED" );
} else {
    error_log( "✅ e-paragraph-converted IS REGISTERED" );
}
```

### **Hypothesis 2: Widget Type Name Override**

**Issue**: Extended widget's `get_element_type()` or `get_name()` returns the original widget type.

**Evidence Needed**:
- Check what `Atomic_Paragraph_Converted::get_element_type()` returns
- Verify it returns `'e-paragraph-converted'`, not `'e-paragraph'`

**Current Implementation**:
```php
// In Atomic_Paragraph_Converted
public static function get_element_type(): string {
    return 'e-paragraph-converted';  // ← Is this being called?
}
```

**Test**:
```php
$instance = new Atomic_Paragraph_Converted();
$name = $instance->get_name();
error_log( "Widget name: {$name}" );  // Should be: 'e-paragraph-converted'
```

### **Hypothesis 3: Editor Falls Back to Original Widget**

**Issue**: When editor can't find `e-paragraph-converted`, it falls back to `e-paragraph`.

**Evidence Needed**:
- Check if Elementor has fallback logic for missing widgets
- Look for silent failures in widget loading

**Possible Code Path**:
```php
// In Elements_Manager::create_element_instance()
if ( 'widget' === $element_data['elType'] ) {
    $element_type = Plugin::$instance->widgets_manager->get_widget_types( 
        $element_data['widgetType'] 
    );
}

if ( ! $element_type ) {
    // What happens here? Fallback? Silent fail?
    return null;  // Or fallback to base widget?
}
```

### **Hypothesis 4: Widget Data is Overwritten on Load**

**Issue**: Post data is correct, but gets overwritten when parsed/loaded by editor.

**Evidence Needed**:
- Check if `widgetType` is modified during post data parsing
- Look for normalization or migration logic

**Test**:
```php
// Before parsing
error_log( "Raw post data widgetType: " . $element_data['widgetType'] );

// After parsing
error_log( "Parsed element widgetType: " . $element->get_name() );
```

### **Hypothesis 5: Experiment Not Active in Editor Context**

**Issue**: `e_atomic_elements` experiment not active when editor loads, so converted widgets aren't registered.

**Evidence Needed**:
- Check experiment status during editor load
- Verify `elementor/widgets/register` filter runs with experiment active

**Test**:
```php
// In module.php register_converted_widgets()
$is_active = Plugin::$instance->experiments->is_feature_active( 'e_atomic_elements' );
error_log( "Experiment active during editor load: " . var_export( $is_active, true ) );
```

---

## 🧪 **Testing Strategy with Maximum Debug**

### **Debug Layer 1: Widget Registration**

Add to `modules/css-converter/module.php`:

```php
public function register_converted_widgets( $widgets_manager ) {
    error_log( "🔥🔥🔥 REGISTER: register_converted_widgets called" );
    error_log( "🔥🔥🔥 REGISTER: Experiment active = " . var_export( 
        Plugin::$instance->experiments->is_feature_active( 'e_atomic_elements' ), 
        true 
    ) );
    error_log( "🔥🔥🔥 REGISTER: Widgets manager class = " . get_class( $widgets_manager ) );
    
    Converted_Widgets_Registry::register_converted_widgets( $widgets_manager );
    
    // Verify registration
    $converted_widget = $widgets_manager->get_widget_types( 'e-paragraph-converted' );
    if ( $converted_widget ) {
        error_log( "🔥🔥🔥 REGISTER: e-paragraph-converted IS REGISTERED ✅" );
        error_log( "🔥🔥🔥 REGISTER: Widget class = " . get_class( $converted_widget ) );
        error_log( "🔥🔥🔥 REGISTER: Widget name = " . $converted_widget->get_name() );
    } else {
        error_log( "🔥🔥🔥 REGISTER: e-paragraph-converted NOT REGISTERED ❌" );
    }
    
    // List all registered widgets
    $all_widgets = $widgets_manager->get_widget_types();
    $atomic_widgets = array_filter( array_keys( $all_widgets ), function( $name ) {
        return strpos( $name, 'e-' ) === 0;
    } );
    error_log( "🔥🔥🔥 REGISTER: All atomic widgets: " . implode( ', ', $atomic_widgets ) );
}
```

### **Debug Layer 2: Registry**

Add to `elements/converted-widgets-registry.php`:

```php
public static function register_converted_widgets( Widgets_Manager $widgets_manager ) {
    error_log( "🔥🔥🔥 REGISTRY: Starting widget registration" );
    error_log( "🔥🔥🔥 REGISTRY: Converted widget map: " . json_encode( array_keys( self::$converted_widget_map ) ) );
    
    foreach ( self::$converted_widget_map as $original_type => $converted_class ) {
        error_log( "🔥🔥🔥 REGISTRY: Processing {$original_type} -> {$converted_class}" );
        
        // Check if original widget exists
        $original_widget = $widgets_manager->get_widget_types( $original_type );
        if ( ! $original_widget ) {
            error_log( "🔥🔥🔥 REGISTRY: Original widget {$original_type} NOT FOUND ❌" );
            continue;
        }
        
        error_log( "🔥🔥🔥 REGISTRY: Original widget {$original_type} found ✅" );
        
        // Check if class exists
        if ( ! class_exists( $converted_class ) ) {
            error_log( "🔥🔥🔥 REGISTRY: Class {$converted_class} NOT EXISTS ❌" );
            continue;
        }
        
        error_log( "🔥🔥🔥 REGISTRY: Class {$converted_class} exists ✅" );
        
        // Create instance
        try {
            $instance = new $converted_class();
            error_log( "🔥🔥🔥 REGISTRY: Instance created ✅" );
            error_log( "🔥🔥🔥 REGISTRY: Instance name = " . $instance->get_name() );
            error_log( "🔥🔥🔥 REGISTRY: Instance type = " . $instance::get_element_type() );
            
            // Register
            $widgets_manager->register( $instance );
            error_log( "🔥🔥🔥 REGISTRY: Registered {$converted_class} ✅" );
            
            // Verify
            $registered = $widgets_manager->get_widget_types( $instance->get_name() );
            if ( $registered ) {
                error_log( "🔥🔥🔥 REGISTRY: Verification SUCCESS ✅" );
            } else {
                error_log( "🔥🔥🔥 REGISTRY: Verification FAILED ❌" );
            }
        } catch ( \Exception $e ) {
            error_log( "🔥🔥🔥 REGISTRY: Exception: " . $e->getMessage() . " ❌" );
        }
    }
    
    error_log( "🔥🔥🔥 REGISTRY: Registration complete" );
}
```

### **Debug Layer 3: Widget Loading**

Add to `Atomic_Paragraph_Converted`:

```php
public function __construct( $data = [], $args = null ) {
    error_log( "🔥🔥🔥 CONVERTED_WIDGET: Constructor called" );
    error_log( "🔥🔥🔥 CONVERTED_WIDGET: Data keys: " . implode( ', ', array_keys( $data ) ) );
    error_log( "🔥🔥🔥 CONVERTED_WIDGET: widgetType: " . ( $data['widgetType'] ?? 'NOT SET' ) );
    
    parent::__construct( $data, $args );
    
    error_log( "🔥🔥🔥 CONVERTED_WIDGET: get_name() = " . $this->get_name() );
    error_log( "🔥🔥🔥 CONVERTED_WIDGET: get_element_type() = " . self::get_element_type() );
}
```

### **Debug Layer 4: Editor Load**

Add hook to detect when editor loads widgets:

```php
// In module.php
add_action( 'elementor/editor/before_enqueue_scripts', function() {
    error_log( "🔥🔥🔥 EDITOR: Before enqueue scripts" );
    
    $post_id = get_the_ID();
    error_log( "🔥🔥🔥 EDITOR: Post ID = {$post_id}" );
    
    if ( $post_id ) {
        $elementor_data = get_post_meta( $post_id, '_elementor_data', true );
        if ( $elementor_data ) {
            $data = json_decode( $elementor_data, true );
            if ( $data && is_array( $data ) ) {
                // Find widget types
                $widget_types = [];
                array_walk_recursive( $data, function( $value, $key ) use ( &$widget_types ) {
                    if ( $key === 'widgetType' ) {
                        $widget_types[] = $value;
                    }
                } );
                
                error_log( "🔥🔥🔥 EDITOR: Widget types in post data: " . implode( ', ', array_unique( $widget_types ) ) );
                
                // Check if converted widgets exist
                $converted_types = array_filter( $widget_types, function( $type ) {
                    return strpos( $type, '-converted' ) !== false;
                } );
                
                if ( ! empty( $converted_types ) ) {
                    error_log( "🔥🔥🔥 EDITOR: CONVERTED WIDGETS FOUND IN DATA ✅" );
                    error_log( "🔥🔥🔥 EDITOR: Converted types: " . implode( ', ', $converted_types ) );
                    
                    // Verify if they're registered
                    foreach ( $converted_types as $type ) {
                        $widget = Plugin::$instance->widgets_manager->get_widget_types( $type );
                        if ( $widget ) {
                            error_log( "🔥🔥🔥 EDITOR: {$type} IS REGISTERED ✅" );
                        } else {
                            error_log( "🔥🔥🔥 EDITOR: {$type} NOT REGISTERED ❌❌❌" );
                        }
                    }
                }
            }
        }
    }
}, 5 );
```

### **Debug Layer 5: Playwright Test**

Add comprehensive logging to test:

```typescript
console.log( '🔥🔥🔥 TEST: Waiting for editor to load...' );
await page.waitForLoadState( 'networkidle' );
await page.waitForTimeout( 3000 );

console.log( '🔥🔥🔥 TEST: Checking for converted widgets...' );

// Check multiple possible selectors
const selectors = [
    '.e-paragraph-converted',
    '[data-widget_type="e-paragraph-converted"]',
    '.elementor-widget-e-paragraph-converted',
    '[data-widget-type="e-paragraph-converted"]',  // Alternative attribute
];

for ( const selector of selectors ) {
    const count = await elementorFrame.locator( selector ).count();
    console.log( `🔥🔥🔥 TEST: Selector "${selector}" found: ${count} elements` );
}

// Get all widget types in the editor
const widgetTypes = await elementorFrame.evaluate( () => {
    const widgets = document.querySelectorAll( '[data-widget_type], [data-widget-type]' );
    return Array.from( widgets ).map( el => 
        el.getAttribute( 'data-widget_type' ) || el.getAttribute( 'data-widget-type' )
    );
} );

console.log( '🔥🔥🔥 TEST: All widget types found in DOM:', JSON.stringify( Array.from( new Set( widgetTypes ) ) ) );

// Check if any converted widgets exist
const hasConverted = widgetTypes.some( type => type && type.includes( '-converted' ) );
console.log( '🔥🔥🔥 TEST: Has converted widgets:', hasConverted );
```

---

## 🎯 **Most Likely Root Cause**

Based on Elementor's architecture and the evidence, **Hypothesis 5** is most likely:

### **The Experiment Not Active During Editor Load**

**Reasoning**:
1. ✅ API creates widgets correctly (experiment active during API call)
2. ✅ Widget data saved correctly (`widgetType: 'e-paragraph-converted'`)
3. ❌ Editor doesn't find widgets (experiment not active during editor load?)

**Critical Code**:
```php
// In module.php
if ( Plugin::$instance->experiments->is_feature_active( 'e_atomic_elements' ) ) {
    add_filter( 'elementor/widgets/register', [ $this, 'register_converted_widgets' ] );
}
```

**Problem**: When does this check happen?
- During module initialization?
- During editor load?
- During API call?

**If the experiment is not active when the editor loads**, the converted widgets are **never registered**, so the editor can't find them!

---

## ✅ **Action Items**

1. **Add maximum debug logging** (all 5 layers above)
2. **Run Playwright test** and capture full debug log
3. **Check if registration hook fires** during editor load
4. **Verify experiment status** in different contexts (API vs Editor)
5. **Analyze when `elementor/widgets/register` is called**

The debug logs will reveal exactly where the flow breaks down and why the editor can't see the converted widgets.

---

## 📊 **Expected Debug Output**

### **If Working Correctly**:
```
🔥🔥🔥 REGISTER: register_converted_widgets called
🔥🔥🔥 REGISTER: Experiment active = true
🔥🔥🔥 REGISTRY: e-paragraph-converted IS REGISTERED ✅
🔥🔥🔥 EDITOR: CONVERTED WIDGETS FOUND IN DATA ✅
🔥🔥🔥 EDITOR: e-paragraph-converted IS REGISTERED ✅
🔥🔥🔥 TEST: Selector "[data-widget_type='e-paragraph-converted']" found: 2 elements
```

### **If Broken (Most Likely)**:
```
🔥🔥🔥 REGISTER: register_converted_widgets called
🔥🔥🔥 REGISTER: Experiment active = false  ← PROBLEM!
(No registration happens)
🔥🔥🔥 EDITOR: CONVERTED WIDGETS FOUND IN DATA ✅
🔥🔥🔥 EDITOR: e-paragraph-converted NOT REGISTERED ❌❌❌  ← PROBLEM!
🔥🔥🔥 TEST: All widget types found: ["e-paragraph", "e-heading"]  ← Fallback to original!
```

This will definitively tell us if the experiment/registration is the issue.
