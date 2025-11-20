<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Properties;

use Elementor\Modules\CssConverter\Convertors\CssProperties\Implementations\Atomic_Property_Mapper_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Text_Decoration_Property_Mapper extends Atomic_Property_Mapper_Base {

	private const SUPPORTED_PROPERTIES = [
		'text-decoration',
	];

	private const VALID_DECORATION_LINES = [
		'none',
		'underline',
		'overline',
		'line-through',
	];

	private const DEFAULT_DECORATION_LINE = 'none';

	public function map_to_v4_atomic( string $property, $value ): ?array {
		if ( ! $this->is_supported_property( $property ) ) {
			return null;
		}

		$decoration_value = $this->parse_text_decoration_value( $value );
		if ( null === $decoration_value ) {
			return null;
		}

		return String_Prop_Type::make()->generate( $decoration_value );
	}

	public function get_supported_properties(): array {
		return self::SUPPORTED_PROPERTIES;
	}

	public function is_supported_property( string $property ): bool {
		return in_array( $property, self::SUPPORTED_PROPERTIES, true );
	}

	private function parse_text_decoration_value( $value ): ?string {
		if ( ! $this->is_valid_string_value( $value ) ) {
			return null;
		}

		$trimmed_value = trim( $value );

		if ( $this->is_empty_value( $trimmed_value ) ) {
			return null;
		}

		$decoration_line = $this->extract_decoration_line( $trimmed_value );

		return $this->validate_decoration_line( $decoration_line );
	}

	private function is_valid_string_value( $value ): bool {
		return is_string( $value );
	}

	private function is_empty_value( string $value ): bool {
		return empty( $value );
	}

	private function validate_decoration_line( string $decoration_line ): ?string {
		if ( ! in_array( $decoration_line, self::VALID_DECORATION_LINES, true ) ) {
			return null;
		}

		return $decoration_line;
	}

	private function extract_decoration_line( string $value ): string {
		$decoration_from_parts = $this->find_decoration_in_shorthand_parts( $value );

		if ( null !== $decoration_from_parts ) {
			return $decoration_from_parts;
		}

		return $this->find_decoration_in_full_value_or_default( $value );
	}

	private function find_decoration_in_shorthand_parts( string $value ): ?string {
		$parts = preg_split( '/\s+/', $value );

		foreach ( $parts as $part ) {
			if ( $this->is_valid_decoration_line( $part ) ) {
				return $part;
			}
		}

		return null;
	}

	private function find_decoration_in_full_value_or_default( string $value ): string {
		if ( $this->is_valid_decoration_line( $value ) ) {
			return $value;
		}

		return self::DEFAULT_DECORATION_LINE;
	}

	private function is_valid_decoration_line( string $line ): bool {
		return in_array( $line, self::VALID_DECORATION_LINES, true );
	}
}
