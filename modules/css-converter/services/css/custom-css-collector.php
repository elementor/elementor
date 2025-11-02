<?php
namespace Elementor\Modules\CssConverter\Services\Css;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Custom_Css_Collector {

	private $custom_css_buffer = [];
	private $tracking_log;
	private $instance_id;

	public function __construct() {
		$this->tracking_log = WP_CONTENT_DIR . '/css-property-tracking.log';
		$this->instance_id = substr( uniqid(), -6 );
	}

	public function add_property( string $widget_id, string $property, string $value, bool $important = false ): void {
		if ( ! isset( $this->custom_css_buffer[ $widget_id ] ) ) {
			$this->custom_css_buffer[ $widget_id ] = [];
		}

		$css_declaration = $property . ': ' . $value;
		if ( $important ) {
			$css_declaration .= ' !important';
		}

		$this->custom_css_buffer[ $widget_id ][] = $css_declaration;

		error_log( "CUSTOM_CSS_DEBUG: add_property - widget_id={$widget_id}, instance_id={$this->instance_id}, property={$property}, value={$value}" );
		file_put_contents( 
			$this->tracking_log, 
			date('[H:i:s] ') . "CUSTOM_CSS_COLLECTOR: Added to widget {$widget_id}: {$css_declaration}\n", 
			FILE_APPEND 
		);
	}

	public function get_custom_css_for_widget( string $widget_id ): string {
		if ( ! isset( $this->custom_css_buffer[ $widget_id ] ) ) {
			error_log( "CUSTOM_CSS_DEBUG: get_custom_css_for_widget - widget_id={$widget_id}, instance_id={$this->instance_id}, NOT FOUND in buffer" );
			return '';
		}

		$css_declarations = $this->custom_css_buffer[ $widget_id ];
		$formatted_css = implode( ";\n", $css_declarations );
		
		if ( ! empty( $formatted_css ) ) {
			$formatted_css .= ';';
		}

		error_log( "CUSTOM_CSS_DEBUG: get_custom_css_for_widget - widget_id={$widget_id}, instance_id={$this->instance_id}, returning: " . substr( $formatted_css, 0, 100 ) );
		return $formatted_css;
	}

	public function has_custom_css( string $widget_id ): bool {
		$buffer_content = isset( $this->custom_css_buffer[ $widget_id ] ) ? $this->custom_css_buffer[ $widget_id ] : [];
		$is_empty = empty( $this->custom_css_buffer[ $widget_id ] );
		error_log( "CUSTOM_CSS_DEBUG: has_custom_css called with widget_id={$widget_id}, instance_id={$this->instance_id}, available_ids: " . implode( ', ', array_keys( $this->custom_css_buffer ) ) . ", buffer_content_count=" . count( $buffer_content ) . ", is_empty=" . ( $is_empty ? 'true' : 'false' ) );
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

		foreach ( $this->custom_css_buffer as $widget_id => $declarations ) {
			$total_properties += count( $declarations );
			
			foreach ( $declarations as $declaration ) {
				$property = explode( ':', $declaration )[0];
				$property = trim( $property );
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
