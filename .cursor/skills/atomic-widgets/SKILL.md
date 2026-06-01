---
name: atomic-widgets
description: >-
  Create or extend Elementor V4 atomic widgets and atomic elements (containers).
  Use when adding a new e-* atomic widget/element, extending props/controls/styles/twig
  for an existing atomic element, or deciding between Atomic_Widget_Base vs Atomic_Element_Base.
---

# Atomic Widgets Skill

Reference for creating **new** atomic widgets/elements or **extending** existing ones in `modules/atomic-widgets/`.

## When to use

- Adding a new `e-*` widget or element under `modules/atomic-widgets/elements/`
- Extending an existing atomic element (new prop, control, base style, twig output)
- Choosing between leaf widget vs container element
- Writing PHPUnit snapshot tests for atomic render output

## Architecture (two kinds)

| Kind | Base class | Template trait | Registration | `elType` in document |
|------|------------|----------------|--------------|----------------------|
| **Leaf widget** (no children) | `Atomic_Widget_Base` | `Has_Template` | `widgets_manager->register()` in `register_widgets()` | `widget` + `widgetType: e-*` |
| **Atomic element** (may nest children) | `Atomic_Element_Base` | `Has_Element_Template` | `elements_manager->register_element_type()` in `register_elements()` | `e-*` (matches `get_type()`) |

Both extend shared behavior via `Has_Atomic_Base` + `Has_Base_Styles`.

### Container vs non-container

**Non-container (leaf widget)** — content-only, single HTML output, no child elements:

- Examples: `e-heading`, `e-paragraph`, `e-button`, `e-image`, `e-divider`
- Base: `Atomic_Widget_Base` + `Has_Template`
- Twig: renders settings only; **no** `<!-- elementor-children-placeholder -->`
- No `$this->meta( 'is_container', true )`

**Container element** — accepts nested widgets/elements:

- Examples: `e-div-block`, `e-flexbox`, `e-grid`, `e-tabs`, `e-tab-content`
- Base: `Atomic_Element_Base` + `Has_Element_Template`
- Constructor: `$this->meta( 'is_container', true )` (layout containers shown in panel)
- Twig: **must** include `<!-- elementor-children-placeholder -->` where children render
- Optional: `define_default_children()`, `define_allowed_child_types()`, `define_initial_attributes()`

**Nested structural sub-elements** (hidden from panel, locked):

- Examples: `e-tab`, `e-tabs-menu`, `e-tabs-content-area`, `e-tab-content`
- `should_show_in_panel(): return false`
- `$this->meta( 'permanently_locked', true )` in constructor
- Often restrict children via `define_allowed_child_types()`

### Decision checklist

```
Need nested children in the editor?
├─ NO  → Atomic_Widget_Base + Has_Template → register_widgets()
└─ YES → Atomic_Element_Base + Has_Element_Template → register_elements()
         └─ Shown in widget panel as layout?
            ├─ YES → meta('is_container', true)
            └─ NO  → should_show_in_panel() = false, often permanently_locked
```

## File layout

Place each element in its own folder under `modules/atomic-widgets/elements/`:

```
modules/atomic-widgets/elements/{kebab-name}/
├── {kebab-name}.php
└── {kebab-name}.html.twig
```

Complex features use nested folders (see `atomic-tabs/`).

### Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| PHP class | `Atomic_{PascalName}` | `Atomic_Heading` |
| PHP namespace | `Elementor\Modules\AtomicWidgets\Elements\{PascalName}` | `...\Elements\Atomic_Heading\Atomic_Heading` |
| Element type ID | `e-{kebab-case}` | `e-heading`, `e-div-block` |
| Twig registry key | `elementor/elements/{kebab-name}` | `elementor/elements/atomic-heading` |
| Icon | `eicon-e-{name}` or existing eicon | `eicon-e-heading` |
| Category | `[ 'v4-elements' ]` (widgets via `get_categories()`, elements via `define_panel_categories()`) |
| Keywords | include `'ato', 'atom', 'atoms', 'atomic'` | panel search |

