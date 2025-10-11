<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgetsV2;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Atomic_Widget_JSON_Creator {

	private HTML_To_Atomic_Widget_Mapper $widget_mapper;
	private Atomic_Widget_Settings_Preparer $settings_preparer;

	public function __construct() {
		$this->widget_mapper = new HTML_To_Atomic_Widget_Mapper();
		$this->settings_preparer = new Atomic_Widget_Settings_Preparer();
	}

	public function create_widget_json( array $widget_data ): ?array {
		if ( ! $this->is_atomic_widgets_available() ) {
			return null;
		}

		$widget_type = $widget_data['widget_type'] ?? '';
		if ( empty( $widget_type ) ) {
			return null;
		}

		$atomic_props = $widget_data['atomic_props'] ?? [];
		$content = $widget_data['content'] ?? '';
		$attributes = $widget_data['attributes'] ?? [];
		$children = $widget_data['children'] ?? [];

		// Prepare settings for the widget
		$settings = $this->settings_preparer->prepare_widget_settings(
			$widget_type,
			$atomic_props,
			$content,
			$attributes
		);

		// Create widget using appropriate builder
		if ( $this->widget_mapper->is_container_widget( $widget_type ) ) {
			return $this->create_container_widget( $widget_type, $settings, $children );
		} else {
			return $this->create_content_widget( $widget_type, $settings );
		}
	}

	public function create_multiple_widgets( array $widgets_data ): array {
		$widgets = [];

		foreach ( $widgets_data as $widget_data ) {
			$widget = $this->create_widget_json( $widget_data );
			if ( $widget ) {
				$widgets[] = $widget;
			}
		}

		return $widgets;
	}

	private function create_content_widget( string $widget_type, array $settings ): ?array {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) ) {
			return null;
		}

		try {
			$widget_builder = \Elementor\Modules\AtomicWidgets\Elements\Widget_Builder::make( $widget_type );
			
			return $widget_builder
				->settings( $settings )
				->is_locked( false )
				->editor_settings( [] )
				->build();
				
		} catch ( \Exception $e ) {
			error_log( "Failed to create widget '{$widget_type}': " . $e->getMessage() );
			return null;
		}
	}

	private function create_container_widget( string $widget_type, array $settings, array $children ): ?array {
		if ( ! class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' ) ) {
			return null;
		}

		// Recursively create child widgets
		$child_widgets = $this->create_child_widgets( $children );

		try {
			$element_builder = \Elementor\Modules\AtomicWidgets\Elements\Element_Builder::make( $widget_type );
			
			return $element_builder
				->settings( $settings )
				->children( $child_widgets )
				->is_locked( false )
				->editor_settings( [] )
				->build();
				
		} catch ( \Exception $e ) {
			error_log( "Failed to create container '{$widget_type}': " . $e->getMessage() );
			return null;
		}
	}

	private function create_child_widgets( array $children ): array {
		$child_widgets = [];

		foreach ( $children as $child_data ) {
			$child_widget = $this->create_widget_json( $child_data );
			if ( $child_widget ) {
				$child_widgets[] = $child_widget;
			}
		}

		return $child_widgets;
	}

	private function is_atomic_widgets_available(): bool {
		return class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Widget_Builder' ) &&
			   class_exists( 'Elementor\\Modules\\AtomicWidgets\\Elements\\Element_Builder' );
	}

	public function validate_widget_against_schema( array $widget, string $widget_type ): bool {
		$atomic_widget_class = $this->get_atomic_widget_class( $widget_type );
		if ( ! $atomic_widget_class ) {
			return true; // Skip validation if class not found
		}

		$schema = $this->get_atomic_widget_schema( $atomic_widget_class );
		if ( ! $schema ) {
			return true; // Skip validation if schema not available
		}

		return $this->validate_settings_against_schema( $widget['settings'] ?? [], $schema );
	}

	private function get_atomic_widget_class( string $widget_type ): ?string {
		$class_map = [
			'e-heading' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Heading\\Atomic_Heading',
			'e-paragraph' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Paragraph\\Atomic_Paragraph',
			'e-button' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Button\\Atomic_Button',
			'e-image' => 'Elementor\\Modules\\AtomicWidgets\\Elements\\Atomic_Image\\Atomic_Image',
		];

		$class_name = $class_map[ $widget_type ] ?? null;
		
		return $class_name && class_exists( $class_name ) ? $class_name : null;
	}

	private function get_atomic_widget_schema( string $widget_class ): ?array {
		if ( ! method_exists( $widget_class, 'define_props_schema' ) ) {
			return null;
		}

		try {
			return $widget_class::define_props_schema();
		} catch ( \Exception $e ) {
			error_log( "Failed to get schema for '{$widget_class}': " . $e->getMessage() );
			return null;
		}
	}

	private function validate_settings_against_schema( array $settings, array $schema ): bool {
		foreach ( $settings as $prop_name => $prop_value ) {
			if ( isset( $schema[ $prop_name ] ) ) {
				$prop_type = $schema[ $prop_name ];
				if ( ! $this->validate_prop_against_type( $prop_value, $prop_type ) ) {
					return false;
				}
			}
		}

		return true;
	}

	private function validate_prop_against_type( $prop_value, $prop_type ): bool {
		// Basic validation - can be extended based on prop type methods
		if ( method_exists( $prop_type, 'validate' ) ) {
			try {
				return $prop_type->validate( $prop_value );
			} catch ( \Exception $e ) {
				error_log( "Prop validation failed: " . $e->getMessage() );
				return false;
			}
		}

		return true; // Skip validation if no validate method
	}

	public function get_supported_widget_types(): array {
		return $this->widget_mapper->get_widget_types();
	}

	public function is_widget_type_supported( string $widget_type ): bool {
		$supported_types = $this->get_supported_widget_types();
		return in_array( $widget_type, $supported_types, true );
	}
}
