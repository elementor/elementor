<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Element_Base extends Controls_Stack {

	/**
	 * @var Element_Base[]
	 */
	private $_children;

	private $_render_attributes = [];

	private $_default_args = [];

	protected static $_edit_tools;

	private $_is_type_instance = true;

	public function get_script_depends() {
		return [];
	}

	final public function enqueue_scripts() {
		foreach ( $this->get_script_depends() as $script ) {
			wp_enqueue_script( $script );
		}
	}

	final public static function get_edit_tools() {
		if ( null === static::$_edit_tools ) {
			self::_init_edit_tools();
		}

		return static::$_edit_tools;
	}

	final public static function add_edit_tool( $tool_name, $tool_data, $after = null ) {
		if ( null === static::$_edit_tools ) {
			self::_init_edit_tools();
		}

		// Adding the tool at specific position
		// in the tools array if requested
		if ( $after ) {
			$after_index = array_search( $after, array_keys( static::$_edit_tools ) ) + 1;

			static::$_edit_tools = array_slice( static::$_edit_tools, 0, $after_index, true ) +
			                       [ $tool_name => $tool_data ] +
			                       array_slice( static::$_edit_tools, $after_index, null, true );
		} else {
			static::$_edit_tools[ $tool_name ] = $tool_data;
		}
	}

	public static function get_type() {
		return 'element';
	}

	protected static function get_default_edit_tools() {
		return [];
	}

	/**
	 * @param array $haystack
	 * @param string $needle
	 *
	 * @return mixed the whole haystack or the
	 * needle from the haystack when requested
	 */
	private static function _get_items( array $haystack, $needle = null ) {
		if ( $needle ) {
			return isset( $haystack[ $needle ] ) ? $haystack[ $needle ] : null;
		}

		return $haystack;
	}

	private static function _init_edit_tools() {
		static::$_edit_tools = static::get_default_edit_tools();
	}

	/**
	 * @param array $element_data
	 *
	 * @return Element_Base
	 */
	abstract protected function _get_default_child_type( array $element_data );

	public function before_render() {}

	public function after_render() {}

	public function get_title() {
		return '';
	}

	public function get_icon() {
		return 'eicon-columns';
	}

	public function is_reload_preview_required() {
		return false;
	}

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

	public function get_children() {
		if ( null === $this->_children ) {
			$this->_init_children();
		}

		return $this->_children;
	}

	public function get_default_args( $item = null ) {
		return self::_get_items( $this->_default_args, $item );
	}

	/**
	 * @return Element_Base
	 */
	public function get_parent() {
		return $this->get_data( 'parent' );
	}

	/**
	 * @param array $child_data
	 * @param array $child_args
	 *
	 * @return Element_Base|false
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

	public function set_render_attribute( $element, $key = null, $value = null ) {
		return $this->add_render_attribute( $element, $key, $value, true );
	}

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

	public function print_element() {
		$this->enqueue_scripts();

		do_action( 'elementor/frontend/' . static::get_type() . '/before_render', $this );

		$this->_add_render_attributes();

		$this->before_render();

		$this->_print_content();

		$this->after_render();

		do_action( 'elementor/frontend/' . static::get_type() . '/after_render', $this );
	}

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

	public function get_unique_selector() {
		return '.elementor-element-' . $this->get_id();
	}

	protected function _content_template() {}

	protected function _render_settings() {
		?>
		<div class="elementor-element-overlay">
			<div class="elementor-editor-element-settings elementor-editor-<?php echo esc_attr( $this->get_type() ); ?>-settings elementor-editor-<?php echo esc_attr( $this->get_name() ); ?>-settings">
				<ul class="elementor-editor-element-settings-list">
					<li class="elementor-editor-element-setting elementor-editor-element-add">
						<a href="#" title="<?php _e( 'Add Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Add', 'elementor' ); ?></span>
							<i class="fa fa-plus"></i>
						</a>
					</li>
					<?php /* Temp removing for better UI
					<li class="elementor-editor-element-setting elementor-editor-element-edit">
						<a href="#" title="<?php _e( 'Edit Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Edit', 'elementor' ); ?></span>
							<i class="fa fa-pencil"></i>
						</a>
					</li>
					*/ ?>
					<li class="elementor-editor-element-setting elementor-editor-element-duplicate">
						<a href="#" title="<?php _e( 'Duplicate Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Duplicate', 'elementor' ); ?></span>
							<i class="fa fa-files-o"></i>
						</a>
					</li>
					<li class="elementor-editor-element-setting elementor-editor-element-remove">
						<a href="#" title="<?php _e( 'Remove Widget', 'elementor' ); ?>">
							<span class="elementor-screen-only"><?php _e( 'Remove', 'elementor' ); ?></span>
							<i class="fa fa-trash-o"></i>
						</a>
					</li>
				</ul>
			</div>
		</div>
		<?php
	}

	/**
	 * @return boolean
	 */
	public function is_type_instance() {
		return $this->_is_type_instance;
	}

	final public function get_frontend_settings_keys() {
		$controls = [];

		foreach ( $this->get_controls() as $control ) {
			if ( ! empty( $control['frontend_available'] ) ) {
				$controls[] = $control['name'];
			}
		}

		return $controls;
	}

	protected function _add_render_attributes() {
		$id = $this->get_id();

		$this->add_render_attribute( '_wrapper', 'data-id', $id );

		$this->add_render_attribute( '_wrapper', 'class', [
			'elementor-element',
			'elementor-element-' . $id,
		] );

		$settings = $this->get_active_settings();

		foreach ( self::get_class_controls() as $control ) {
			if ( empty( $settings[ $control['name'] ] ) )
				continue;

			$this->add_render_attribute( '_wrapper', 'class', $control['prefix_class'] . $settings[ $control['name'] ] );
		}

		if ( ! empty( $settings['_element_id'] ) ) {
			$this->add_render_attribute( '_wrapper', 'id', trim( $settings['_element_id'] ) );
		}

		if ( ! Plugin::$instance->editor->is_edit_mode() ) {
			$frontend_settings = array_intersect_key( $settings, array_flip( $this->get_frontend_settings_keys() ) );

			foreach ( $frontend_settings as $key => $setting ) {
				if ( in_array( $setting, [ null, '' ], true ) ) {
					unset( $frontend_settings[ $key ] );
				}
			}

			if ( $frontend_settings ) {
				$this->add_render_attribute( '_wrapper', 'data-settings', wp_json_encode( $frontend_settings ) );
			}
		}
	}

	protected function render() {}

	protected function get_default_data() {
		$data = parent::get_default_data();

		return array_merge( $data, [
			'elements' => [],
			'isInner' => false,
		] );
	}

	protected function _print_content() {
		foreach ( $this->get_children() as $child ) {
			$child->print_element();
		}
	}

	protected function _get_initial_config() {
		$config = parent::_get_initial_config();

		return array_merge( $config, [
			'name' => $this->get_name(),
			'elType' => $this->get_type(),
			'title' => $this->get_title(),
			'icon' => $this->get_icon(),
			'reload_preview' => $this->is_reload_preview_required(),
		] );
	}

	private function _get_child_type( $element_data ) {
		$child_type = $this->_get_default_child_type( $element_data );

		// If it's not a valid widget ( like a deactivated plugin )
		if ( ! $child_type ) {
			return false;
		}

		return apply_filters( 'elementor/element/get_child_type', $child_type, $element_data, $this );
	}

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

	public function __construct( array $data = [], array $args = null ) {
		parent::__construct( $data );

		if ( $data ) {
			$this->_is_type_instance = false;
		} elseif ( $args ) {
			$this->_default_args = $args;
		}
	}
}
