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
		return [
			'background-image' => $this->get_images( $value, Background_Image_Overlay_Transformer::$default_image ),
			'background-repeat' => $this->get_values_by_prop( $value, 'repeat', Background_Image_Overlay_Transformer::$default_repeat ),
			'background-attachment' => $this->get_values_by_prop( $value, 'attachment', Background_Image_Overlay_Transformer::$default_attachment ),
			'background-size' => $this->get_values_by_prop( $value, 'size', Background_Image_Overlay_Transformer::$default_size ),
			'background-position' => $this->get_values_by_prop( $value, 'position', Background_Image_Overlay_Transformer::$default_position ),
		];
	}

	private function get_images( $value, $default ): string {
		return implode( ',', array_map( function ( $item ) use ( $default ) {
			if ( is_string( $item ) ) {
				return $item;
			}

			if ( ! is_array( $item ) ) {
				return $default;
			}

			return $item['url'] ?? $default;
		}, $value ) );
	}

	private function get_values_by_prop( $value, string $prop, string $default ): string {
		return implode( ',', array_map( function ( $item ) use ( $prop, $default ) {
			if ( is_string( $item ) ) {
				return $default;
			}

			if ( ! is_array( $item ) ) {
				return $default;
			}

			return $item[ $prop ] ?? $default;
		}, $value ) );
	}
}
