# Twig Implementation Study - Elementor Atomic Widgets

## Overview

Elementor uses **Twing** (a JavaScript implementation of the Twig template engine) for rendering atomic widgets in the editor. This is completely separate from the PHP-based Twig rendering used on the frontend.

## Architecture

### Two Separate Rendering Paths

1. **JavaScript Editor** (packages/core/editor-canvas) - Uses Twing
2. **PHP Frontend** (modules/atomic-widgets) - Uses PHP Twig via `Template_Renderer`

## JavaScript Twig Implementation (Editor)

### Location
- `packages/packages/libs/twing/` - Wrapper around the `twing` npm package
- `packages/packages/core/editor-canvas/src/renderers/create-dom-renderer.ts` - DOM renderer implementation
- `packages/packages/core/editor-canvas/src/legacy/create-templated-element-type.ts` - Template-based element creation

### How It Works

#### 1. Initialization (`init-legacy-views.ts`)
```typescript
const renderer = createDomRenderer();  // Create single Twing renderer instance

Object.entries( config ).forEach( ( [ type, element ] ) => {
    if ( canBeTemplated( element ) ) {
        // Register Twig templates from element config
        createTemplatedElementType( { type, renderer, element } )
    }
} );
```

#### 2. Template Registration
Templates are registered from the widget's `get_initial_config()`:

```typescript
// From element config sent by PHP:
element.twig_templates  // All templates as key => content pairs
element.twig_main_template  // Main template key
element.base_styles_dictionary  // Base style class names
```

Templates are registered once at initialization:
```typescript
Object.entries( element.twig_templates ).forEach( ( [ key, template ] ) => {
    renderer.register( key, template );  // Stores template in TwingArrayLoader
} );
```

#### 3. Rendering (`create-templated-element-type.ts`)

**Key Finding**: The rendering context is built in `_renderTemplate()`:

```typescript
async _renderTemplate() {
    const settings = this.model.get( 'settings' ).toJSON();
    const resolvedSettings = await resolveProps( { props: settings } );
    
    // CRITICAL: This is where the context is built
    const context = {
        id: this.model.get( 'id' ),
        type,
        settings: resolvedSettings,
        base_styles: baseStylesDictionary,  // ← Passed from element config
    };
    
    const html = await renderer.render( templateKey, context );
    this.$el.html( html );
}
```

### Critical Observations

1. **`baseStylesDictionary` is set once at initialization**
   - It comes from `element.base_styles_dictionary`
   - This is sent by PHP in `get_initial_config()`
   - It's stored in the closure and used for ALL renders

2. **Templates are static**
   - Templates are registered once from `element.twig_templates`
   - They are NOT re-registered on each render
   - The template content is fixed

3. **Only `settings` changes between renders**
   - The `context` is rebuilt on each render
   - But `base_styles` always uses the same `baseStylesDictionary`
   - This dictionary is frozen at widget initialization

## PHP Twig Implementation (Frontend)

### Location
- `modules/atomic-widgets/elements/has-template.php` - Template rendering trait
- `modules/atomic-widgets/TemplateRenderer/Template_Renderer.php` - PHP Twig renderer

### How It Works

```php
protected function render() {
    $renderer = Template_Renderer::instance();
    
    // Register templates
    foreach ( $this->get_templates() as $name => $path ) {
        $renderer->register( $name, $path );
    }
    
    $base_styles_dict = $this->get_base_styles_dictionary();
    
    // Build context
    $context = [
        'id' => $this->get_id(),
        'type' => $this->get_name(),
        'settings' => $this->get_atomic_settings(),
        'base_styles' => $base_styles_dict,  // ← Fresh on every render
    ];
    
    echo $renderer->render( $this->get_main_template(), $context );
}
```

## The Problem with Our Approach

### Why Twig Template Edits Won't Work

The Twig template files (`.html.twig`) are used by BOTH:
1. JavaScript editor (via Twing)
2. PHP frontend (via PHP Twig)

