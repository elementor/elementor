<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor element base.
 *
 * An abstract class to register new Elementor elements. It extended the
 * `Controls_Stack` class to inherit its properties.
 *
 * This abstract class must be extended in order to register new elements.
 *
 * @since 1.0.0
 * @abstract
 */
abstract class Element_Base extends Controls_Stack {

	/**
	 * Child elements.
	 *
	 * Holds all the child elements of the element.
	 *
	 * @access private
	 *
	 * @var Element_Base[]
	 */
	private $_children;

	/**
	 * Element render attributes.
	 *
	 * Holds all the render attributes of the element. Used to store data like
	 * the HTML class name and the class value, or HTML element ID name and value.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $_render_attributes = [];

	/**
	 * Element default arguments.
	 *
	 * Holds all the default arguments of the element. Used to store additional
	 * data. For example WordPress widgets use this to store widget names.
	 *
	 * @access private
	 *
	 * @var array
	 */
	private $_default_args = [];

	/**
	 * Element edit tools.
	 *
	 * Holds all the edit tools of the element. For example: delete, duplicate etc.
	 *
	 * @access protected
	 * @static
	 *
	 * @var array
	 */
	protected static $_edit_tools;

	/**
	 * Is type instance.
	 *
	 * Whether the element is an instance of that type or not.
	 *
	 * @access private
	 *
	 * @var bool
	 */
	private $_is_type_instance = true;

	/**
	 * Depended scripts.
	 *
	 * Holds all the element depended scripts to enqueue.
	 *
	 * @since 1.9.0
	 * @access private
	 *
	 * @var array
	 */
	private $depended_scripts = [];

	/**
	 * Depended styles.
	 *
	 * Holds all the element depended styles to enqueue.
	 *
	 * @since 1.9.0
	 * @access private
	 *
	 * @var array
	 */
	private $depended_styles = [];

	/**
	 * Add script depends.
	 *
	 * Register new script to enqueue by the handler.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param string $handler Depend script handler.
	 */
	public function add_script_depends( $handler ) {
		$this->depended_scripts[] = $handler;
	}

	/**
	 * Add style depends.
	 *
	 * Register new style to enqueue by the handler.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @param string $handler Depend style handler.
	 */
	public function add_style_depends( $handler ) {
		$this->depended_styles[] = $handler;
	}

	/**
	 * Get script dependencies.
	 *
	 * Retrieve the list of script dependencies the element requires.
	 *
	 * @since 1.3.0
	 * @access public
	 *
	 * @return array Element scripts dependencies.
	 */
	public function get_script_depends() {
		return $this->depended_scripts;
	}

