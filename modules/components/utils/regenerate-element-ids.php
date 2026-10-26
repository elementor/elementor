<?php

namespace Elementor\Modules\Components\Utils;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Regenerate_Element_Ids {
	/**
	 * @return array{elements: array, id_map: array<string, string>}
	 */
	public static function apply( array $elements ): array {
		$id_map = [];
		$elements = self::regenerate( $elements, $id_map );

		return [
			'elements' => $elements,
			'id_map' => $id_map,
		];
	}

	private static function regenerate( array $elements, array &$id_map ): array {
		foreach ( $elements as $index => $element ) {
			if ( ! is_array( $element ) ) {
				continue;
			}

			if ( isset( $element['id'] ) && is_string( $element['id'] ) ) {
				$new_id = self::generate_unique_id( $id_map );
				$id_map[ $element['id'] ] = $new_id;
				$element['id'] = $new_id;
			}

			if ( ! empty( $element['elements'] ) && is_array( $element['elements'] ) ) {
				$element['elements'] = self::regenerate( $element['elements'], $id_map );
			}

			$elements[ $index ] = $element;
		}

		return $elements;
	}

	private static function generate_unique_id( array $id_map ): string {
		do {
			$id = Utils::generate_random_string();
		} while ( in_array( $id, $id_map, true ) );

		return $id;
	}
}
