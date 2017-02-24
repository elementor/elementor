<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Element_Base {

	const RESPONSIVE_DESKTOP = 'desktop';
	const RESPONSIVE_TABLET = 'tablet';
	const RESPONSIVE_MOBILE = 'mobile';

	private $_id;

	private $_settings;

	private $_data;

	private $_config;

	/**
	 * @var Element_Base[]
	 */
	private $_children;

	private $_render_attributes = [];

	private $_default_args = [];

	protected static $_edit_tools;

	/**
	 * Holds the current section while render a set of controls sections
	 *
	 * @var null|array
	 */
	private $_current_section = null;

	/**
	 * Holds the current tab while render a set of controls tabs
	 *
	 * @var null|array
	 */
	protected $_current_tab = null;

	private $_is_type_instance = true;

	public final static function get_edit_tools() {
		if ( null === static::$_edit_tools ) {
			self::_init_edit_tools();
		}

		return static::$_edit_tools;
	}

	public final static function add_edit_tool( $tool_name, $tool_data, $after = null ) {
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

	abstract public function get_name();

	public function get_controls( $control_id = null ) {
		$stack = Plugin::$instance->controls_manager->get_element_stack( $this );

		if ( null === $stack ) {
			$this->_init_controls();

			return $this->get_controls();
		}

		return self::_get_items( $stack['controls'], $control_id );
	}

	public function add_control( $id, array $args, $overwrite = false ) {
		if ( empty( $args['type'] ) || ! in_array( $args['type'], [ Controls_Manager::SECTION, Controls_Manager::WP_WIDGET ] ) ) {
			if ( null !== $this->_current_section ) {
				if ( ! empty( $args['section'] ) || ! empty( $args['tab'] ) ) {
					_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Cannot redeclare control with `tab` or `section` args inside section. - ' . $id, '1.0.0' );
				}
				$args = array_merge( $args, $this->_current_section );

				if ( null !== $this->_current_tab ) {
					$args = array_merge( $args, $this->_current_tab );
				}
			} elseif ( empty( $args['section'] ) ) {
				wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Cannot add a control outside a section (use `start_controls_section`).' );
			}
		}

		return Plugin::$instance->controls_manager->add_control_to_stack( $this, $id, $args, $overwrite );
	}

	public function remove_control( $control_id ) {
		return Plugin::$instance->controls_manager->remove_control_from_stack( $this->get_name(), $control_id );
	}

	public function update_control( $control_id, array $args ) {
		return Plugin::$instance->controls_manager->update_control_in_stack( $this, $control_id, $args );
	}

	public final function add_group_control( $group_name, array $args = [] ) {
		$group = Plugin::$instance->controls_manager->get_control_groups( $group_name );

		if ( ! $group ) {
			wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Group `' . $group_name . '` not found.' );
		}

		$group->add_controls( $this, $args );
	}

	public final function get_tabs_controls() {
		$stack = Plugin::$instance->controls_manager->get_element_stack( $this );

		return $stack['tabs'];
	}

	public final function get_scheme_controls() {
		$enabled_schemes = Schemes_Manager::get_enabled_schemes();

		return array_filter( $this->get_controls(), function( $control ) use ( $enabled_schemes ) {
			return ( ! empty( $control['scheme'] ) && in_array( $control['scheme']['type'], $enabled_schemes ) );
		} );
	}

	public final function get_style_controls( $controls = null ) {
		if ( null === $controls ) {
			$controls = $this->get_controls();
		}

		$style_controls = [];

		foreach ( $controls as $control_name => $control ) {
			if ( Controls_Manager::REPEATER === $control['type'] ) {
				$control['style_fields'] = $this->get_style_controls( $control['fields'] );
			}

			if ( ! empty( $control['style_fields'] ) || ! empty( $control['selectors'] ) ) {
				$style_controls[ $control_name ] = $control;
			}
		}

		return $style_controls;
	}

	public final function get_class_controls() {
		return array_filter( $this->get_controls(), function( $control ) {
			return ( isset( $control['prefix_class'] ) );
		} );
	}

	public final function add_responsive_control( $id, array $args ) {
		$devices = [
			self::RESPONSIVE_DESKTOP,
			self::RESPONSIVE_TABLET,
			self::RESPONSIVE_MOBILE,
		];

		foreach ( $devices as $device_name ) {
			$control_args = $args;

			if ( ! empty( $args['prefix_class'] ) ) {
				$device_to_replace = self::RESPONSIVE_DESKTOP === $device_name ? '' : '-' . $device_name;

				$control_args['prefix_class'] = sprintf( $args['prefix_class'], $device_to_replace );
			}

			$control_args['responsive'] = [ 'max' => $device_name ];

			if ( isset( $control_args[ $device_name . '_default' ] ) ) {
				$control_args['default'] = $control_args[ $device_name . '_default' ];
			}

			unset( $control_args['desktop_default'] );
			unset( $control_args['tablet_default'] );
			unset( $control_args['mobile_default'] );

			$id_suffix = self::RESPONSIVE_DESKTOP === $device_name ? '' : '_' . $device_name;

			$this->add_control(
				$id . $id_suffix,
				$control_args
			);
		}
	}

	public final function get_class_name() {
		return get_called_class();
	}

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

	public final function get_config() {
		if ( null === $this->_config ) {
			$this->_config = $this->_get_initial_config();
		}

		return $this->_config;
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

	public function get_id() {
		return $this->_id;
	}

	public function get_data( $item = null ) {
		return self::_get_items( $this->_data, $item );
	}

	public function get_settings( $setting = null ) {
		return self::_get_items( $this->_settings, $setting );
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

	public function is_control_visible( $control, $values = null ) {
		if ( null === $values ) {
			$values = $this->get_settings();
		}

		// Repeater fields
		if ( ! empty( $control['conditions'] ) ) {
			return Conditions::check( $control['conditions'], $values );
		}

		if ( empty( $control['condition'] ) ) {
			return true;
		}

		foreach ( $control['condition'] as $condition_key => $condition_value ) {
			preg_match( '/([a-z_0-9]+)(?:\[([a-z_]+)])?(!?)$/i', $condition_key, $condition_key_parts );

			$pure_condition_key = $condition_key_parts[1];
			$condition_sub_key = $condition_key_parts[2];
			$is_negative_condition = ! ! $condition_key_parts[3];

			$instance_value = $values[ $pure_condition_key ];

			if ( null === $instance_value ) {
				return false;
			}

			if ( $condition_sub_key ) {
				if ( ! isset( $instance_value[ $condition_sub_key ] ) ) {
					return false;
				}

				$instance_value = $instance_value[ $condition_sub_key ];
			}

			// If it's a non empty array - check if the conditionValue contains the controlValue,
			// otherwise check if they are equal. ( and give the ability to check if the value is an empty array )
			$is_contains = ( is_array( $condition_value ) && ! empty( $condition_value ) ) ? in_array( $instance_value, $condition_value ) : $instance_value === $condition_value;

			if ( $is_negative_condition && $is_contains || ! $is_negative_condition && ! $is_contains ) {
				return false;
			}
		}

		return true;
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
		do_action( 'elementor/frontend/' . static::get_type() . '/before_render', $this );

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
			'id' => $this->_id,
			'elType' => $data['elType'],
			'settings' => $data['settings'],
			'elements' => $elements,
			'isInner' => $data['isInner'],
		];
	}

	public function get_unique_selector() {
		return '.elementor-element-' . $this->get_id();
	}

	public function start_controls_section( $section_id, array $args ) {
		do_action( 'elementor/element/before_section_start', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/before_section_start', $this, $args );

		$args['type'] = Controls_Manager::SECTION;

		$this->add_control( $section_id, $args );

		if ( null !== $this->_current_section ) {
			wp_die( sprintf( 'Elementor: You can\'t start a section before the end of the previous section: `%s`', $this->_current_section['section'] ) );
		}

		$this->_current_section = [
			'section' => $section_id,
			'tab' => $this->get_controls( $section_id )['tab'],
		];

		do_action( 'elementor/element/after_section_start', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/after_section_start', $this, $args );
	}

	public function end_controls_section() {
		// Save the current section for the action
		$current_section = $this->_current_section;
		$section_id = $current_section['section'];
		$args = [ 'tab' => $current_section['tab'] ];

		do_action( 'elementor/element/before_section_end', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/before_section_end', $this, $args );

		$this->_current_section = null;

		do_action( 'elementor/element/after_section_end', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/after_section_end', $this, $args );
	}

	public function start_controls_tabs( $tabs_id ) {
		if ( null !== $this->_current_tab ) {
			wp_die( sprintf( 'Elementor: You can\'t start tabs before the end of the previous tabs: `%s`', $this->_current_tab['tabs_wrapper'] ) );
		}

		$this->add_control(
			$tabs_id,
			[
				'type' => Controls_Manager::TABS,
			]
		);

		$this->_current_tab = [
			'tabs_wrapper' => $tabs_id,
		];
	}

	public function end_controls_tabs() {
		$this->_current_tab = null;
	}

	public function start_controls_tab( $tab_id, $args ) {
		if ( ! empty( $this->_current_tab['inner_tab'] ) ) {
			wp_die( sprintf( 'Elementor: You can\'t start a tab before the end of the previous tab: `%s`', $this->_current_tab['inner_tab'] ) );
		}

		$args['type'] = Controls_Manager::TAB;
		$args['tabs_wrapper'] = $this->_current_tab['tabs_wrapper'];

		$this->add_control( $tab_id, $args );

		$this->_current_tab['inner_tab'] = $tab_id;
	}

	public function end_controls_tab() {
		unset( $this->_current_tab['inner_tab'] );
	}

	public final function set_settings( $key, $value = null ) {
		if ( null === $value ) {
			$this->_settings = $key;
		} else {
			$this->_settings[ $key ] = $value;
		}
	}

	protected function _register_controls() {}

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

	protected function render() {}

	protected function get_default_data() {
		return [
			'id' => 0,
			'settings' => [],
			'elements' => [],
			'isInner' => false,
		];
	}

	protected function _get_parsed_settings() {
		$settings = $this->_data['settings'];

		foreach ( $this->get_controls() as $control ) {
			$control_obj = Plugin::$instance->controls_manager->get_control( $control['type'] );

			$settings[ $control['name'] ] = $control_obj->get_value( $control, $settings );
		}

		return $settings;
	}

	protected function _print_content() {
		foreach ( $this->get_children() as $child ) {
			$child->print_element();
		}
	}

	protected function _get_initial_config() {
		return [
			'name' => $this->get_name(),
			'elType' => $this->get_type(),
			'title' => $this->get_title(),
			'controls' => $this->get_controls(),
			'tabs_controls' => $this->get_tabs_controls(),
			'icon' => $this->get_icon(),
			'reload_preview' => $this->is_reload_preview_required(),
		];
	}

	private function _get_child_type( $element_data ) {
		$child_type = $this->_get_default_child_type( $element_data );

		// If it's not a valid widget ( like a deactivated plugin )
		if ( ! $child_type ) {
			return false;
		}

		return apply_filters( 'elementor/element/get_child_type', $child_type, $element_data, $this );
	}

	private function _init_controls() {
		Plugin::$instance->controls_manager->open_stack( $this );

		$this->_register_controls();
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

	private function _init( $data ) {
		$this->_data = array_merge( $this->get_default_data(), $data );
		$this->_id = $data['id'];
		$this->_settings = $this->_get_parsed_settings();
	}

	public function __construct( array $data = [], array $args = null ) {
		if ( $data ) {
		    $this->_is_type_instance = false;
			$this->_init( $data );
		} elseif ( $args ) {
			$this->_default_args = $args;
		}
	}
}
