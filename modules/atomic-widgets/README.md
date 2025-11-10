# Atomic Widgets Module

Atomic Widgets are Elementor's next-generation widget architecture, introducing type-safe prop schemas, dynamic styling, and programmatic widget creation capabilities.

## Table of Contents

- [Overview](#overview)
- [Key Concepts](#key-concepts)
- [Architecture](#architecture)
- [Prop Types System](#prop-types-system)
- [Widget and Element Builders](#widget-and-element-builders)
- [Transformers](#transformers)
- [Style System](#style-system)
- [Creating Atomic Widgets](#creating-atomic-widgets)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Integration Points](#integration-points)

---

## Overview

Atomic Widgets represent a fundamental shift from traditional Elementor widgets:

- **Type-Safe Prop Schemas**: Properties are defined with strict types and validation
- **Dynamic Styling**: Styles managed through transformers and variant-based system
- **Builder Pattern**: Programmatic widget creation via fluent API
- **Atomic Elements**: New element types (`e-div-block`, `e-heading`, `e-paragraph`, etc.)
- **Prop Dependencies**: Automatic dependency tracking between properties

### Benefits

- **Type Safety**: Compile-time and runtime validation of widget properties
- **Consistency**: Standardized prop types across all atomic widgets
- **Extensibility**: Easy to add new prop types and transformers
- **Programmatic Creation**: Build widgets programmatically without manual JSON
- **Better Performance**: Optimized rendering with style variants

---

## Key Concepts

### Atomic Widget vs Traditional Widget

**Traditional Widget:**
```php
// Settings stored as flat key-value pairs
$settings = [
    'title' => 'Hello',
    'color' => '#ff0000',
];
```

**Atomic Widget:**
```php
// Settings stored with type information
$settings = [
    'title' => [
        '$$type' => 'text',
        'value' => 'Hello'
    ],
    'color' => [
        '$$type' => 'color',
        'value' => '#ff0000'
    ],
];
```

### Element Types

Atomic widgets introduce new element types:

- **`e-div-block`** - Generic container element
- **`e-flexbox`** - Flexbox layout container
- **`e-heading`** - Heading element (h1-h6)
- **`e-paragraph`** - Paragraph text element
- **`e-button`** - Button element
- **`e-image`** - Image element
- **`e-link`** - Link element
- **`e-svg`** - SVG element
- **`e-divider`** - Divider element
- **`e-youtube`** - YouTube embed element
- **`e-tabs`** - Tabs container element

---

## Architecture

### Module Structure

```
modules/atomic-widgets/
├── elements/              # Widget and element implementations
│   ├── atomic-widget-base.php
│   ├── atomic-element-base.php
│   ├── widget-builder.php
│   ├── element-builder.php
│   └── [element-name]/    # Individual element implementations
├── prop-types/            # Prop type definitions (40+ types)
│   ├── contracts/
│   ├── primitives/
│   ├── filters/
│   └── transform/
├── props-resolver/        # Transformers for settings/styles
│   └── transformers/
├── styles/                # Style system
│   ├── atomic-styles-manager.php
│   ├── style-schema.php
│   └── style-variant.php
├── dynamic-tags/          # Dynamic content integration
├── import-export/         # Import/export functionality
└── module.php             # Module registration
```

### Base Classes

#### Atomic_Widget_Base

Base class for all atomic widgets. Extends `Widget_Base` and adds atomic-specific functionality.

**Key Methods:**
- `define_atomic_controls()` - Define widget controls (abstract)
- `define_props_schema()` - Define prop type schema (abstract)
- `get_base_styles()` - Get base style definitions
- `get_atomic_controls()` - Get atomic controls configuration

#### Atomic_Element_Base

Base class for atomic container elements (like `e-div-block`, `e-flexbox`).

**Key Methods:**
- `define_atomic_controls()` - Define element controls (abstract)
- `define_atomic_style_states()` - Define style states (hover, active, etc.)

#### Has_Atomic_Base

Trait providing shared atomic functionality to both widgets and elements.

**Key Methods:**
- `get_data_for_save()` - Serialize widget/element data
- `get_atomic_controls()` - Build controls from prop schema
- `get_base_styles_dictionary()` - Get style definitions

---

## Prop Types System

Prop types define the structure and validation rules for widget properties. There are 40+ prop types covering various data structures.

### Core Prop Types

#### Primitive Types

- **`String_Prop_Type`** - String values
- **`Number_Prop_Type`** - Numeric values
- **`Boolean_Prop_Type`** - Boolean values

#### Size and Dimensions

- **`Size_Prop_Type`** - Size values with units (px, em, %, etc.)
- **`Dimensions_Prop_Type`** - Multi-directional sizes (padding, margin)
- **`Selection_Size_Prop_Type`** - Size selection from predefined options
- **`Layout_Direction_Prop_Type`** - Layout direction properties

#### Color and Visual

- **`Color_Prop_Type`** - Color values (hex, rgb, named)
- **`Color_Stop_Prop_Type`** - Gradient color stops
- **`Gradient_Color_Stop_Prop_Type`** - Gradient color stop arrays
- **`Background_Prop_Type`** - Background properties
- **`Background_Overlay_Prop_Type`** - Background overlay properties
- **`Box_Shadow_Prop_Type`** - Box shadow properties
- **`Shadow_Prop_Type`** - Text shadow properties

#### Layout and Positioning

- **`Position_Prop_Type`** - Position properties (absolute, relative, etc.)
- **`Flex_Prop_Type`** - Flexbox properties
- **`Border_Radius_Prop_Type`** - Border radius properties
- **`Border_Width_Prop_Type`** - Border width properties

#### Transform and Animation

- **`Transform_Prop_Type`** - CSS transform properties
- **`Transform_Origin_Prop_Type`** - Transform origin
- **`Transition_Prop_Type`** - CSS transition properties
- **`Filter_Prop_Type`** - CSS filter properties
- **`Backdrop_Filter_Prop_Type`** - Backdrop filter properties

#### Media and Content

- **`Image_Prop_Type`** - Image properties
- **`Image_Src_Prop_Type`** - Image source URL
- **`Link_Prop_Type`** - Link properties
- **`Url_Prop_Type`** - URL properties

#### Advanced

- **`Classes_Prop_Type`** - CSS class arrays
- **`Attributes_Prop_Type`** - HTML attributes
- **`Query_Prop_Type`** - Query builder for dynamic content
- **`Date_Time_Prop_Type`** - Date/time values
- **`Key_Value_Prop_Type`** - Key-value pairs
- **`Union_Prop_Type`** - Union of multiple prop types

### Prop Type Structure

Each prop type implements `Prop_Type` contract:

```php
interface Prop_Type {
    public function get_name(): string;
    public function get_default_value();
    public function validate( $value ): bool;
    public function sanitize( $value );
}
```

### Defining Prop Schema

```php
protected static function define_props_schema(): array {
    return [
        'title' => new String_Prop_Type(),
        'color' => new Color_Prop_Type(),
        'padding' => new Dimensions_Prop_Type(),
        'background' => new Background_Prop_Type(),
    ];
}
```

---

## Widget and Element Builders

Builders provide a fluent API for programmatically creating widgets and elements.

### Widget_Builder

Creates individual widget JSON structures.

**Usage:**
```php
use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;

$widget = Widget_Builder::make('e-heading')
    ->settings([
        'title' => [
            '$$type' => 'text',
            'value' => 'My Heading'
        ],
        'tag' => [
            '$$type' => 'string',
            'value' => 'h1'
        ],
    ])
    ->is_locked(false)
    ->editor_settings([])
    ->build();
```

**Generated Structure:**
```json
{
    "elType": "widget",
    "widgetType": "e-heading",
    "settings": {
        "title": {"$$type": "text", "value": "My Heading"},
        "tag": {"$$type": "string", "value": "h1"}
    },
    "isLocked": false,
    "editor_settings": []
}
```

### Element_Builder

Creates container element JSON structures with children.

**Usage:**
```php
use Elementor\Modules\AtomicWidgets\Elements\Element_Builder;

$container = Element_Builder::make('e-flexbox')
    ->settings([
        'direction' => [
            '$$type' => 'layout-direction',
            'value' => 'column'
        ],
        'align_items' => [
            '$$type' => 'flex',
            'value' => 'center'
        ],
    ])
    ->children([$child_widget1, $child_widget2])
    ->is_locked(false)
    ->editor_settings([])
    ->build();
```

**Generated Structure:**
```json
{
    "elType": "e-flexbox",
    "settings": {
        "direction": {"$$type": "layout-direction", "value": "column"},
        "align_items": {"$$type": "flex", "value": "center"}
    },
    "isLocked": false,
    "editor_settings": [],
    "elements": [...]
}
```

---

## Transformers

Transformers convert between different data representations:

- **Settings Transformers**: Convert prop values to/from settings format
- **Styles Transformers**: Convert prop values to CSS styles
- **Import/Export Transformers**: Handle import/export data transformations

### Transformer Types

#### Settings Transformers

- `Classes_Transformer` - CSS classes array
- `Link_Transformer` - Link properties
- `Date_Time_Transformer` - Date/time values
- `Attributes_Transformer` - HTML attributes
- `Query_Transformer` - Query builder

#### Styles Transformers

- `Background_Transformer` - Background properties
- `Color_Stop_Transformer` - Gradient color stops
- `Shadow_Transformer` - Shadow properties
- `Size_Transformer` - Size values
- `Position_Transformer` - Position properties
- `Flex_Transformer` - Flexbox properties
- `Transform_*_Transformer` - Transform functions
- `Filter_Transformer` - CSS filters

#### Import/Export Transformers

- `Image_Src_Import_Transformer` - Import image sources
- `Image_Src_Export_Transformer` - Export image sources
- `Import_Export_Plain_Transformer` - Plain value handling

### Transformer Registry

Transformers are registered via WordPress hooks:

```php
add_action('elementor/atomic-widgets/settings/transformers/register', function($registry) {
    $registry->register(new My_Transformer());
});
```

---

## Style System

Atomic widgets use a variant-based style system with state support.

### Style Schema

The `Style_Schema` defines all available style properties and their types.

**Key Components:**
- **Style Definitions**: Property definitions with types
- **Variants**: Different style variants (default, hover, active, etc.)
- **States**: Style states (hover, focus, active, etc.)

### Style Manager

`Atomic_Styles_Manager` handles:
- Style registration
- Variant generation
- CSS file generation
- Style caching

### Base Styles

Each atomic widget can define base styles:

```php
protected function get_base_styles(): array {
    return [
        'color' => new Color_Prop_Type(),
        'padding' => new Dimensions_Prop_Type(),
        'background' => new Background_Prop_Type(),
    ];
}
```

### Style Variants

Styles support variants for different states:

- **Default**: Base styles
- **Hover**: Hover state styles
- **Active**: Active state styles
- **Focus**: Focus state styles

---

## Creating Atomic Widgets

### Step 1: Create Widget Class

```php
namespace Elementor\Modules\AtomicWidgets\Elements\My_Widget;

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

class My_Widget extends Atomic_Widget_Base {
    public static function get_name() {
        return 'my-widget';
    }

    public function get_title() {
        return esc_html__('My Widget', 'elementor');
    }

    protected static function define_props_schema(): array {
        return [
            'text' => new String_Prop_Type(),
            'color' => new Color_Prop_Type(),
        ];
    }

    protected function define_atomic_controls(): array {
        return [
            // Controls are auto-generated from prop schema
        ];
    }
}
```

### Step 2: Register Widget

```php
add_filter('elementor/widgets/register', function($widgets_manager) {
    $widgets_manager->register(new My_Widget());
});
```

### Step 3: Create Template (Optional)

Create a Twig template in `elements/my-widget/template.twig`:

```twig
<div class="my-widget">
    <p style="color: {{ color }}">{{ text }}</p>
</div>
```

---

## Usage Examples

### Example 1: Simple Heading Widget

```php
$heading = Widget_Builder::make('e-heading')
    ->settings([
        'title' => [
            '$$type' => 'text',
            'value' => 'Hello World'
        ],
        'tag' => [
            '$$type' => 'string',
            'value' => 'h1'
        ],
    ])
    ->build();
```

### Example 2: Container with Children

```php
$container = Element_Builder::make('e-div-block')
    ->settings([
        'padding' => [
            '$$type' => 'dimensions',
            'value' => [
                'top' => '20px',
                'right' => '20px',
                'bottom' => '20px',
                'left' => '20px',
            ]
        ],
    ])
    ->children([
        Widget_Builder::make('e-heading')
            ->settings(['title' => ['$$type' => 'text', 'value' => 'Title']])
            ->build(),
        Widget_Builder::make('e-paragraph')
            ->settings(['text' => ['$$type' => 'text', 'value' => 'Content']])
            ->build(),
    ])
    ->build();
```

### Example 3: Styled Button

```php
$button = Widget_Builder::make('e-button')
    ->settings([
        'text' => [
            '$$type' => 'text',
            'value' => 'Click Me'
        ],
        'link' => [
            '$$type' => 'link',
            'value' => [
                'url' => 'https://example.com',
                'is_external' => true,
            ]
        ],
    ])
    ->build();
```

---

## API Reference

### Widget_Builder Methods

- `make(string $widget_type): Widget_Builder` - Create builder instance
- `settings(array $settings): Widget_Builder` - Set widget settings
- `is_locked(bool $is_locked): Widget_Builder` - Set locked state
- `editor_settings(array $settings): Widget_Builder` - Set editor settings
- `build(): array` - Build widget data array

### Element_Builder Methods

- `make(string $element_type): Element_Builder` - Create builder instance
- `settings(array $settings): Element_Builder` - Set element settings
- `children(array $children): Element_Builder` - Set child elements
- `is_locked(bool $is_locked): Element_Builder` - Set locked state
- `editor_settings(array $settings): Element_Builder` - Set editor settings
- `build(): array` - Build element data array

### Atomic_Widget_Base Methods

- `define_atomic_controls(): array` - Define widget controls (abstract)
- `define_props_schema(): array` - Define prop schema (abstract static)
- `get_base_styles(): array` - Get base style definitions
- `get_atomic_controls(): array` - Get atomic controls configuration
- `get_base_styles_dictionary(): array` - Get style definitions dictionary

### Atomic_Element_Base Methods

- `define_atomic_controls(): array` - Define element controls (abstract)
- `define_atomic_style_states(): array` - Define style states
- `get_base_styles(): array` - Get base style definitions

---

## Integration Points

### Dynamic Tags

Atomic widgets integrate with Elementor's dynamic content system via `Dynamic_Tags_Module`.

### Import/Export

Atomic widgets support import/export through `Atomic_Import_Export` class with transformers.

### Frontend Rendering

Frontend assets are loaded via `Frontend_Assets_Loader` and rendered using Twig templates.

### CSS Variables

Atomic widgets use CSS variables for dynamic styling. The `@elementor/editor-variables` package provides:
- CSS variable management and scoping
- Variable value resolution and inheritance
- Integration with atomic widget style system

### Global Classes

Atomic widgets support global CSS classes through the `@elementor/editor-global-classes` package:
- Global class definition and management
- Class application to atomic widgets
- Style inheritance from global classes

### Editor Integration

Editor integration happens through:
- `assets/js/editor/module.js` - JavaScript module
- `assets/js/editor/component.js` - Editor component
- **Package Integration**: Atomic widgets integrate with several V4 packages:
  - `editor-controls` - Form controls for prop editing
  - `editor-props` - Props system and validation
  - `editor-styles` - Style system and variants
  - `editor-styles-repository` - Styles repository
  - `editor-canvas` - Canvas rendering
  - `editor-editing-panel` - Editing panel UI
  - `editor-variables` - CSS variables management for atomic widgets
  - `editor-global-classes` - Global CSS classes management and application

Core packages (`editor-canvas`, `editor-controls`, `editor-editing-panel`, `editor-elements`, `editor-props`, `editor-styles`, `editor-styles-repository`) are automatically loaded when the atomic widgets experiment is active (see `module.php` PACKAGES constant). Additional packages like `editor-variables` and `editor-global-classes` provide enhanced functionality for CSS variables and global class management.

For package details, see [packages/docs/architecture.md](../../packages/docs/architecture.md).

---

## Experimental Features

Atomic widgets are currently available via experiment:

- **Experiment Name**: `e_atomic_elements`
- **Status**: Development
- **Activation**: Via Elementor Experiments page

### Related Experiments

- `e_nested_elements` - Nested elements support
- `editor_mcp` - Editor MCP integration
- `v4-inline-text-editing` - Inline text editing

---

## Additional Resources

- **[Main Architecture Documentation](../../ARCHITECTURE.md)** - High-level architecture overview
- **[V4 Packages Documentation](../../packages/docs/architecture.md)** - Complete Editor V2 architecture, package catalog, and integration details
- **[Creating New Packages](../../packages/docs/creating-a-new-package.md)** - Guide for adding packages to monorepo
- **[Container Documentation](../../docs/includes/elements/container.md)** - Container element guide

---

*Last updated: 2025*

