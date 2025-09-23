<?php
namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Property_Convertor extends Abstract_Css_Property_Convertor {
	private const HEX3_PATTERN = '/^#([A-Fa-f0-9]{3})$/';
	private const HEX6_PATTERN = '/^#([A-Fa-f0-9]{6})$/';
	private const HEXA_PATTERN = '/^#([A-Fa-f0-9]{8})$/';
	private const RGB_PATTERN = '/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/';
	private const RGBA_PATTERN = '/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/';
	private const HSL_PATTERN = '/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/';

	private const NAMED_COLORS = [
		'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
		'silver', 'gray', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'navy',
		'fuchsia', 'purple', 'orange', 'pink', 'brown', 'gold', 'violet',
	];

	public function supports( string $property, $value ): bool {
		return 'color' === $property && $this->is_valid_color( $value );
	}

	public function get_supported_properties(): array {
		return [ 'color' ];
	}

	public function map_to_schema( string $property, $value ): array {
		return [
			'color' => [
				'type' => 'color',
				'value' => $this->normalize_color( $value ),
			],
		];
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		return $this->create_v4_property( 'color', $this->normalize_color( $value ) );
	}

	private function is_valid_color( $value ): bool {
		if ( ! is_string( $value ) ) {
			return false;
		}

		$value = trim( $value );

		return $this->is_hex_color( $value ) ||
			   $this->is_rgb_color( $value ) ||
			   $this->is_rgba_color( $value ) ||
			   $this->is_hsl_color( $value ) ||
			   $this->is_named_color( $value );
	}

	private function normalize_color( string $value ): string {
		$value = trim( $value );

		if ( $this->is_hex3_color( $value ) ) {
			return $this->expand_hex3_to_hex6( $value );
		}

		return $value;
	}

	private function is_hex_color( string $value ): bool {
		return $this->is_hex3_color( $value ) || 
			   $this->is_hex6_color( $value ) || 
			   $this->is_hexa_color( $value );
	}

	private function is_hex3_color( string $value ): bool {
		return 1 === preg_match( self::HEX3_PATTERN, $value );
	}

	private function is_hex6_color( string $value ): bool {
		return 1 === preg_match( self::HEX6_PATTERN, $value );
	}

	private function is_hexa_color( string $value ): bool {
		return 1 === preg_match( self::HEXA_PATTERN, $value );
	}

	private function is_rgb_color( string $value ): bool {
		return 1 === preg_match( self::RGB_PATTERN, $value );
	}

	private function is_rgba_color( string $value ): bool {
		return 1 === preg_match( self::RGBA_PATTERN, $value );
	}

	private function is_hsl_color( string $value ): bool {
		return 1 === preg_match( self::HSL_PATTERN, $value );
	}

	private function is_named_color( string $value ): bool {
		return in_array( strtolower( $value ), self::NAMED_COLORS, true );
	}

	private function expand_hex3_to_hex6( string $hex3 ): string {
		if ( ! $this->is_hex3_color( $hex3 ) ) {
			return $hex3;
		}

		$hex = substr( $hex3, 1 );
		return '#' . $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
	}
}