Widgets implement `get_element_type()` (used as widget name).
Elements implement **both** `get_type()` and `get_element_type()` returning the same `e-*` string.

## Registration (`modules/atomic-widgets/module.php`)

1. Add `use` import for the new class
2. Register in the correct method:

```php
// Leaf widget
$widgets_manager->register( new Atomic_My_Widget() );

// Container / nested element
$elements_manager->register_element_type( new My_Container() );
```

3. Frontend JS (only if needed): implement `register_frontend_handlers()` + `get_script_depends()` on the element class (see `Atomic_Tabs`, `Atomic_Youtube`). Handlers are invoked via `elementor/frontend/before_register_scripts`.

## Required PHP structure

Every atomic element defines these methods:

| Method | Purpose |
|--------|---------|
| `static get_element_type(): string` | Unique `e-*` ID |
| `get_title()` | Panel label (escaped) |
| `get_icon()` | Panel icon class |
| `get_keywords()` | Search keywords |
| `static define_props_schema(): array` | Typed props (schema) |
| `define_atomic_controls(): array` | Editor controls bound to schema |
| `get_templates(): array` | Twig path map |
| `define_base_styles(): array` | Default style definitions (can return `[]`) |

Optional but common:

| Method | When |
|--------|------|
| `static $widget_description` | AI / component generation hints |
| `render_markdown(): string` | Markdown export (widgets) |
| `define_atomic_pseudo_states(): array` | Custom pseudo states |
| `define_atomic_style_states(): array` | Class-based states (e.g. selected tab) |
| `define_render_context(): array` | Pass data to child twig via `Render_Context` |
| `build_template_context(): array` | Extra twig vars (containers) |
| `get_settings_controls(): array` | Reusable settings section controls |
| `register_frontend_handlers()` | Custom frontend JS |

### Standard props schema (always include)

Every schema should include:

```php
'classes' => Classes_Prop_Type::make()->default( [] ),
'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
```

`_cssid` is **auto-injected** by `Has_Atomic_Base::get_props_schema()` — bind a `Text_Control` to `_cssid` in settings, do not add it manually to `define_props_schema()`.

### Controls rules

- Controls live in `Section::make()` groups with `set_id()` and `set_label()`
- Every control **must** bind to a schema prop: `Some_Control::bind_to( 'prop_name' )`
- Typical sections: `content` (main editable prop), `settings` (tag, link, ID)
- Settings ID control pattern:

```php
Text_Control::bind_to( '_cssid' )
    ->set_label( __( 'ID', 'elementor' ) )
    ->set_meta( $this->get_css_id_control_meta() ),
```

### Base styles pattern

```php
const BASE_STYLE_KEY = 'base';

protected function define_base_styles(): array {
    return [
        static::BASE_STYLE_KEY => Style_Definition::make()
            ->add_variant(
                Style_Variant::make()
                    ->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
                    ->add_prop( 'margin', Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ) )
            ),
    ];
}
```

- Dictionary key `base` becomes CSS class `{element-type}-base` (e.g. `e-heading-base`)
- Additional keys (e.g. `link-base`) for nested link wrappers
- State variants: `Style_Variant::make()->set_state( Style_States::HOVER )`

---

## Template: leaf widget PHP

Replace placeholders: `{Namespace}`, `{ClassName}`, `{element-type}`, `{Title}`, `{icon}`, `{main-prop}`, `{MainPropType}`, `{default text}`.

