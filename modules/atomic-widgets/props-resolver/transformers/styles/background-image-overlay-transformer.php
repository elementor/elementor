<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		$image_src = $value['image-src'];
		$size = $value['size'];
		$position = $value['position'];
		$resolution = $value['resolution'];

		$image_url = $this->get_image_url( $image_src, $resolution );

		if ( ! isset( $size ) && ! isset( $position ) ) {
			return "url(\" $image_url \")";
		}

		if ( isset( $position ) && ! isset( $size ) ) {
			return "url(\" $image_url \") $position";
		}

		$position = $position ?? '0% 0%';

		return "url(\" $image_url \") $position \ $size";
	}

	private function get_image_url( $image_src, $resolution ): string {
		if ( ! empty( $image_src['id'] ) ) {
			return $this->get_image_url_by_id( $image_src['id'], $resolution );
		}

		if ( empty( $image_src['url'] ) ) {
			throw new \Exception( 'Invalid image URL.' );
		}

		return $image_src['url'];
	}

	private function get_image_url_by_id( $id, $resolution = 'full' ): string {
		$image_src = wp_get_attachment_image_src(
			(int) $id, $resolution
		);

		if ( ! $image_src ) {
			throw new \Exception( 'Cannot get image src.' );
		}

		[ $src ] = $image_src;

		return $src;
	}
}
