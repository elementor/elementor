<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Multi_Props;
use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		return Multi_Props::generate( [
			'background-image' => $this->get_images( $value ),
			'background-repeat' => $this->get_values_by_prop( $value, 'repeat', Background_Image_Overlay_Transformer::$default_repeat ),
			'background-attachment' => $this->get_values_by_prop( $value, 'attachment', Background_Image_Overlay_Transformer::$default_attachment ),
			'background-size' => $this->get_values_by_prop( $value, 'size', Background_Image_Overlay_Transformer::$default_size ),
			'background-position' => $this->get_values_by_prop( $value, 'position', Background_Image_Overlay_Transformer::$default_position ),
		] );
	}

	private function get_images( $value ): string {
		return implode( ',', array_map( function ( $item ) {
			if ( is_string( $item ) ) {
				return $item;
			}

			if ( ! Multi_Props::is( $item ) ) {
				return 'unset';
			}

			return Multi_Props::get_value( $item )['url'] ?? 'unset';
		}, $value ) );
	}

	private function get_values_by_prop( $value, string $prop, string $default ): string {
		return implode( ',', array_map( function ( $item ) use ( $prop, $default ) {
			if ( is_string( $item ) ) {
				return $default;
			}

			if ( ! Multi_Props::is( $item ) ) {
				return $default;
			}

			return Multi_Props::get_value( $item )[ $prop ] ?? $default;
		}, $value ) );
	}
}
