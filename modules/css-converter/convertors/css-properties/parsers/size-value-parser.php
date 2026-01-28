<?php

namespace Elementor\Modules\CssConverter\Convertors\CssProperties\Parsers;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Size_Value_Parser {

	private const CSS_KEYWORDS = [ 'auto', 'inherit', 'initial', 'unset', 'revert', 'revert-layer' ];

	private const SIZE_WITH_OPTIONAL_UNIT_PATTERN = '/^(-?\d+\.?\d*|-?\d*\.\d+)(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)?$/i';

	private const NUMERIC_GROUP_INDEX = 1;
	private const UNIT_GROUP_INDEX = 2;

	private const DEFAULT_UNIT = 'px';
	private const KEYWORD_UNIT = 'custom';

	public static function parse( string $value ): ?array {
		$trimmed_value = trim( $value );

		if ( self::is_empty_value( $trimmed_value ) ) {
			return null;
		}

		if ( self::is_css_keyword( $trimmed_value ) ) {
			return self::create_keyword_size( $trimmed_value );
		}

		if ( self::is_numeric_size_value( $trimmed_value, $matches ) ) {
			return self::create_numeric_size( $matches );
		}

		return null;
	}

	public static function create_zero(): array {
		return self::create_size_structure( 0.0, self::DEFAULT_UNIT );
	}

	private static function is_empty_value( string $value ): bool {
		return '' === $value;
	}

	private static function is_css_keyword( string $value ): bool {
		$lowercase_value = strtolower( $value );
		return in_array( $lowercase_value, self::CSS_KEYWORDS, true );
	}

	private static function is_numeric_size_value( string $value, &$matches ): bool {
		return (bool) preg_match( self::SIZE_WITH_OPTIONAL_UNIT_PATTERN, $value, $matches );
	}

	private static function create_keyword_size( string $keyword ): array {
		return self::create_size_structure( $keyword, self::KEYWORD_UNIT );
	}

	private static function create_numeric_size( array $regex_matches ): array {
		$numeric_value = self::extract_numeric_value( $regex_matches );
		$unit = self::extract_unit_or_default( $regex_matches );

		return self::create_size_structure( $numeric_value, $unit );
	}

	private static function extract_numeric_value( array $regex_matches ): float {
		return (float) $regex_matches[ self::NUMERIC_GROUP_INDEX ];
	}

	private static function extract_unit_or_default( array $regex_matches ): string {
		$unit = $regex_matches[ self::UNIT_GROUP_INDEX ] ?? self::DEFAULT_UNIT;
		return strtolower( $unit );
	}

	private static function create_size_structure( $size, string $unit ): array {
		return [
			'size' => $size,
			'unit' => $unit,
		];
	}
}
