<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\Elements\Atomic_Heading\Atomic_Heading;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Paragraph\Atomic_Paragraph;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Button\Atomic_Button;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Image\Atomic_Image;
use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Atomic_Widget_Factory {
	
	private array $widget_class_map = [
		'e-heading' => Atomic_Heading::class,
		'e-paragraph' => Atomic_Paragraph::class,
		'e-button' => Atomic_Button::class,
		'e-image' => Atomic_Image::class,
		'e-flexbox' => Flexbox::class,
	];
	
	private Html_To_Props_Mapper $props_mapper;
	private Widget_Json_Generator $json_generator;
	
	public function __construct() {
		$this->props_mapper = new Html_To_Props_Mapper();
		$this->json_generator = new Widget_Json_Generator();
	}
	
	public function create_widget( string $widget_type, array $html_element ): ?array {
		if ( ! $this->supports_widget_type( $widget_type ) ) {
			return null;
		}
		
		$atomic_widget_class = $this->get_atomic_widget_class( $widget_type );
		if ( null === $atomic_widget_class ) {
			return null;
		}
		
		$props_schema = $this->get_props_schema_safely( $atomic_widget_class );
		if ( empty( $props_schema ) ) {
			return null;
		}
		
		$props = $this->props_mapper->map_html_to_props( $html_element, $props_schema );
		$validated_props = $this->validate_and_sanitize_props( $props, $props_schema );
		
		return $this->json_generator->generate_widget_json( 
			$widget_type, 
			$validated_props, 
			$html_element 
		);
	}
	
	private function get_props_schema_safely( string $atomic_widget_class ): array {
		if ( ! class_exists( $atomic_widget_class ) ) {
			return [];
		}
		
		if ( ! method_exists( $atomic_widget_class, 'define_props_schema' ) ) {
			return [];
		}
		
		$schema = $atomic_widget_class::define_props_schema();
		
		return is_array( $schema ) ? $schema : [];
	}
	
	public function supports_widget_type( string $widget_type ): bool {
		return array_key_exists( $widget_type, $this->widget_class_map );
	}
	
	public function get_supported_widget_types(): array {
		return array_keys( $this->widget_class_map );
	}
	
	private function validate_and_sanitize_props( array $props, array $props_schema ): array {
		$validated = [];
		
		foreach ( $props_schema as $prop_name => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}
			
			$value = $props[ $prop_name ] ?? $prop_type->get_default();
			
			if ( $prop_type->validate( $value ) ) {
				$validated[ $prop_name ] = $prop_type->sanitize( $value );
			} else {
				$validated[ $prop_name ] = $prop_type->get_default();
				
				error_log( sprintf(
					'CSS Converter: Invalid prop value for %s, using default. Value: %s',
					$prop_name,
					is_scalar( $value ) ? $value : json_encode( $value )
				) );
			}
		}
		
		return $validated;
	}
	
	public function get_atomic_widget_class( string $widget_type ): ?string {
		return $this->widget_class_map[ $widget_type ] ?? null;
	}
	
	public function get_props_schema( string $widget_type ): ?array {
		$atomic_widget_class = $this->get_atomic_widget_class( $widget_type );
		
		if ( ! $atomic_widget_class ) {
			return null;
		}
		
		return $atomic_widget_class::define_props_schema();
	}
}
