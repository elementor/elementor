<?php

namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\Elements\Widget_Builder;
use Elementor\Modules\AtomicWidgets\Elements\Element_Builder;
use Elementor\Modules\CssConverter\Convertors\AtomicProperties\Implementations\Atomic_Prop_Mapper_Factory;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Widget_JSON_Generator {
	private $atomic_widget_service;

	public function __construct( Atomic_Widget_Service $atomic_widget_service = null ) {
		$this->atomic_widget_service = $atomic_widget_service ?: new Atomic_Widget_Service();
	}

	public function generate_widget_json( array $element_data ): ?array {
		if ( ! isset( $element_data['widget_type'] ) ) {
			return null;
		}

		$widget_type = $element_data['widget_type'];
		$props = $element_data['props'] ?? [];
		$settings = $element_data['settings'] ?? [];
		$editor_settings = $element_data['editor_settings'] ?? [];
		$is_locked = $element_data['is_locked'] ?? false;

		$atomic_props = $this->convert_props_to_atomic( $props );
		$final_settings = array_merge( $settings, $atomic_props );

		$builder = Widget_Builder::make( $widget_type );
		
		if ( ! empty( $final_settings ) ) {
			$builder->settings( $final_settings );
		}

		if ( ! empty( $editor_settings ) ) {
			$builder->editor_settings( $editor_settings );
		}

		if ( $is_locked ) {
			$builder->is_locked( true );
		}

		return $builder->build();
	}

	public function generate_element_json( array $element_data ): ?array {
		if ( ! isset( $element_data['element_type'] ) ) {
			return null;
		}

		$element_type = $element_data['element_type'];
		$props = $element_data['props'] ?? [];
		$settings = $element_data['settings'] ?? [];
		$children = $element_data['children'] ?? [];
		$editor_settings = $element_data['editor_settings'] ?? [];
		$is_locked = $element_data['is_locked'] ?? false;

		$atomic_props = $this->convert_props_to_atomic( $props );
		$final_settings = array_merge( $settings, $atomic_props );

		$builder = Element_Builder::make( $element_type );
		
		if ( ! empty( $final_settings ) ) {
			$builder->settings( $final_settings );
		}

		if ( ! empty( $children ) ) {
			$processed_children = $this->process_children( $children );
			$builder->children( $processed_children );
		}

		if ( ! empty( $editor_settings ) ) {
			$builder->editor_settings( $editor_settings );
		}

		if ( $is_locked ) {
			$builder->is_locked( true );
		}

		return $builder->build();
	}

	public function generate_from_css_properties( string $widget_type, array $css_properties ): ?array {
		if ( empty( $widget_type ) || empty( $css_properties ) ) {
			return null;
		}

		$atomic_props = [];
		foreach ( $css_properties as $property => $value ) {
			$atomic_prop = $this->atomic_widget_service->convert_css_to_atomic_prop( $property, $value );
			if ( null !== $atomic_prop ) {
				$atomic_props[ $property ] = $atomic_prop;
			}
		}

		if ( empty( $atomic_props ) ) {
			return null;
		}

		return $this->generate_widget_json([
			'widget_type' => $widget_type,
			'props' => $atomic_props
		]);
	}

	public function validate_generated_json( array $json ): bool {
		if ( ! isset( $json['elType'] ) ) {
			return false;
		}

		if ( 'widget' === $json['elType'] && ! isset( $json['widgetType'] ) ) {
			return false;
		}

		if ( isset( $json['settings'] ) && is_array( $json['settings'] ) ) {
			return $this->validate_atomic_settings( $json['settings'] );
		}

		return true;
	}

	public function get_widget_builder_instance( string $widget_type ): Widget_Builder {
		return Widget_Builder::make( $widget_type );
	}

	public function get_element_builder_instance( string $element_type ): Element_Builder {
		return Element_Builder::make( $element_type );
	}

	private function convert_props_to_atomic( array $props ): array {
		$atomic_props = [];

		foreach ( $props as $prop_name => $prop_value ) {
			if ( is_array( $prop_value ) && isset( $prop_value['$$type'] ) ) {
				if ( $this->atomic_widget_service->validate_prop_structure( $prop_value['$$type'], $prop_value['value'] ) ) {
					$atomic_props[ $prop_name ] = $prop_value;
				}
			} elseif ( is_string( $prop_value ) ) {
				$atomic_prop = $this->convert_css_property_to_atomic_format( $prop_name, $prop_value );
				if ( null !== $atomic_prop ) {
					$atomic_props[ $prop_name ] = $atomic_prop;
				}
			}
		}

		return $atomic_props;
	}

	private function convert_css_property_to_atomic_format( string $css_property, string $css_value ): ?array {
		return Atomic_Prop_Mapper_Factory::convert_css_property_to_atomic_format( $css_property, $css_value );
	}

	private function process_children( array $children ): array {
		$processed_children = [];

		foreach ( $children as $child ) {
			if ( is_array( $child ) ) {
				if ( isset( $child['widget_type'] ) ) {
					$processed_child = $this->generate_widget_json( $child );
				} elseif ( isset( $child['element_type'] ) ) {
					$processed_child = $this->generate_element_json( $child );
				} else {
					$processed_child = $child;
				}

				if ( null !== $processed_child ) {
					$processed_children[] = $processed_child;
				}
			}
		}

		return $processed_children;
	}

	private function validate_atomic_settings( array $settings ): bool {
		foreach ( $settings as $setting_name => $setting_value ) {
			if ( is_array( $setting_value ) && isset( $setting_value['$$type'] ) ) {
				if ( ! $this->atomic_widget_service->validate_prop_structure( $setting_value ) ) {
					return false;
				}
			}
		}

		return true;
	}

	public function create_heading_widget( string $text, array $css_properties = [] ): ?array {
		$atomic_css_props = $this->convert_css_properties_to_atomic_props( $css_properties );
		
		$element_data = [
			'widget_type' => 'atomic-heading',
			'settings' => [
				'title' => [
					'$$type' => 'string',
					'value' => $text
				]
			],
			'props' => $atomic_css_props
		];

		return $this->generate_widget_json( $element_data );
	}

	public function create_paragraph_widget( string $text, array $css_properties = [] ): ?array {
		$atomic_css_props = $this->convert_css_properties_to_atomic_props( $css_properties );
		
		$element_data = [
			'widget_type' => 'atomic-paragraph',
			'settings' => [
				'paragraph' => [
					'$$type' => 'string',
					'value' => $text
				]
			],
			'props' => $atomic_css_props
		];

		return $this->generate_widget_json( $element_data );
	}

	public function create_button_widget( string $text, string $link = '', array $css_properties = [] ): ?array {
		$atomic_css_props = $this->convert_css_properties_to_atomic_props( $css_properties );
		
		$settings = [
			'text' => [
				'$$type' => 'string',
				'value' => $text
			]
		];

		if ( ! empty( $link ) ) {
			$settings['link'] = [
				'$$type' => 'link',
				'value' => [
					'url' => $link,
					'is_external' => false,
					'nofollow' => false
				]
			];
		}

		$element_data = [
			'widget_type' => 'atomic-button',
			'settings' => $settings,
			'props' => $atomic_css_props
		];

		return $this->generate_widget_json( $element_data );
	}

	private function convert_css_properties_to_atomic_props( array $css_properties ): array {
		$atomic_props = [];

		foreach ( $css_properties as $css_property => $css_value ) {
			if ( is_string( $css_value ) ) {
				$atomic_prop = $this->convert_css_property_to_atomic_format( $css_property, $css_value );
				if ( null !== $atomic_prop ) {
					$atomic_props[ $css_property ] = $atomic_prop;
				}
			} elseif ( is_array( $css_value ) && isset( $css_value['$$type'] ) ) {
				$atomic_props[ $css_property ] = $css_value;
			}
		}

		return $atomic_props;
	}

	public function create_div_element( array $children = [], array $css_properties = [] ): ?array {
		$element_data = [
			'element_type' => 'div-block',
			'children' => $children,
			'props' => $css_properties
		];

		return $this->generate_element_json( $element_data );
	}

	public function create_flexbox_element( array $children = [], array $css_properties = [] ): ?array {
		$element_data = [
			'element_type' => 'flexbox',
			'children' => $children,
			'props' => $css_properties
		];

		return $this->generate_element_json( $element_data );
	}
}