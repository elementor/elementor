<?php
namespace Elementor\Modules\CssConverter\Services\Widgets\Factories;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include required dependencies

use Elementor\Modules\CssConverter\Services\Widgets\Contracts\Widget_Factory_Interface;
use Elementor\Modules\CssConverter\Services\Widgets\Atomic_Widget_Data_Formatter;

class Atomic_Widget_Factory implements Widget_Factory_Interface {
	private Atomic_Widget_Data_Formatter $data_formatter;
	private bool $use_zero_defaults;
	private array $css_processing_result;

	public function __construct( bool $use_zero_defaults = false ) {
		$this->data_formatter = Atomic_Widget_Data_Formatter::make();
		$this->use_zero_defaults = $use_zero_defaults;
		$this->css_processing_result = [];
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

		// DEBUG: Log widget data received by factory
		$widget_classes = $widget_data['attributes']['class'] ?? '';
		error_log( "CSS Converter: Factory received {$widget_type} widget with classes: '{$widget_classes}'" );
		error_log( 'CSS Converter: Full widget_data keys: ' . implode( ', ', array_keys( $widget_data ) ) );

		$formatted_widget_data = $this->data_formatter->format_widget_data( $resolved_styles, $widget_data, $widget_id );

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

		// DEBUG: Log class application process
		$widget_type = $widget_data['widget_type'] ?? 'unknown';
		error_log( "CSS Converter: Applying global classes to {$widget_type} widget" );
		error_log( "CSS Converter: Widget classes found: '{$widget_classes}'" );
		error_log( 'CSS Converter: Available global classes: ' . implode( ', ', array_keys( $global_classes ) ) );
		error_log( 'CSS Converter: Class name mappings: ' . json_encode( $class_name_mappings ) );

		if ( empty( $widget_classes ) ) {
			error_log( 'CSS Converter: No widget classes found, skipping global class application' );
			return $final_settings;
		}

		$classes_array = explode( ' ', $widget_classes );
		$applicable_global_classes = [];

		foreach ( $classes_array as $class_name ) {
			$class_name = trim( $class_name );

			// CRITICAL FIX: Use mapped class name if available (for duplicate detection)
			$mapped_class_name = $class_name_mappings[ $class_name ] ?? $class_name;

			if ( isset( $global_classes[ $mapped_class_name ] ) ) {
				$applicable_global_classes[] = $mapped_class_name;
				error_log( "CSS Converter: Found matching global class: {$class_name} -> {$mapped_class_name}" );
			} else {
				error_log( "CSS Converter: No global class found for: {$class_name} (mapped: {$mapped_class_name})" );
			}
		}

		if ( ! empty( $applicable_global_classes ) ) {
			$existing_classes = $final_settings['classes']['value'] ?? [];
			$merged_classes = array_merge( $existing_classes, $applicable_global_classes );

			$final_settings['classes'] = [
				'$$type' => 'classes',
				'value' => array_values( array_unique( $merged_classes ) ),
			];

			error_log( 'CSS Converter: Applied classes to widget: ' . implode( ', ', $merged_classes ) );
		} else {
			error_log( 'CSS Converter: No applicable global classes found' );
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
