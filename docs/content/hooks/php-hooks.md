# PHP Hooks

## TOC
  * [Frontend Filters](#frontend-filters)
    + [`elementor/frontend/the_content`](#elementorfrontendthe_content)
    + [`elementor/widget/render_content`](#elementorwidgetrender_content)
    + [`elementor/frontend/print_google_fonts`](#elementorfrontendprint_google_fonts)
  * [Editor Filters](#editor-filters)
    + [`elementor/element/print_template`](#elementorelementprint_template)
  * [Init Actions](#init-actions)
    + [`elementor/loaded`](#elementorloaded)
    + [`elementor/init`](#elementorinit)
    + [`elementor/widget/{name}/skins_init`](#elementorwidgetnameskins_init)
  * [Frontend Actions](#frontend-actions)
    + [`elementor/frontend/before_enqueue_scripts`](#elementorfrontendbefore_enqueue_scripts)
    + [`elementor/frontend/after_register_styles`](#elementorfrontendafter_register_styles)
    + [`elementor/frontend/after_enqueue_styles`](#elementorfrontendafter_enqueue_styles)
    + [`elementor/element/parse_css`](#elementorelementparse_css)
    + [`elementor/frontend/{section|column|widget}/before_render`](#elementorfrontendsectioncolumnwidgetbefore_render)
    + [`elementor/frontend/{section|column|widget}/after_render`](#elementorfrontendsectioncolumnwidgetafter_render)
    + [`elementor/widgets/widgets_registered`](#elementorwidgetswidgets_registered)
  * [Editor Actions](#editor-actions)
    + [`elementor/editor/after_save`](#elementoreditorafter_save)
    + [`elementor/editor/before_enqueue_scripts`](#elementoreditorbefore_enqueue_scripts)
    + [`elementor/element/before_section_start`](#elementorelementbefore_section_start)
    + [`elementor/element/after_section_end`](#elementorelementafter_section_end)
    + [`elementor/element/{$element_name}/{$section_id}/before_section_start`](#elementorelementelement_namesection_idbefore_section_start)
    + [`elementor/element/{element_name}/{section_id}/after_section_end`](#elementorelementelement_namesection_idafter_section_end)
    + [`elementor/element/after_section_start`](#elementorelementafter_section_start)
    + [`elementor/element/before_section_end`](#elementorelementbefore_section_end)
    + [`elementor/element/{$element_name}/{$section_id}/after_section_start`](#elementorelementelement_namesection_idafter_section_start)
    + [`elementor/element/{element_name}/{section_id}/before_section_end`](#elementorelementelement_namesection_idbefore_section_end)
  * [Preview Actions](#preview-actions)
    + [`elementor/preview/enqueue_styles`](#elementorpreviewenqueue_styles)

## Frontend Filters

### `elementor/frontend/the_content`
Applied to frontend HTML content (the entire Elementor content in page).

#### Arguments

Argument          | Type         | Description
------------      | :------:     | ---------------------------------------------
`content`         | *`string`*   | The entire Elementor HTML output of current page/post
 
#### Example

```php
add_action( 'elementor/frontend/the_content', function( $content ) {
	if ( ! membership_plugin_is_allowed_content() ) {
		$content = __( 'Forbidden', 'membership_plugin' );
	}
	
	return $content;
} );
```

### `elementor/widget/render_content`
Applied to the PHP html content of a single widget. ( in the Editor it will be shown after the finish edit the element. to change the JavaScript Template see [`elementor/element/print_template`](#elementorelementprint_template))
 
#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`content`         | *`string`*        | The widget HTML output
`widget`          | *`Widget_Base`*   | The widget instance
 
#### Example

 ```php
add_action( 'elementor/widget/render_content', function( $content, $widget ) {
	if ( 'heading' === $widget->get_name() ) {
		$settings = $widget->get_settings();
	
		if ( ! empty( $settings['link']['is_external'] ) ) {
			$content .= '<i class="fa fa-external-link" aria-hidden="true"></i>';
		}
	}
	
	return $content;
}, 10, 2 );
 ```
 
 ### `elementor/frontend/print_google_fonts`
 Used to prevent loading of Google Fonts by Elementor
 
 #### Arguments
 None
  
 #### Example
 
  ```php
add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );
 ```

## Editor Filters

### `elementor/element/print_template`
Applied to the javascript preview templates.

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`template`        | *`string`*        | The JavaScript template output
`widget`          | *`Widget_Base`*   | The widget instance
 
#### Example

 ```php
add_action( 'elementor/element/print_template', function( $template, $widget ) {
	if ( 'heading' === $widget->get_name() ) {
		$old_template = '<a href="\' + settings.link.url + \'">\' + title_html + \'</a>';
		$new_template = '<a href="\' + settings.link.url + \'">\' + title_html + ( settings.link.is_external ? \'<i class="fa fa-external-link" aria-hidden="true"></i>\' : \'\' ) + \'</a>';
		$template = str_replace( $old_template, $new_template, $template );
	}

	return $template;
}, 10, 2 );
 ```
 Note: The code above it for example only, we do not recommend to use `str_replace` on templates, because the template may be changed and the `str_replace` will fail. instead, take the whole original template and change it for your needs.
 
## Init Actions

### `elementor/loaded`
Elementor plugin is loaded, before load all components

#### Arguments
None
 
#### Example

 ```php
add_action( 'elementor/loaded', 'load_my_plugin' );
 ```

### `elementor/init`
Elementor is fully loaded

#### Arguments
None
 
#### Example

 ```php
// Add a custom category for panel widgets
add_action( 'elementor/init', function() {
	\Elementor\Plugin::$instance->elements_manager->add_category( 
		'theme-elements',
		[
			'title' => __( 'Theme Elements', 'theme-domain' ),
			'icon' => 'fa fa-plug', //default icon
		],
		2 // position
	);
} );
```

### `elementor/widget/{name}/skins_init`
Runs after widget construction. 
Here is th place to register custom skins. 

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`widget`          | *`Widget_Base`*   | The widget instance
 
#### Example

 ```php
// Add a custom skin for the Google Maps widget
add_action( 'elementor/widget/google_maps/skins_init', function( $widget ) {
	$widget->add_skin( new MySkins\Skin_Dark_Map( $widget ) );
} );
```

## Frontend Actions

### `elementor/frontend/before_enqueue_scripts`
Before the frontend scripts enqueuing.

#### Arguments
None
 
#### Example

 ```php
add_action( 'elementor/frontend/before_enqueue_scripts', function() {
	wp_enqueue_script(
		'plugin-name-frontend',
		'plugin-url/assets/frontend.js',
		[
			'elementor-frontend', // dependency
		],
		'plugin_version',
		true // in_footer
	);
} );
```

### `elementor/frontend/after_register_styles`
After Elementor registers all styles.

#### Arguments
None

### `elementor/frontend/after_enqueue_styles`
After the frontend styles enqueuing.

#### Arguments
None

#### Example

 ```php
add_action( 'elementor/frontend/after_enqueue_styles', function() {
    wp_dequeue_style( 'font-awesome' );
} );
```

### `elementor/element/parse_css`
After Parse the element CSS in order to generate the CSS file

#### Arguments
Argument          | Type              | Description
------------      | :------:          | ----------------------
`post_css`        | *`Post_CSS_File`* | The Post CSS generator
`element`         | *`Element_Base`*  | The element instance
 
#### Example

 ```php
add_action(	'elementor/element/parse_css', function( $post_css, $element ) {
	$item_width = some_get_theme_config_function( 'item_width' );
	/**
	 * @var \Elementor\Post_CSS_File $post_css
	 * @var \Elementor\Element_Base  $element
	 */
	$post_css->get_stylesheet()->add_rules( $element->get_unique_selector(), [
		'width' => $item_width . 'px',
	] );
}, 10, 2 );
```

### `elementor/frontend/{section|element|widget}/before_render`
### `elementor/frontend/{section|element|widget}/after_render`
Before/after the element is printed

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`         | *`Element_Base`*  | The element instance
 
#### Example

```php
add_action( 'elementor/frontend/element/before_render', function ( \Elementor\Element_Base $element ) {
	if ( ! $element->get_settings( 'my-custom-settings' ) ) {
		return;
	}

	$element->add_render_attribute( '_wrapper', [
		'class' => 'my-custom-class',
		'data-my_data' => 'my-data-value',
	] );
} );
```

### `elementor/widgets/widgets_registered`
The place to register your custom widgets. 

#### Arguments

Argument          | Type               | Description
------------      | :------:           | ----------------------
`widgets_manager` | *`Widgets_Manager`*| The widgets manager instance

#### Example

```php
add_action( 'elementor/widgets/widgets_registered', function( $widgets_manager ) {
	require 'plugin-path/widgets/my-widget.php';
    
    $widgets_manager->register_widget_type( new My_Widget() );
} );
```

## Editor Actions
### `elementor/editor/after_save`
Runs after saving Elementor data.

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`post_id`         | *`integer`*       | The post ID
`editor_data`     | *`array`*         | Array of Elementor elements

#### Example

```php
add_action( 'elementor/editor/after_save', function( $post_id, $editor_data ) {
    // Activity Log Plugin
    aal_insert_log(
		[
			'action' => 'saved',
			'object_type' => 'Elementor Data',
			'object_id' => $post_id,
			'object_name' => get_the_title( $post_id ),
		]
	);
}
```

### `elementor/editor/before_enqueue_scripts`
Before the editor scripts enqueuing.

#### Arguments
None
 
#### Example

 ```php
add_action( 'elementor/editor/before_enqueue_scripts', function() {
	wp_enqueue_script(
		'plugin-name-editor',
		'plugin-url/assets/editor.js',
		[
			'elementor-editor', // dependency
		],
		'plugin_version',
		true // in_footer
	);
} );
```

start_controls_section
### `elementor/element/before_section_start`
### `elementor/element/after_section_end`
Runs before/after an editor section is registered.
Here is the place to add additional sections before and after each section for all elements in panel
If you need to add a section in a specific place ( a specific element & section ), prefer to use the [next hook](#elementorelementelement_namesection_idbefore_section_start)

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`         | *`Element_Base`*  | The edited element.
`section_id`      | *`string`*        | Current section  id
`args`            | *`array`*         | The $args that sent to `$element->start_controls_section`
 
#### Example

 ```php

add_action( 'elementor/element/before_section_start', function( $element, $section_id, $args ) {
	/** @var \Elementor\Element_Base $element */
	if ( 'section' === $element->get_name() && 'section_background' === $section_id ) {

		$element->start_controls_section(
			'custom_section',
			[
				'tab' => \Elementor\Controls_Manager::TAB_STYLE,
				'label' => __( 'Custom Section', 'plugin-name' ),
			]
		);

		$element->add_control(
			'custom_control',
			[
			'type' => \Elementor\Controls_Manager::NUMBER,
			'label' => __( 'Custom Control', 'plugin-name' ),
			]
		);

		$element->end_controls_section();
	}
}, 10, 3 );
```

### `elementor/element/{$element_name}/{$section_id}/before_section_start`
### `elementor/element/{element_name}/{section_id}/after_section_end`
Runs before/after a specific element ( like `heading`) and a specific section ( like `section_title` )

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`         | *`Element_Base`*  | The edited element.
`args`            | *`array`*         | The $args that sent to `$element->start_controls_section`
 
#### Example

```php
add_action( 'elementor/element/heading/section_title/before_section_start', function( $element, $args ) {
	/** @var \Elementor\Element_Base $element */
	$element->start_controls_section(
		'custom_section',
		[
			'tab' => \Elementor\Controls_Manager::TAB_STYLE,
			'label' => __( 'Custom Section', 'plugin-name' ),
		]
	);

	$element->add_control(
		'custom_control',
		[
			'type' => \Elementor\Controls_Manager::NUMBER,
			'label' => __( 'Custom Control', 'plugin-name' ),
		]
	);

	$element->end_controls_section();
}, 10, 2 );
```

### `elementor/element/after_section_start`
### `elementor/element/before_section_end`
Runs within an editor section. after it was opened / before the section is closed.
Here is the place to add additional controls to existing sections.
If you need to add a control to a specific place ( a specific element & section ), prefer to use the [next hook](#elementorelementelement_namesection_idafter_section_start)

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`         | *`Element_Base`*  | The edited element.
`section_id`      | *`string`*        | Current section id
`args`            | *`array`*         | The $args that sent to `$element->start_controls_section`
 
#### Example

```php
add_action( 'elementor/element/after_section_start', function( $element, $section_id, $args ) {
	/** @var \Elementor\Element_Base $element */
	if ( 'section' === $element->get_name() && 'section_background' === $section_id ) {
		$element->add_control(
			'custom_control',
			[
				'type' => \Elementor\Controls_Manager::NUMBER,
				'label' => __( 'Custom Control', 'plugin-name' ),
			]
		);
	}
}, 10, 3 );
```

### `elementor/element/{$element_name}/{$section_id}/after_section_start`
### `elementor/element/{element_name}/{section_id}/before_section_end`

Runs within an editor section. after it was opened / before the section is closed.
Here is the place to add additional controls before and after a specific element ( like `heading`) and a specific section ( like `section_title` )

#### Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`         | *`Element_Base`*  | The edited element.
`args`            | *`array`*         | The $args that sent to `$element->start_controls_section`
 
#### Example

```php
add_action( 'elementor/element/heading/section_title/before_section_start', function( $element, $args ) {
	/** @var \Elementor\Element_Base $element */
	$element->add_control(
		'custom_control',
		[
			'type' => \Elementor\Controls_Manager::NUMBER,
			'label' => __( 'Custom Control', 'plugin-name' ),
		]
	);
}, 10, 2 );
```

## Preview Actions
### `elementor/preview/enqueue_styles`
Before the preview styles enqueuing.

#### Arguments
None
 
#### Example

 ```php
add_action( 'elementor/preview/enqueue_styles', function() {
	wp_enqueue_style(
		'elementor-preview-style',
		url/to/style.css',
		[],
		'plugin-version'
	);
} );
```