```php
<?php
namespace Elementor\Modules\AtomicWidgets\Elements\{Namespace};

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Inline_Editing_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Link_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Html_V3_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Link_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class {ClassName} extends Atomic_Widget_Base {
	use Has_Template;

	const LINK_BASE_STYLE_KEY = 'link-base';

	public static $widget_description = '{Short description for AI generation.}';

	public static function get_element_type(): string {
		return '{element-type}';
	}

	public function get_title() {
		return esc_html__( '{Title}', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic' ];
	}

	public function get_icon() {
		return '{icon}';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'{main-prop}' => Html_V3_Prop_Type::make()
				->default( [
					'content'  => String_Prop_Type::generate( __( '{default text}', 'elementor' ) ),
					'children' => [],
				] ),
			'link' => Link_Prop_Type::make(),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Inline_Editing_Control::bind_to( '{main-prop}' )
						->set_placeholder( __( '{Placeholder}', 'elementor' ) )
						->set_label( __( '{Label}', 'elementor' ) ),
				] ),
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Link_Control::bind_to( 'link' )
						->set_placeholder( __( 'Type or paste your URL', 'elementor' ) )
						->set_label( __( 'Link', 'elementor' ) ),
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'margin', Size_Prop_Type::generate( [ 'size' => 0, 'unit' => 'px' ] ) )
				),
			self::LINK_BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'all', 'unset' )
						->add_prop( 'cursor', 'pointer' )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/{twig-name}' => __DIR__ . '/{twig-name}.html.twig',
		];
	}
}
```

---

## Template: container element PHP

Replace `{element-type}`, `{ClassName}`, `{Namespace}`, `{Title}`.

```php
<?php
namespace Elementor\Modules\AtomicWidgets\Elements\{Namespace};

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Text_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class {ClassName} extends Atomic_Element_Base {
	use Has_Element_Template;

	const BASE_STYLE_KEY = 'base';

	public static $widget_description = '{Describe structure and child constraints.}';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return '{element-type}';
	}

	public static function get_element_type(): string {
		return '{element-type}';
	}

	public function get_title() {
		return esc_html__( '{Title}', 'elementor' );
	}

	public function get_keywords() {
		return [ 'ato', 'atom', 'atoms', 'atomic', 'layout' ];
	}

	public function get_icon() {
		return '{icon}';
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Settings', 'elementor' ) )
				->set_id( 'settings' )
				->set_items( [
					Text_Control::bind_to( '_cssid' )
						->set_label( __( 'ID', 'elementor' ) )
						->set_meta( $this->get_css_id_control_meta() ),
				] ),
		];
	}

	protected function define_base_styles(): array {
		return [
			static::BASE_STYLE_KEY => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
						->add_prop( 'padding', Size_Prop_Type::generate( [ 'size' => 10, 'unit' => 'px' ] ) )
						->add_prop( 'min-width', Size_Prop_Type::generate( [ 'size' => 30, 'unit' => 'px' ] ) )
				),
		];
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/{twig-name}' => __DIR__ . '/{twig-name}.html.twig',
		];
	}
}
```

### Default children (optional)

Use builders to seed structure when element is inserted:

```php
protected function define_default_children() {
	return [
		Atomic_Child_Element::generate()
			->editor_settings( [ 'title' => 'Child label' ] )
			->build(),
	];
}
```

- Widget children: `Some_Widget::generate()->settings( [...] )->build()`
- Element children: `Some_Element::generate()->children( [...] )->build()`

---

## Template: leaf widget Twig (text + optional link)

Context available in all twig templates:

| Variable | Description |
|----------|-------------|
| `id` | Element instance ID |
| `interaction_id` | Interaction tracking ID |
| `type` | Element type string |
| `settings` | Resolved atomic settings (post-transform) |
| `base_styles` | Map of style key → generated class name |

