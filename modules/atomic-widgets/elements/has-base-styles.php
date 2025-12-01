<?php

namespace Elementor\Modules\AtomicWidgets\Elements;

use Elementor\Core\Utils\Collection;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @mixin Has_Atomic_Base
 */
trait Has_Base_Styles {
	public function get_base_styles() {
		if ( $this->is_css_converter_widget() ) {
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

	public function get_base_styles_dictionary() {
		// If CSS converter widget, return EMPTY array (no base classes)
		if ( $this->is_css_converter_widget() ) {
			return [];
		}
		
		// Normal widgets - return standard base classes
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

	private function is_css_converter_widget(): bool {
		
		// Primary detection: check editor_settings for disable_base_styles flag
		$has_disable_flag = ! empty( $this->editor_settings['disable_base_styles'] );
		if ( $has_disable_flag ) {
			return true;
		}

		// Alternative detection: check for CSS converter widget flag
		$has_css_converter_flag = ! empty( $this->editor_settings['css_converter_widget'] );
		if ( $has_css_converter_flag ) {
			return true;
		}

		// Fallback detection: check for CSS converter-specific class patterns
		// IMPORTANT: Only check settings if they exist (during runtime), not during initialization
		try {
			$settings = $this->get_atomic_settings();
			
			$classes = $settings['classes'] ?? [];

			// CSS converter widgets often have specific class patterns (e.g., e-xxxxx-yyyyy)
			if ( is_array( $classes ) ) {
				foreach ( $classes as $class ) {
					if ( is_string( $class ) && preg_match( '/^e-[a-f0-9]{7}-[a-f0-9]{7}$/', $class ) ) {
						return true;
					}
				}
			}

			// Additional fallback: check if widget has specific CSS converter characteristics
			// CSS converter widgets often have version '0.0' and specific settings structure
			if ( $this->version === '0.0' && ! empty( $settings ) ) {
				// Check if the widget has the typical CSS converter settings structure
				$has_converter_structure = (
					isset( $settings['classes'] ) &&
					is_array( $settings['classes'] ) &&
					count( $settings['classes'] ) > 0
				);

				if ( $has_converter_structure ) {
					return true;
				}
			}
		} catch ( \Throwable $e ) {
			// This is OK during widget registration - settings don't exist yet
			// We'll rely on editor_settings flags instead
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
