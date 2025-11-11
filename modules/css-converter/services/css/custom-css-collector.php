<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Css_Collector {

	private $custom_css_buffer = [];
	private $instance_id;

	public function __construct() {
		$this->instance_id = substr( uniqid(), -6 );
	}

	public function add_property( string $widget_id, string $property, string $value, bool $important = false ): void {
		
		if ( ! isset( $this->custom_css_buffer[ $widget_id ] ) ) {
			$this->custom_css_buffer[ $widget_id ] = [];
		}

		$property_key = $this->create_deduplicated_property_key( $property );
		
		if ( $this->should_override_existing_property( $widget_id, $property_key, $important ) ) {
			$this->custom_css_buffer[ $widget_id ][ $property_key ] = [
				'property' => $property,
				'value' => $value,
				'important' => $important,
			];
		}
	}

	private function should_override_existing_property( string $widget_id, string $property_key, bool $new_important ): bool {
		if ( ! isset( $this->custom_css_buffer[ $widget_id ][ $property_key ] ) ) {
			return true;
		}

		$existing_important = $this->custom_css_buffer[ $widget_id ][ $property_key ]['important'] ?? false;
		
		if ( $new_important && ! $existing_important ) {
			return true;
		}
		
		if ( ! $new_important && $existing_important ) {
			return false;
		}
		
		return true;
	}

	private function create_deduplicated_property_key( string $property ): string {
		return strtolower( trim( $property ) );
	}

	private function format_css_declaration_from_property_data( array $property_data ): string {
		$property = $property_data['property'];
		$value = $property_data['value'];
		$important = $property_data['important'] ?? false;
		
		$css_declaration = $property . ': ' . $value;
		if ( $important ) {
			$css_declaration .= ' !important';
		}
		
		return $css_declaration;
	}

	public function get_custom_css_for_widget( string $widget_id ): string {
		if ( ! isset( $this->custom_css_buffer[ $widget_id ] ) ) {
			return '';
		}

		$property_data_array = $this->custom_css_buffer[ $widget_id ];
		
		$css_declarations = array_map( 
			[ $this, 'format_css_declaration_from_property_data' ], 
			$property_data_array 
		);
		
		$formatted_css = implode( ";\n", $css_declarations );
		
		if ( ! empty( $formatted_css ) ) {
			$formatted_css .= ';';
		}

		return $formatted_css;
	}

	public function has_custom_css( string $widget_id ): bool {
		return isset( $this->custom_css_buffer[ $widget_id ] ) && 
			   ! empty( $this->custom_css_buffer[ $widget_id ] );
	}

	public function clear_widget_buffer( string $widget_id ): void {
		unset( $this->custom_css_buffer[ $widget_id ] );
	}

	public function get_statistics(): array {
		$total_widgets = count( $this->custom_css_buffer );
		$total_properties = 0;
		$property_counts = [];

		foreach ( $this->custom_css_buffer as $widget_id => $property_data_array ) {
			$total_properties += count( $property_data_array );
			
			foreach ( $property_data_array as $property_data ) {
				$property = $property_data['property'];
				$property_counts[ $property ] = ( $property_counts[ $property ] ?? 0 ) + 1;
			}
		}

		arsort( $property_counts );

		return [
			'widgets_with_custom_css' => $total_widgets,
			'total_custom_css_properties' => $total_properties,
			'most_common_unsupported' => array_slice( $property_counts, 0, 10 ),
		];
	}

	public function clear_all(): void {
		$this->custom_css_buffer = [];
	}
}
