# Base Styles Removal Investigation

## Problem Statement

The CSS rule `[data-element_type="e-div-block"] { display: block; }` is present on localhost but missing in CI builds. This rule comes from base styles that should be removed for CSS converter widgets.

## Root Cause Analysis

### 1. PHP Side: Global Base Styles Collection

**File**: `plugins/elementor-css/modules/atomic-widgets/styles/atomic-widget-base-styles.php`

```37:46:plugins/elementor-css/modules/atomic-widgets/styles/atomic-widget-base-styles.php
public function get_all_base_styles(): array {
	$elements = Plugin::$instance->elements_manager->get_element_types();
	$widgets = Plugin::$instance->widgets_manager->get_widget_types();

	return Collection::make( $elements )
	->merge( $widgets )
	->filter( fn( $element ) => Utils::is_atomic( $element ) )
	->map( fn( $element ) => $element->get_base_styles() )
	->flatten()
	->all();
}
```

**Issue**: This method creates **template widget instances** (without `editor_settings`) to collect base styles. Since CSS converter widgets are detected via `editor_settings['disable_base_styles']`, the template instances don't have this flag, so their base styles ARE included in the global collection.

### 2. Individual Widget Base Styles Check

**File**: `plugins/elementor-css/modules/atomic-widgets/elements/has-base-styles.php`

```16:31:plugins/elementor-css/modules/atomic-widgets/elements/has-base-styles.php
public function get_base_styles() {
	if ( $this->is_css_converter_widget() ) {
		return [];
	}

	$base_styles = $this->define_base_styles();
	$style_definitions = [];

	foreach ( $base_styles as $key => $style ) {
		$id = $this->generate_base_style_id( $key );

		$style_definitions[ $id ] = $style->build( $id );
	}

	return $style_definitions;
}
```

**Status**: ✅ This correctly returns empty array for CSS converter widgets **when called on actual widget instances** (with `editor_settings`).

**Problem**: `get_all_base_styles()` calls this on template instances without `editor_settings`, so the check fails.

### 3. JavaScript Side: Base Styles Provider

**File**: `plugins/elementor-css/packages/packages/core/editor-styles-repository/src/providers/element-base-styles-provider.ts`

```7:16:plugins/elementor-css/packages/packages/core/editor-styles-repository/src/providers/element-base-styles-provider.ts
export const elementBaseStylesProvider = createStylesProvider( {
	key: ELEMENTS_BASE_STYLES_PROVIDER_KEY,
	actions: {
		all() {
			const widgetsCache = getWidgetsCache();

			return Object.values( widgetsCache ?? {} ).flatMap( ( widget ) =>
				Object.values( widget.base_styles ?? {} )
			);
		},
```

**Issue**: This provider gets base styles from `widgetsCache`, which comes from PHP's `get_initial_config()`. Since template instances don't have `editor_settings`, their base styles are included in the cache.

### 4. JavaScript Override Attempt

**File**: `plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js`

```22:37:plugins/elementor-css/modules/atomic-widgets/assets/js/editor/css-converter-base-styles-override.js
elementor.helpers.getAtomicWidgetBaseStyles = function( model ) {
	// Check if this is a CSS converter widget
	const editorSettings = model?.get?.( 'editor_settings' ) || {};
	const isConverterWidget = true === editorSettings.disable_base_styles ||
							  true === editorSettings.css_converter_widget ||
							  '0.0' === model?.get?.( 'version' );

	if ( isConverterWidget ) {
		console.log( '🔥 CSS Converter: Removing base styles for widget container:', model.get( 'widgetType' ) );
		// CSS converter widget: return empty object (no base styles)
		return {};
	}

	// Not a CSS converter widget, call original function
	return originalGetAtomicWidgetBaseStyles.call( this, model );
};
```

**Status**: ✅ This correctly prevents base classes from being applied to widget containers.

