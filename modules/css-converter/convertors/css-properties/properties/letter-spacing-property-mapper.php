<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Letter_Spacing_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'letter-spacing',
	];

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! is_string( $value ) || 'normal' === trim( $value ) ) {
			return null;
		}

		$size_data = $this->parse_size_value( $value );
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

	public function get_v4_property_name( string $property ): string {
		return 'letter-spacing';
	}

	protected function parse_size_value( string $value ): ?array {
		if ( $this->is_normal_letter_spacing( $value ) ) {
			return null;
		}

		return Size_Value_Parser::parse( $value );
	}

	private function is_normal_letter_spacing( string $value ): bool {
		$trimmed_value = trim( $value );
		return '' === $trimmed_value || 'normal' === $trimmed_value;
	}
}
