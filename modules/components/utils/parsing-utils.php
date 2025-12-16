<?php
namespace Elementor\Modules\Components\Utils;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Parsing_Utils {
	public static function get_prop_type( string $el_type, string $widget_type, string $prop_key ): Prop_Type {
		$element = Plugin::$instance->elements_manager->get_element( $el_type, $widget_type );

		if ( ! $element ) {
			throw new \Exception( esc_html( "Invalid element: Element type $el_type with widget type $widget_type is not registered." ) );
		}

		$element_instance = new $element();

		/** @var Atomic_Element_Base | Atomic_Widget_Base $element_instance */
		if ( ! Utils::is_atomic( $element_instance ) ) {
			throw new \Exception( esc_html( "Invalid element: Element type $el_type with widget type $widget_type is not an atomic element/widget." ) );
		}

		$props_schema = $element_instance->get_props_schema();

		if ( ! isset( $props_schema[ $prop_key ] ) ) {
			throw new \Exception( esc_html( "Prop key '$prop_key' does not exist in the schema of element '{$element_instance->get_element_type()}'." ) );
		}

		return $props_schema[ $prop_key ];
	}

	public static function get_duplicates( array $array ): array {
		$duplicates = [];
		$seen = [];

		foreach ( $array as $item ) {
			if ( in_array( $item, $seen, true ) ) {
				if ( ! in_array( $item, $duplicates, true ) ) {
					$duplicates[] = $item;
				}
			} else {
				$seen[] = $item;
			}
		}

		return $duplicates;
	}
}
