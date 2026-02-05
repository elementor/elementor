<?php

namespace Elementor\Modules\AtomicConverters\Converters;

use Elementor\Modules\AtomicConverters\Property_Converter_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Color_Converter extends Property_Converter_Base {
	private const SUPPORTED_PROPERTIES = [ 'color' ];
	private const PATTERN_SIMPLE_COLOR_NAME = '/^[a-zA-Z0-9-]+$/';

	protected function get_supported_properties_list(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function convert( string $property, $value ): ?array {
		if ( ! $this->supports( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$normalized = $this->normalize_color_value( $value );
		if ( null === $normalized ) {
			return null;
		}

		return Color_Prop_Type::generate( $normalized );
	}

	private function normalize_color_value( string $value ): ?string {
		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		if ( 'none' === $value ) {
			return null;
		}

		if ( 'transparent' === $value ) {
			return 'rgba(0,0,0,0)';
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return null;
	}

	private function is_valid_color_format( string $value ): bool {
		if ( $this->is_css_variable( $value ) ) {
			return false;
		}

		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		return $this->is_simple_color_name( $value );
	}

	private function is_css_variable( string $value ): bool {
		return str_starts_with( $value, 'var(' );
	}

	private function is_simple_color_name( string $value ): bool {
		return preg_match( self::PATTERN_SIMPLE_COLOR_NAME, $value ) === 1;
	}
}
