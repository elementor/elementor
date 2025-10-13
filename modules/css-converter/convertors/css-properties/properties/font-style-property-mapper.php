<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Font_Style_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'font-style',
	];

	private const VALID_VALUES = [
		'normal',
		'italic',
		'oblique',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$font_style_value = $this->parse_font_style_value( $value );
		if ( null === $font_style_value ) {
			return null;
		}

		return String_Prop_Type::make()
			->enum( self::VALID_VALUES )
			->generate( $font_style_value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_font_style_value( $value ): ?string {
		if ( ! $this->is_valid_string_value( $value ) ) {
			return null;
		}

		$trimmed_value = trim( $value );

		if ( $this->is_empty_value( $trimmed_value ) ) {
			return null;
		}

		return $this->validate_against_enum_values( $trimmed_value );
	}

	private function is_valid_string_value( $value ): bool {
		return is_string( $value );
	}

	private function is_empty_value( string $value ): bool {
		return empty( $value );
	}

	private function validate_against_enum_values( string $value ): ?string {
		if ( ! in_array( $value, self::VALID_VALUES, true ) ) {
			return null;
		}

		return $value;
	}
}
