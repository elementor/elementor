<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Line_Height_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'line-height',
	];

	private const NORMAL_LINE_HEIGHT_VALUE = 1.2;
	private const DEFAULT_LINE_HEIGHT_VALUE = 1.5;

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! $this->is_valid_string_value( $value ) ) {
			return null;
		}

		$line_height_data = $this->parse_line_height_value( $value );

		// If parsing failed (e.g., CSS variable), return null instead of creating invalid data
		if ( null === $line_height_data ) {
			return null;
		}

		return Size_Prop_Type::make()
			->units( Size_Constants::typography() )
			->generate( $line_height_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	protected function parse_line_height_value( string $value ): ?array {
		$trimmed_value = trim( $value );

		if ( $this->is_normal_keyword( $trimmed_value ) ) {
			return $this->create_normal_line_height();
		}

		if ( $this->is_unitless_numeric_value( $trimmed_value ) ) {
			return $this->create_unitless_line_height( (float) $trimmed_value );
		}

		return $this->parse_value_with_units_or_default( $trimmed_value );
	}

	private function is_valid_string_value( $value ): bool {
		return is_string( $value ) && '' !== trim( $value );
	}

	private function is_normal_keyword( string $value ): bool {
		return 'normal' === $value;
	}

	private function is_unitless_numeric_value( string $value ): bool {
		return is_numeric( $value );
	}

	private function parse_value_with_units_or_default( string $value ): ?array {
		$parsed = Size_Value_Parser::parse( $value );

		if ( null !== $parsed ) {
			return $parsed;
		}

		// Don't create fake defaults - return null to indicate parsing failure
		error_log( "CSS Converter: Cannot parse line-height value: '{$value}'" );
		return null;
	}

	private function create_unitless_line_height( float $value ): array {
		return [
			'size' => $value,
			'unit' => '',
		];
	}

	private function create_normal_line_height(): array {
		return [
			'size' => self::NORMAL_LINE_HEIGHT_VALUE,
			'unit' => '',
		];
	}
}
