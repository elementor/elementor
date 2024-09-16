<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Classes_Prop_Type extends Transformable_Prop_Type {

	public static function get_key(): string {
		return 'classes';
	}

	protected function validate_value( $value ): void {
		// Nothing.
	}

	protected static function define_value_schema(): Prop_Type {
		return Array_Prop_Type::make()->items(
			String_Prop_Type::make()->regex( '/^[a-z][a-z-_0-9]*$/i' )
		);
	}
}
