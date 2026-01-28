<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Factories;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Atomic_Widget_Data_Formatter;
use Elementor\Modules\CssConverter\Services\Css\Custom_Css_Collector;

class Atomic_Widget_Factory implements Widget_Factory_Interface {
	private Atomic_Widget_Data_Formatter $data_formatter;
	private bool $use_zero_defaults;
	private array $css_processing_result;
	private ?Custom_Css_Collector $custom_css_collector;

	public function __construct( bool $use_zero_defaults = false, Custom_Css_Collector $custom_css_collector = null ) {
		$this->data_formatter = Atomic_Widget_Data_Formatter::make();
		$this->use_zero_defaults = $use_zero_defaults;
		$this->css_processing_result = [];
		$this->custom_css_collector = $custom_css_collector;
	}

	public function set_css_processing_result( array $css_processing_result ): void {
		$this->css_processing_result = $css_processing_result;
	}

	public function create_widget( array $widget_data ): array {
		$widget_type = $widget_data['widget_type'];
		$settings = $widget_data['settings'] ?? [];
		$resolved_styles = $widget_data['resolved_styles'] ?? [];
		$widget_id = wp_generate_uuid4();
		$mapped_type = $this->map_to_elementor_widget_type( $widget_type );

		$class_name_mappings = $this->css_processing_result['class_name_mappings'] ?? [];
		if ( ! empty( $class_name_mappings ) && ( isset( $class_name_mappings['brxw-intro-02'] ) || strpos( implode( ' ', array_keys( $class_name_mappings ) ), 'brxw-intro-02' ) !== false ) ) {
		}
		$this->data_formatter->set_class_name_mappings( $class_name_mappings );
		$formatted_widget_data = $this->data_formatter->format_widget_data( $resolved_styles, $widget_data, $widget_id, $this->custom_css_collector );

		if ( $this->requires_link_to_button_conversion( $widget_type, $mapped_type ) ) {
			$settings = $this->convert_link_settings_to_button_format( $settings );
		}

		$final_settings = array_merge( $settings, $formatted_widget_data['settings'] );
		$final_settings = $this->apply_global_classes( $final_settings, $widget_data );

		if ( 'e-div-block' === $mapped_type ) {
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'e-div-block',
				'settings' => $final_settings,
				'isInner' => false,
				'styles' => $formatted_widget_data['styles'],
				'editor_settings' => [
					'css_converter_widget' => true,
				],
				'version' => '0.0',
			];
		} else {
			$elementor_widget = [
				'id' => $widget_id,
				'elType' => 'widget',
				'widgetType' => $mapped_type,
				'settings' => $final_settings,
				'isInner' => false,
				'styles' => $formatted_widget_data['styles'],
				'editor_settings' => [
					'disable_base_styles' => $this->use_zero_defaults,
					'css_converter_widget' => true,
				],
				'version' => '0.0',
			];
		}

		$elementor_widget['elements'] = $widget_data['elements'] ?? [];

		// Add global classes to widget styles for atomic widgets CSS output
		$applicable_global_classes = $this->extract_applicable_global_classes( $widget_data );

		if ( ! empty( $applicable_global_classes ) ) {
			$elementor_widget['styles'] = array_merge(
				$elementor_widget['styles'] ?? [],
				$this->convert_global_classes_to_styles( $applicable_global_classes )
			);
		}

