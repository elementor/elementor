<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers\Size_Value_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Word_Spacing_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'word-spacing',
	];

	private const NORMAL_WORD_SPACING_SIZE = 0;
	private const DEFAULT_WORD_SPACING_UNIT = 'px';

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		if ( ! $this->is_valid_string_value( $value ) ) {
			return null;
		}

		$word_spacing_data = $this->parse_word_spacing_value( $value );

		// If parsing failed (e.g., CSS variable), return null instead of creating invalid data
		if ( null === $word_spacing_data ) {
			return null;
		}

		return Size_Prop_Type::make()
			->units( Size_Constants::typography() )
			->generate( $word_spacing_data );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	protected function parse_word_spacing_value( string $value ): ?array {
		$trimmed_value = trim( $value );

		if ( $this->is_normal_keyword( $trimmed_value ) ) {
			return $this->create_normal_word_spacing();
		}

		return $this->parse_value_with_units_or_default( $trimmed_value );
	}

	private function is_valid_string_value( $value ): bool {
		return is_string( $value ) && '' !== trim( $value );
	}

	private function is_normal_keyword( string $value ): bool {
		return 'normal' === $value;
	}

	private function parse_value_with_units_or_default( string $value ): ?array {
		$parsed = Size_Value_Parser::parse( $value );

		if ( null !== $parsed ) {
			return $parsed;
		}

		// Don't create fake defaults - return null to indicate parsing failure
		return null;
	}

	private function create_normal_word_spacing(): array {
		return [
			'size' => self::NORMAL_WORD_SPACING_SIZE,
			'unit' => self::DEFAULT_WORD_SPACING_UNIT,
		];
	}
}
