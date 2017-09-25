<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Element Base
 *
 * Base class extended to register elements.
 *
 * This class must be extended for each element.
 *
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
	 * Retrieve script dependencies.
	 *
	 * Get the list of script dependencies the element requires.
	 *
	 * @access public
	 *
	 * @return array Widget scripts dependencies.
	 */
	public function get_script_depends() {
		return [];
	}

	/**
	 * Enqueue scripts.
	 *
	 * Registers all the scripts defined as element dependencies and enqueues
	 * them. Use `get_script_depends()` method to add custom script dependencies.
	 *
	 * @access public
	 */
	final public function enqueue_scripts() {
		foreach ( $this->get_script_depends() as $script ) {
			wp_enqueue_script( $script );
		}
	}

	/**
	 * Retrieve element edit tools.
	 *
	 * Used to get the element edit tools.
	 *
	 * @access public
	 * @static
	 *
	 * @return array Element edit tools.
	 */
	final public static function get_edit_tools() {
		if ( null === static::$_edit_tools ) {
			self::_init_edit_tools();
		}

		return static::$_edit_tools;
	}

	/**
	 * Add new edit tool.
	 *
	 * Register new edit tool for the element.
	 *
	 * @access public
	 * @static
	 *
	 * @param string $tool_name Edit tool name.
	 * @param array  $tool_data {
	 *     Edit tool data.
	 *
	 *     @type string $title  Edit tool title.
	 *     @type string $icon   Edit tool icon.
	 * }
	 * @param string $after     Optional. If tool ID defined, the new edit tool
	 *                          will be added after it. If null, the new edit
	 *                          tool will be added at the end. Default is null.
	 *
	 */
	final public static function add_edit_tool( $tool_name, $tool_data, $after = null ) {
		if ( null === static::$_edit_tools ) {
			self::_init_edit_tools();
		}

		// Adding the tool at specific position
		// in the tools array if requested
		if ( $after ) {
			$after_index = array_search( $after, array_keys( static::$_edit_tools ) ) + 1;

			static::$_edit_tools = array_slice( static::$_edit_tools, 0, $after_index, true ) +
								   [
									   $tool_name => $tool_data,
								   ] +
								   array_slice( static::$_edit_tools, $after_index, null, true );
		} else {
			static::$_edit_tools[ $tool_name ] = $tool_data;
		}
	}

	/**
	 * Retrieve element type.
	 *
	 * @access public
	 * @static
	 *
	 * @return string Control type.
	 */
	public static function get_type() {
		return 'element';
	}

	/**
	 * Retrieve default edit tools.
	 *
	 * Get the element default edit tools. Used to set initial tools.
	 * By default the element has no edit tools.
	 *
	 * @access protected
	 * @static
	 *
	 * @return array Default edit tools.
	 */
	protected static function get_default_edit_tools() {
		return [];
	}

	/**
	 * Retrieve items.
	 *
	 * Utility method that recieves an array with a needle and returns all the
	 * items that match the needle. If needle is not defined the entire haystack
	 * will be returened.
	 *
	 * @access private
	 * @static
	 *
	 * @param array  $haystack An array of items.
	 * @param string $needle   Optional. Default is null.
	 *
	 * @return mixed The whole haystack or the needle from the haystack when requested.
	 */
	private static function _get_items( array $haystack, $needle = null ) {
		if ( $needle ) {
			return isset( $haystack[ $needle ] ) ? $haystack[ $needle ] : null;
		}

		return $haystack;
	}

	/**
	 * Initialize edit tools.
	 *
	 * Register default edit tools.
	 *
	 * @access private
	 * @static
	 */
	private static function _init_edit_tools() {
		static::$_edit_tools = static::get_default_edit_tools();
	}

	/**
	 * Retrieve the default child element type.
	 *
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
	 * @access public
	 */
	public function before_render() {}

	/**
	 * After element rendering.
	 *
	 * Used to add stuff after the element.
	 *
	 * @access public
	 */
	public function after_render() {}

	/**
	 * Retrieve element title.
	 *
	 * @access public
	 *
	 * @return string Element title.
	 */
	public function get_title() {
		return '';
	}

	/**
	 * Retrieve element icon.
	 *
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
	 * @access public
	 *
	 * @return bool Whether the reload preview is required.
	 */
	public function is_reload_preview_required() {
		return false;
	}

	/**
	 * Print element template.
	 *
	 * Used to generate the element template on the editor.
	 *
	 * @access public
	 */
	public function print_template() {
		ob_start();

		$this->_content_template();

		$content_template = ob_get_clean();

		$content_template = Utils::apply_filters_deprecated( 'elementor/elements/print_template', [ $content_template, $this ], '1.0.10', 'elementor/element/print_template' );

		$content_template = apply_filters( 'elementor/element/print_template', $content_template, $this );

		if ( empty( $content_template ) ) {
			return;
		}
		?>
		<script type="text/html" id="tmpl-elementor-<?php echo $this->get_type(); ?>-<?php echo esc_attr( $this->get_name() ); ?>-content">
			<?php $this->_render_settings(); ?>
			<?php echo $content_template; ?>
		</script>
		<?php
	}

	/**
	 * Retrieve children elements.
	 *
	 * Get all the child elements of this this element.
	 *
	 * @access public
	 *
	 * @return Element_Base[] Child elements.
	 */
	public function get_children() {
		if ( null === $this->_children ) {
			$this->_init_children();
		}

		return $this->_children;
	}

	/**
	 * Retrieve default arguments.
	 *
	 * Get the element default arguments. Used to return all the default
	 * arguments or a specific default argument, if one is set.
	 *
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
	 * Retrieve parent element.
	 *
	 * Get the element parent. Used to check which element it belongs to.
	 *
	 * @access public
	 *
	 * @deprecated
	 *
	 * @return Element_Base Parent element.
	 */
	public function get_parent() {
		return $this->get_data( 'parent' );
	}

	/**
	 * Add new child element.
	 *
	 * Register new child element to allow hierarchy.
	 *
	 * @param array $child_data Child element data.
	 * @param array $child_args Child element arguments.
	 *
	 * @return Element_Base|false Child element instance, or false if failed.
	 */
	public function add_child( array $child_data, array $child_args = [] ) {
		if ( null === $this->_children ) {
			$this->_init_children();
		}

		$child_type = $this->_get_child_type( $child_data );

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
	 * Used to add render attribute to specific HTML elements.
	 *
	 * Example usage:
	 *
	 * `$this->add_render_attribute( 'wrapper', 'class', 'custom-widget-wrapper-class' );`
	 * `$this->add_render_attribute( 'widget', 'id', 'custom-widget-id' );
	 * `$this->add_render_attribute( 'button', [ 'class' => 'custom-button-class', 'id' => 'custom-button-id' ] );
	 *
	 * @access public
	 *
	 * @param array|string $element   The HTML element.
	 * @param array|string $key       Optional. Attribute key. Dafault is null.
	 * @param array|string $value     Optional. Attribute value. Dafault is null.
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
	 * @access public
	 *
	 * @param array|string $element The HTML element.
	 * @param array|string $key     Optional. Attribute key. Dafault is null.
	 * @param array|string $value   Optional. Attribute value. Dafault is null.
	 *
	 * @return Element_Base Current instance of the element.
	 */
	public function set_render_attribute( $element, $key = null, $value = null ) {
		return $this->add_render_attribute( $element, $key, $value, true );
	}

	/**
	 * Retrieve render attribute string.
	 *
	 * Used to get the value of the render attribute.
	 *
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
			$attributes[] = sprintf( '%s="%s"', $attribute_key, esc_attr( implode( ' ', $attribute_values ) ) );
		}

		return implode( ' ', $attributes );
	}

	/**
	 * Print element.
	 *
	 * Used to generate the element final HTML on the frontend and the editor.
 	 *
	 * @access public
	 */
	public function print_element() {
		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			$this->enqueue_scripts();
		}

		do_action( 'elementor/frontend/' . static::get_type() . '/before_render', $this );

		$this->_add_render_attributes();

		$this->before_render();

		$this->_print_content();

		$this->after_render();

		do_action( 'elementor/frontend/' . static::get_type() . '/after_render', $this );
	}

	/**
	 * Retrieve the element raw data.
	 *
	 * Get the raw element data, including the id, type, settings, child
	 * elements and whether it is an inner element.
	 *
	 * The data with the HTML used always to display the data, but the Elementor
	 * editor uses the raw data without the HTML in order not to render the data
	 * again.
 	 *
	 * @access public
	 *
	 * @param bool $with_html_content Optional. Whether to return the data with
	 *                                HTML content or without. Used for caching. Default is false, without HTML.
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
	 * Retrieve unique selector.
	 *
	 * Get the unique selector of the element. Used to set a unique HTML class
	 * for each HTML element. This way Elementor can set custom styles for each
	 * element.
	 *
	 * @access public
	 *
	 * @return string Unique selector.
	 */
	public function get_unique_selector() {
		return '.elementor-element-' . $this->get_id();
	}

	/**
	 * Render element output in the editor.
	 *
	 * Used to generate the live preview, using a Backbone JavaScript template.
	 *
	 * @access protected
	 */
	protected function _content_template() {}

	/**
	 * Render element settings.
	 *
	 * Used to generate the final HTML.
	 *
	 * @access protected
	 */
	protected function _render_settings() {}

	/**
	 * Is type instance.
	 *
	 * Used to determine whether the element is an instance of that type or not.
	 *
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
	 * Used to add render attributes to the element.
	 *
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

		foreach ( self::get_class_controls() as $control ) {
			if ( empty( $settings[ $control['name'] ] ) ) {
				continue;
			}

			$this->add_render_attribute( '_wrapper', 'class', $control['prefix_class'] . $settings[ $control['name'] ] );
		}

		if ( ! empty( $settings['animation'] ) || ! empty( $settings['_animation'] ) ) {
			// Hide the element until the animation begins
			$this->add_render_attribute( '_wrapper', 'class', 'elementor-invisible' );
		}

		if ( ! empty( $settings['_element_id'] ) ) {
			$this->add_render_attribute( '_wrapper', 'id', trim( $settings['_element_id'] ) );
		}

		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			$frontend_settings = $this->get_frontend_settings();

			if ( $frontend_settings ) {
				$this->add_render_attribute( '_wrapper', 'data-settings', wp_json_encode( $frontend_settings ) );
			}
		}
	}

	/**
	 * Render element.
	 *
	 * Generates the final HTML on the frontend.
	 *
	 * @access protected
	 */
	protected function render() {}

	/**
	 * Retrieve default data.
	 *
	 * Get the default element data. Used to reset the data on initialization.
	 *
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
	 * @access protected
	 */
	protected function _print_content() {
		foreach ( $this->get_children() as $child ) {
			$child->print_element();
		}
	}

	/**
	 * Retrieve initial config.
	 *
	 * Get the element initial configuration.
	 *
	 * @access protected
	 *
	 * @return array The initial config.
	 */
	protected function _get_initial_config() {
		$config = parent::_get_initial_config();

		return array_merge(
			$config, [
				'name' => $this->get_name(),
				'elType' => $this->get_type(),
				'title' => $this->get_title(),
				'icon' => $this->get_icon(),
				'reload_preview' => $this->is_reload_preview_required(),
			]
		);
	}

	/**
	 * Retrieve child type.
	 *
	 * Get the element child type based on element data.
	 *
	 * @access private
	 *
	 * @param array $element_data Element ID.
	 *
	 * @return Element_Base|false Child type or false if type not found.
	 */
	private function _get_child_type( $element_data ) {
		$child_type = $this->_get_default_child_type( $element_data );

		// If it's not a valid widget ( like a deactivated plugin )
		if ( ! $child_type ) {
			return false;
		}

		return apply_filters( 'elementor/element/get_child_type', $child_type, $element_data, $this );
	}

	/**
	 * Initialize children.
	 *
	 * Initializing the element child elements.
	 *
	 * @access private
	 */
	private function _init_children() {
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
	 * Initializing the element base class using `$data` and `$args`. The
	 * `$data` is required for a normal instance.
	 *
	 * @param array      $data Element data. Default is an empty array.
	 * @param array|null $args Optional. Element arguments. Default is null.
	 **/
	public function __construct( array $data = [], array $args = null ) {
		parent::__construct( $data );

		if ( $data ) {
			$this->_is_type_instance = false;
		} elseif ( $args ) {
			$this->_default_args = $args;
		}
	}
}
