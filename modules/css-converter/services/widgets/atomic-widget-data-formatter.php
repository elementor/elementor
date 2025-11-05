<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Css_Converter_Config;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

class Atomic_Widget_Data_Formatter {
	public function __construct() {
	}

	public static function make(): self {
		return new self();
	}
	public function format_widget_data( array $resolved_styles, array $widget, string $widget_id, Custom_Css_Collector $custom_css_collector = null ): array {
		error_log( "CUSTOM_CSS_DEBUG: format_widget_data - element_id=" . ($widget['element_id'] ?? 'NONE') . ", resolved_styles_count=" . count($resolved_styles) . ", inline_css_count=" . count($widget['inline_css'] ?? []) );
		error_log( "CUSTOM_CSS_DEBUG: format_widget_data - resolved_styles keys: " . implode(', ', array_keys($resolved_styles)) );
		
		// Generate atomic-style widget ID (7-char hex)
		$atomic_widget_id = $this->generate_atomic_widget_id();
		$class_id = $this->create_atomic_style_class_name( $atomic_widget_id );
		$atomic_props = $this->extract_atomic_props_from_resolved_styles( $resolved_styles );
		error_log( "CUSTOM_CSS_DEBUG: format_widget_data - atomic_props count: " . count($atomic_props) );
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
	$custom_css = $this->get_custom_css_for_widget( $widget, $css_classes, $custom_css_collector, $widget_id );
	$style_definition = $this->create_unified_style_definition( $class_id, $atomic_props, $custom_css );
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
			$converted_value = $style_data['converted_property'] ?? 'NULL';
			error_log( "CUSTOM_CSS_DEBUG: extract_atomic_props - property={$property}, converted_property=" . ( is_null($converted_value) ? 'NULL' : ( is_array($converted_value) ? 'ARRAY:' . json_encode($converted_value) : 'NOT_ARRAY' ) ) );
			
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
	private function get_custom_css_for_widget( array $widget, array $css_classes, Custom_Css_Collector $custom_css_collector = null, string $widget_id = null ): string {
		if ( ! $custom_css_collector ) {
			return '';
		}

		// Check widget_id first
		if ( $widget_id && $custom_css_collector->has_custom_css( $widget_id ) ) {
			return $custom_css_collector->get_custom_css_for_widget( $widget_id );
		}

		// Check element_id (for inline styles)
		$element_id = $widget['element_id'] ?? null;
		if ( $element_id && $custom_css_collector->has_custom_css( $element_id ) ) {
			return $custom_css_collector->get_custom_css_for_widget( $element_id );
		}

		// Check CSS classes
		foreach ( $css_classes as $class_name ) {
			if ( $custom_css_collector->has_custom_css( $class_name ) ) {
				return $custom_css_collector->get_custom_css_for_widget( $class_name );
			}
		}

		return '';
	}

	private function create_unified_style_definition( string $class_id, array $atomic_props, string $custom_css = '' ): array {
		$custom_css_field = null;
		if ( ! empty( $custom_css ) ) {
			$custom_css_field = [
				'raw' => base64_encode( $custom_css ),
			];
		}
		
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
					'custom_css' => $custom_css_field,
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
		
		// CRITICAL FIX: Do NOT add ANY widget classes to widget settings
		// Widget classes (elementor-*, e-con*, etc.) should be converted to direct styles by Widget Class Processor
		// ONLY add global classes to widget settings
		if ( ! empty( $css_classes ) ) {
			$global_classes_only = array_filter( $css_classes, function( $class ) {
				// Check if this is a widget class (starts with 'elementor-' or 'e-con')
				$is_widget_class = (
					strpos( $class, 'elementor-' ) === 0 ||
					strpos( $class, 'e-con' ) === 0
				);
				
				// Only keep classes that are NOT widget classes (i.e., only global classes)
				return ! $is_widget_class;
			});
			
			// Only add classes if we have global classes
			if ( ! empty( $global_classes_only ) ) {
				$formatted_settings['classes'] = $this->format_css_classes_in_atomic_format( $global_classes_only );
			}
		}

		// Add custom CSS if present - check both widget ID and class names
		$collector_id = $custom_css_collector ? 'COLLECTOR_PRESENT' : 'NULL';
		error_log( "CUSTOM_CSS_DEBUG: format_widget_settings checking for custom CSS with widget_id={$widget_id}, collector={$collector_id}" );
		$custom_css = '';
		
		// First try the widget ID
		if ( $custom_css_collector && $custom_css_collector->has_custom_css( $widget_id ) ) {
			error_log( "CUSTOM_CSS_DEBUG: Custom CSS found for widget_id={$widget_id}" );
			$custom_css = $custom_css_collector->get_custom_css_for_widget( $widget_id );
		}
		
		// If not found, try the widget's class names (for global classes)
		if ( empty( $custom_css ) && ! empty( $css_classes ) ) {
			foreach ( $css_classes as $class_name ) {
				if ( $custom_css_collector && $custom_css_collector->has_custom_css( $class_name ) ) {
					error_log( "CUSTOM_CSS_DEBUG: Custom CSS found for class_name={$class_name}" );
					$custom_css = $custom_css_collector->get_custom_css_for_widget( $class_name );
					error_log( "CUSTOM_CSS_DEBUG: Retrieved custom_css length: " . strlen( $custom_css ) . ", content: " . substr( $custom_css, 0, 50 ) );
					break;
				}
			}
		}
		
		error_log( "CUSTOM_CSS_DEBUG: Final custom_css before check - length: " . strlen( $custom_css ) . ", empty: " . ( empty( $custom_css ) ? 'true' : 'false' ) );
		
		if ( ! empty( $custom_css ) ) {
			// Store as plain string for legacy editor compatibility
			$formatted_settings['custom_css'] = $custom_css;
			error_log( "CUSTOM_CSS_DEBUG: Custom CSS SET in formatted_settings: " . substr( $custom_css, 0, 100 ) );
		} else {
			error_log( "CUSTOM_CSS_DEBUG: No custom CSS found for widget_id={$widget_id} or classes: " . implode( ', ', $css_classes ) );
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
		$widget_type = $widget['widget_type'] ?? '';
		$element_id = $widget['element_id'] ?? 'unknown';
		
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$class_string = $widget['attributes']['class'];
			$class_array = explode( ' ', $class_string );
			
			// DEBUG: Track classes being extracted for heading widgets
			if ( $widget_type === 'e-heading' ) {
				$debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';
				file_put_contents(
					$debug_log,
					date( '[H:i:s] ' ) . "ATOMIC_DATA_FORMATTER: Extracting classes for {$widget_type} {$element_id}\n" .
					"  Class string: '{$class_string}'\n" .
					"  Class array: " . implode( ', ', $class_array ) . "\n",
					FILE_APPEND
				);
			}
			
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				if ( ! empty( $class ) ) {
					$classes[] = $class;
				}
			}
		} else {
			// DEBUG: Track when no classes found
			if ( $widget_type === 'e-heading' ) {
				$debug_log = WP_CONTENT_DIR . '/processor-data-flow.log';
				file_put_contents(
					$debug_log,
					date( '[H:i:s] ' ) . "ATOMIC_DATA_FORMATTER: No classes found for {$widget_type} {$element_id}\n",
					FILE_APPEND
				);
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
