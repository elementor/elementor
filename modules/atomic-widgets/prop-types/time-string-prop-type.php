<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Time_String_Prop_Type extends String_Prop_Type {
	const ISO_TIME_REGEX = '/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/';

	public static function get_key(): string {
		return 'time-string';
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		return 1 === preg_match( self::ISO_TIME_REGEX, $value );
	}
}
