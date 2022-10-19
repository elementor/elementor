<?php
namespace Elementor\Modules\KitElementsDefaults\Utils;

use Elementor\Element_Base;
use Elementor\Elements_Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Settings_Sanitizer {

	private $elements_manager;

	private $widget_types;

	public function __construct( Elements_Manager $elements_manager, $widget_types = [] ) {
		$this->elements_manager = $elements_manager;
		$this->widget_types = $widget_types;
	}

	public function sanitize( $settings, $type ) {
		$element = $this->get_element_instance( $type );

		if ( ! $element ) {
			return [];
		}

		return $this->remove_invalid_settings( $element, $settings );
	}

	private function remove_invalid_settings( Element_Base $element, $settings ) {
		$valid_element_controls = $element->get_controls();

		// Remove the controls that don't exist in the element.
		return array_intersect_key(
			$settings,
			$valid_element_controls
		);
	}

	private function is_widget( $type ) {
		return in_array( $type, $this->widget_types, true );
	}

	private function get_element_instance( $type ) {
		$args = $this->is_widget( $type )
			? [
				'elType' => 'widget',
				'widgetType' => $type,
				'id' => '0',
			] : [
				'elType' => $type,
				'id' => '0',
			];

		return $this->elements_manager->create_element_instance( $args );
	}
}
