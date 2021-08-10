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

	public function render_content() {
		do_action( 'elementor/widget/before_render_content', $this );
		ob_start();
		$this->render_by_mode();
		$widget_content = ob_get_clean();

		if ( empty( $widget_content ) ) {
			return;
		}

		if ( $this->is_widget_first_render() ) {
			$this->register_runtime_widget( $this->get_group_name() );
			$this->print_widget_css();
		}

		$widget_content = apply_filters( 'elementor/widget/render_content', $widget_content, $this );

		echo $widget_content;
	}

	protected function get_slots_dictionary() {
		return [];
	}

	protected function render() {
		$settings = $this->get_settings_for_display();
		$element_name = $this->get_custom_element_tag_name();
		$props = [];
		$slots = [];

		foreach ( $this->get_controls() as $control_name => $control_args ) {
			if ( isset( $control_args['component_prop'] ) ) {
				$props[] = $control_name;
			}
			if ( isset( $control_args['component_slot'] ) ) {
				$slots[ $control_args['component_slot'] ] = $control_name;
			}
		}

		if ( isset( $slots['default'] ) && ! $settings[ $slots['default'] ] ) {
			return;
		}

		foreach ( $props as $prop ) {
			if ( ! empty( $settings[ $prop ] ) ) {
				$this->add_render_attribute( $element_name, $prop, $settings[ $prop ] );
			}
		}

		$element = sprintf(
			'<%1s %2$s>%3$s</%1s>',
			$element_name,
			$this->get_render_attribute_string( $element_name ),
			$this->render_slots( $slots )
		);

		echo $element;
	}

	protected function render_slots( $slots ) {
		$content = '';
		foreach ( $slots as $name => $control_name ) {
			$content .= $this->render_slot( $control_name, $name );
		}

		return $content;
	}

	protected function render_slot( $control_name, $slot_name = false ) {
		$settings = $this->get_settings_for_display();
		$slot_tag_name = 'a';
		$slot_content = $settings[ $control_name ];

		$slot_element = '<' . $slot_tag_name;
		if ( ! 'default' === $slot_name ) {
			$slot_element .= ' slot="' . $slot_name . '"';
		}
		$slot_element .= '>';
		$slot_element .= $slot_content;
		$slot_element .= '</' . $slot_tag_name . '>';

		return $slot_element;
	}
}
