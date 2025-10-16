<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Text Align Property Mapper
 *
 * 🎯 ATOMIC SOURCE: style-schema.php uses String_Prop_Type with enum for text-align
 * 🚫 FALLBACKS: NONE - 100% atomic widget compliance
 * ✅ VALIDATION: Matches atomic widget expectations exactly
 *
 * ✅ ATOMIC-ONLY COMPLIANCE ACHIEVED:
 * ✅ IMPLEMENTATION: Pure atomic prop type return - String_Prop_Type::make()->enum()->generate()
 * ✅ VERIFIED: All JSON creation handled by atomic widgets
 */
class Text_Align_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'text-align',
	];

	// Enum values from style-schema.php lines 143-148
	private const ALLOWED_VALUES = [
		'start',
		'center',
		'end',
		'justify',
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

		$text_align_value = $this->parse_text_align_value( $value );
		if ( null === $text_align_value ) {
			return null;
		}

		// ✅ ATOMIC-ONLY COMPLIANCE: Pure atomic prop type return
		return String_Prop_Type::make()
			->enum( self::ALLOWED_VALUES )
			->generate( $text_align_value );
	}

	private function parse_text_align_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		// Map common CSS values to atomic widget enum values
		$value_mapping = [
			'left' => 'start',
			'right' => 'end',
			'center' => 'center',
			'justify' => 'justify',
			'start' => 'start',
			'end' => 'end',
		];

		$mapped_value = $value_mapping[ $value ] ?? null;

		// Validate against atomic widget enum values
		if ( null === $mapped_value || ! in_array( $mapped_value, self::ALLOWED_VALUES, true ) ) {
			return null;
		}

		return $mapped_value;
	}
}
