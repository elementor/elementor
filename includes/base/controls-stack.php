<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

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
	private $_current_section;

	/**
	 * Holds the current tab while render a set of controls tabs
	 *
	 * @var null|array
	 */
	private $_current_tab;

	private $injection_point;

	abstract public function get_name();

	public function get_unique_name() {
		return $this->get_name();
	}

	public function get_id() {
		return $this->_id;
	}

	public static function get_type() {
		return 'stack';
	}

	/**
	 * @param array  $haystack
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

	public function get_current_section() {
		return $this->_current_section;
	}

	public function get_current_tab() {
		return $this->_current_tab;
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

		$settings = $this->get_controls_settings();

		$active_controls = array_reduce(
			array_keys( $controls ), function( $active_controls, $control_key ) use ( $controls, $settings ) {
				$control = $controls[ $control_key ];

				if ( $this->is_control_visible( $control, $settings ) ) {
					$active_controls[ $control_key ] = $control;
				}

				return $active_controls;
			}, []
		);

		return $active_controls;
	}

	public function get_controls_settings() {
		return array_intersect_key( $this->get_settings(), $this->get_controls() );
	}

	public function add_control( $id, array $args, $options = [] ) {
		$default_options = [
			'overwrite' => false,
			'position' => null,
		];

		$options = array_merge( $default_options, $options );

		if ( $options['position'] ) {
			$this->start_injection( $options['position'] );
		}

		if ( $this->injection_point ) {
			$options['index'] = $this->injection_point['index']++;
		}

		if ( empty( $args['type'] ) || ! in_array( $args['type'], [ Controls_Manager::SECTION, Controls_Manager::WP_WIDGET ] ) ) {
			$target_section_args = $this->_current_section;

			$target_tab = $this->_current_tab;

			if ( $this->injection_point ) {
				$target_section_args = $this->injection_point['section'];

				if ( ! empty( $this->injection_point['tab'] ) ) {
					$target_tab = $this->injection_point['tab'];
				}
			}

			if ( null !== $target_section_args ) {
				if ( ! empty( $args['section'] ) || ! empty( $args['tab'] ) ) {
					_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Cannot redeclare control with `tab` or `section` args inside section. - ' . esc_html( $id ), '1.0.0' );
				}

				$args = array_replace_recursive( $target_section_args, $args );

				if ( null !== $target_tab ) {
					$args = array_merge( $args, $target_tab );
				}
			} elseif ( empty( $args['section'] ) && ( ! $options['overwrite'] || is_wp_error( Plugin::$instance->controls_manager->get_control_from_stack( $this->get_unique_name(), $id ) ) ) ) {
				wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Cannot add a control outside of a section (use `start_controls_section`).' );
			}
		}

		if ( $options['position'] ) {
			$this->end_injection();
		}

		unset( $options['position'] );

		return Plugin::$instance->controls_manager->add_control_to_stack( $this, $id, $args, $options );
	}

	public function remove_control( $control_id ) {
		return Plugin::$instance->controls_manager->remove_control_from_stack( $this->get_unique_name(), $control_id );
	}

	public function update_control( $control_id, array $args ) {
		return Plugin::$instance->controls_manager->update_control_in_stack( $this, $control_id, $args );
	}

	final public function get_position_info( array $position ) {
		$default_position = [
			'type' => 'control',
			'at' => 'after',
		];

		if ( ! empty( $position['type'] ) && 'section' === $position['type'] ) {
			$default_position['at'] = 'end';
		}

		$position = array_merge( $default_position, $position );

		if (
			'control' === $position['type'] && in_array( $position['at'], [ 'start', 'end' ] ) ||
			'section' === $position['type'] && in_array( $position['at'], [ 'before', 'after' ] )
		) {
			_doing_it_wrong( __CLASS__ . '::' . __FUNCTION__, 'Invalid position arguments. Use `before` / `after` for control or `start` / `end` for section.', '1.7.0' );

			return false;
		}

		$registered_controls = Plugin::$instance->controls_manager->get_element_stack( $this )['controls'];

		$controls_keys = array_keys( $registered_controls );

		$target_control_index = array_search( $position['of'], $controls_keys );

		if ( false == $target_control_index ) {
			return false;
		}

		$target_section_index = $target_control_index;

		while( Controls_Manager::SECTION !== $registered_controls[ $controls_keys[ $target_section_index ] ]['type'] ) {
			$target_section_index--;
		}

		if ( 'section' === $position['type'] ) {
			$target_control_index++;

			if ( 'end' === $position['at'] ) {
				while( Controls_Manager::SECTION !== $registered_controls[ $controls_keys[ $target_control_index ] ]['type'] ) {
					if ( ++$target_control_index >= count( $registered_controls ) ) {
						break;
					}
				}
			}
		}

		$target_control = $registered_controls[ $controls_keys[ $target_control_index ] ];

		if ( 'after' === $position['at'] ) {
			$target_control_index++;
		}

		$section_id = $registered_controls[ $controls_keys[ $target_section_index ] ]['name'];

		$position_info = [
			'index' => $target_control_index,
			'section' => $this->get_section_args( $section_id ),
		];

		if ( ! empty( $target_control['tabs_wrapper'] ) ) {
			$position_info['tab'] = [
				'tabs_wrapper' => $target_control['tabs_wrapper'],
				'inner_tab' => $target_control['inner_tab'],
			];
		}

		return $position_info;
	}

	final public function add_group_control( $group_name, array $args = [], array $options = [] ) {
		$group = Plugin::$instance->controls_manager->get_control_groups( $group_name );

		if ( ! $group ) {
			wp_die( __CLASS__ . '::' . __FUNCTION__ . ': Group `' . $group_name . '` not found.' );
		}

		$group->add_controls( $this, $args, $options );
	}

	final public function get_scheme_controls() {
		$enabled_schemes = Schemes_Manager::get_enabled_schemes();

		return array_filter(
			$this->get_controls(), function( $control ) use ( $enabled_schemes ) {
				return ( ! empty( $control['scheme'] ) && in_array( $control['scheme']['type'], $enabled_schemes ) );
			}
		);
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
		return array_filter(
			$this->get_active_controls(), function( $control ) {
				return ( isset( $control['prefix_class'] ) );
			}
		);
	}

	final public function get_tabs_controls() {
		$stack = Plugin::$instance->controls_manager->get_element_stack( $this );

		return $stack['tabs'];
	}

	final public function add_responsive_control( $id, array $args, $options = [] ) {
		$args['responsive'] = [];

		$devices = [
			self::RESPONSIVE_DESKTOP,
			self::RESPONSIVE_TABLET,
			self::RESPONSIVE_MOBILE,
		];

		if ( isset( $args['devices'] ) ) {
			$devices = array_intersect( $devices, $args['devices'] );

			$args['responsive']['devices'] = $devices;

			unset( $args['devices'] );
		}

		if ( isset( $args['default'] ) ) {
			$args['desktop_default'] = $args['default'];

			unset( $args['default'] );
		}

		foreach ( $devices as $device_name ) {
			$control_args = $args;

			if ( isset( $control_args['device_args'] ) ) {
				if ( ! empty( $control_args['device_args'][ $device_name ] ) ) {
					$control_args = array_merge( $control_args, $control_args['device_args'][ $device_name ] );
				}

				unset( $control_args['device_args'] );
			}

			if ( ! empty( $args['prefix_class'] ) ) {
				$device_to_replace = self::RESPONSIVE_DESKTOP === $device_name ? '' : '-' . $device_name;

				$control_args['prefix_class'] = sprintf( $args['prefix_class'], $device_to_replace );
			}

			$control_args['responsive']['max'] = $device_name;

			if ( isset( $control_args['min_affected_device'] ) ) {
				if ( ! empty( $control_args['min_affected_device'][ $device_name ] ) ) {
					$control_args['responsive']['min'] = $control_args['min_affected_device'][ $device_name ];
				}

				unset( $control_args['min_affected_device'] );
			}

			if ( isset( $control_args[ $device_name . '_default' ] ) ) {
				$control_args['default'] = $control_args[ $device_name . '_default' ];
			}

			unset( $control_args['desktop_default'] );
			unset( $control_args['tablet_default'] );
			unset( $control_args['mobile_default'] );

			$id_suffix = self::RESPONSIVE_DESKTOP === $device_name ? '' : '_' . $device_name;

			if ( ! empty( $options['overwrite'] ) ) {
				$this->update_control( $id . $id_suffix, $control_args );
			} else {
				$this->add_control( $id . $id_suffix, $control_args, $options );
			}
		}
	}

	final public function update_responsive_control( $id, array $args ) {
		$this->add_responsive_control( $id, $args, [ 'overwrite' => true ] );
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

	final public function get_frontend_settings_keys() {
		$controls = [];

		foreach ( $this->get_controls() as $control ) {
			if ( ! empty( $control['frontend_available'] ) ) {
				$controls[] = $control['name'];
			}
		}

		return $controls;
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

	public function get_frontend_settings() {
		$frontend_settings = array_intersect_key( $this->get_active_settings(), array_flip( $this->get_frontend_settings_keys() ) );

		foreach ( $frontend_settings as $key => $setting ) {
			if ( in_array( $setting, [ null, '' ], true ) ) {
				unset( $frontend_settings[ $key ] );
			}
		}

		return $frontend_settings;
	}

	public function filter_controls_settings( callable $callback, array $settings = [], array $controls = [] ) {
		if ( ! $settings ) {
			$settings = $this->get_settings();
		}

		if ( ! $controls ) {
			$controls = $this->get_controls();
		}

		return array_reduce(
			array_keys( $settings ), function( $filtered_settings, $setting_key ) use ( $controls, $settings, $callback ) {
				if ( isset( $controls[ $setting_key ] ) ) {
					$result = $callback( $settings[ $setting_key ], $controls[ $setting_key ] );

					if ( null !== $result ) {
						$filtered_settings[ $setting_key ] = $result;
					}
				}

				return $filtered_settings;
			}, []
		);
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

			if ( ! isset( $values[ $pure_condition_key ] ) || null === $values[ $pure_condition_key ] ) {
				return false;
			}

			$instance_value = $values[ $pure_condition_key ];

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
			 */
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
			wp_die( sprintf( 'Elementor: You can\'t start a section before the end of the previous section: `%s`', $this->_current_section['section'] ) ); // XSS ok.
		}

		$this->_current_section = $this->get_section_args( $section_id );

		if ( $this->injection_point ) {
			$this->injection_point['section'] = $this->_current_section;
		}

		do_action( 'elementor/element/after_section_start', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/after_section_start', $this, $args );
	}

	public function end_controls_section() {
		// Save the current section for the action.
		$current_section = $this->_current_section;
		$section_id = $current_section['section'];
		$args = [
			'tab' => $current_section['tab'],
		];

		do_action( 'elementor/element/before_section_end', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/before_section_end', $this, $args );

		$this->_current_section = null;

		do_action( 'elementor/element/after_section_end', $this, $section_id, $args );
		do_action( 'elementor/element/' . $this->get_name() . '/' . $section_id . '/after_section_end', $this, $args );
	}

	public function start_controls_tabs( $tabs_id ) {
		if ( null !== $this->_current_tab ) {
			wp_die( sprintf( 'Elementor: You can\'t start tabs before the end of the previous tabs: `%s`', $this->_current_tab['tabs_wrapper'] ) ); // XSS ok.
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

		if ( $this->injection_point ) {
			$this->injection_point['tab'] = $this->_current_tab;
		}
	}

	public function end_controls_tabs() {
		$this->_current_tab = null;
	}

	public function start_controls_tab( $tab_id, $args ) {
		if ( ! empty( $this->_current_tab['inner_tab'] ) ) {
			wp_die( sprintf( 'Elementor: You can\'t start a tab before the end of the previous tab: `%s`', $this->_current_tab['inner_tab'] ) ); // XSS ok.
		}

		$args['type'] = Controls_Manager::TAB;
		$args['tabs_wrapper'] = $this->_current_tab['tabs_wrapper'];

		$this->add_control( $tab_id, $args );

		$this->_current_tab['inner_tab'] = $tab_id;

		if ( $this->injection_point ) {
			$this->injection_point['tab']['inner_tab'] = $this->_current_tab['inner_tab'];
		}
	}

	public function end_controls_tab() {
		unset( $this->_current_tab['inner_tab'] );
	}

	final public function start_injection( array $position ) {
		if ( $this->injection_point ) {
			wp_die( 'A controls injection is already opened. Please close current injection before starting a new one (use `end_injection`).' );
		}

		$this->injection_point = $this->get_position_info( $position );
	}

	final public function end_injection() {
		$this->injection_point = null;
	}

	final public function set_settings( $key, $value = null ) {
		// strict check if override all settings.
		if ( is_array( $key ) ) {
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

			if ( ! $control_obj instanceof Base_Data_Control ) {
				continue;
			}

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
		$section_control = $this->get_controls( $section_id );

		$section_args_keys = [ 'tab', 'condition' ];

		$args = array_intersect_key( $section_control, array_flip( $section_args_keys ) );

		$args['section'] = $section_id;

		return $args;
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

	/**
	 * @param array $data - Required for a normal instance, It's optional only for internal `type instance`.
	 **/
	public function __construct( array $data = [] ) {
		if ( $data ) {
			$this->_init( $data );
		}
	}
}
