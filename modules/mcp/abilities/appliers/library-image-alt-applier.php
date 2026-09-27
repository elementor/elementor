<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers;

use Elementor\Modules\AtomicWidgets\PropTypes\Image_Src_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Library images render the attachment's Media Library alt text, so a per-use `alt`
 * sent alongside `src.id` would be persisted but never rendered.
 */
class Library_Image_Alt_Stripper {

	public static function strip( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		if ( self::is_library_image_src( $value ) ) {
			unset( $value['value']['alt'] );

			return $value;
		}

		return array_map( [ self::class, 'strip' ], $value );
	}

	private static function is_library_image_src( array $value ): bool {
		return Image_Src_Prop_Type::get_key() === ( $value['$$type'] ?? null )
			&& ! empty( $value['value']['id'] );
	}
}
