<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\CssConverter\Services\Css\Css_Converter_Config;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

class Atomic_Widget_Data_Formatter {
	private array $class_name_mappings = [];

	public function __construct() {
	}

	public function set_class_name_mappings( array $class_name_mappings ): void {
		$this->class_name_mappings = $class_name_mappings;
	}

	public static function make(): self {
		return new self();
	}
	public function format_widget_data( array $resolved_styles, array $widget, string $widget_id, Custom_Css_Collector $custom_css_collector = null ): array {
		$atomic_widget_id = $this->generate_atomic_widget_id();
		$class_id = $this->create_atomic_style_class_name( $atomic_widget_id );
		$element_id = $widget['element_id'] ?? 'unknown';
		
		if ( strpos( $element_id, 'element-div-11' ) !== false ) {
			error_log( 'CSS_CONVERTER_DEBUG: format_widget_data for ' . $element_id . ' - resolved_styles keys: ' . implode( ', ', array_keys( $resolved_styles ) ) );
			foreach ( $resolved_styles as $prop => $style_data ) {
				if ( in_array( $prop, [ 'display', 'align-items' ], true ) ) {
					error_log( 'CSS_CONVERTER_DEBUG: format_widget_data - resolved_styles[' . $prop . ']: ' . print_r( $style_data, true ) );
				}
			}
		}
		
		$atomic_props = $this->extract_atomic_props_from_resolved_styles( $resolved_styles );
		$css_classes = $this->extract_css_classes_from_widget( $widget );

		// Note: Base classes (e.g., e-heading-base) are added automatically by atomic widget Twig templates
		// CSS Converter should only add generated style classes and user-defined classes
		$widget_type = $widget['widget_type'] ?? 'e-div-block';
		if ( strpos( $element_id, 'element-div-11' ) !== false || strpos( implode( ' ', $css_classes ), 'brxw-intro-02-2' ) !== false ) {
			error_log( 'CSS_CONVERTER_DEBUG: format_widget_data for ' . $element_id . ' - atomic_props: ' . count( $atomic_props ) . ' (' . implode( ', ', array_keys( $atomic_props ) ) . '), css_classes: ' . count( $css_classes ) . ' (' . implode( ', ', $css_classes ) . ')' );
		}
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

		$element_id = $widget['element_id'] ?? null;
		$classes_string = implode( ' ', $css_classes );
		$is_brxw_intro_02 = strpos( $classes_string, 'brxw-intro-02' ) !== false;
		if ( $is_brxw_intro_02 ) {
			error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - element_id: ' . $element_id . ', classes: ' . $classes_string );
		}

		// Check widget_id first
		if ( $widget_id && $custom_css_collector->has_custom_css( $widget_id ) ) {
			$css = $custom_css_collector->get_custom_css_for_widget( $widget_id );
			if ( $is_brxw_intro_02 ) {
				error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Found CSS for widget_id ' . $widget_id . ': ' . substr( $css, 0, 100 ) );
			}
			return $css;
		}

		// Check element_id (for inline styles)
		if ( $element_id && $custom_css_collector->has_custom_css( $element_id ) ) {
			$css = $custom_css_collector->get_custom_css_for_widget( $element_id );
			if ( $is_brxw_intro_02 ) {
				error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Found CSS for element_id ' . $element_id . ': ' . substr( $css, 0, 100 ) );
			}
			return $css;
		}

		// Check CSS classes
		foreach ( $css_classes as $class_name ) {
			if ( $custom_css_collector->has_custom_css( $class_name ) ) {
				$css = $custom_css_collector->get_custom_css_for_widget( $class_name );
				if ( $is_brxw_intro_02 ) {
					error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Found CSS for class ' . $class_name . ': ' . substr( $css, 0, 100 ) );
				}
				return $css;
			}
		}

		// Check mapped class names (reverse lookup)
		if ( $is_brxw_intro_02 ) {
			error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - No CSS found for classes, checking mapped names' );
			error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - class_name_mappings: ' . print_r( $this->class_name_mappings, true ) );
		}
		foreach ( $css_classes as $class_name ) {
			if ( $is_brxw_intro_02 && strpos( $class_name, 'brxw-intro-02' ) !== false ) {
				error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Checking reverse lookup for: ' . $class_name );
			}
			$original_class_name = $this->find_original_class_name_for_mapped( $class_name );
			if ( $is_brxw_intro_02 && strpos( $class_name, 'brxw-intro-02' ) !== false ) {
				error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Reverse lookup result for ' . $class_name . ': ' . ( $original_class_name ?? 'NULL' ) );
			}
			if ( $original_class_name && $original_class_name !== $class_name && $custom_css_collector->has_custom_css( $original_class_name ) ) {
				$css = $custom_css_collector->get_custom_css_for_widget( $original_class_name );
				if ( $is_brxw_intro_02 ) {
					error_log( 'CSS_CONVERTER_DEBUG: get_custom_css_for_widget - Found CSS for mapped class ' . $class_name . ' using original ' . $original_class_name . ': ' . substr( $css, 0, 150 ) );
				}
				return $css;
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
		
		if ( strpos( $class_id, 'e-' ) === 0 ) {
			$element_id_from_class = str_replace( 'e-', '', $class_id );
			if ( strpos( $element_id_from_class, 'element-div-11' ) !== false || in_array( 'display', array_keys( $atomic_props ), true ) ) {
				error_log( 'CSS_CONVERTER_DEBUG: create_unified_style_definition for ' . $class_id . ' - atomic_props keys: ' . implode( ', ', array_keys( $atomic_props ) ) );
				foreach ( $atomic_props as $prop => $atomic_value ) {
					if ( in_array( $prop, [ 'display', 'align-items' ], true ) ) {
						error_log( 'CSS_CONVERTER_DEBUG: create_unified_style_definition - atomic_props[' . $prop . ']: ' . print_r( $atomic_value, true ) );
					}
				}
			}
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
			
			if ( ! empty( $global_classes_only ) ) {
				foreach ( $global_classes_only as $class ) {
					if ( strpos( $class, 'intro-section' ) !== false ) {
						error_log( 'CSS_CONVERTER_DEBUG: Adding intro-section to settings.classes for widget ' . $widget_id );
					}
				}
				error_log( 'CSS_CONVERTER_DEBUG: Adding ' . count( $global_classes_only ) . ' global classes to settings.classes for widget ' . $widget_id );
				$formatted_settings['classes'] = $this->format_css_classes_in_atomic_format( $global_classes_only );
			} else {
				error_log( 'CSS_CONVERTER_DEBUG: No global classes to add (all filtered out as widget classes) for widget ' . $widget_id );
			}
		}

		$custom_css = '';
		$element_id = $widget['element_id'] ?? null;
		
		if ( $custom_css_collector && $custom_css_collector->has_custom_css( $widget_id ) ) {
			$custom_css = $custom_css_collector->get_custom_css_for_widget( $widget_id );
		}
		
		if ( empty( $custom_css ) && $element_id && $custom_css_collector && $custom_css_collector->has_custom_css( $element_id ) ) {
			$custom_css = $custom_css_collector->get_custom_css_for_widget( $element_id );
			if ( strpos( implode( ' ', $css_classes ), 'brxw-intro-02' ) !== false ) {
				error_log( 'CSS_CONVERTER_DEBUG: format_widget_settings - Found CSS for element_id ' . $element_id . ': ' . substr( $custom_css, 0, 100 ) );
			}
		}
		
		if ( empty( $custom_css ) && ! empty( $css_classes ) ) {
			if ( strpos( implode( ' ', $css_classes ), 'brxw-intro-02' ) !== false ) {
				error_log( 'CSS_CONVERTER_DEBUG: format_widget_settings - css_classes for widget ' . $widget_id . ': ' . implode( ', ', $css_classes ) );
			}
			foreach ( $css_classes as $class_name ) {
				if ( $custom_css_collector && $custom_css_collector->has_custom_css( $class_name ) ) {
					$custom_css = $custom_css_collector->get_custom_css_for_widget( $class_name );
					if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
						error_log( 'CSS_CONVERTER_DEBUG: Found custom CSS for ' . $class_name . ': ' . substr( $custom_css, 0, 100 ) );
					}
					break;
				}
			}
			
			if ( empty( $custom_css ) ) {
				foreach ( $css_classes as $class_name ) {
					if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
						error_log( 'CSS_CONVERTER_DEBUG: Checking mapped class for custom CSS: ' . $class_name );
					}
					$original_class_name = $this->find_original_class_name_for_mapped( $class_name );
					if ( $original_class_name && $original_class_name !== $class_name ) {
						if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
							error_log( 'CSS_CONVERTER_DEBUG: Mapped class ' . $class_name . ' -> original ' . $original_class_name );
							error_log( 'CSS_CONVERTER_DEBUG: Original class has custom CSS: ' . ( $custom_css_collector && $custom_css_collector->has_custom_css( $original_class_name ) ? 'YES' : 'NO' ) );
						}
						if ( $custom_css_collector && $custom_css_collector->has_custom_css( $original_class_name ) ) {
							$custom_css = $custom_css_collector->get_custom_css_for_widget( $original_class_name );
							if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
								error_log( 'CSS_CONVERTER_DEBUG: Found custom CSS for mapped class ' . $class_name . ' using original ' . $original_class_name . ': ' . substr( $custom_css, 0, 150 ) );
							}
							break;
						}
					}
				}
			}
		}
		
		if ( ! empty( $custom_css ) ) {
			$formatted_settings['custom_css'] = $custom_css;
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
			error_log( 'CSS_CONVERTER_DEBUG: Extracting classes from widget ' . $element_id . ' (' . $widget_type . '): ' . $class_string );
			$class_array = explode( ' ', $class_string );
			
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				if ( ! empty( $class ) ) {
					$classes[] = $class;
					if ( strpos( $class, 'intro-section' ) !== false ) {
						error_log( 'CSS_CONVERTER_DEBUG: Found intro-section class in widget ' . $element_id );
					}
				}
			}
			error_log( 'CSS_CONVERTER_DEBUG: Extracted ' . count( $classes ) . ' classes from widget ' . $element_id );
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

	private function find_original_class_name_for_mapped( string $mapped_class_name ): ?string {
		if ( ! empty( $this->class_name_mappings ) ) {
			if ( strpos( $mapped_class_name, 'brxw-intro-02' ) !== false ) {
				error_log( 'CSS_CONVERTER_DEBUG: find_original_class_name_for_mapped - Looking for original of: ' . $mapped_class_name );
				error_log( 'CSS_CONVERTER_DEBUG: find_original_class_name_for_mapped - Available mappings: ' . print_r( $this->class_name_mappings, true ) );
			}
			foreach ( $this->class_name_mappings as $original => $mapped ) {
				if ( $mapped === $mapped_class_name ) {
					if ( strpos( $mapped_class_name, 'brxw-intro-02' ) !== false ) {
						error_log( 'CSS_CONVERTER_DEBUG: find_original_class_name_for_mapped - Found match: ' . $original . ' => ' . $mapped );
					}
					return $original;
				}
			}
		}
		
		if ( strpos( $mapped_class_name, '-2' ) !== false || strpos( $mapped_class_name, '-3' ) !== false ) {
			$possible_original = preg_replace( '/-(\d+)$/', '', $mapped_class_name );
			if ( $possible_original !== $mapped_class_name ) {
				if ( strpos( $mapped_class_name, 'brxw-intro-02' ) !== false ) {
					error_log( 'CSS_CONVERTER_DEBUG: find_original_class_name_for_mapped - Using regex fallback: ' . $mapped_class_name . ' => ' . $possible_original );
				}
				return $possible_original;
			}
		}
		if ( strpos( $mapped_class_name, 'brxw-intro-02' ) !== false ) {
			error_log( 'CSS_CONVERTER_DEBUG: find_original_class_name_for_mapped - No match found for: ' . $mapped_class_name );
		}
		return null;
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
