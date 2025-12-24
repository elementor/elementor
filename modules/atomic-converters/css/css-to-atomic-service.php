<?php

namespace Elementor\Modules\AtomicConverters\Css;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_To_Atomic_Service {
	private const REGEX_CSS_PROPERTY_VALUE_PAIR = '/([a-zA-Z0-9-]+)\s*:\s*([^;]+);?/';
	private const SUPPORTED_PROPERTIES = [ 'color' ];

	public function convert( array $params ): array {
		$css_string = $params['cssString'] ?? '';

		$properties = $this->parse_css_string( $css_string );
		$filtered_properties = $this->filter_supported_properties( $properties );

		$result = $this->convert_properties_to_atomic( $filtered_properties );

		return $result;
	}

	private function filter_supported_properties( array $properties ): array {
		$filtered = [];
		foreach ( $properties as $property => $value ) {
			if ( in_array( $property, self::SUPPORTED_PROPERTIES, true ) ) {
				$filtered[ $property ] = $value;
			}
		}
		return $filtered;
	}

	private function parse_css_string( string $css_string ): array {
		$properties = [];
		$pattern = self::REGEX_CSS_PROPERTY_VALUE_PAIR;

		if ( preg_match_all( $pattern, $css_string, $matches, PREG_SET_ORDER ) ) {
			foreach ( $matches as $match ) {
				$property = trim( $match[1] );
				$value = trim( $match[2] );
				$properties[ $property ] = $value;
			}
		}

		return $properties;
	}

	private function convert_properties_to_atomic( array $properties ): array {
		$props = [];

		foreach ( $properties as $property => $value ) {
			if ( 'color' === $property ) {
				$converted = $this->convert_color( $value );
				if ( $converted ) {
					$props['color'] = $converted;
				}
			}
		}

		return [
			'props' => (object) $props,
		];
	}

	private function convert_color( string $value ): ?array {
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

		if ( 'transparent' === $value ) {
			return 'rgba(0,0,0,0)';
		}

		if ( $this->is_valid_color_format( $value ) ) {
			return $value;
		}

		return null;
	}

	private function is_valid_color_format( string $value ): bool {
		if ( str_starts_with( $value, 'var(' ) ) {
			return true;
		}

		if ( str_starts_with( $value, '#' ) && ( strlen( $value ) === 4 || strlen( $value ) === 7 ) ) {
			return ctype_xdigit( substr( $value, 1 ) );
		}

		if ( str_starts_with( $value, 'rgb' ) || str_starts_with( $value, 'hsl' ) ) {
			return true;
		}

		return in_array( strtolower( $value ), $this->get_named_colors(), true );
	}

	private function get_named_colors(): array {
		return [
			'transparent',
			'inherit',
			'initial',
			'unset',
			'black',
			'white',
			'red',
			'green',
			'blue',
			'yellow',
			'cyan',
			'magenta',
			'gray',
			'grey',
			'orange',
			'purple',
			'pink',
			'brown',
			'navy',
			'teal',
			'lime',
			'olive',
			'maroon',
			'silver',
			'aqua',
			'fuchsia',
			'gold',
			'violet',
		];
	}
}
