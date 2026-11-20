<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Date or date-time text control. The widgets parse it at render time and throw on anything
 * PHP cannot read, so invalid text is rejected here instead of being saved.
 */
class Date_Time_Setting_Adapter extends String_Setting_Adapter implements V3_Plain_Value_Guard {

	const PATTERN = '^(\d{4}-\d{2}-\d{2}( \d{2}:\d{2}(:\d{2})?)?)?$';

	const FORMATS = [ 'Y-m-d H:i:s', 'Y-m-d H:i', 'Y-m-d' ];

	public function prop_type( array $control ): Prop_Type {
		return V3_String_Prop_Type::make()->pattern( self::PATTERN );
	}

	/**
	 * The published pattern fixes the format; a pattern cannot tell whether the date exists (no Feb 30).
	 */
	public function reject_reason( $plain, array $control ): ?string {
		if ( ! is_string( $plain ) || '' === $plain ) {
			return null;
		}

		foreach ( self::FORMATS as $format ) {
			$date = \DateTime::createFromFormat( '!' . $format, $plain );
			$errors = \DateTime::getLastErrors();

			if ( $date && $date->format( $format ) === $plain && ( ! $errors || ( 0 === $errors['warning_count'] && 0 === $errors['error_count'] ) ) ) {
				return null;
			}
		}

		return 'is not a date that exists';
	}
}
