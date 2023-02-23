<?php

namespace Elementor\Modules\DesignGuidelines\Utils;

use Elementor\Modules\DesignGuidelines\Classes\Element;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Elements_Data_Helper {


	public function get_element_settings( $element ) {
		return $element['settings'];
	}

	public function get_element_id( $element ): ?string {
		return $this->get_element_settings( $element )['_element_id'];
	}

	public function find_element_by_id( $element, $id ) {
		$elements = [ $element ];
		while ( 0 < count( $elements ) ) {
			$current = array_shift( $elements );

			if ( $this->get_element_id( $current ) === $id ) {
				return $current;
			}

			$children = $current['elements'];
			foreach ( $children as $child ) {
				$elements[] = $child;
			}
		}

		return null;
	}

	public function get_element_classes( $element ): array {
		$property_name = $this->get_class_property_name( $element );

		$classes_string = $this->get_element_settings( $element )[ $property_name ];

		if ( ! isset( $classes_string ) ) {
			return [];
		}

		return explode( ' ', $classes_string );
	}

	public function find_elements_by_class( $element, $class_name ): array {
		$elements = [ $element ];
		$found = [];

		while ( 0 < count( $elements ) ) {
			$current = array_shift( $elements );

			$classes = $this->get_element_classes( $current );

			if ( in_array( $class_name, $classes ) ) {
				$found[] = $current;
			}

			$children = $current['elements'];
			foreach ( $children as $child ) {
				$elements[] = $child;
			}
		}

		return $found;
	}

	public function append_in_element( &$element, $model ) {
		$new_element = new Element( $model, $this );

		$element['elements'][] = $new_element->get_model();
	}

	public function get_class_property_name( $element ): string {
		$element_type = $element['elType'];

		return $element_type === 'widget' ? '_css_classes' : 'css_classes';
	}

}

