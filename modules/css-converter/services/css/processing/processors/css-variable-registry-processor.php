<?php
namespace Elementor\Modules\CssConverter\Services\Css\Processing\Processors;

use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processor_Interface;
use Elementor\Modules\CssConverter\Services\Css\Processing\Contracts\Css_Processing_Context;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Css_Variable_Registry_Processor implements Css_Processor_Interface {
	private $css_variable_definitions = [];

	public function get_processor_name(): string {
		return 'css_variable_registry';
	}

	public function get_priority(): int {
		return 9; // Right after CSS parsing
	}

	public function supports_context( Css_Processing_Context $context ): bool {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		return ! empty( $css_rules ) || ! empty( $css );
	}

	public function process( Css_Processing_Context $context ): Css_Processing_Context {
		$css_rules = $context->get_metadata( 'css_rules', [] );
		$css = $context->get_metadata( 'css', '' );
		$beautified_css = $context->get_metadata( 'beautified_css', '' );

		$this->css_variable_definitions = [];

		$variables_extracted = $this->extract_css_variable_definitions_from_rules( $css_rules );

		$cssToCheck = ! empty( $css ) ? $css : $beautified_css;

		if ( ! empty( $cssToCheck ) ) {
			$kitVariablesExtracted = $this->extract_kit_css_variables_from_raw_css( $cssToCheck );
			$variables_extracted += $kitVariablesExtracted;
		}

		$existing_definitions = $context->get_metadata( 'css_variable_definitions', [] );
		if ( ! empty( $existing_definitions ) ) {
			$this->css_variable_definitions = array_merge( $existing_definitions, $this->css_variable_definitions );
		}

		$context->set_metadata( 'css_variable_definitions', $this->css_variable_definitions );

		$context->add_statistic( 'css_variables_registered', $variables_extracted );

		return $context;
	}

	public function get_statistics_keys(): array {
		return [
			'css_variables_registered',
		];
	}

	private function extract_css_variable_definitions_from_rules( array $css_rules ): int {
		$variables_extracted = 0;

		foreach ( $css_rules as $rule ) {
			$selector = $rule['selector'] ?? '';
			$properties = $rule['properties'] ?? [];
			$variables_extracted += $this->process_css_variable_declarations_from_properties( $selector, $properties );
		}

		return $variables_extracted;
	}

	private function process_css_variable_declarations_from_properties( string $selector, array $properties ): int {
		$variables_processed = 0;

		foreach ( $properties as $property_data ) {
			$property = $property_data['property'] ?? '';
			$value = $property_data['value'] ?? '';

			if ( 0 === strpos( $property, '--' ) ) {
				$this->store_css_variable_definition( $property, $value, $selector );
				++$variables_processed;
			} else {
				$extracted = $this->extract_variable_references_from_value( $value, $selector );
				$variables_processed += $extracted;
			}
		}

		return $variables_processed;
	}

	private function extract_variable_references_from_value( string $value, string $selector ): int {
		$extracted = 0;
		if ( preg_match_all( '/var\s*\(\s*(--[a-zA-Z0-9_-]+)/', $value, $matches ) ) {
			foreach ( $matches[1] as $variable_name ) {
				$variable_name = trim( $variable_name );

				if ( ! isset( $this->css_variable_definitions[ $variable_name ] ) ) {
					$this->store_css_variable_definition( $variable_name, '', $selector );
					++$extracted;
				}
			}
		}
		return $extracted;
	}

	private function store_css_variable_definition( string $variable_name, string $value, string $selector ): void {
		$clean_name = $this->clean_variable_name( $variable_name );

		// Skip if empty value and variable already exists WITH a non-empty value
		if ( empty( $value ) && isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$existing_value = $this->css_variable_definitions[ $clean_name ]['value'] ?? '';
			if ( ! empty( $existing_value ) ) {
				return; // Don't overwrite existing non-empty value
			}
			// Continue if existing value is also empty (we'll update other metadata)
		}

		$new_specificity = $this->calculate_selector_specificity( $selector );
		$existing_specificity = 0;

		if ( isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$existing_specificity = $this->calculate_selector_specificity( $this->css_variable_definitions[ $clean_name ]['selector'] );
		}

		if ( ! isset( $this->css_variable_definitions[ $clean_name ] ) ) {
			$this->css_variable_definitions[ $clean_name ] = [
				'name' => $variable_name,
				'value' => $value,
				'selector' => $selector,
				'specificity' => $new_specificity,
				'source' => empty( $value ) ? 'extracted_from_reference' : 'extracted_from_css',
				'type' => $this->classify_variable( $variable_name, $value ),
			];
		} elseif ( empty( $this->css_variable_definitions[ $clean_name ]['value'] ) || $this->css_variable_definitions[ $clean_name ]['source'] === 'extracted_from_reference' ) {
			if ( ! empty( $value ) ) {
				$this->css_variable_definitions[ $clean_name ]['value'] = $value;
				$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
				$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
				$this->css_variable_definitions[ $clean_name ]['source'] = 'extracted_from_css';
			}
		} elseif ( $new_specificity > $existing_specificity ) {
			$this->css_variable_definitions[ $clean_name ]['value'] = $value;
			$this->css_variable_definitions[ $clean_name ]['selector'] = $selector;
			$this->css_variable_definitions[ $clean_name ]['specificity'] = $new_specificity;
			$this->css_variable_definitions[ $clean_name ]['type'] = $this->classify_variable( $variable_name, $value );
		}
	}

	private function clean_variable_name( string $variable_name ): string {
		$clean = trim( $variable_name );
		if ( 0 === strpos( $clean, '--' ) ) {
			$clean = substr( $clean, 2 );
		}
		return $clean;
	}

	private function calculate_selector_specificity( string $selector ): int {
		$id_count = substr_count( $selector, '#' );
		$class_count = substr_count( $selector, '.' );
		$element_count = preg_match_all( '/\b[a-z]+\b/', $selector );
		return ( $id_count * 100 ) + ( $class_count * 10 ) + $element_count;
	}

	private function extract_kit_css_variables_from_raw_css( string $css ): int {
		$extracted = 0;

		$hasVariables = strpos( $css, '--' ) !== false;

		if ( ! $hasVariables ) {
			return 0;
		}

		$patterns = [
			'/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/',
			'/(--[a-zA-Z0-9-]+)\s*:\s*([^}]+?)(?=\s*--[a-zA-Z0-9-]+|\s*})/)',
			'/(--[a-zA-Z0-9-]+):([^;]+);/',
		];

		$allVarMatches = [];
		foreach ( $patterns as $pattern_idx => $pattern ) {
			preg_match_all( $pattern, $css, $matches, PREG_SET_ORDER );
			if ( ! empty( $matches ) ) {
				$allVarMatches = array_merge( $allVarMatches, $matches );
			}
		}

		foreach ( $allVarMatches as $match ) {
			$varName = trim( $match[1] );
			$varValue = trim( $match[2] ?? '' );

			$clean_name = $this->clean_variable_name( $varName );

			$existing_value = $this->css_variable_definitions[ $clean_name ]['value'] ?? null;
			if ( $existing_value === null || $existing_value === '' ) {
				$this->css_variable_definitions[ $clean_name ] = [
					'name' => $varName,
					'value' => $varValue,
					'selector' => 'kit-css',
					'specificity' => 1000,
					'source' => 'extracted_from_kit_css',
				];
				++$extracted;
			}
		}

		return $extracted;
	}

	private function classify_variable( string $var_name, string $value ): string {
		$VARIABLE_TYPE_COLOR = 'color';
		$VARIABLE_TYPE_FONT = 'font';
		$VARIABLE_TYPE_SIZE = 'size';
		$VARIABLE_TYPE_LOCAL = 'local';
		$VARIABLE_TYPE_UNSUPPORTED = 'unsupported';

		if ( $this->is_color_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_COLOR;
		}

		if ( $this->is_font_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_FONT;
		}

		if ( $this->is_size_variable( $var_name, $value ) ) {
			return $VARIABLE_TYPE_SIZE;
		}

		if ( $this->is_local_variable( $var_name ) ) {
			return $VARIABLE_TYPE_LOCAL;
		}

		return $VARIABLE_TYPE_UNSUPPORTED;
	}

	private function is_color_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '--e-global-color-' ) === 0 ) {
			return true;
		}

		if ( $this->is_color_value( $value ) ) {
			return true;
		}

		return false;
	}

	private function is_font_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '-font-family' ) !== false ) {
			return true;
		}

		if ( strpos( $var_name, '--e-global-typography-' ) === 0 && strpos( $var_name, '-font-family' ) !== false ) {
			return true;
		}

		return false;
	}

	private function is_size_variable( string $var_name, string $value ): bool {
		if ( strpos( $var_name, '--e-global-size-' ) === 0 ) {
			return true;
		}

		if ( ! class_exists( 'ElementorPro\\Plugin' ) ) {
			return false;
		}

		return false;
	}

	private function is_size_value( string $value ): bool {
		return (bool) preg_match( '/^-?\d+\.?\d*(px|em|rem|%|vh|vw|vmin|vmax|auto)$/', trim( $value ) );
	}

	private function is_color_value( string $value ): bool {
		$value = trim( $value );

		if ( preg_match( '/^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/', $value ) ) {
			return true;
		}

		if ( preg_match( '/^rgba\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/', $value ) ) {
			return true;
		}

		$named_colors = [
			'red',
			'blue',
			'green',
			'yellow',
			'orange',
			'purple',
			'pink',
			'brown',
			'black',
			'white',
			'gray',
			'grey',
			'transparent',
			'currentColor',
		];

		return in_array( strtolower( $value ), $named_colors, true );
	}

	private function is_local_variable( string $var_name ): bool {
		$local_variable_patterns = [
			'display',
			'flex-direction',
			'justify-content',
			'align-items',
			'align-content',
			'flex-wrap',
			'text-align',
			'font-weight',
			'position',
			'z-index',
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'padding-block-start',
			'padding-block-end',
			'padding-inline-start',
			'padding-inline-end',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-block-start',
			'margin-block-end',
			'margin-inline-start',
			'margin-inline-end',
			'border-radius',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
			'border-block-start-width',
			'border-block-end-width',
			'border-inline-start-width',
			'border-inline-end-width',
			'width',
			'height',
			'gap',
			'row-gap',
			'column-gap',
			'widgets-spacing-row',
			'widgets-spacing-column',
			'container-max-width',
			'container-widget-flex-grow',
			'background-overlay',
		];

		foreach ( $local_variable_patterns as $pattern ) {
			if ( strpos( $var_name, '--' . $pattern ) === 0 ) {
				return true;
			}
		}

		return false;
	}
}
