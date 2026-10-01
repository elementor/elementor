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

	const WARNING_CODE = 'image_alt_ignored';

	public static function strip( $value ) {
		if ( ! is_array( $value ) ) {
			return $value;
		}

		if ( self::is_library_image_src_with_alt( $value ) ) {
			unset( $value['value']['alt'] );

			return $value;
		}

		return array_map( [ self::class, 'strip' ], $value );
	}

	public static function warning_message( string $prop_name ): string {
		return sprintf(
			'Property "%s": "alt" is ignored for Media Library images (src.id) and was not saved. The image renders the attachment\'s Alt Text from the Media Library; if it is missing or inaccurate, ask the user to update it there.',
			$prop_name
		);
	}

	private static function is_library_image_src_with_alt( array $value ): bool {
		return Image_Src_Prop_Type::get_key() === ( $value['$$type'] ?? null )
			&& ! empty( $value['value']['id'] )
			&& isset( $value['value']['alt'] );
	}
}
