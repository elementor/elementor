<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

abstract class Group_Control_Base implements Group_Control_Interface {

	private $_args = [];

	public function get_controls_prefix() {
		return $this->get_args()['name'] . '_';
	}

	public function get_base_group_classes() {
		return 'elementor-group-control-' . static::get_type() . ' elementor-group-control';
	}

	final public function add_controls( Element_Base $element, array $user_args ) {
		$this->_init_args( $user_args );

		// Filter witch controls to display
		$filtered_controls = $this->_filter_controls();

		// Add prefixes to all control conditions
		$filtered_controls = $this->add_prefixes( $filtered_controls );

		foreach ( $filtered_controls as $control_id => $control_args ) {
			// Add the global group args to the control
			$control_args = $this->_add_group_args_to_control( $control_id, $control_args );

			// Register the control
			$id = $this->get_controls_prefix() . $control_id;

			if ( ! empty( $control_args['responsive'] ) ) {
				unset( $control_args['responsive'] );

				$element->add_responsive_control( $id, $control_args );
			} else {
				$element->add_control( $id , $control_args );
			}
		}
	}

	final public function get_args() {
		return $this->_args;
	}

	protected function _get_child_default_args() {
		return [];
	}

	abstract protected function _get_controls( $args );

	private function _get_default_args() {
		return [
			'default' => '',
			'selector' => '{{WRAPPER}}',
			'fields' => 'all',
		];
	}

	private function _init_args( $args ) {
		$this->_args = array_merge( $this->_get_default_args(), $this->_get_child_default_args(), $args );
	}

	private function _filter_controls() {
		$args = $this->get_args();

		$controls = $this->_get_controls( $args );

		if ( ! is_array( $args['fields'] ) ) {
			return $controls;
		}

		$filtered_controls = array_intersect_key( $controls, array_flip( $args['fields'] ) );

		// Include all condition depended controls
		foreach ( $filtered_controls as $control ) {
			if ( empty( $control['condition'] ) ) {
				continue;
			}

			$depended_controls = array_intersect_key( $controls, $control['condition'] );
			$filtered_controls = array_merge( $filtered_controls, $depended_controls );
			$filtered_controls = array_intersect_key( $controls, $filtered_controls );
		}

		return $filtered_controls;
	}

	private function add_conditions_prefix( $control ) {
		$prefixed_condition_keys = array_map(
			function ( $key ) {
				return $this->get_controls_prefix() . $key;
			},
			array_keys( $control['condition'] )
		);

		$control['condition'] = array_combine(
			$prefixed_condition_keys,
			$control['condition']
		);

		return $control;
	}

	private function add_selectors_prefix( $control ) {
		foreach ( $control['selectors'] as &$selector ) {
			$selector = preg_replace_callback( '/(?:\{\{)\K[^.}]+(?=\.[^}]*}})/', function ( $matches ) {
				return $this->get_controls_prefix() . $matches[0];
			}, $selector );
		}

		return $control;
	}

	private function add_prefixes( $controls ) {
		foreach ( $controls as &$control ) {
			if ( ! empty( $control['condition'] ) ) {
				$control = $this->add_conditions_prefix( $control );
			}

			if ( ! empty( $control['selectors'] ) ) {
				$control = $this->add_selectors_prefix( $control );
			}
		}

		return $controls;
	}

	protected function _add_group_args_to_control( $control_id, $control_args ) {
		$args = $this->get_args();

		if ( ! empty( $args['tab'] ) ) {
			$control_args['tab'] = $args['tab'];
		}

		if ( ! empty( $args['section'] ) ) {
			$control_args['section'] = $args['section'];
		}

		$control_args['classes'] = $this->get_base_group_classes() . ' elementor-group-control-' . $control_id;

		if ( ! empty( $args['condition'] ) ) {
			if ( empty( $control_args['condition'] ) )
				$control_args['condition'] = [];

			$control_args['condition'] += $args['condition'];
		}

		return $control_args;
	}
}
