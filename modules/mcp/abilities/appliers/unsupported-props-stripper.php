<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Unsupported_Props_Stripper {

	/**
	 * @return array{value: mixed, stripped_keys: string[]}
	 */
	public static function strip( $value ): array {
		$stripped_keys = [];
		$stripped_value = self::strip_recursive( $value, $stripped_keys );

		return [
			'value' => $stripped_value,
			'stripped_keys' => array_values( array_unique( $stripped_keys ) ),
		];
	}

	private static function strip_recursive( $value, array &$stripped_keys ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		if ( self::is_image_src( $value ) && is_array( $value['value'] ?? null ) ) {
			foreach ( Image_Src_Prop_Type::get_unsupported_keys( $value['value'] ) as $key ) {
				unset( $value['value'][ $key ] );
				$stripped_keys[] = $key;
			}

			return $value;
		}

		foreach ( $value as $key => $item ) {
			$value[ $key ] = self::strip_recursive( $item, $stripped_keys );
		}

		return $value;
	}

	private static function is_image_src( array $value ): bool {
		return Image_Src_Prop_Type::get_key() === ( $value['$$type'] ?? null );
	}
}
