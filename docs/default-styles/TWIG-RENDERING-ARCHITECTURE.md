# Twig Rendering Architecture in Elementor Editor

## Research Date: October 9, 2025

## Problem Context
CSS converter widgets show base classes (`e-paragraph-base`, `e-heading-base`) in editor preview despite PHP and JavaScript solutions to remove them.

## Complete Rendering Flow

### 1. Widget Registration Phase

**File**: `plugins/elementor/modules/atomic-widgets/elements/atomic-widget-base.php`

```php
public function get_initial_config() {
    $config = parent::get_initial_config();
    $config['base_styles'] = $this->get_base_styles();
    $config['base_styles_dictionary'] = $this->get_base_styles_dictionary(); // Line 40
    return $config;
}
```

- Called during widget **class registration**
- Sends configuration to JavaScript editor
- Stored in `elementor.widgetsCache[widgetType]`

**JavaScript Storage**: `plugins/elementor/assets/dev/js/editor/editor-base.js`

```javascript
addWidgetsCache( widgets ) {
    jQuery.each( widgets, ( widgetName, widgetConfig ) => {
        this.widgetsCache[ widgetName ] = jQuery.extend( true, {}, 
            this.widgetsCache[ widgetName ], widgetConfig );
    });
}
```

### 2. Widget Instance Creation Phase

**File**: `plugins/elementor/includes/base/widget-base.php`

```php
public function get_raw_data( $with_html_content = false ) {
    $data = parent::get_raw_data( $with_html_content );
    
    if ( $with_html_content ) {
        ob_start();
        $this->render_content(); // Calls render() method
        $data['htmlCache'] = ob_get_clean(); // Line 759
    }
    
    return $data;
}
```

- Called when widget **instance is created**
- Generates HTML by calling `render_content()` → `render()`
- Stores rendered HTML in `htmlCache`

### 3. Twig Template Rendering (Server-Side)

**File**: `plugins/elementor-css/modules/atomic-widgets/elements/has-template.php`

```php
protected function render() {
    $context = [
        'id' => $this->get_id(),
        'type' => $this->get_name(),
        'settings' => $this->get_atomic_settings(),
        'base_styles' => $this->get_base_styles_dictionary(), // Line 42
    ];
    
    echo $renderer->render( $this->get_main_template(), $context );
}
```

**Twig Template**: `atomic-paragraph.html.twig`

```twig
<p class="{{ settings.classes | merge( [ base_styles.base ] ) | join(' ') }}">
    {{ settings.paragraph }}
</p>
```

- **Line 3**: Uses `base_styles.base` from PHP context
- Generates: `<p class="e-paragraph-base">...</p>`
- This HTML is captured in `htmlCache`

### 4. Editor Preview Display

**File**: `plugins/elementor/assets/dev/js/editor/elements/views/widget.js`

```javascript
getHTMLContent( html ) {
    var htmlCache = this.getEditModel().getHtmlCache(); // Line 94
    return htmlCache || html; // Line 96
}

attachElContent( html ) {
    elementorFrontend.elements.window.jQuery( this.el )
        .empty()
        .append( this.getHandlesOverlay(), this.getHTMLContent( html ) );
}
```

- **Line 94**: Retrieves cached HTML from model
- **Line 96**: Returns cached HTML (bypasses live rendering)
- Editor displays the pre-rendered HTML with base classes

### 5. Base Styles Dictionary Lookup

**File**: `plugins/elementor/assets/dev/js/editor/utils/helpers.js`

```javascript
getAtomicWidgetBaseStyles( model ) {
    if ( ! this.isAtomicWidget( model ) ) {
        return;
    }
    
    const widgetCache = this.getWidgetCache( model ); // Line 774
    return widgetCache.base_styles; // Line 776
}

getWidgetCache( model ) {
    const elementType = 'widget' === model.get( 'elType' ) 
        ? model.get( 'widgetType' ) 
        : model.get( 'elType' );
    
    return elementor.widgetsCache[ elementType ]; // Line 760
}
```

- Returns `base_styles` from registration-time config
- Used by JavaScript helper functions (e.g., `getBaseClass()`)
- **Does NOT affect htmlCache** which was already rendered

## Why Current Solutions Don't Work

### PHP Solution (`has-base-styles.php`)
```php
public function get_base_styles_dictionary() {
    if ( ! $is_registration_context && $this->is_css_converter_widget() ) {
        return []; // Empty array for runtime
    }
    // ... build dictionary
}
```

**Status**: ✅ Works for **frontend** rendering  
**Problem**: ❌ Fails for **editor preview** because:
1. `htmlCache` was generated during widget creation (BEFORE page load)
2. Cached HTML contains `<p class="e-paragraph-base">` from old rendering
3. Editor displays cached HTML, not live-rendered HTML

