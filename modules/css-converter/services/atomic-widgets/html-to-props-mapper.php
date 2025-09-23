<?php
namespace Elementor\Modules\CssConverter\Services\AtomicWidgets;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;

class Html_To_Props_Mapper {
	
	public function map_html_to_props( array $html_element, array $props_schema ): array {
		$props = [];
		
		foreach ( $props_schema as $prop_name => $prop_type ) {
			if ( ! ( $prop_type instanceof Prop_Type ) ) {
				continue;
			}
			
			$props[ $prop_name ] = $this->extract_prop_value( 
				$prop_name, 
				$html_element, 
				$prop_type 
			);
		}
		
		return $props;
	}
	
	private function extract_prop_value( string $prop_name, array $html_element, Prop_Type $prop_type ) {
		switch ( $prop_name ) {
			case 'title':
				return $this->extract_title( $html_element, $prop_type );
				
			case 'paragraph':
				return $this->extract_paragraph( $html_element, $prop_type );
				
			case 'tag':
				return $this->extract_tag( $html_element, $prop_type );
				
			case 'classes':
				return $this->extract_classes( $html_element, $prop_type );
				
			case 'attributes':
				return $this->extract_attributes( $html_element, $prop_type );
				
			case 'link':
				return $this->extract_link( $html_element, $prop_type );
				
			case 'text':
				return $this->extract_text( $html_element, $prop_type );
				
			case 'src':
				return $this->extract_src( $html_element, $prop_type );
				
			case 'alt':
				return $this->extract_alt( $html_element, $prop_type );
				
			default:
				return $prop_type->get_default();
		}
	}
	
	private function extract_title( array $html_element, Prop_Type $prop_type ): string {
		return $html_element['text'] ?? $prop_type->get_default();
	}
	
	private function extract_paragraph( array $html_element, Prop_Type $prop_type ): string {
		return $html_element['text'] ?? $prop_type->get_default();
	}
	
	private function extract_tag( array $html_element, Prop_Type $prop_type ): string {
		$tag = $html_element['tag'] ?? '';
		
		if ( empty( $tag ) ) {
			return $prop_type->get_default();
		}
		
		return $this->normalize_tag_for_atomic_widget( $tag, $prop_type );
	}
	
	private function normalize_tag_for_atomic_widget( string $tag, Prop_Type $prop_type ): string {
		$tag = strtolower( trim( $tag ) );
		
		$settings = $prop_type->get_settings();
		$allowed_values = $settings['enum'] ?? [];
		
		if ( in_array( $tag, $allowed_values, true ) ) {
			return $tag;
		}
		
		return $prop_type->get_default();
	}
	
	private function extract_classes( array $html_element, Prop_Type $prop_type ): array {
		$classes = $html_element['classes'] ?? [];
		
		if ( ! is_array( $classes ) ) {
			return $prop_type->get_default();
		}
		
		return array_values( array_filter( $classes, 'is_string' ) );
	}
	
	private function extract_attributes( array $html_element, Prop_Type $prop_type ): array {
		$attributes = $html_element['attributes'] ?? [];
		
		if ( ! is_array( $attributes ) ) {
			return $prop_type->get_default();
		}
		
		return $this->sanitize_attributes( $attributes );
	}
	
	private function sanitize_attributes( array $attributes ): array {
		$sanitized = [];
		
		foreach ( $attributes as $name => $value ) {
			if ( ! is_string( $name ) || ! is_scalar( $value ) ) {
				continue;
			}
			
			$sanitized[ sanitize_key( $name ) ] = sanitize_text_field( (string) $value );
		}
		
		return $sanitized;
	}
	
	private function extract_link( array $html_element, Prop_Type $prop_type ): ?array {
		$href = $html_element['attributes']['href'] ?? '';
		
		if ( empty( $href ) ) {
			return $prop_type->get_default();
		}
		
		return [
			'destination' => esc_url_raw( $href ),
			'target' => $this->extract_link_target( $html_element ),
			'rel' => $this->extract_link_rel( $html_element ),
		];
	}
	
	private function extract_link_target( array $html_element ): string {
		$target = $html_element['attributes']['target'] ?? '';
		
		return in_array( $target, [ '_blank', '_self', '_parent', '_top' ], true ) 
			? $target 
			: '_self';
	}
	
	private function extract_link_rel( array $html_element ): string {
		return sanitize_text_field( $html_element['attributes']['rel'] ?? '' );
	}
	
	private function extract_text( array $html_element, Prop_Type $prop_type ): string {
		return $html_element['text'] ?? $prop_type->get_default();
	}
	
	private function extract_src( array $html_element, Prop_Type $prop_type ): string {
		$src = $html_element['attributes']['src'] ?? '';
		
		if ( empty( $src ) ) {
			return $prop_type->get_default();
		}
		
		return esc_url_raw( $src );
	}
	
	private function extract_alt( array $html_element, Prop_Type $prop_type ): string {
		return sanitize_text_field( $html_element['attributes']['alt'] ?? $prop_type->get_default() );
	}
}