**Problem**: This only affects widget container classes, NOT the global CSS rules generated from `elementBaseStylesProvider`. The CSS rule `[data-element_type="e-div-block"] { display: block; }` is generated from the global base styles collection, which includes CSS converter widgets' base styles.

## Why It Works Differently on Local vs CI

The discrepancy likely stems from:

1. **Cache Invalidation**: Localhost may have stale cache that includes base styles, while CI has fresh cache without them (or vice versa).

2. **JavaScript Loading Order**: The `css-converter-base-styles-override.js` file may load at different times in different environments, affecting when base styles are filtered.

3. **Widget Registration Timing**: If widgets are registered before the override script loads, base styles may already be collected and cached.

## Solution Options

### Option 1: Filter Base Styles at PHP Collection Level (RECOMMENDED)

Modify `Atomic_Widget_Base_Styles::get_all_base_styles()` to exclude base styles for widgets that would be CSS converter widgets:

```php
public function get_all_base_styles(): array {
	$elements = Plugin::$instance->elements_manager->get_element_types();
	$widgets = Plugin::$instance->widgets_manager->get_widget_types();

	return Collection::make( $elements )
	->merge( $widgets )
	->filter( fn( $element ) => Utils::is_atomic( $element ) )
	->filter( fn( $element ) => ! $this->is_css_converter_widget_type( $element ) )
	->map( fn( $element ) => $element->get_base_styles() )
	->flatten()
	->all();
}

private function is_css_converter_widget_type( $element ): bool {
	// Check if widget type is typically used by CSS converter
	// This is a heuristic since template instances don't have editor_settings
	$element_type = $element->get_type();
	
	// CSS converter widgets typically have version '0.0'
	// But we can't check this on template instances...
	
	// Alternative: Check widget class or namespace
	// Or: Maintain a list of widget types that should never have base styles
	
	return false; // For now, need to determine detection method
}
```

**Challenge**: Template instances don't have `editor_settings`, so we need a different detection method.

### Option 2: Filter Base Styles in JavaScript Provider

Modify `elementBaseStylesProvider` to filter out base styles for CSS converter widgets:

```typescript
all() {
	const widgetsCache = getWidgetsCache();

	return Object.values( widgetsCache ?? {} )
		.filter( ( widget ) => {
			// Check if this widget type should have base styles
			// Need to check actual widget instances, not cache entries
			return true; // For now, need to determine detection method
		} )
		.flatMap( ( widget ) =>
			Object.values( widget.base_styles ?? {} )
		);
}
```

**Challenge**: The provider only has access to cached widget configs, not actual widget instances with `editor_settings`.

### Option 3: Filter CSS Rules After Generation

Intercept the CSS generation process and remove rules that target CSS converter widgets:

```javascript
// In css-converter-base-styles-override.js
elementor.on( 'document:loaded', function() {
	// Remove base style CSS rules for CSS converter widgets
	removeBaseStyleCssRules();
} );

function removeBaseStyleCssRules() {
	// Find all style elements in preview iframe
	const iframe = document.querySelector( '#elementor-preview-iframe' );
	if ( ! iframe || ! iframe.contentDocument ) {
		return;
	}

	const styleSheets = iframe.contentDocument.styleSheets;
	// Iterate through stylesheets and remove rules matching:
	// [data-element_type="e-div-block"] { display: block; }
	// But only for CSS converter widgets...
}
```

**Challenge**: This is fragile and requires parsing/generating CSS selectors.

## Recommended Solution

**Option 1** is the most robust, but requires a way to detect CSS converter widgets at the template instance level. Since template instances don't have `editor_settings`, we need an alternative detection method:

1. **Widget Type Pattern**: CSS converter widgets might have a specific naming pattern or namespace.
2. **Version Check**: If all CSS converter widgets have version '0.0', we could check this (but need to verify).
3. **Registration Flag**: Add a flag during widget registration that indicates "never include base styles for this widget type".

The cleanest approach would be to add a method to widget classes that indicates whether they should have base styles included in global collections, independent of `editor_settings`.

