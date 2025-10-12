<?php
namespace Elementor\Modules\CssConverter\Services\Widgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_Data_Formatter {

	public static function make(): self {
		return new self();
	}

	public function format_widget_data( array $resolved_styles, array $widget ): array {
		$class_id = $this->generate_unique_class_id();
		
		$atomic_props = $this->extract_atomic_props_from_resolved_styles( $resolved_styles );
		
		$css_classes = $this->extract_css_classes_from_widget( $widget );
		
		if ( empty( $atomic_props ) && empty( $css_classes ) ) {
			return [
				'widgetType' => $widget['widget_type'] ?? 'e-div-block',
				'settings' => $this->format_widget_settings( $widget, $css_classes ),
				'styles' => [],
			];
		}

		$style_definition = $this->create_unified_style_definition( $class_id, $atomic_props );

		return [
			'widgetType' => $widget['widget_type'] ?? 'e-div-block',
			'settings' => $this->format_widget_settings( $widget, $css_classes ),
			'styles' => [
				$class_id => $style_definition,
			],
		];
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
				}
			}
		}

		return $atomic_props;
	}

	private function create_unified_style_definition( string $class_id, array $atomic_props ): array {
		return [
			'id' => $class_id,
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

	private function format_widget_settings( array $widget, array $css_classes ): array {
		$settings = $widget['settings'] ?? [];
		
		if ( ! empty( $css_classes ) ) {
			$settings['classes'] = $this->format_css_classes_in_atomic_format( $css_classes );
		}
		
		return $settings;
	}

	private function generate_unique_class_id(): string {
		return 'e-' . substr( wp_generate_uuid4(), 0, 8 );
	}

	private function get_target_property_name( string $property ): string {
		$property_map = [
			'background-color' => 'background',
			'border-top-left-radius' => 'border-radius',
			'border-top-right-radius' => 'border-radius',
			'border-bottom-left-radius' => 'border-radius',
			'border-bottom-right-radius' => 'border-radius',
		];

		return $property_map[ $property ] ?? $property;
	}

	private function extract_css_classes_from_widget_attributes( array $widget, array $classes ): array {
		if ( ! empty( $widget['attributes']['class'] ) ) {
			$class_string = $widget['attributes']['class'];
			$class_array = explode( ' ', $class_string );
			
			foreach ( $class_array as $class ) {
				$class = trim( $class );
				if ( ! empty( $class ) ) {
					$classes[] = $class;
				}
			}
		}
		
		return $classes;
	}

	private function format_css_classes_in_atomic_format( array $css_classes ): array {
		return [
			'$$type' => 'classes',
			'value' => array_values( $css_classes )
		];
	}
}
