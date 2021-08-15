<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Web_Component_Base extends Widget_Base {

	public function get_custom_element_tag_name() {
		return $this->get_name();
	}

	public function get_categories() {
		return [ 'web-components' ];
	}

	protected function get_component_props( $slot = 'default' ) {
		$props = [];

		foreach ( $this->get_controls() as $control_name => $control_args ) {
			if ( isset( $control_args['component_prop'] ) && $slot === $control_args['component_prop'] ) {
				$props[ $control_name ] = $slot;
			}
		}

		return $props;
	}

	private $slots_map = [];

	protected function add_slot( $slot_name, $slot_data ) {
		$this->slots_map[ $slot_name ] = $slot_data;
	}

	protected function get_slots_data( $slot = false ) {
		$slots_map = $this->slots_map;

		if ( $slot ) {
			return isset( $slots_map[ $slot ] ) ? $slots_map[ $slot ] : false;
		}

		return $slots_map;
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$component_name = $this->get_custom_element_tag_name();
		$props = $this->get_component_props();

		foreach ( $props as $prop => $element_name ) {
			if ( 'default' === $element_name && ! empty( $settings[ $prop ] ) ) {
				$this->add_render_attribute( $component_name, $prop, $settings[ $prop ] );
			}
		}

		$attributes = ' ' . $this->get_render_attribute_string( $component_name );
		$content = $this->render_slotted_nodes();

		echo '<' . $component_name . $attributes . '>' . $content . '</' . $component_name . '>';
	}

	protected function render_slotted_nodes() {
		$this->register_slots();
		$slots = $this->get_slots_data();
		$nodes = [];

		foreach ( $slots as $slot_name => $slot_data ) {
			$nodes[] = $this->render_node( $slot_name, $slot_data );
		}

		return implode( '', $nodes );
	}

	protected function render_node( $slot_name, $slot_data ) {
		$node_type = isset( $slot_data['node_type'] ) ? $slot_data['node_type'] : 'span';
		$tag_name = $node_type;
		$content = $slot_data['content'];
		$prop_controls = $this->get_component_props( $slot_name );

		if ( 'none' === $node_type ) {
			return $content;
		}

		foreach ( $prop_controls as $control_name => $slot ) {
			if ( $slot_name === $slot && ! empty( $settings[ $control_name ] ) ) {
				$this->add_render_attribute( $slot_name, $control_name, $settings[ $control_name ] );
			}
		}

		$this->add_render_attribute( $slot_name, 'slot', $slot_name );

		$attributes = ' ' . $this->get_render_attribute_string( $slot_name );

		return '<' . $tag_name . $attributes . '>' . $content . '</' . $tag_name . '>';
	}

	protected function register_slots() {}
}
