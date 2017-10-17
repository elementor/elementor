<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Group_Control_Base implements Group_Control_Interface {

	private $args = [];

	private $options;

	final public function get_options( $option ) {
		if ( null === $this->options ) {
			$this->init_options();
		}

		if ( $option ) {
			if ( isset( $this->options[ $option ] ) ) {
				return $this->options[ $option ];
			}

			return null;
		}

		return $this->options;
	}

	final public function add_controls( Controls_Stack $element, array $user_args, array $options = [] ) {
		$this->init_args( $user_args );

		// Filter witch controls to display
		$filtered_fields = $this->filter_fields();

		$filtered_fields = $this->prepare_fields( $filtered_fields );

		// For php < 7
		reset( $filtered_fields );

		$filtered_fields = $this->set_popup( $filtered_fields );

		if ( isset( $this->args['separator'] ) ) {
			$filtered_fields[ key( $filtered_fields ) ]['separator'] = $this->args['separator'];
		}

		$has_injection = false;

		if ( ! empty( $options['position'] ) ) {
			$has_injection = true;

			$element->start_injection( $options['position'] );

			unset( $options['position'] );
		}

		foreach ( $filtered_fields as $field_id => $field_args ) {
			// Add the global group args to the control
			$field_args = $this->add_group_args_to_field( $field_id, $field_args );

			// Register the control
			$id = $this->get_controls_prefix() . $field_id;

			if ( ! empty( $field_args['responsive'] ) ) {
				unset( $field_args['responsive'] );

				$element->add_responsive_control( $id, $field_args, $options );
			} else {
				$element->add_control( $id , $field_args, $options );
			}
		}

		if ( $has_injection ) {
			$element->end_injection();
		}
	}

	final public function get_args() {
		return $this->args;
	}

	final public function get_fields() {
		// TODO: Temp - compatibility for posts group
		if ( method_exists( $this, '_get_controls' ) ) {
			return $this->_get_controls( $this->get_args() );
		}

		if ( null === static::$fields ) {
			static::$fields = $this->init_fields();
		}

		return static::$fields;
	}

	public function get_controls_prefix() {
		return $this->args['name'] . '_';
	}

	public function get_base_group_classes() {
		return 'elementor-group-control-' . static::get_type() . ' elementor-group-control';
	}

	protected abstract function init_fields();

	protected function get_default_options() {
		return [];
	}

	protected function get_child_default_args() {
		return [];
	}

	protected function filter_fields() {
		$args = $this->get_args();

		$fields = $this->get_fields();

		if ( ! empty( $args['include'] ) ) {
			$fields = array_intersect_key( $fields, array_flip( $args['include'] ) );
		}

		if ( ! empty( $args['exclude'] ) ) {
			$fields = array_diff_key( $fields, array_flip( $args['exclude'] ) );
		}

		return $fields;
	}

	protected function add_group_args_to_field( $control_id, $field_args ) {
		$args = $this->get_args();

		if ( ! empty( $args['tab'] ) ) {
			$field_args['tab'] = $args['tab'];
		}

		if ( ! empty( $args['section'] ) ) {
			$field_args['section'] = $args['section'];
		}

		$field_args['classes'] = $this->get_base_group_classes() . ' elementor-group-control-' . $control_id;

		if ( ! empty( $args['condition'] ) ) {
			if ( empty( $field_args['condition'] ) ) {
				$field_args['condition'] = [];
			}

			$field_args['condition'] += $args['condition'];
		}

		return $field_args;
	}

	protected function prepare_fields( $fields ) {
		foreach ( $fields as $field_key => &$field ) {
			if ( ! empty( $field['condition'] ) ) {
				$field = $this->add_conditions_prefix( $field );
			}

			if ( ! empty( $field['selectors'] ) ) {
				$field['selectors'] = $this->handle_selectors( $field['selectors'] );
			}

			if ( isset( $this->args['fields_options']['__all'] ) ) {
				$field = array_merge( $field, $this->args['fields_options']['__all'] );
			}

			if ( isset( $this->args['fields_options'][ $field_key ] ) ) {
				$field = array_merge( $field, $this->args['fields_options'][ $field_key ] );
			}
		}

		return $fields;
	}

	private function init_options() {
		$default_options = [
			'popup' => [
				'title' => 'Error: Popup title not set',
				'starter_name' => 'popup_starter',
				'starter_value' => 'custom',
				'starter_title' => '',
				'toggle_type' => 'switcher',
				'toggle_title' => __( 'Set', 'elementor' ),
			],
		];

		$this->options = array_replace_recursive( $default_options, $this->get_default_options() );
	}

	private function init_args( $args ) {
		$this->args = array_merge( $this->get_default_args(), $this->get_child_default_args(), $args );
	}

	private function get_default_args() {
		return [
			'default' => '',
			'selector' => '{{WRAPPER}}',
			'fields_options' => [],
		];
	}

	private function add_conditions_prefix( $field ) {
		$controls_prefix = $this->get_controls_prefix();

		$prefixed_condition_keys = array_map(
			function( $key ) use ( $controls_prefix ) {
				return $controls_prefix . $key;
			},
			array_keys( $field['condition'] )
		);

		$field['condition'] = array_combine(
			$prefixed_condition_keys,
			$field['condition']
		);

		return $field;
	}

	private function handle_selectors( $selectors ) {
		$args = $this->get_args();

		$selectors = array_combine(
			array_map(
				function( $key ) use ( $args ) {
						return str_replace( '{{SELECTOR}}', $args['selector'], $key );
				}, array_keys( $selectors )
			),
			$selectors
		);

		if ( ! $selectors ) {
			return $selectors;
		}

		$controls_prefix = $this->get_controls_prefix();

		foreach ( $selectors as &$selector ) {
			$selector = preg_replace_callback(
				'/(?:\{\{)\K[^.}]+(?=\.[^}]*}})/', function( $matches ) use ( $controls_prefix ) {
					return $controls_prefix . $matches[0];
				}, $selector
			);
		}

		return $selectors;
	}

	private function set_popup( array $fields ) {
		$popup_options = $this->get_options( 'popup' );

		$fields[ key( $fields ) ]['popup'] = [
			'start' => true,
			'title' => $popup_options['title'],
		];

		$popup_starter_field = [
			$popup_options['starter_name'] => [
				'type' => Controls_Manager::POPUP_STARTER,
				'label' => $popup_options['starter_title'],
				'toggle_type' => $popup_options['toggle_type'],
				'toggle_title' => $popup_options['toggle_title'],
				'return_value' => $popup_options['starter_value'],
			]
		];

		$fields = $popup_starter_field + $fields;

		end( $fields );

		$fields[ key( $fields ) ]['popup'] = [ 'end' => true ];

		reset( $fields );

		return $fields;
	}
}
