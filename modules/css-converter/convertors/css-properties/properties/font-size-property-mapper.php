<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Font Size Property Mapper
 *
 * 🎯 ATOMIC SOURCE: atomic-heading.php uses Size_Prop_Type for font-size
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 *
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ FIXED: Pure atomic prop type return - Size_Prop_Type::make()->units()->generate()
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
 */
class Font_Size_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'font-size',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );

		// If parsing failed (e.g., CSS variable), return null instead of creating invalid data
		if ( null === $size_data ) {
			return null;
		}

		return Size_Prop_Type::make()
			->units( Size_Constants::typography() )
			->generate( $size_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	protected function parse_size_value( string $value ): ?array {
		$parsed = Size_Value_Parser::parse( $value );

		if ( null !== $parsed ) {
			return $parsed;
		}

		// Don't create fake defaults - return null to indicate parsing failure
		// This allows CSS variables and other unparseable values to be handled properly
		return null;
	}
}
