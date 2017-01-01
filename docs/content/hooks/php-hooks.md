#PHP Hooks

##Frontend Filters

###`elementor/frontend/the_content`
Applied to frontend HTML content (the entire Elementor content in page).

####Arguments

Argument          | Type         | Description
------------      | :------:     | ---------------------------------------------
`content`         | *`string`*   | The entire Elementor HTML output of current page/post
 
####Example

```php
add_action( 'elementor/frontend/the_content', function( $content ) {
	if ( ! membership_plugin_is_allowed_content() ) {
		$content = __( 'Forbidden', 'membership_plugin' );
	}
	
	return $content;
} );
```

###`elementor/widget/render_content`
Applied to the PHP html content of a single widget. ( in the Editor it will be shown after the finish edit the element. to change the JavaScript Template see [`elementor/element/print_template`](####`elementor/element/print_template`))
 
####Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`content`         | *`string`*        | The widget HTML output
`widget`          | *`Widget_Base`*   | The widget instance
 
####Example

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

##Editor Filters

###`elementor/element/print_template`
Applied to the javascript preview templates.

####Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`template`        | *`string`*        | The JavaScript template output
`widget`          | *`Widget_Base`*   | The widget instance
 
####Example

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
 
##Init Actions

###`elementor/loaded`
Elementor plugin is loaded, before load all components

####Arguments
None
 
####Example

 ```php
add_action( 'elementor/loaded', 'load_my_plugin' );
 ```

###`elementor/init`
Elementor is fully loaded

####Arguments
None
 
####Example

 ```php
// Add a custom category for panel widgets
add_action( 'elementor/init', function() {
	\Elementor\Plugin::instance()->elements_manager->add_category( 
		'theme-elements',
		[
			'title' => __( 'Theme Elements', 'theme-domain' ),
			'icon' => 'fa fa-plug', //default icon
		],
		2 // position
	);
} );
```

##Frontend Actions

###`elementor/frontend/before_enqueue_scripts`
Before the frontend scripts enqueuing.

####Arguments
None
 
####Example

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

###`elementor/element/parse_css`
After Parse the element CSS in order to generate the CSS file

####Arguments
Argument          | Type              | Description
------------      | :------:          | ----------------------
`post_css`        | *`Post_CSS_File`* | The Post CSS generator
`element`         | *`Element_Base`*  | The element instance
 
####Example

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

###`elementor/frontend/{section|column|widget}/before_render`
###`elementor/frontend/{section|column|widget}/after_render`
Before/after the element is printed

####Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`element`          | *`Element_Base`*   | The element instance
 
####Example

```php
add_action( 'elementor/frontend/section/before_render', function( $element ) {
	if ( ! $section->get_settings( 'my-custom-settings ) {
		return;
    }
    
    $element->add_render_attribute( 'wrapper', 'class', 'my-custom-class' );
}
```

###`elementor/widgets/widgets_registered`
The place to register your custom widgets. 

####Arguments

Argument          | Type               | Description
------------      | :------:           | ----------------------
`widgets_manager` | *`Widgets_Manager`*| The widgets manager instance

####Example

```php
add_action( 'elementor/widgets/widgets_registered', function( $widgets_manager ) {
	require 'plugin-path/widgets/my-widget.php';
    
    $widgets_manager->register_widget_type( new My_Widget() );
} );
```

##Editor Actions
###`elementor/editor/after_save`
Runs after saving Elementor data.

####Arguments

Argument          | Type              | Description
------------      | :------:          | ----------------------
`post_id`         | *`integer`*       | The post ID
`editor_data`     | *`array`*         | Array of Elementor elements

####Example

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

###`elementor/editor/before_enqueue_scripts`
Before the editor scripts enqueuing.

####Arguments
None
 
####Example

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
