<?php

namespace Elementor\Modules\CssConverter\Services\GlobalClasses\Unified;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Global_Classes_Detection_Service {

	const ELEMENTOR_CLASS_PREFIXES = [ 'e-con-', 'elementor-', 'e-' ];
	const FLATTENED_CLASS_PREFIX = 'e-con-';

	public function detect_css_class_selectors( array $css_rules ): array {
		$detected_classes = [];

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			// DEBUG: Log all selectors being processed
			error_log( "CSS Converter: Processing selector: '{$selector}'" );

			if ( ! $this->is_valid_class_selector( $selector ) ) {
				error_log( "CSS Converter: Skipping '{$selector}' - not a valid class selector" );
				continue;
			}

			if ( $this->should_skip_selector( $selector ) ) {
				error_log( "CSS Converter: Skipping '{$selector}' - should skip selector" );
				continue;
			}

			$class_name = $this->extract_class_name( $selector );

			if ( $this->is_class_name_too_long( $class_name ) ) {
				error_log( "CSS Converter: Skipping '{$selector}' - class name too long" );
				continue;
			}

			$detected_classes[ $class_name ] = [
				'selector' => $selector,
				'properties' => $rule['properties'] ?? [],
				'source' => 'css-converter',
			];
			
			error_log( "CSS Converter: Detected class '{$class_name}' with " . count( $rule['properties'] ?? [] ) . " properties" );
		}

		return $detected_classes;
	}

	private function is_valid_class_selector( string $selector ): bool {
		$trimmed_selector = trim( $selector );

		if ( empty( $trimmed_selector ) ) {
			return false;
		}

		if ( 0 !== strpos( $trimmed_selector, '.' ) ) {
			return false;
		}

		$class_name = ltrim( $trimmed_selector, '.' );

		return ! empty( $class_name );
	}

	private function should_skip_selector( string $selector ): bool {
		$class_name = $this->extract_class_name( $selector );

		foreach ( self::ELEMENTOR_CLASS_PREFIXES as $prefix ) {
			if ( 0 === strpos( $class_name, $prefix ) ) {
				return true;
			}
		}

		return false;
	}

	private function extract_class_name( string $selector ): string {
		return ltrim( trim( $selector ), '.' );
	}

	private function is_class_name_too_long( string $class_name ): bool {
		$max_class_name_length = 50;

		return strlen( $class_name ) > $max_class_name_length;
	}

	public function get_detection_stats( array $css_rules ): array {
		$total_rules = count( $css_rules );
		$class_selectors = 0;
		$valid_classes = 0;
		$skipped_elementor = 0;
		$skipped_invalid = 0;
		$skipped_too_long = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';

			if ( 0 === strpos( trim( $selector ), '.' ) ) {
				++$class_selectors;

				if ( ! $this->is_valid_class_selector( $selector ) ) {
					++$skipped_invalid;
					continue;
				}

				if ( $this->should_skip_selector( $selector ) ) {
					++$skipped_elementor;
					continue;
				}

				$class_name = $this->extract_class_name( $selector );
				if ( $this->is_class_name_too_long( $class_name ) ) {
					++$skipped_too_long;
					continue;
				}

				++$valid_classes;
			}
		}

		return [
			'total_rules' => $total_rules,
			'class_selectors' => $class_selectors,
			'valid_classes' => $valid_classes,
			'skipped_elementor' => $skipped_elementor,
			'skipped_invalid' => $skipped_invalid,
			'skipped_too_long' => $skipped_too_long,
		];
	}
}