		return $elementor_widget;
	}

	public function supports_widget_type( string $widget_type ): bool {
		return in_array( $widget_type, $this->get_supported_types(), true );
	}

	public function get_supported_types(): array {
		return [
			'e-heading',
			'e-paragraph',
			'e-div-block',
			'e-flexbox',
			'e-link',
			'e-button',
			'e-image',
		];
	}

	private function map_to_elementor_widget_type( string $widget_type ): string {
		$mapping = [
			'e-heading' => 'e-heading',
			'e-paragraph' => 'e-paragraph',
			'e-div-block' => 'e-div-block',
			'e-flexbox' => 'e-flexbox',
			'e-link' => 'e-button',
			'e-button' => 'e-button',
			'e-image' => 'e-image',
		];

		return $mapping[ $widget_type ] ?? 'html';
	}

	private function requires_link_to_button_conversion( string $widget_type, string $mapped_type ): bool {
		return 'e-link' === $widget_type && 'e-button' === $mapped_type;
	}

	private function convert_link_settings_to_button_format( array $settings ): array {
		$button_settings = $settings;

		if ( isset( $settings['url'] ) && ! empty( $settings['url'] ) && '#' !== $settings['url'] ) {
			$target = $settings['target'] ?? '_self';
			$is_target_blank = ( '_blank' === $target ) ? true : null;

			$button_settings['link'] = [
				'$$type' => 'link',
				'value' => [
					'destination' => [
						'$$type' => 'url',
						'value' => $settings['url'],
					],
					'isTargetBlank' => $is_target_blank,
				],
			];

			unset( $button_settings['url'] );
			unset( $button_settings['target'] );
		}

		return $button_settings;
	}

	private function apply_global_classes( array $final_settings, array $widget_data ): array {
		$global_classes = $this->css_processing_result['global_classes'] ?? [];
		$class_name_mappings = $this->css_processing_result['class_name_mappings'] ?? [];

		if ( empty( $global_classes ) ) {
			return $final_settings;
		}

		$widget_classes = $widget_data['attributes']['class'] ?? '';
		$widget_id = $widget_data['element_id'] ?? 'unknown';

		if ( empty( $widget_classes ) ) {
			return $final_settings;
		}

		if ( strpos( $widget_classes, 'intro-section' ) !== false || strpos( $widget_classes, 'brxw-intro-02' ) !== false || strpos( $widget_classes, 'brxe-section' ) !== false ) {
			if ( strpos( $widget_classes, 'brxe-section' ) !== false ) {
				if ( isset( $global_classes['brxe-section'] ) ) {
					$brxe_props = $global_classes['brxe-section']['atomic_props'] ?? [];
				}
			}
		}

		$classes_array = explode( ' ', $widget_classes );
		$applicable_global_classes = [];

		foreach ( $classes_array as $class_name ) {
			$class_name = trim( $class_name );

			if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
			}

			$mapped_class_name = $class_name_mappings[ $class_name ] ?? $class_name;
			
			$original_class_name = null;
			if ( ! empty( $class_name_mappings ) ) {
				foreach ( $class_name_mappings as $original => $mapped ) {
					if ( $mapped === $class_name ) {
						$original_class_name = $original;
						break;
					}
				}
			}
			
			if ( strpos( $class_name, 'brxw-intro-02' ) !== false ) {
				if ( $original_class_name ) {
				}
			}

			if ( isset( $global_classes[ $mapped_class_name ] ) ) {
				$applicable_global_classes[] = $mapped_class_name;
				if ( strpos( $mapped_class_name, 'intro-section' ) !== false || strpos( $mapped_class_name, 'brxw-intro-02' ) !== false || strpos( $mapped_class_name, 'brxe-section' ) !== false ) {
				}
			} elseif ( $original_class_name && isset( $global_classes[ $original_class_name ] ) ) {
				$applicable_global_classes[] = $original_class_name;
				if ( strpos( $original_class_name, 'intro-section' ) !== false || strpos( $original_class_name, 'brxw-intro-02' ) !== false || strpos( $original_class_name, 'brxe-section' ) !== false ) {
				}
			} elseif ( isset( $global_classes[ $class_name ] ) ) {
				$applicable_global_classes[] = $class_name;
				if ( strpos( $class_name, 'intro-section' ) !== false || strpos( $class_name, 'brxw-intro-02' ) !== false || strpos( $class_name, 'brxe-section' ) !== false ) {
				}
			}
		}

		if ( ! empty( $applicable_global_classes ) ) {
			$existing_classes = $final_settings['classes']['value'] ?? [];
			$merged_classes = array_merge( $existing_classes, $applicable_global_classes );

			$final_settings['classes'] = [
				'$$type' => 'classes',
				'value' => array_values( array_unique( $merged_classes ) ),
			];
			if ( strpos( $widget_classes, 'brxw-intro-02' ) !== false ) {
			} elseif ( in_array( 'intro-section', $merged_classes, true ) ) {
			}
		} else {
			if ( strpos( $widget_classes, 'intro-section' ) !== false || strpos( $widget_classes, 'brxw-intro-02' ) !== false || strpos( $widget_classes, 'brxe-section' ) !== false ) {
			}
		}

		return $final_settings;
	}

	private function extract_applicable_global_classes( array $widget_data ): array {
		$global_classes = $this->css_processing_result['global_classes'] ?? [];
		if ( empty( $global_classes ) ) {
			return [];
		}

		$widget_classes = $widget_data['attributes']['class'] ?? '';
		if ( empty( $widget_classes ) ) {
			return [];
		}

		$classes_array = explode( ' ', $widget_classes );
		$applicable_global_classes = [];

		foreach ( $classes_array as $class_name ) {
			$class_name = trim( $class_name );
			if ( isset( $global_classes[ $class_name ] ) ) {
				$applicable_global_classes[ $class_name ] = $global_classes[ $class_name ];
			}
		}

		return $applicable_global_classes;
	}

	private function convert_global_classes_to_styles( array $global_classes ): array {
		$styles = [];

		foreach ( $global_classes as $class_name => $class_data ) {
			$atomic_props = $class_data['atomic_props'] ?? [];

			if ( empty( $atomic_props ) ) {
				continue;
			}

			// Convert to the format expected by atomic widgets system
			$styles[ $class_name ] = [
				'id' => $class_name,
				'label' => $class_name,
				'type' => 'class',
				'variants' => [
					[
						'props' => $atomic_props,
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => 'normal',
						],
					],
				],
			];
		}

		return $styles;
	}
}