```twig
{% import 'elementor/macros' as m %}
{%- set allowed_tags = '<b><strong><sup><sub><s><em><i><u><a><del><span><br>' -%}
{%- set classes = settings.classes | merge( [ base_styles.base ] ) | join(' ') -%}
<{{ settings.tag | default('div') | e('html_tag') }} class="{{ classes }}" data-interaction-id="{{ interaction_id }}"
	{{- m.render_custom_attributes(settings) }}>
{%- if settings.link is defined and settings.link.href is defined and settings.link.href is not empty -%}
	<{{ settings.link.tag | default('a') | e('html_tag') }}
		{{- m.render_link_attributes(settings.link) }} class="{{ base_styles['link-base'] }}">
		{{ settings.{main-prop} | striptags(allowed_tags) | raw }}
	</{{ settings.link.tag | default('a') | e('html_tag') }}>
{%- else -%}
	{{ settings.{main-prop} | striptags(allowed_tags) | raw }}
{%- endif %}
</{{ settings.tag | default('div') | e('html_tag') }}>
```

### Leaf widget Twig (button pattern)

When the element itself is the interactive control (no wrapper tag):

```twig
{% import 'elementor/macros' as m %}
{%- set allowed_tags = '<b><strong><sup><sub><s><em><i><u><del><span><br>' -%}
{%- set classes = settings.classes | merge( [ base_styles.base ] ) | join(' ') -%}
{%- if settings.link is defined and settings.link.href is defined and settings.link.href is not empty -%}
	<{{ settings.link.tag | default('a') | e('html_tag') }}
		{{- m.render_link_attributes(settings.link) }} class="{{ classes }}" data-interaction-id="{{ interaction_id }}"
		{{- m.render_custom_attributes(settings) }}>
		{{ settings.text | striptags(allowed_tags) | raw }}
	</{{ settings.link.tag | default('a') | e('html_tag') }}>
{%- else -%}
	<button class="{{ classes }}" data-interaction-id="{{ interaction_id }}"
		{{- m.render_custom_attributes(settings) }}>
		{{ settings.text | striptags(allowed_tags) | raw }}
	</button>
{%- endif %}
```

### Leaf widget Twig (minimal / self-closing)

For elements like divider:

```twig
{% set classes = settings.classes | merge( [ base_styles.base ] ) | join(' ') %}
{% set id_attribute = settings._cssid is not empty ? 'id=' ~ settings._cssid | e('html_attr') : '' %}
<hr class="{{ classes }}" data-interaction-id="{{ interaction_id }}" {{ id_attribute }} {{ settings.attributes | raw }} />
```

### Container element Twig

**Must** include the children placeholder. Prefer shared macros from `modules/atomic-widgets/elements/base/_macros.html.twig`:

```twig
{% import 'elementor/macros' as m %}
{%- set tag = settings.tag | default('div') -%}
{%- if settings.link is defined and settings.link.href is defined and settings.link.href is not empty -%}
    {%- set tag = settings.link.tag | default('a') -%}
{%- endif -%}
<{{ tag }} class="{{ m.render_base_classes(id, base_styles, settings) }} {{ editor_classes | default('') }}"
    {{- ' ' }}{{ m.render_data_attributes(id, type, interaction_id) }}
    {{- m.render_link_attributes(settings.link | default(null)) }}
    {{- m.render_custom_attributes(settings, editor_attributes) }}>
    <!-- elementor-children-placeholder -->
</{{ tag }}>
```

Macros (`{% import 'elementor/macros' as m %}`):

| Macro | Purpose |
|-------|---------|
| `m.render_base_classes(id, base_styles, settings)` | Standard elementor + atomic classes |
| `m.render_data_attributes(id, type, interaction_id)` | `data-id`, `data-element_type`, etc. |
| `m.render_custom_attributes(settings, editor_attributes)` | `_cssid`, custom attributes |
| `m.render_link_attributes(link)` | `href` or `data-action-link` for button links |

---

## Prop types → controls mapping