When we edited the templates to add conditionals like:
```twig
{% set base_class = base_styles.base ?? '' %}
<p class="{{ settings.classes | merge( base_class ? [ base_class ] : [] ) | join(' ') }}">
```

**This causes issues because:**

1. **In the Editor (JavaScript)**:
   - `base_styles_dictionary` is set ONCE at initialization from `get_base_styles_dictionary()`
   - Even if we return `[]` for CSS converter widgets, it's too late - it was already set when the widget config was sent to JavaScript
   - The template receives the SAME `base_styles` dictionary for all renders

2. **In the Frontend (PHP)**:
   - `base_styles_dict` is fresh on each render from `get_base_styles_dictionary()`
   - Our conditional WOULD work here IF we fixed `get_base_styles_dictionary()`

### The Root Cause

**The `base_styles_dictionary` is sent to JavaScript in `get_initial_config()` which runs BEFORE render time:**

```php
// atomic-widget-base.php
public function get_initial_config() {
    $config = parent::get_initial_config();
    // ...
    $config['base_styles_dictionary'] = $this->get_base_styles_dictionary();  // ← Sent ONCE
    // ...
    return $config;
}
```

This config is sent when the widget is registered in the editor, NOT when it's rendered.

## Why the querySelector Approach Was Unstable

The querySelector approach tried to fix the problem AFTER rendering by manipulating the DOM. This is unstable because:

1. **Timing Issues**: It runs during `onRender()` lifecycle, which can be inconsistent
2. **Race Conditions**: DOM manipulation competes with editor's own DOM updates
3. **Not Preventive**: It removes classes after they're already applied and styled
4. **Reload Problems**: On page reload, execution order changes and approach fails

## The Correct Solution

### The Issue

`base_styles_dictionary` needs to be EMPTY for CSS converter widgets, but it's set once at initialization and can't be changed dynamically in the editor.

### Possible Approaches

#### Option 1: Fix `get_base_styles_dictionary()` to Check CSS Converter Flag
**Problem**: This already exists in the code! It returns `[]` correctly.
**Real Problem**: The config is sent once and cached by JavaScript editor.

#### Option 2: Override the Template Context in JavaScript
Modify `_renderTemplate()` to check `editor_settings` and override `base_styles`:

```typescript
async _renderTemplate() {
    const settings = this.model.get( 'settings' ).toJSON();
    const editorSettings = this.model.get( 'editor_settings' ) || {};
    
    const resolvedSettings = await resolveProps( { props: settings } );
    
    // Override base_styles for CSS converter widgets
    const finalBaseStyles = ( editorSettings.css_converter_widget || editorSettings.disable_base_styles )
        ? {}  // Empty object for CSS converter widgets
        : baseStylesDictionary;
    
    const context = {
        id: this.model.get( 'id' ),
        type,
        settings: resolvedSettings,
        base_styles: finalBaseStyles,  // ← Dynamic based on editor_settings
    };
    
    return renderer.render( templateKey, context );
}
```

This approach:
- ✅ Runs at render time (not initialization)
- ✅ Checks `editor_settings` for CSS converter flag
- ✅ Works consistently across reloads
- ✅ Preventive (stops base classes at template level)
- ✅ No DOM manipulation needed

#### Option 3: Separate Templates for CSS Converter Widgets
**Problem**: This would require maintaining duplicate templates.

## Conclusion

The correct fix is **Option 2**: Modify the JavaScript template rendering to dynamically override `base_styles` context based on `editor_settings` before passing it to the Twig template.

This is:
1. **Stable** - No timing/race conditions
2. **Preventive** - Stops base classes at source
3. **Consistent** - Works on initial load and reloads
4. **Editor-only** - Doesn't affect frontend rendering

## Files to Modify

- `packages/packages/core/editor-canvas/src/legacy/create-templated-element-type.ts`
  - Modify `_renderTemplate()` method in `createTemplatedElementViewClassDeclaration()`
  - Check `editor_settings.css_converter_widget` before building context
  - Override `base_styles` with empty object for CSS converter widgets