	/**
	 * Enqueue scripts.
	 *
	 * Registers all the scripts defined as element dependencies and enqueues
	 * them. Use `get_script_depends()` method to add custom script dependencies.
	 *
	 * @since 1.3.0
	 * @access public
	 */
	final public function enqueue_scripts() {
		foreach ( $this->get_script_depends() as $script ) {
			wp_enqueue_script( $script );
		}
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the element requires.
	 *
	 * @since 1.9.0
	 * @access public
	 *
	 * @return array Element styles dependencies.
	 */
	public function get_style_depends() {
		return $this->depended_styles;
	}

	/**
	 * Enqueue styles.
	 *
	 * Registers all the styles defined as element dependencies and enqueues
	 * them. Use `get_style_depends()` method to add custom style dependencies.
	 *
	 * @since 1.9.0
	 * @access public
	 */
	final public function enqueue_styles() {
		foreach ( $this->get_style_depends() as $style ) {
			wp_enqueue_style( $style );
		}
	}

	/**
	 * Get element edit tools.
	 *
	 * Used to retrieve the element edit tools.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @return array Element edit tools.
	 */
	final public static function get_edit_tools() {
		if ( ! Plugin::instance()->role_manager->user_can( 'design' ) ) {
			return [];
		}

		if ( null === static::$_edit_tools ) {
			self::init_edit_tools();
		}

		return static::$_edit_tools;
	}

	/**
	 * Add new edit tool.
	 *
	 * Register new edit tool for the element.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @param string   $tool_name Edit tool name.
	 * @param string[] $tool_data Edit tool data.
	 * @param string   $after     Optional. If tool ID defined, the new edit tool
	 *                            will be added after it. If null, the new edit
	 *                            tool will be added at the end. Default is null.
	 *
	 */
	final public static function add_edit_tool( $tool_name, $tool_data, $after = null ) {
		if ( null === static::$_edit_tools ) {
			self::init_edit_tools();
		}

		// Adding the tool at specific position
		// in the tools array if requested
		if ( $after ) {
			$after_index = array_search( $after, array_keys( static::$_edit_tools ), true ) + 1;

			static::$_edit_tools = array_slice( static::$_edit_tools, 0, $after_index, true ) +
								   [
									   $tool_name => $tool_data,
								   ] +
								   array_slice( static::$_edit_tools, $after_index, null, true );
		} else {
			static::$_edit_tools[ $tool_name ] = $tool_data;
		}
	}

	final public static function is_edit_buttons_enabled() {
		return get_option( 'elementor_edit_buttons' );
	}

	/**
	 * Get default edit tools.
	 *
	 * Retrieve the element default edit tools. Used to set initial tools.
	 * By default the element has no edit tools.
	 *
	 * @since 1.0.0
	 * @access protected
	 * @static
	 *
	 * @return array Default edit tools.
	 */
	protected static function get_default_edit_tools() {
		return [];
	}

	/**
	 * Initialize edit tools.
	 *
	 * Register default edit tools.
	 *
	 * @since 2.0.0
	 * @access private
	 * @static
	 */
	private static function init_edit_tools() {
		static::$_edit_tools = static::get_default_edit_tools();
	}

	/**
	 * Get default child type.
	 *
	 * Retrieve the default child type based on element data.
	 *
	 * Note that not all elements support children.
	 *
	 * @since 1.0.0
	 * @access protected
	 * @abstract
	 *
	 * @param array $element_data Element data.
	 *
	 * @return Element_Base
	 */
	abstract protected function _get_default_child_type( array $element_data );

	/**
	 * Before element rendering.
	 *
	 * Used to add stuff before the element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function before_render() {}

	/**
	 * After element rendering.
	 *
	 * Used to add stuff after the element.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function after_render() {}

	/**
	 * Get element title.
	 *
	 * Retrieve the element title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Element title.
	 */
	public function get_title() {
		return '';
	}

	/**
	 * Get element icon.
	 *
	 * Retrieve the element icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Element icon.
	 */
	public function get_icon() {
		return 'eicon-columns';
	}

	/**
	 * Whether the reload preview is required.
	 *
	 * Used to determine whether the reload preview is required or not.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return bool Whether the reload preview is required.
	 */
	public function is_reload_preview_required() {
		return false;
	}

	/**
	 * Print element content template.
	 *
	 * Used to generate the element content template on the editor, using a
	 * Backbone JavaScript template.
	 *
	 * @access protected
	 * @since 2.0.0
	 *
	 * @param string $template_content Template content.
	 */
	protected function print_template_content( $template_content ) {
		$this->render_edit_tools();

		echo $template_content; // XSS ok.
	}

	/**
	 * Get child elements.
	 *
	 * Retrieve all the child elements of this element.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return Element_Base[] Child elements.
	 */
	public function get_children() {
		if ( null === $this->_children ) {
			$this->init_children();
		}

		return $this->_children;
	}

	/**
	 * Get default arguments.
	 *
	 * Retrieve the element default arguments. Used to return all the default
	 * arguments or a specific default argument, if one is set.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array $item Optional. Default is null.
	 *
	 * @return array Default argument(s).
	 */
	public function get_default_args( $item = null ) {
		return self::_get_items( $this->_default_args, $item );
	}

	/**
	 * Get parent element.
	 *
	 * Retrieve the element parent. Used to check which element it belongs to.
	 *
	 * @since 1.0.0
	 * @deprecated 1.7.6 Use `Element_Base::get_data( 'parent' )` instead.
	 * @access public
	 *
	 * @return Element_Base Parent element.
	 */
	public function get_parent() {
		_deprecated_function( __METHOD__, '1.7.6', __CLASS__ . '::get_data( \'parent\' )' );

		return $this->get_data( 'parent' );
	}

	/**
	 * Add new child element.
	 *
	 * Register new child element to allow hierarchy.
	 *
	 * @since 1.0.0
	 * @access public
	 * @param array $child_data Child element data.
	 * @param array $child_args Child element arguments.
	 *
	 * @return Element_Base|false Child element instance, or false if failed.
	 */
	public function add_child( array $child_data, array $child_args = [] ) {
		if ( null === $this->_children ) {
			$this->init_children();
		}

		$child_type = $this->get_child_type( $child_data );

		if ( ! $child_type ) {
			return false;
		}

		$child = Plugin::$instance->elements_manager->create_element_instance( $child_data, $child_args, $child_type );

		if ( $child ) {
			$this->_children[] = $child;
		}

		return $child;
	}

	/**
	 * Add render attribute.
	 *
	 * Used to add attributes to a specific HTML element.
	 *
	 * The HTML tag is represented by the element parameter, then you need to
	 * define the attribute key and the attribute key. The final result will be:
	 * `<element attribute_key="attribute_value">`.
	 *
	 * Example usage:
	 *
	 * `$this->add_render_attribute( 'wrapper', 'class', 'custom-widget-wrapper-class' );`
	 * `$this->add_render_attribute( 'widget', 'id', 'custom-widget-id' );`
	 * `$this->add_render_attribute( 'button', [ 'class' => 'custom-button-class', 'id' => 'custom-button-id' ] );`
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array|string $element   The HTML element.
	 * @param array|string $key       Optional. Attribute key. Default is null.
	 * @param array|string $value     Optional. Attribute value. Default is null.
	 * @param bool         $overwrite Optional. Whether to overwrite existing
	 *                                attribute. Default is false, not to overwrite.
	 *
	 * @return Element_Base Current instance of the element.
	 */
	public function add_render_attribute( $element, $key = null, $value = null, $overwrite = false ) {
		if ( is_array( $element ) ) {
			foreach ( $element as $element_key => $attributes ) {
				$this->add_render_attribute( $element_key, $attributes, null, $overwrite );
			}

			return $this;
		}

		if ( is_array( $key ) ) {
			foreach ( $key as $attribute_key => $attributes ) {
				$this->add_render_attribute( $element, $attribute_key, $attributes, $overwrite );
			}

			return $this;
		}

		if ( empty( $this->_render_attributes[ $element ][ $key ] ) ) {
			$this->_render_attributes[ $element ][ $key ] = [];
		}

		settype( $value, 'array' );

		if ( $overwrite ) {
			$this->_render_attributes[ $element ][ $key ] = $value;
		} else {
			$this->_render_attributes[ $element ][ $key ] = array_merge( $this->_render_attributes[ $element ][ $key ], $value );
		}

		return $this;
	}

	/**
	 * Set render attribute.
	 *
	 * Used to set the value of the HTML element render attribute or to update
	 * an existing render attribute.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array|string $element The HTML element.
	 * @param array|string $key     Optional. Attribute key. Default is null.
	 * @param array|string $value   Optional. Attribute value. Default is null.
	 *
	 * @return Element_Base Current instance of the element.
	 */
	public function set_render_attribute( $element, $key = null, $value = null ) {
		return $this->add_render_attribute( $element, $key, $value, true );
	}

	/**
	 * Get render attribute string.
	 *
	 * Used to retrieve the value of the render attribute.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array|string $element The element.
	 *
	 * @return string Render attribute string, or an empty string if the attribute
	 *                is empty or not exist.
	 */
	public function get_render_attribute_string( $element ) {
		if ( empty( $this->_render_attributes[ $element ] ) ) {
			return '';
		}

		$render_attributes = $this->_render_attributes[ $element ];

		$attributes = [];

		foreach ( $render_attributes as $attribute_key => $attribute_values ) {
			$attributes[] = sprintf( '%1$s="%2$s"', $attribute_key, esc_attr( implode( ' ', $attribute_values ) ) );
		}

		return implode( ' ', $attributes );
	}

	/**
	 * Print render attribute string.
	 *
	 * Used to output the rendered attribute.
	 *
	 * @since 2.0.0
	 * @access public
	 *
	 * @param array|string $element The element.
	 */
	public function print_render_attribute_string( $element ) {
		echo $this->get_render_attribute_string( $element ); // XSS ok.
	}

	/**
	 * Print element.
	 *
	 * Used to generate the element final HTML on the frontend and the editor.
	 *
	 * @since 1.0.0
	 * @access public
	 */
	public function print_element() {
		$element_type = $this->get_type();

		/**
		 * Before frontend element render.
		 *
		 * Fires before Elementor element is rendered in the frontend.
		 *
		 * @since 2.2.0
		 *
		 * @param Element_Base $this The element.
		 */
		do_action( 'elementor/frontend/before_render', $this );

		/**
		 * Before frontend element render.
		 *
		 * Fires before Elementor element is rendered in the frontend.
		 *
		 * The dynamic portion of the hook name, `$element_type`, refers to the element type.
		 *
		 * @since 1.0.0
		 *
		 * @param Element_Base $this The element.
		 */
		do_action( "elementor/frontend/{$element_type}/before_render", $this );

		$this->_add_render_attributes();

		$this->before_render();
		$this->_print_content();
		$this->after_render();

		$this->enqueue_scripts();
		$this->enqueue_styles();
		/**
		 * After frontend element render.
		 *
		 * Fires after Elementor element was rendered in the frontend.
		 *
		 * The dynamic portion of the hook name, `$element_type`, refers to the element type.
		 *
		 * @since 1.0.0
		 *
		 * @param Element_Base $this The element.
		 */
		do_action( "elementor/frontend/{$element_type}/after_render", $this );
	}

	/**
	 * Get the element raw data.
	 *
	 * Retrieve the raw element data, including the id, type, settings, child
	 * elements and whether it is an inner element.
	 *
	 * The data with the HTML used always to display the data, but the Elementor
	 * editor uses the raw data without the HTML in order not to render the data
	 * again.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param bool $with_html_content Optional. Whether to return the data with
	 *                                HTML content or without. Used for caching.
	 *                                Default is false, without HTML.
	 *
	 * @return array Element raw data.
	 */
	public function get_raw_data( $with_html_content = false ) {
		$data = $this->get_data();

		$elements = [];

		foreach ( $this->get_children() as $child ) {
			$elements[] = $child->get_raw_data( $with_html_content );
		}

		return [
			'id' => $this->get_id(),
			'elType' => $data['elType'],
			'settings' => $data['settings'],
			'elements' => $elements,
			'isInner' => $data['isInner'],
		];
	}

	/**
	 * Get unique selector.
	 *
	 * Retrieve the unique selector of the element. Used to set a unique HTML
	 * class for each HTML element. This way Elementor can set custom styles for
	 * each element.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Unique selector.
	 */
	public function get_unique_selector() {
		return '.elementor-element-' . $this->get_id();
	}

	/**
	 * Render element edit tools.
	 *
	 * Used to generate the edit tools HTML.
	 *
	 * @since 1.0.0
	 * @deprecated 1.8.0 Use `Element_Base::render_edit_tools()` instead.
	 * @access protected
	 */
	protected function _render_settings() {
		_deprecated_function( sprintf( '%s::%s', get_called_class(), __FUNCTION__ ), '1.8.0', '$this->render_edit_tools()' );

		$this->render_edit_tools();
	}

	/**
	 * Render element edit tools.
	 *
	 * Used to generate the edit tools HTML.
	 *
	 * @since 1.8.0
	 * @access protected
	 */
	protected function render_edit_tools() {
		?>
		<div class="elementor-element-overlay">
			<ul class="elementor-editor-element-settings elementor-editor-<?php echo $this->get_type(); ?>-settings">
				<?php
				foreach ( self::get_edit_tools() as $edit_tool_name => $edit_tool ) {
					?>
					<li class="elementor-editor-element-setting elementor-editor-element-<?php echo esc_attr( $edit_tool_name ); ?>" title="<?php echo esc_attr( $edit_tool['title'] ); ?>">
						<i class="eicon-<?php echo esc_attr( $edit_tool['icon'] ); ?>" aria-hidden="true"></i>
						<span class="elementor-screen-only"><?php echo esc_html( $edit_tool['title'] ); ?></span>
					</li>
				<?php } ?>
			</ul>
		</div>
		<?php
	}

	/**
	 * Is type instance.
	 *
	 * Used to determine whether the element is an instance of that type or not.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return bool Whether the element is an instance of that type.
	 */
	public function is_type_instance() {
		return $this->_is_type_instance;
	}

	/**
	 * Add render attributes.
	 *
	 * Used to add attributes to the current element wrapper HTML tag.
	 *
	 * @since 1.3.0
	 * @access protected
	 */
	protected function _add_render_attributes() {
		$id = $this->get_id();

		$this->add_render_attribute( '_wrapper', 'data-id', $id );

		$this->add_render_attribute(
			'_wrapper', 'class', [
				'elementor-element',
				'elementor-element-' . $id,
			]
		);

		$settings = $this->get_active_settings();

		$controls = $this->get_controls();

		$class_settings = [];

		foreach ( $settings as $setting_key => $setting ) {
			if ( isset( $controls[ $setting_key ]['prefix_class'] ) ) {
				$class_settings[ $setting_key ] = $setting;
			}
		}

		foreach ( $class_settings as $setting_key => $setting ) {
			if ( empty( $setting ) && '0' !== $setting ) {
				continue;
			}

			$this->add_render_attribute( '_wrapper', 'class', $controls[ $setting_key ]['prefix_class'] . $setting );
		}

		if ( ! empty( $settings['animation'] ) || ! empty( $settings['_animation'] ) ) {
			// Hide the element until the animation begins
			$this->add_render_attribute( '_wrapper', 'class', 'elementor-invisible' );
		}

		if ( ! empty( $settings['_element_id'] ) ) {
			$this->add_render_attribute( '_wrapper', 'id', trim( $settings['_element_id'] ) );
		}

		$frontend_settings = $this->get_frontend_settings();

		if ( $frontend_settings ) {
			$this->add_render_attribute( '_wrapper', 'data-settings', wp_json_encode( $frontend_settings ) );
		}
	}

	/**
	 * Get default data.
	 *
	 * Retrieve the default element data. Used to reset the data on initialization.
	 *
	 * @since 1.0.0
	 * @access protected
	 *
	 * @return array Default data.
	 */
	protected function get_default_data() {
		$data = parent::get_default_data();

		return array_merge(
			$data, [
				'elements' => [],
				'isInner' => false,
			]
		);
	}

	/**
	 * Print element content.
	 *
	 * Output the element final HTML on the frontend.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function _print_content() {
		foreach ( $this->get_children() as $child ) {
			$child->print_element();
		}
	}

	/**
	 * Get initial config.
	 *
	 * Retrieve the current element initial configuration.
	 *
	 * Adds more configuration on top of the controls list and the tabs assigned
	 * to the control. This method also adds element name, type, icon and more.
	 *
	 * @since 1.0.10
	 * @access protected
	 *
	 * @return array The initial config.
	 */
	protected function _get_initial_config() {
		$config = [
			'name' => $this->get_name(),
			'elType' => $this->get_type(),
			'title' => $this->get_title(),
			'icon' => $this->get_icon(),
			'reload_preview' => $this->is_reload_preview_required(),
		];

		return array_merge( parent::_get_initial_config(), $config );
	}

	/**
	 * Get child type.
	 *
	 * Retrieve the element child type based on element data.
	 *
	 * @since 2.0.0
	 * @access private
	 *
	 * @param array $element_data Element ID.
	 *
	 * @return Element_Base|false Child type or false if type not found.
	 */
	private function get_child_type( $element_data ) {
		$child_type = $this->_get_default_child_type( $element_data );

		// If it's not a valid widget ( like a deactivated plugin )
		if ( ! $child_type ) {
			return false;
		}

		/**
		 * Element child type.
		 *
		 * Filters the child type of the element.
		 *
		 * @since 1.0.0
		 *
		 * @param Element_Base $child_type   The child element.
		 * @param array        $element_data The original element ID.
		 * @param Element_Base $this         The original element.
		 */
		$child_type = apply_filters( 'elementor/element/get_child_type', $child_type, $element_data, $this );

		return $child_type;
	}

	/**
	 * Initialize children.
	 *
	 * Initializing the element child elements.
	 *
	 * @since 2.0.0
	 * @access private
	 */
	private function init_children() {
		$this->_children = [];

		$children_data = $this->get_data( 'elements' );

		if ( ! $children_data ) {
			return;
		}

		foreach ( $children_data as $child_data ) {
			if ( ! $child_data ) {
				continue;
			}

			$this->add_child( $child_data );
		}
	}

	/**
	 * Element base constructor.
	 *
	 * Initializing the element base class using `$data` and `$args`.
	 *
	 * The `$data` parameter is required for a normal instance because of the
	 * way Elementor renders data when initializing elements.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @param array      $data Optional. Element data. Default is an empty array.
	 * @param array|null $args Optional. Element default arguments. Default is null.
	 **/
	public function __construct( array $data = [], array $args = null ) {
		if ( $data ) {
			$this->_is_type_instance = false;
		} elseif ( $args ) {
			$this->_default_args = $args;
		}

		parent::__construct( $data );
	}
}
