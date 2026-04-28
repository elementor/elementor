<?php

namespace Elementor\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Min_Max_Date_Time_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'min-max-date-time';
	}

	protected function define_shape(): array {
		return [
			'min' => String_Prop_Type::make(),
			'max' => String_Prop_Type::make(),
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

		if ( ! preg_match( '/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/', $raw ) ) {
			return null;
		}

		$timestamp = strtotime( $raw );

		return false === $timestamp ? null : $timestamp;
	}
}
