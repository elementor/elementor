<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Trait for managing base styles in atomic widgets.
 * 
 * Handles the application of default CSS classes and styles to atomic widgets,
 * with special handling for CSS converter widgets that should not receive
 * base styles to preserve their original styling.
 * 
 * @mixin Has_Atomic_Base
 */
trait Has_Base_Styles {
	/**
	 * Gets the compiled base styles for this widget.
	 * 
	 * Returns an empty array for CSS converter widgets to prevent
	 * base styles from interfering with the original styling.
	 * 
	 * @return array<string, mixed> Compiled style definitions
	 */
	public function get_base_styles() {
		// CSS converter widgets should not have any base styles applied
		if ( $this->should_disable_base_styles() ) {
			return [];
		}

		$base_styles = $this->define_base_styles();
		$style_definitions = [];

		foreach ( $base_styles as $key => $style ) {
			$id = $this->generate_base_style_id( $key );
			$style_definitions[ $id ] = $style->build( $id );
		}

		return $style_definitions;
	}

	private function should_disable_base_styles(): bool {
		return isset( $this->editor_settings['disable_base_styles'] ) && $this->editor_settings['disable_base_styles'];
	}

	/**
	 * Gets the base styles dictionary for the editor.
	 * 
	 * This dictionary maps style keys to CSS class names and is used by
	 * JavaScript and Twig templates to apply base classes. CSS converter
	 * widgets receive an empty dictionary to prevent base class application.
	 * 
	 * @return array<string, string> Map of style keys to CSS class names
	 */
	public function get_base_styles_dictionary() {
		// CSS converter widgets should not have base classes in the editor
		// This prevents base classes from being applied in JavaScript/Twig templates
		if ( $this->is_css_converter_widget() ) {
			return [];
		}
		
		// Regular widgets get their standard base class dictionary
		$result = [];
		$base_styles = array_keys( $this->define_base_styles() );

		foreach ( $base_styles as $key ) {
			$base_class_id = $this->generate_base_style_id( $key );
			$result[ $key ] = $base_class_id;
		}

		return $result;
	}

	private function generate_base_style_id( string $key ): string {
		return static::get_element_type() . '-' . $key;
	}

	/**
	 * Detects if this widget was created by the CSS converter API.
	 * 
	 * CSS converter widgets should not have base classes applied to maintain
	 * the original styling from the converted HTML/CSS.
	 * 
	 * Uses a multi-layered detection strategy:
	 * 1. Primary: Check editor_settings flags (most reliable)
	 * 2. Fallback: Analyze widget characteristics (class patterns, version)
	 * 
	 * @return bool True if this is a CSS converter widget
	 */
	private function is_css_converter_widget(): bool {
		// Primary detection: Check explicit flags set by CSS converter API
		if ( ! empty( $this->editor_settings['disable_base_styles'] ) ) {
			return true;
		}

		if ( ! empty( $this->editor_settings['css_converter_widget'] ) ) {
			return true;
		}

		// Fallback detection: Analyze widget characteristics
		// Only attempt this during runtime when settings are available
		try {
			$settings = $this->get_atomic_settings();
			$classes = $settings['classes'] ?? [];

			// Check for CSS converter-generated class patterns (e.g., e-a1b2c3d-e4f5g6h)
			if ( is_array( $classes ) ) {
				foreach ( $classes as $class ) {
					if ( is_string( $class ) && preg_match( '/^e-[a-f0-9]{7}-[a-f0-9]{7}$/', $class ) ) {
						return true;
					}
				}
			}

			// Additional heuristic: CSS converter widgets typically have version '0.0'
			if ( $this->version === '0.0' && ! empty( $settings['classes'] ) ) {
				return true;
			}
		} catch ( \Throwable $e ) {
			// Expected during widget registration when settings aren't available yet
			// Fall back to editor_settings flags only
		}

		return false;
	}

	/**
	 * @return array<string, Style_Definition>
	 */
	protected function define_base_styles(): array {
		return [];
	}
}
