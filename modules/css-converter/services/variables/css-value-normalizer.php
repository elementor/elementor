<?php
namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class CSS_Value_Normalizer {

	public function normalize( string $value ): string {
		$value = $this->remove_comments( $value );
		$value = $this->normalize_whitespace( $value );
		$value = $this->normalize_color_values( $value );
		$value = $this->normalize_numeric_values( $value );
		$value = $this->normalize_quotes( $value );

		return $value;
	}

	private function remove_comments( string $value ): string {
		return preg_replace( '/\/\*.*?\*\//s', '', $value );
	}

	private function normalize_whitespace( string $value ): string {
		$value = trim( $value );
		$value = preg_replace( '/\s+/', ' ', $value );
		$value = preg_replace( '/\s*([(){}\[\]:;,])\s*/', '$1', $value );

		return $value;
	}

	private function normalize_color_values( string $value ): string {
		if ( preg_match( '/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/', $value ) ) {
			return preg_replace_callback(
				'/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})/i',
				[ $this, 'hex_to_rgb' ],
				$value
			);
		}

		if ( preg_match( '/rgb\s*\(/i', $value ) ) {
			return preg_replace_callback(
				'/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i',
				function( $matches ) {
					return 'rgb(' . (int) $matches[1] . ',' . (int) $matches[2] . ',' . (int) $matches[3] . ')';
				},
				$value
			);
		}

		return $value;
	}

	private function hex_to_rgb( array $matches ): string {
		$hex = $matches[1];

		if ( 3 === strlen( $hex ) ) {
			$hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
		}

		$r = hexdec( substr( $hex, 0, 2 ) );
		$g = hexdec( substr( $hex, 2, 2 ) );
		$b = hexdec( substr( $hex, 4, 2 ) );

		return 'rgb(' . $r . ',' . $g . ',' . $b . ')';
	}

	private function normalize_numeric_values( string $value ): string {
		return preg_replace_callback(
			'/(\d+)(\.(\d+))?\s*(px|em|rem|%|pt|cm|mm|in|pc|ex|ch|vw|vh|vmin|vmax)/',
			function( $matches ) {
				$number = (float) $matches[1];
				if ( isset( $matches[3] ) && '' !== $matches[3] ) {
					$number = (float) ( $matches[1] . '.' . $matches[3] );
				}
				$unit = $matches[4];

				return $number . $unit;
			},
			$value
		);
	}

	private function normalize_quotes( string $value ): string {
		return preg_replace_callback(
			'/(\'|")([^\'"]*)(?:\'|")/',
			function( $matches ) {
				return '"' . $matches[2] . '"';
			},
			$value
		);
	}
}

