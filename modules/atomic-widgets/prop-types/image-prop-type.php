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

	protected static function define_value_schema(): Prop_Type {
		return Object_Prop_Type::make( [
			'src' => Object_Prop_Type::make( [
				'id' => Number_Prop_Type::make()->int()->optional(),
				'url' => String_Prop_Type::make()->optional(),
			] ),
			'size' => String_Prop_Type::make()->optional(),
		] );

		// icon list
		return Object_Prop_Type::make( [
			'items' => Array_Prop_Type::make()->of( Object_Prop_Type::make( [
				'icon' => Icon_Prop_Type::make(),
				'label' => String_Prop_Type::make(),
			] ) ),
		] );
	}
}
