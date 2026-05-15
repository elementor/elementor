<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Date_String_Prop_Type extends String_Prop_Type {
	public static function get_key(): string {
		return 'date-string';
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$date = date_create_from_format( 'Y-m-d', $value );

		return false !== $date;
	}
}
