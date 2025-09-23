<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Percentage_Variable_Convertor extends Abstract_Variable_Convertor {
	private const PERCENTAGE_PATTERN = '/^([+-]?(?:\d*\.)?\d+)%$/';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::PERCENTAGE_PATTERN, trim( $value ) );
	}

	protected function get_type(): string {
		return 'size-percentage';
	}

	protected function normalize_value( string $value ): string {
		return $this->normalize_percentage( $value );
	}

	private function normalize_percentage( string $percentage ): string {
		$trimmed = trim( $percentage );

		if ( 1 === preg_match( self::PERCENTAGE_PATTERN, $trimmed, $matches ) ) {
			$number = $matches[1];

			// Normalize the number to avoid unnecessary decimal places
			$normalized_number = $this->normalize_number( $number );

			return $normalized_number . '%';
		}

		return $trimmed;
	}

	private function normalize_number( string $number ): string {
		$float = (float) $number;

		// If it's a whole number, return as integer
		if ( $float === (int) $float ) {
			return (string) (int) $float;
		}

		// Otherwise return the float with reasonable precision
		return (string) $float;
	}
}
