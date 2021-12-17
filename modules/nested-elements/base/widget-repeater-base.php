<?php
namespace Elementor\Modules\NestedElements\Base;

use Elementor\Plugin;
use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Widget_Repeater_Base extends Widget_Base {

	abstract protected function get_default_children();

	abstract protected function get_default_repeater_title_setting();

	protected function get_default_children_title() {
		return __( 'Item #%d', 'elementor' );
	}

	protected function get_default_children_placeholder() {
		// Empty string, means will be added at the end.
		return '';
	}

	protected function _get_default_child_type( array $element_data ) {
		if ( ! empty( $element_data['widgetType'] ) ) {
			Plugin::$instance->widgets_manager->get_widget_types( $element_data['widgetType'] );
		}

		return Plugin::$instance->elements_manager->get_element_types( $element_data['elType'] );
	}

	protected function get_initial_config() {
		$result = parent::get_initial_config();

		$default_children = [];
		$default_children['elements'] = $this->get_default_children();
		$default_children['elements_title'] = $this->get_default_children_title();
		$default_children['elements_placeholder_selector'] = $this->get_default_children_placeholder();
		$default_children['repeater_title_setting'] = $this->get_default_repeater_title_setting();

		$result['support_nesting'] = true;
		$result['default_children'] = $default_children;

		return $result;
	}

	public function get_raw_data( $with_html_content = false ) {
		$elements = [];
		$data = $this->get_data();

		$children = $this->get_children();

		foreach ( $children as $child ) {
			$child_raw_data = $child->get_raw_data( $with_html_content );

			$elements[] = $child_raw_data;
		}

		return [
			'id' => $this->get_id(),
			'elType' => $data['elType'],
			'widgetType' => $data['widgetType'],
			'settings' => $data['settings'],
			'elements' => $elements,
		];
	}

	public function print_children( $index ) {
		$children = $this->get_children();

		if ( ! empty( $children[ $index ] ) ) {
			$children[ $index ]->print_element();
		}
	}
}
