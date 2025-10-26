<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}


class Css_Selector_Utils {

	public static function is_element_tag( string $part ): bool {
		$part = trim( $part );

		if ( 0 === strpos( $part, '.' ) || 0 === strpos( $part, '#' ) ) {
			return false;
		}

		$pattern = Css_Converter_Config::get_regex_pattern( 'element_tag' );
		if ( preg_match( $pattern, $part, $matches ) ) {
			$element = strtolower( $matches[1] );
			return Css_Converter_Config::is_supported_html_element( $element );
		}

		return false;
	}

	public static function extract_class_name( string $selector ): ?string {
		$trimmed = trim( $selector );
		$pattern = Css_Converter_Config::get_regex_pattern( 'class_selector' );
		if ( preg_match( $pattern, $trimmed, $matches ) ) {
			return $matches[1];
		}
		return null;
	}

	public static function extract_all_class_names( string $selector ): array {
		$pattern = Css_Converter_Config::get_regex_pattern( 'all_class_names' );
		if ( preg_match_all( $pattern, $selector, $matches ) ) {
			return $matches[1];
		}
		return [];
	}

	public static function is_nested_selector( string $selector ): bool {
		$descendant_pattern = Css_Converter_Config::get_regex_pattern( 'nested_descendant' );
		$child_pattern = Css_Converter_Config::get_regex_pattern( 'nested_child' );

		if ( preg_match( $descendant_pattern, $selector ) ) {
			return true;
		}
		if ( preg_match( $child_pattern, $selector ) ) {
			return true;
		}
		return false;
	}

	public static function has_descendant_selector( string $selector ): bool {
		$pattern = Css_Converter_Config::get_regex_pattern( 'nested_descendant' );
		return preg_match( $pattern, $selector ) === 1;
	}

	public static function has_child_selector( string $selector ): bool {
		$pattern = Css_Converter_Config::get_regex_pattern( 'nested_child' );
		return preg_match( $pattern, $selector ) === 1;
	}

	public static function is_compound_class_selector( string $selector ): bool {
		$trimmed = trim( $selector );
		$pattern = Css_Converter_Config::get_regex_pattern( 'compound_class' );
		return preg_match( $pattern, $trimmed ) === 1;
	}

	public static function extract_compound_classes( string $selector ): array {
		$selector = trim( $selector );
		if ( empty( $selector ) || 0 !== strpos( $selector, '.' ) ) {
			return [];
		}
		$selector = substr( $selector, 1 );
		$classes = explode( '.', $selector );
		$filtered_classes = array_filter( array_map( 'trim', $classes ) );

		$max_classes = Css_Converter_Config::MAX_COMPOUND_CLASSES;
		return array_slice( $filtered_classes, 0, $max_classes );
	}

	public static function build_compound_flattened_name( array $classes ): string {
		$sorted_classes = $classes;
		sort( $sorted_classes );
		return implode( '-and-', $sorted_classes );
	}

	public static function calculate_compound_specificity( array $classes ): int {
		$class_count = count( $classes );
		$specificity_per_class = 10;
		return $class_count * $specificity_per_class;
	}

	public static function clean_selector_part( string $part ): string {
		$part = trim( $part );
		$part = ltrim( $part, '.' );
		$part = preg_replace( '/[^a-zA-Z0-9_-]/', '', $part );
		return $part;
	}

	public static function extract_class_name_from_target( string $target ): string {
		$target = trim( $target );

		$class_name = self::extract_first_class_from_selector( $target );
		if ( ! empty( $class_name ) ) {
			return $class_name;
		}

		$element_name = self::extract_element_from_selector( $target );
		if ( ! empty( $element_name ) ) {
			return $element_name;
		}

		return '';
	}

	public static function extract_target_class_from_parsed_target( string $target ): ?string {
		$target = trim( $target );

		if ( 0 === strpos( $target, '.' ) ) {
			$pattern = Css_Converter_Config::get_regex_pattern( 'class_name_extraction' );
			if ( preg_match( $pattern, $target, $matches ) ) {
				return $matches[1];
			}
		}

		if ( false !== strpos( $target, '.' ) ) {
			$pattern = Css_Converter_Config::get_regex_pattern( 'class_from_element_selector' );
			if ( preg_match( $pattern, $target, $matches ) ) {
				return $matches[1];
			}
		}

		$pattern = Css_Converter_Config::get_regex_pattern( 'element_from_selector' );
		if ( preg_match( $pattern, $target, $matches ) ) {
			return $matches[1];
		}

		return null;
	}

	public static function extract_class_name_from_selector( string $selector ): ?string {
		$trimmed = trim( $selector );
		$pattern = Css_Converter_Config::get_regex_pattern( 'class_selector' );
		if ( preg_match( $pattern, $trimmed, $matches ) ) {
			return $matches[1];
		}
		return null;
	}

	private static function extract_first_class_from_selector( string $target ): string {
		if ( 0 !== strpos( $target, '.' ) ) {
			return '';
		}

		$pattern = Css_Converter_Config::get_regex_pattern( 'class_name_extraction' );
		if ( preg_match( $pattern, $target, $matches ) ) {
			return $matches[1];
		}

		return '';
	}

	private static function extract_element_from_selector( string $target ): string {
		$pattern = Css_Converter_Config::get_regex_pattern( 'element_from_selector' );
		if ( preg_match( $pattern, $target, $matches ) ) {
			return $matches[1];
		}

		return '';
	}
}
