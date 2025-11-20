<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Height Property Mapper
 *
 * 🎯 ATOMIC SOURCE: style-schema.php uses Size_Prop_Type for height
 * ✅ ATOMIC-ONLY IMPLEMENTATION: Uses atomic prop types exclusively
 */
class Height_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'height',
		'min-height',
		'max-height',
	];

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || empty( trim( $value ) ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );

		return Size_Prop_Type::make()->generate( $size_data );
	}

	protected function parse_size_value( string $value ): array {
		$parsed = Size_Value_Parser::parse( $value );

		if ( null !== $parsed ) {
			return $this->normalize_height_value( $parsed );
		}

		return Size_Value_Parser::create_zero();
	}

	private function normalize_height_value( array $parsed ): array {
		if ( 'custom' === $parsed['unit'] && '' === $parsed['size'] ) {
			return [
				'size' => '',
				'unit' => 'auto',
			];
		}

		return $parsed;
	}
}
