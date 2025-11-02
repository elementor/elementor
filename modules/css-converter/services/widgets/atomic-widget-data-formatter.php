<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Css_Converter_Config;
use Elementor\Modules\CssConverter\Services\Widgets\Elementor_Class_Filter;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

class Atomic_Widget_Data_Formatter {
	private $class_filter;
	public function __construct() {
		$this->class_filter = new Elementor_Class_Filter();
	}

	public static function make(): self {
		return new self();
	}
	public function format_widget_data( array $resolved_styles, array $widget, string $widget_id, Custom_Css_Collector $custom_css_collector = null ): array {
		// Generate atomic-style widget ID (7-char hex)
		$atomic_widget_id = $this->generate_atomic_widget_id();
		$class_id = $this->create_atomic_style_class_name( $atomic_widget_id );
		$atomic_props = $this->extract_atomic_props_from_resolved_styles( $resolved_styles );
		$css_classes = $this->extract_css_classes_from_widget( $widget );

		// Note: Base classes (e.g., e-heading-base) are added automatically by atomic widget Twig templates
		// CSS Converter should only add generated style classes and user-defined classes
		$widget_type = $widget['widget_type'] ?? 'e-div-block';
		if ( empty( $atomic_props ) && empty( $css_classes ) ) {
			return [
				'widgetType' => $widget_type,
				'settings' => $this->format_widget_settings( $widget, $css_classes, $custom_css_collector, $widget_id ),
				'styles' => [],
			];
		}
		$style_definition = $this->create_unified_style_definition( $class_id, $atomic_props );
		// Add the generated style class to css_classes so it gets applied to HTML
		if ( ! empty( $atomic_props ) ) {
			$css_classes[] = $class_id;
		}
		$final_widget_data = [
			'widgetType' => $widget_type,
			'settings' => $this->format_widget_settings( $widget, $css_classes, $custom_css_collector, $widget_id ),
			'styles' => [
				$class_id => $style_definition,
			],
		];

		return $final_widget_data;
	}
	public function format_global_class_data( string $class_name, array $atomic_props ): array {
		return [
			'id' => $class_name,
			'label' => $class_name,
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $atomic_props,
					'custom_css' => null,
				],
			],
		];
	}
	private function extract_atomic_props_from_resolved_styles( array $resolved_styles ): array {
		$atomic_props = [];
		
		foreach ( $resolved_styles as $property => $style_data ) {
			if ( isset( $style_data['converted_property'] ) && is_array( $style_data['converted_property'] ) ) {
				$converted_property = $style_data['converted_property'];
				
				if ( isset( $converted_property['$$type'] ) ) {
					$target_property = $this->get_target_property_name( $property );
					$atomic_props[ $target_property ] = $converted_property;
				} else {
					foreach ( $converted_property as $prop_name => $atomic_format ) {
						if ( isset( $atomic_format['$$type'] ) ) {
							$target_property = $this->get_target_property_name( $prop_name );
							$atomic_props[ $target_property ] = $atomic_format;
						}
					}
				}
			}
		}
		
		return $atomic_props;
	}
	private function create_unified_style_definition( string $class_id, array $atomic_props ): array {
		return [
			'id' => $class_id,
			'cssName' => $class_id,
			'label' => 'local',
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => $atomic_props,
					'custom_css' => null,
				],
			],
		];
	}
	private function extract_css_classes_from_widget( array $widget ): array {
		$classes = [];
		$classes = $this->extract_css_classes_from_widget_attributes( $widget, $classes );
		return $classes;
	}
	private function format_widget_settings( array $widget, array $css_classes, Custom_Css_Collector $custom_css_collector = null, string $widget_id = '' ): array {
		$settings = $widget['settings'] ?? [];
		// Convert raw settings values to atomic prop format
		$formatted_settings = $this->convert_settings_to_atomic_format( $settings );
		if ( ! empty( $css_classes ) ) {
			$formatted_settings['classes'] = $this->format_css_classes_in_atomic_format( $css_classes );
		}

		// Add custom CSS if present
		if ( $custom_css_collector && $custom_css_collector->has_custom_css( $widget_id ) ) {
			$custom_css = $custom_css_collector->get_custom_css_for_widget( $widget_id );
			$formatted_settings['custom-css'] = [
				'$$type' => 'string',
				'value' => $custom_css,
			];
		}

		return $formatted_settings;
	}
	private function create_atomic_style_class_name( string $widget_id ): string {
		// Generate atomic widget CSS class format: e-{widget-id}-{unique-id}
		// Based on atomic widgets pattern from utils.php and get-random-style-id.js
		$unique_id = $this->generate_atomic_unique_id();
		return "e-{$widget_id}-{$unique_id}";
	}
	private function generate_atomic_unique_id(): string {
		// Generate 7-character hex ID like atomic widgets do
		// Based on Utils::generate_id() from atomic-widgets/utils.php
		return substr( bin2hex( random_bytes( 4 ) ), 0, 7 );
	}
	private function generate_atomic_widget_id(): string {
		// Generate 7-character hex widget ID like atomic widgets do
		return substr( bin2hex( random_bytes( 4 ) ), 0, 7 );
	}
	private function get_target_property_name( string $property ): string {
		return \Elementor\Modules\CssConverter\Services\Css\Css_Converter_Config::get_mapped_property_name( $property );
	}
	private function extract_css_classes_from_widget_attributes( array $widget, array $classes ): array {
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$class_string = $widget['attributes']['class'];
			$class_array = explode( ' ', $class_string );
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				if ( ! empty( $class ) && $this->class_filter->should_preserve_class( $class ) ) {
					$classes[] = $class;
				}
			}
		}
		return $classes;
	}
	private function format_css_classes_in_atomic_format( array $css_classes ): array {
		return [
			'$$type' => 'classes',
			'value' => array_values( $css_classes ),
		];
	}
	private function convert_settings_to_atomic_format( array $settings ): array {
		$formatted_settings = [];
		foreach ( $settings as $key => $value ) {
			$formatted_settings[ $key ] = $this->convert_value_to_atomic_format( $value );
		}
		return $formatted_settings;
	}
	private function convert_value_to_atomic_format( $value ) {
		if ( is_array( $value ) && isset( $value['$$type'] ) ) {
			return $value;
		}
		if ( is_string( $value ) ) {
			$decoded_value = $this->decode_unicode_sequences( $value );
			return [
				'$$type' => 'string',
				'value' => $decoded_value,
			];
		}
		// Convert numbers to atomic number format (for level, etc.)
		if ( is_numeric( $value ) ) {
			return [
				'$$type' => 'number',
				'value' => (int) $value,
			];
		}
		return $value;
	}

	private function decode_unicode_sequences( $text ) {
		if ( ! is_string( $text ) ) {
			return $text;
		}
		
		return preg_replace_callback(
			'/u([0-9A-Fa-f]{4})/',
			function( $matches ) {
				$unicode_code = hexdec( $matches[1] );
				if ( function_exists( 'mb_chr' ) ) {
					return mb_chr( $unicode_code, 'UTF-8' );
				}
				if ( class_exists( 'IntlChar' ) && method_exists( 'IntlChar', 'chr' ) ) {
					return \IntlChar::chr( $unicode_code );
				}
				$hex_code = strtoupper( $matches[1] );
				return json_decode( '"\\u' . $hex_code . '"' );
			},
			$text
		);
	}
}
