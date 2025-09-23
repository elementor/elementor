<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_Styles_Integrator {

	private Atomic_Widget_Class_Generator $class_generator;

	public function __construct() {
		$this->class_generator = new Atomic_Widget_Class_Generator();
	}

	public function integrate_styles_into_widget( array $widget, array $atomic_props ): array {
		if ( empty( $atomic_props ) ) {
			return $widget;
		}

		// Generate class ID for this widget
		$widget_type = $widget['widgetType'] ?? $widget['elType'] ?? '';
		$class_id = $this->class_generator->generate_class_id( $widget_type );

		// Create styles structure
		$styles = $this->create_styles_structure( $class_id, $atomic_props );

		// Add styles to widget
		$widget['styles'] = $styles;

		// Add class reference to settings
		$widget = $this->add_class_reference_to_widget( $widget, $class_id );

		return $widget;
	}

	public function integrate_styles_into_multiple_widgets( array $widgets, array $widgets_atomic_props ): array {
		$processed_widgets = [];

		foreach ( $widgets as $index => $widget ) {
			$atomic_props = $widgets_atomic_props[ $index ] ?? [];
			$processed_widgets[] = $this->integrate_styles_into_widget( $widget, $atomic_props );
		}

		return $processed_widgets;
	}

	public function create_global_classes_from_widgets( array $widgets ): array {
		$global_classes = [
			'items' => [],
			'order' => [],
		];

		foreach ( $widgets as $widget ) {
			if ( isset( $widget['styles'] ) && ! empty( $widget['styles'] ) ) {
				foreach ( $widget['styles'] as $class_id => $style_definition ) {
					$global_classes['items'][ $class_id ] = $style_definition;
					$global_classes['order'][] = $class_id;
				}
			}
		}

		return $global_classes;
	}

	private function create_styles_structure( string $class_id, array $atomic_props ): array {
		return [
			$class_id => [
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
			],
		];
	}

	private function add_class_reference_to_widget( array $widget, string $class_id ): array {
		// Ensure settings exist
		if ( ! isset( $widget['settings'] ) ) {
			$widget['settings'] = [];
		}

		// Ensure classes structure exists
		if ( ! isset( $widget['settings']['classes'] ) ) {
			$widget['settings']['classes'] = [
				'$$type' => 'classes',
				'value' => [],
			];
		}

		// Add class ID to the classes array
		if ( ! in_array( $class_id, $widget['settings']['classes']['value'], true ) ) {
			$widget['settings']['classes']['value'][] = $class_id;
		}

		return $widget;
	}

	public function extract_atomic_props_from_widget_data( array $widget_data ): array {
		return $widget_data['atomic_props'] ?? [];
	}

	public function validate_styles_structure( array $styles ): bool {
		foreach ( $styles as $class_id => $style_definition ) {
			if ( ! $this->validate_single_style_definition( $style_definition ) ) {
				return false;
			}
		}

		return true;
	}

	private function validate_single_style_definition( array $style_definition ): bool {
		$required_fields = ['id', 'label', 'type', 'variants'];

		foreach ( $required_fields as $field ) {
			if ( ! isset( $style_definition[ $field ] ) ) {
				return false;
			}
		}

		// Validate variants structure
		if ( ! is_array( $style_definition['variants'] ) ) {
			return false;
		}

		foreach ( $style_definition['variants'] as $variant ) {
			if ( ! $this->validate_variant_structure( $variant ) ) {
				return false;
			}
		}

		return true;
	}

	private function validate_variant_structure( array $variant ): bool {
		$required_fields = ['meta', 'props'];

		foreach ( $required_fields as $field ) {
			if ( ! isset( $variant[ $field ] ) ) {
				return false;
			}
		}

		// Validate meta structure
		if ( ! isset( $variant['meta']['breakpoint'] ) ) {
			return false;
		}

		// Validate props structure (should be array of atomic props)
		if ( ! is_array( $variant['props'] ) ) {
			return false;
		}

		return true;
	}

	public function merge_atomic_props( array $base_props, array $additional_props ): array {
		// Simple merge - additional props override base props
		return array_merge( $base_props, $additional_props );
	}

	public function filter_atomic_props_by_breakpoint( array $atomic_props, string $breakpoint ): array {
		// For now, return all props as we're only handling desktop breakpoint
		// This can be extended to handle responsive props in the future
		return $atomic_props;
	}

	public function get_class_generator(): Atomic_Widget_Class_Generator {
		return $this->class_generator;
	}
}
