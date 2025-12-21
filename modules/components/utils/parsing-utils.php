<?php
namespace Elementor\Modules\Components\Utils;

use Elementor\Plugin;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Utils\Utils;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Parsing_Utils {
	public static function get_prop_type( string $el_type, string $widget_type, array $path ): Prop_Type {
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

		return self::get_prop_type_by_path( $props_schema, $path, $element_instance->get_element_type() );
	}

	private static function get_prop_type_by_path( array $schema, array $path, string $prev_path_items ): Prop_Type {
		$first_path_item = $path[0];

		if ( ! isset( $schema[ $first_path_item['key'] ] ) ) {
			throw new \Exception( esc_html( 'Prop key ' . $first_path_item['key'] . ' does not exist in the schema' . $prev_path_items ) );
		}

		$first_path_item_prop_type = $schema[ $first_path_item['key'] ];

		if ( count( $path ) === 1 ) {
			return $first_path_item_prop_type;
		}

		if ( $first_path_item_prop_type instanceof Union_Prop_Type ) {
			$first_path_item_prop_type = $first_path_item_prop_type->get_prop_type( $first_path_item['$$type'] );
		}

		if ( ( ! $first_path_item_prop_type instanceof Object_Prop_Type ) && ( ! $first_path_item_prop_type instanceof Array_Prop_Type ) ) {
			throw new \Exception( esc_html( 'Prop type path not found: ' . $prev_path_items . '.' . $first_path_item['key'] . '.' . $path[1]['key'] . ' : Only Object and Array can have nested prop types.' ) );
		}

		if ( $first_path_item_prop_type instanceof Object_Prop_Type ) {
			$next_item_schema = $first_path_item_prop_type->get_shape();
		}

		if ( $first_path_item_prop_type instanceof Array_Prop_Type ) {
			$next_item_schema = [ $path[1]['key'] => $first_path_item_prop_type->get_item_type() ];
		}

		return self::get_prop_type_by_path( $next_item_schema, array_slice( $path, 1 ), $prev_path_items . '.' . $first_path_item['key'] );
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
