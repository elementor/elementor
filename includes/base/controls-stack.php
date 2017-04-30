<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Controls_Stack {

	const RESPONSIVE_DESKTOP = 'desktop';
	const RESPONSIVE_TABLET = 'tablet';
	const RESPONSIVE_MOBILE = 'mobile';

	private $_id;
	private $_settings;
	private $_data;
	private $_config;

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

	public function get_id() {
		return $this->_id;
	}

	abstract public function get_name();

	public static function get_type() {
		return 'stack';
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

	public function get_controls( $control_id = null ) {
		$stack = Plugin::$instance->controls_manager->get_element_stack( $this );

		if ( null === $stack ) {
			$this->_init_controls();

			return $this->get_controls();
		}

		return self::_get_items( $stack['controls'], $control_id );
	}

	public function get_active_controls() {
		$controls = $this->get_controls();

		$settings = $this->get_settings();

		$active_controls = array_reduce( array_keys( $controls ), function ( $active_controls, $control_key ) use ( $controls, $settings ) {
			$control = $controls[ $control_key ];

			if ( $this->is_control_visible( $control, $settings ) ) {
				$active_controls[ $control_key ] = $control;
			}

			return $active_controls;
		}, [] );

		return $active_controls;
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

	final public function add_group_control( $group_name, array $args = [] ) {
		$group = Plugin::$instance->controls_manager->get_control_groups( $group_name );

		if ( ! $group ) {
			wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Group `' . $group_name . '` not found.' );
		}

		$group->add_controls( $this, $args );
	}

	final public function get_scheme_controls() {
		$enabled_schemes = Schemes_Manager::get_enabled_schemes();

		return array_filter( $this->get_controls(), function( $control ) use ( $enabled_schemes ) {
			return ( ! empty( $control['scheme'] ) && in_array( $control['scheme']['type'], $enabled_schemes ) );
		} );
	}

	final public function get_style_controls( $controls = null ) {
		if ( null === $controls ) {
			$controls = $this->get_active_controls();
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

	final public function get_class_controls() {
		return array_filter( $this->get_active_controls(), function( $control ) {
			return ( isset( $control['prefix_class'] ) );
		} );
	}

	final public function get_tabs_controls() {
		$stack = Plugin::$instance->controls_manager->get_element_stack( $this );

		return $stack['tabs'];
	}

	final public function add_responsive_control( $id, array $args, $overwrite = false ) {
		$devices = [
			self::RESPONSIVE_DESKTOP,
			self::RESPONSIVE_TABLET,
			self::RESPONSIVE_MOBILE,
		];

		if ( isset( $args['default'] ) ) {
			$args['desktop_default'] = $args['default'];

			unset( $args['default'] );
		}

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

			$this->add_control( $id . $id_suffix, $control_args, $overwrite );
		}
	}

	final public function update_responsive_control( $id, array $args ) {
		$this->add_responsive_control( $id, $args, true );
	}

	final public function remove_responsive_control( $id ) {
		$devices = [
			self::RESPONSIVE_DESKTOP,
			self::RESPONSIVE_TABLET,
			self::RESPONSIVE_MOBILE,
		];

		foreach ( $devices as $device_name ) {
			$id_suffix = self::RESPONSIVE_DESKTOP === $device_name ? '' : '_' . $device_name;

			$this->remove_control( $id . $id_suffix );
		}
	}

	final public function get_class_name() {
		return get_called_class();
	}

	final public function get_config() {
		if ( null === $this->_config ) {
			$this->_config = $this->_get_initial_config();
		}

		return $this->_config;
	}

	public function get_data( $item = null ) {
		return self::_get_items( $this->_data, $item );
	}

	public function get_settings( $setting = null ) {
		return self::_get_items( $this->_settings, $setting );
	}

	public function get_active_settings() {
		$settings = $this->get_settings();

		$active_settings = array_intersect_key( $settings, $this->get_active_controls() );

		$settings_mask = array_fill_keys( array_keys( $settings ), null );

		return array_merge( $settings_mask, $active_settings );
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

			/**
			 * If the $condition_value is a non empty array - check if the $condition_value contains the $instance_value,
			 * If the $instance_value is a non empty array - check if the $instance_value contains the $condition_value
			 * otherwise check if they are equal. ( and give the ability to check if the value is an empty array )
			 **/
			if ( is_array( $condition_value ) && ! empty( $condition_value ) ) {
				$is_contains = in_array( $instance_value, $condition_value );
			} elseif ( is_array( $instance_value ) && ! empty( $instance_value ) ) {
				$is_contains = in_array( $condition_value, $instance_value );
			} else {
				$is_contains = $instance_value === $condition_value;
			}

			if ( $is_negative_condition && $is_contains || ! $is_negative_condition && ! $is_contains ) {
				return false;
			}
		}

		return true;
	}

	public function start_controls_section( $section_id, array $args ) {
		do_action( 'elementor/element/before_section_start', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/before_section_start', $this, $args );

		$args['type'] = Controls_Manager::SECTION;

		$this->add_control( $section_id, $args );

		if ( null !== $this->_current_section ) {
			wp_die( sprintf( 'Elementor: You can\'t start a section before the end of the previous section: `%s`', $this->_current_section['section'] ) );
		}

		$this->_current_section = $this->get_section_args( $section_id );

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

	final public function set_settings( $key, $value = null ) {
		if ( null === $value ) {
			$this->_settings = $key;
		} else {
			$this->_settings[ $key ] = $value;
		}
	}

	protected function _register_controls() {}

	protected function get_default_data() {
		return [
			'id' => 0,
			'settings' => [],
		];
	}

	protected function _get_parsed_settings() {
		$settings = $this->_data['settings'];

		foreach ( $this->get_controls() as $control ) {
			$control_obj = Plugin::$instance->controls_manager->get_control( $control['type'] );

			$control = array_merge( $control, $control_obj->get_settings() );

			$settings[ $control['name'] ] = $control_obj->get_value( $control, $settings );
		}

		return $settings;
	}

	protected function _get_initial_config() {
		return [
			'controls' => $this->get_controls(),
			'tabs_controls' => $this->get_tabs_controls(),
		];
	}

	protected function get_section_args( $section_id ) {
		return [
			'section' => $section_id,
			'tab' => $this->get_controls( $section_id )['tab'],
		];
	}

	private function _init_controls() {
		Plugin::$instance->controls_manager->open_stack( $this );

		$this->_register_controls();
	}

	protected function _init( $data ) {
		$this->_data = array_merge( $this->get_default_data(), $data );

		$this->_id = $data['id'];

		$this->_settings = $this->_get_parsed_settings();
	}

	public function __construct( array $data = [] ) {
		if ( $data ) {
			$this->_init( $data );
		}
	}
}