### JavaScript Solution (`css-converter-base-styles-override.js`)
```javascript
elementor.helpers.getAtomicWidgetBaseStyles = function( model ) {
    const editorSettings = model?.get?.( 'editor_settings' ) || {};
    const isConverterWidget = editorSettings.disable_base_styles === true;
    
    if ( isConverterWidget ) {
        return {}; // Empty object
    }
    // ... original function
};
```

**Status**: ✅ Works for **widget container** classes  
**Problem**: ❌ Fails for **inner elements** (`<p>`, `<h1>`) because:
1. Affects `getAtomicWidgetBaseStyles()` helper only
2. Helper is used for widget wrapper, not inner element rendering
3. Inner elements are rendered from `htmlCache` (pre-rendered HTML)

## Architecture Visualization

```
┌─────────────────────────────────────────────────────────────┐
│ WIDGET REGISTRATION (Class Level)                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PHP: get_initial_config()                               │ │
│ │   → base_styles_dictionary = ['base' => 'e-paragraph-base'] │ │
│ └────────────────────┬────────────────────────────────────┘ │
│                      ▼                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ JS: elementor.widgetsCache['e-paragraph']               │ │
│ │   → { base_styles: {...}, base_styles_dictionary: {...} }│ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ WIDGET INSTANCE CREATION                                     │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ PHP: get_raw_data(with_html_content=true)               │ │
│ │   → render_content()                                     │ │
│ │     → render()                                           │ │
│ │       → get_base_styles_dictionary()  ← ⚠️ CALLED HERE  │ │
│ │         → Twig: <p class="e-paragraph-base">            │ │
│ │   → htmlCache = "<p class=...>"  ← ⚠️ CACHED HERE       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EDITOR PREVIEW DISPLAY                                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ JS: getHTMLContent()                                     │ │
│ │   → getHtmlCache()  ← ⚠️ USES CACHED HTML               │ │
│ │   → Returns: "<p class=\"e-paragraph-base\">..."        │ │
│ │   → Display in iframe                                    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Key Findings

1. **NO Client-Side Twig Rendering**: Editor does NOT use JavaScript Twig rendering
2. **HTML Caching**: Editor uses server-rendered HTML cached during widget creation
3. **Two Separate Contexts**:
   - **Registration Context**: `get_initial_config()` → `widgetsCache`
   - **Runtime Context**: `render()` → `htmlCache`
4. **Cache Timing**: `htmlCache` is generated ONCE during widget creation, not on every preview refresh
5. **Base Styles Source**: Inner elements get classes from `base_styles` in Twig context, NOT from JavaScript helpers

## Where Base Classes Are Applied

### Widget Container (Wrapper)
- **Source**: JavaScript helpers (`getBaseClass()`)
- **Uses**: `elementor.widgetsCache[type].base_styles_dictionary`
- **Status**: ✅ Can be modified by JavaScript override

### Inner Elements (`<p>`, `<h1>`, etc.)
- **Source**: Twig template rendering
- **Uses**: PHP `get_base_styles_dictionary()` result
- **Status**: ❌ Cannot be modified by JavaScript (uses cached HTML)

## Solution Requirements

To remove base classes from editor preview inner elements, we need to:

1. **Invalidate htmlCache** when CSS converter widgets are created
2. **Force re-render** using updated PHP `get_base_styles_dictionary()`
3. **OR** intercept and modify `htmlCache` before it's displayed
4. **OR** prevent `htmlCache` from being used for CSS converter widgets

## Files Involved

### PHP (Server-Side Rendering)
- `plugins/elementor-css/modules/atomic-widgets/elements/has-base-styles.php` - Defines `get_base_styles_dictionary()`
- `plugins/elementor-css/modules/atomic-widgets/elements/has-template.php` - Calls Twig rendering
- `plugins/elementor/includes/base/widget-base.php` - Creates `htmlCache`
- `plugins/elementor-css/modules/atomic-widgets/elements/atomic-paragraph/atomic-paragraph.html.twig` - Template using `base_styles.base`

### JavaScript (Editor Display)
- `plugins/elementor/assets/dev/js/editor/elements/models/element.js` - Stores/retrieves `htmlCache`
- `plugins/elementor/assets/dev/js/editor/elements/views/widget.js` - Uses `htmlCache` for display
- `plugins/elementor/assets/dev/js/editor/utils/helpers.js` - Provides `getAtomicWidgetBaseStyles()`
- `plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js` - Overrides base styles helper

## Conclusion

The editor preview uses **pre-rendered HTML caching** (`htmlCache`), not live Twig rendering. The cached HTML was generated with base classes included, and this cache is used for editor display. Modifying `get_base_styles_dictionary()` or JavaScript helpers does NOT affect the cached HTML already stored in the widget instance.

