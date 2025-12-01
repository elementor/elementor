<?php
namespace Elementor\Modules\CssConverter\Convertors\Variables\Convertors;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Length_Size_Viewport_Variable_Convertor extends Abstract_Variable_Convertor {
	private const LENGTH_PATTERN = '/^([+-]?(?:\d*\.)?\d+)(px|pt|em|rem|ch|vh|vw|svh|svw|vmin|vmax)$/i';

	public function supports( string $name, string $value ): bool {
		return 1 === preg_match( self::LENGTH_PATTERN, trim( $value ) );
	}

	protected function get_type(): string {
		return 'size-length-viewport';
	}

	protected function normalize_value( string $value ): string {
		return $this->normalize_length( $value );
	}

	private function normalize_length( string $length ): string {
		$trimmed = trim( $length );

		if ( 1 === preg_match( self::LENGTH_PATTERN, $trimmed, $matches ) ) {
			$number = $matches[1];
			$unit = strtolower( $matches[2] );

			// Normalize the number to avoid unnecessary decimal places
			$normalized_number = $this->normalize_number( $number );

			return $normalized_number . $unit;
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
