<?php

namespace Elementor\Modules\CssConverter\Services\Variables;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Variables_Integration_Service {

	private $registration_service;
	private $conversion_service;
	private $update_mode;

	public function __construct( $update_mode = Variables_Registration_Service::DEFAULT_UPDATE_MODE ) {
		$this->update_mode = $update_mode;
		$this->registration_service = new Variables_Registration_Service( $update_mode );
		$this->conversion_service = new Variable_Conversion_Service();
	}

	public function get_update_mode(): string {
		return $this->update_mode;
	}

	public function process_css_variables( array $css_variable_definitions ): array {
		if ( empty( $css_variable_definitions ) ) {
			return [
				'variables' => [],
				'variables_created' => 0,
				'variable_name_mappings' => [],
			];
		}

		$converted_variables = $this->convert_css_variables_to_elementor_format( $css_variable_definitions );

		if ( empty( $converted_variables ) ) {
			return [
				'variables' => [],
				'variables_created' => 0,
				'variable_name_mappings' => [],
			];
		}

		// Register with Elementor (includes duplicate detection)
		$registration_result = $this->registration_service->register_with_elementor( $converted_variables );

		return [
			'variables' => $converted_variables,
			'variables_created' => $registration_result['registered'] ?? 0,
			'variables_reused' => $registration_result['reused'] ?? 0,
			'reused' => $registration_result['reused'] ?? 0,
			'variable_name_mappings' => $registration_result['variable_name_mappings'] ?? [],
			'variables_skipped' => $registration_result['skipped'] ?? 0,
			'update_mode' => $registration_result['update_mode'] ?? $this->update_mode,
		];
	}

	private function convert_css_variables_to_elementor_format( array $css_variable_definitions ): array {
		$converted = [];

		foreach ( $css_variable_definitions as $var_name => $var_data ) {
			$clean_name = $this->clean_variable_name( $var_name );
			
			if ( empty( $clean_name ) ) {
				continue;
			}

			$is_referenced_only = empty( $var_data['value'] ) && ( $var_data['source'] ?? '' ) === 'extracted_from_reference';
			
			if ( empty( $var_data['value'] ) && ! $is_referenced_only ) {
				continue;
			}

			if ( $is_referenced_only ) {
				$placeholder_value = $this->get_placeholder_value_for_variable( $clean_name );
				$converted[ $clean_name ] = [
					'type' => $this->detect_variable_type( $placeholder_value ),
					'value' => $placeholder_value,
					'source' => 'css-converter-placeholder',
					'selector' => $var_data['selector'] ?? ':root',
				];
			} else {
				$converted[ $clean_name ] = [
					'type' => $this->detect_variable_type( $var_data['value'] ),
					'value' => $var_data['value'],
					'source' => $var_data['source'] ?? 'css-converter',
					'selector' => $var_data['selector'] ?? ':root',
				];
			}
		}

		return $converted;
	}

	private function get_placeholder_value_for_variable( string $var_name ): string {
		if ( strpos( $var_name, 'color' ) !== false ) {
			return '#000000';
		}
		
		if ( strpos( $var_name, 'typography' ) !== false || strpos( $var_name, 'font' ) !== false ) {
			return 'inherit';
		}
		
		if ( strpos( $var_name, 'size' ) !== false || strpos( $var_name, 'width' ) !== false || strpos( $var_name, 'height' ) !== false ) {
			return '0px';
		}
		
		return 'inherit';
	}

	private function clean_variable_name( string $var_name ): string {
		$clean_name = ltrim( $var_name, '-' );
		$clean_name = sanitize_key( $clean_name );
		
		return $clean_name;
	}

	private function detect_variable_type( string $value ): string {
		$value = trim( $value );

		// Color detection
		if ( $this->is_color_value( $value ) ) {
			return 'global-color-variable';
		}

		// Size detection
		if ( $this->is_size_value( $value ) ) {
			return 'global-size-variable';
		}

		// Font detection
		if ( $this->is_font_value( $value ) ) {
			return 'global-font-variable';
		}

		// Default to string
		return 'string';
	}

	private function is_color_value( string $value ): bool {
		// Hex colors
		if ( preg_match( '/^#[0-9a-f]{3,6}$/i', $value ) ) {
			return true;
		}

		// RGB/RGBA colors
		if ( preg_match( '/^rgba?\s*\(/i', $value ) ) {
			return true;
		}

		// HSL/HSLA colors
		if ( preg_match( '/^hsla?\s*\(/i', $value ) ) {
			return true;
		}

		// Named colors (basic check)
		$named_colors = [ 'red', 'blue', 'green', 'black', 'white', 'transparent', 'inherit', 'currentColor' ];
		if ( in_array( strtolower( $value ), $named_colors, true ) ) {
			return true;
		}

		return false;
	}

	private function is_size_value( string $value ): bool {
		// Check for size units
		return preg_match( '/^\d*\.?\d+(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax)$/i', $value );
	}

	private function is_font_value( string $value ): bool {
		// Check for font family patterns
		return preg_match( '/["\']?[a-z\s-]+["\']?(\s*,\s*["\']?[a-z\s-]+["\']?)*/i', $value ) && 
			   ! $this->is_color_value( $value ) && 
			   ! $this->is_size_value( $value );
	}
}
