<?php

namespace Elementor\Modules\GlobalClasses\Utils;

use Elementor\Core\Utils\Template_Library_Element_Iterator;
use Elementor\Core\Utils\Template_Library_Import_Export_Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Template_Library_Global_Classes_Element_Transformer {

	public static function rewrite_elements_classes_ids( array $elements, array $id_map ): array {
		if ( empty( $elements ) || empty( $id_map ) ) {
			return $elements;
		}

		return Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( $id_map ) {
				$class_values = $element_data['settings']['classes']['value'] ?? null;

				if ( ! is_array( $class_values ) ) {
					return $element_data;
				}

				$element_data['settings']['classes']['value'] = self::map_class_values( $class_values, $id_map );

				return $element_data;
			}
		);
	}

	public static function flatten_elements_classes( array $elements, array $global_classes, ?array $only_ids = null ): array {
		$items = $global_classes['items'] ?? [];

		if ( empty( $elements ) || empty( $items ) ) {
			return $elements;
		}

		$ids_to_flatten = null !== $only_ids ? array_fill_keys( $only_ids, true ) : null;

		return Template_Library_Element_Iterator::iterate(
			$elements,
			function ( $element_data ) use ( $items, $ids_to_flatten ) {
				$class_values = $element_data['settings']['classes']['value'] ?? null;

				if ( ! is_array( $class_values ) || empty( $class_values ) ) {
					return $element_data;
				}

				[ $updated_values, $element_styles ] = self::flatten_class_values( $class_values, $element_data, $items, $ids_to_flatten );
				$element_data['settings']['classes']['value'] = array_values( array_unique( $updated_values ) );
				$element_data['styles'] = $element_styles;

				return $element_data;
			}
		);
	}

	private static function map_class_values( array $class_values, array $id_map ): array {
		$updated_values = [];

		foreach ( $class_values as $class_id ) {
			if ( ! is_string( $class_id ) || '' === $class_id ) {
				continue;
			}

			$updated_values[] = $id_map[ $class_id ] ?? $class_id;
		}

		return array_values( array_unique( $updated_values ) );
	}

	private static function flatten_class_values( array $class_values, array $element_data, array $items, ?array $ids_to_flatten ): array {
		$updated_values = [];
		$element_styles = $element_data['styles'] ?? [];

		foreach ( $class_values as $class_id ) {
			if ( ! is_string( $class_id ) || '' === $class_id ) {
				continue;
			}

			if ( ! self::should_flatten_class_id( $class_id, $items, $ids_to_flatten ) ) {
				if ( self::is_global_class_id( $class_id ) ) {
					if ( null !== $ids_to_flatten && isset( $items[ $class_id ] ) ) {
						$updated_values[] = $class_id;
					}

					continue;
				}
				$updated_values[] = $class_id;
				continue;
			}

			$global_class = $items[ $class_id ];
			$local_id = self::create_local_class_id( $element_data );
			$element_styles[ $local_id ] = self::build_local_class_style( $local_id, $global_class );
			$updated_values[] = $local_id;
		}

		return [ $updated_values, $element_styles ];
	}

	private static function is_global_class_id( string $class_id ): bool {
		return str_starts_with( $class_id, 'g-' );
	}

	private static function should_flatten_class_id( string $class_id, array $items, ?array $ids_to_flatten ): bool {
		if ( ! isset( $items[ $class_id ] ) ) {
			return false;
		}

		if ( null !== $ids_to_flatten && ! isset( $ids_to_flatten[ $class_id ] ) ) {
			return false;
		}

		return true;
	}

	private static function create_local_class_id( array $element_data ): string {
		return 'e-' . substr( $element_data['id'] ?? '', 0, 8 ) . '-' . Template_Library_Import_Export_Utils::generate_random_string( 7 );
	}

	private static function build_local_class_style( string $local_id, array $global_class ): array {
		return [
			'id' => $local_id,
			'label' => $global_class['label'] ?? 'flattened',
			'type' => 'class',
			'variants' => $global_class['variants'] ?? [],
		];
	}
}