| Prop type | Typical control |
|-----------|-----------------|
| `String_Prop_Type` | `Text_Control`, `Select_Control`, `Html_Tag_Control` |
| `Html_V3_Prop_Type` | `Inline_Editing_Control` |
| `Link_Prop_Type` | `Link_Control` |
| `Image_Prop_Type` | `Image_Control` |
| `Svg_Src_Prop_Type` | `Svg_Control` |
| `Video_Src_Prop_Type` | `Video_Control` |
| `Number_Prop_Type` | `Number_Control` |
| `Boolean_Prop_Type` | `Switch_Control`, `Toggle_Control` |
| `Size_Prop_Type` | `Size_Control` |
| Nested/repeater props | `Repeatable_Control`, `Query_Control`, etc. |

Prop types live in `modules/atomic-widgets/prop-types/`.
Controls live in `modules/atomic-widgets/controls/types/`.

Generate default prop values with `{PropType}::generate( ... )` or `{PropType}::make()->default( ... )`.

---

## Extending an existing atomic element

1. **Search first** — find the element under `modules/atomic-widgets/elements/`
2. **Schema** — add prop to `define_props_schema()` with correct `Prop_Type`
3. **Controls** — add `{Control}::bind_to( 'new-prop' )` in the matching `Section`
4. **Twig** — consume `settings.new-prop` with proper escaping (`e()`, `striptags`, `raw` only when safe)
5. **Base styles** — extend `define_base_styles()` if default appearance needed
6. **Dependencies** — use `Dependency_Manager` on prop or control when visibility depends on other props (see `Div_Block`)
7. **Render context** — if child elements need parent data, extend `define_render_context()` on parent and read via `Render_Context::get( ParentClass::class )` in child `build_template_context()`
8. **Tests** — update/add PHPUnit snapshot test in `tests/phpunit/elementor/modules/atomic-widgets/`
9. **Registration** — only needed for brand-new element types

Do **not** use legacy `Widget_Base` controls (`add_control`). Atomic elements use `define_atomic_controls()` only.

---

## PHPUnit test template

```php
<?php

use Elementor\Modules\AtomicWidgets\Elements\{Namespace}\{ClassName};
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

class Test_{ClassName} extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test__render_default(): void {
		// Arrange.
		$mock = [
			'id' => 'abc1234',
			'elType' => 'widget', // use element type string for containers
			'settings' => [],
			'widgetType' => {ClassName}::get_element_type(), // omit for pure elements; use 'elType' => 'e-*' instead
		];

		$instance = Plugin::$instance->elements_manager->create_element_instance( $mock );

		// Act.
		ob_start();
		$instance->render_content();
		$rendered_output = ob_get_clean();

		// Assert.
		$this->assertMatchesSnapshot( $rendered_output );
	}
}
```

For container elements, set `'elType' => '{element-type}'` and omit `widgetType`.

---

## Reference implementations

| Pattern | Reference files |
|---------|-----------------|
| Text + link widget | `elements/atomic-heading/` |
| Button (link vs `<button>`) | `elements/atomic-button/` |
| Media widget | `elements/atomic-image/` |
| Minimal leaf | `elements/atomic-divider/` |
| Layout container | `elements/div-block/`, `elements/flexbox/` |
| Composite nested structure | `elements/atomic-tabs/` |
| Shared macros | `elements/base/_macros.html.twig` |
| Widget builder (tests/defaults) | `elements/base/widget-builder.php` |
| Element builder | `elements/base/element-builder.php` |
| Module registration | `modules/atomic-widgets/module.php` |

---

## Common pitfalls

- Using `Has_Template` on a container — containers **must** use `Has_Element_Template`
- Missing `<!-- elementor-children-placeholder -->` in container twig — children will not render
- Control bound to prop missing from schema — throws in editor validation
- Adding `_cssid` to schema manually — already injected; only add the control
- Forgetting `Overridable_Prop_Type::ignore()` on `attributes` prop
- Widget registered in `register_elements()` or vice versa
- Element type strings must stay stable — they are persisted in JSON documents
- Twig template key path must match `get_templates()` registry key
- Link buttons use `data-action-link`, not `href` — handled by `render_link_attributes` macro
