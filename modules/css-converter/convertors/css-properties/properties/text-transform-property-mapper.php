<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Text_Transform_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'text-transform',
	];

	private const VALID_VALUES = [
		'none',
		'capitalize',
		'uppercase',
		'lowercase',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$text_transform_value = $this->parse_text_transform_value( $value );
		if ( null === $text_transform_value ) {
			return null;
		}

		return String_Prop_Type::make()
			->enum( self::VALID_VALUES )
			->generate( $text_transform_value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	public function get_v4_property_name( string $property ): string {
		return 'text-transform';
	}

	private function parse_text_transform_value( $value ): ?string {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$value = trim( $value );

		if ( empty( $value ) ) {
			return null;
		}

		// Validate against atomic widget enum values
		if ( ! in_array( $value, self::VALID_VALUES, true ) ) {
			return null;
		}

		return $value;
	}
}
