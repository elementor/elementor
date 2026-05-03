<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Date_String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Date_Range_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'date-range';
	}

	protected function define_shape(): array {
		return [
			'min' => Date_String_Prop_Type::make(),
			'max' => Date_String_Prop_Type::make(),
		];
	}

	protected function validate_value( $value ): bool {
		if ( ! parent::validate_value( $value ) ) {
			return false;
		}

		$min = $this->extract_iso_date( $value['min'] ?? null );
		$max = $this->extract_iso_date( $value['max'] ?? null );

		if ( null === $min || null === $max ) {
			return true;
		}

		return $max >= $min;
	}

	private function extract_iso_date( $field ): ?int {
		$raw = is_array( $field ) ? ( $field['value'] ?? null ) : null;

		if ( ! is_string( $raw ) || '' === $raw ) {
			return null;
		}

		$date = date_create_from_format( 'Y-m-d', $raw );

		return false === $date ? null : $date->getTimestamp();
	}
}
