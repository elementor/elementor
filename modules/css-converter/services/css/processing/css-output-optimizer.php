<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Output_Optimizer {

	private const CONTAINER_PROPERTIES = [
		'order',
		'flex-grow',
		'flex-shrink',
		'align-self',
	];

	private const BROKEN_VALUE_PATTERNS = [
		// Fix broken font-size values
		'/(\d+)\.rem/' => '$1rem',
		'/0var\(/' => '0 var(',
		// Fix background none
		'/background:\s*none\s*;/' => 'background: transparent;',
		'/background-color:\s*none\s*;/' => 'background-color: transparent;',
	];

	private const NESTED_CLASS_FIXES = [
		// Remove HTML tags from nested class names
		'/--body-/' => '--',
		'/--html-/' => '--',
		'/--div-/' => '--',
		'/--span-/' => '--',
	];

	public function optimize_css_output( array $css_rules ): array {
		$optimized_rules = [];

		foreach ( $css_rules as $selector => $properties ) {
			// Skip empty rules
			if ( empty( $properties ) ) {
				continue;
			}

			// Fix selector naming
			$fixed_selector = $this->fix_selector_naming( $selector );

			// Fix property values
			$fixed_properties = $this->fix_property_values( $properties );

			// Skip if no properties remain after fixing
			if ( empty( $fixed_properties ) ) {
				continue;
			}

			$optimized_rules[ $fixed_selector ] = $fixed_properties;
		}

		return $optimized_rules;
	}

	public function should_apply_to_container( string $property ): bool {
		return in_array( $property, self::CONTAINER_PROPERTIES, true );
	}

	public function get_container_selector( string $widget_selector ): string {
		// Convert widget selector to container selector
		// Example: .e-7a28a1d-95ac953 -> .elementor-element.elementor-element-{id}
		if ( preg_match( '/\.e-([a-f0-9-]+)/', $widget_selector, $matches ) ) {
			$element_id = $matches[1];
			return ".elementor-element.elementor-element-{$element_id}";
		}

		return $widget_selector;
	}

	private function fix_selector_naming( string $selector ): string {
		$fixed_selector = $selector;

		// Apply nested class fixes
		foreach ( self::NESTED_CLASS_FIXES as $pattern => $replacement ) {
			$fixed_selector = preg_replace( $pattern, $replacement, $fixed_selector );
		}

		return $fixed_selector;
	}

	private function fix_property_values( array $properties ): array {
		$fixed_properties = [];

		foreach ( $properties as $property => $value ) {
			// Skip empty values
			if ( empty( $value ) || '' === trim( $value ) ) {
				continue;
			}

			$fixed_value = $this->fix_single_property_value( $value );

			// Skip if value becomes empty after fixing
			if ( empty( $fixed_value ) || '' === trim( $fixed_value ) ) {
				continue;
			}

			$fixed_properties[ $property ] = $fixed_value;
		}

		return $fixed_properties;
	}

	private function fix_single_property_value( string $value ): string {
		$fixed_value = $value;

		// Apply value fixes
		foreach ( self::BROKEN_VALUE_PATTERNS as $pattern => $replacement ) {
			$fixed_value = preg_replace( $pattern, $replacement, $fixed_value );
		}

		return $fixed_value;
	}

	public function add_missing_nested_selectors( array $css_rules ): array {
		// Add commonly missing nested selectors
		$missing_selectors = [
			'body.loaded .loading' => [
				'background' => 'transparent',
			],
			'.elementor .elementor-widget' => [
				'position' => 'relative',
			],
		];

		foreach ( $missing_selectors as $selector => $properties ) {
			// Convert to flattened class name
			$flattened_selector = $this->convert_to_flattened_class( $selector );
			
			if ( ! isset( $css_rules[ $flattened_selector ] ) ) {
				$css_rules[ $flattened_selector ] = $properties;
			}
		}

		return $css_rules;
	}

	private function convert_to_flattened_class( string $nested_selector ): string {
		// Convert nested selector to flattened class name
		// Example: "body.loaded .loading" -> "loading--loaded"
		
		if ( 'body.loaded .loading' === $nested_selector ) {
			return '.loading--loaded';
		}

		if ( '.elementor .elementor-widget' === $nested_selector ) {
			return '.elementor-widget';
		}

		// Default: return as-is
		return $nested_selector;
	}

	public function validate_css_variables( array $css_rules ): array {
		// Ensure CSS variables are properly formatted
		foreach ( $css_rules as $selector => $properties ) {
			foreach ( $properties as $property => $value ) {
				if ( is_string( $value ) && strpos( $value, 'var(' ) !== false ) {
					// Validate CSS variable syntax
					if ( ! preg_match( '/^var\(\s*--[a-zA-Z0-9_-]+(?:\s*,\s*[^)]+)?\s*\)$/', $value ) ) {
						error_log( '⚠️ Invalid CSS variable syntax: ' . $value . ' in ' . $selector );
					}
				}
			}
		}

		return $css_rules;
	}
}
