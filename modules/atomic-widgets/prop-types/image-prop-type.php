<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'image';
	}

	public function validate_value( $value ): void {
		// TODO: Validate the image size against the src.
	}

	/**
	 * @return array<string, Prop_Type>
	 */
	protected static function define_value_schema(): array {
		return Object_Prop_Type::make( [
			'src' => String_Prop_Type::make()->default( Utils::get_placeholder_image_src() ),
			'size' => String_Prop_Type::make()->optional(),
		] );
	}
}
