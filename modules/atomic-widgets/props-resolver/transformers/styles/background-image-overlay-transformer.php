<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		if ( ! isset( $value['image-src'] ) ) {
			return '';
		}

		$image_url = $this->get_image_url( $value['image-src'] );

		$background_style = "url(\" $image_url \")";

		$position_and_size_style = $this->get_position_and_size_style( $value );

		if ( ! empty( $position_and_size_style ) ) {
			$background_style .= ' ' . $position_and_size_style;
		}

		return $background_style;
	}

	private function get_image_url( array $image_src ): string {
		if ( ! empty( $image_src['id'] ) ) {
			return $this->get_image_url_by_id( $image_src['id'] );
		}

		if ( empty( $image_src['url'] ) ) {
			throw new \Exception( 'Invalid image URL.' );
		}

		return $image_src['url'];
	}

	private function get_image_url_by_id( int $id ): string {
		$image_src = wp_get_attachment_image_src(
			(int) $id, 'full'
		);

		if ( ! $image_src ) {
			throw new \Exception( 'Cannot get image src.' );
		}

		[ $image_url ] = $image_src;

		return $image_url;
	}

	private function get_position_and_size_style( array $value ): string {
		if ( ! isset( $value['size'] ) && ! isset( $value['position'] ) ) {
			return '';
		}

		if ( ! isset( $value['size'] ) ) {
			return $value['position'];
		}

		$default_position = '0% 0%';

		$position = $value['position'] ?? $default_position;

		return $position . ' / ' . $value['size'];
	}
}
