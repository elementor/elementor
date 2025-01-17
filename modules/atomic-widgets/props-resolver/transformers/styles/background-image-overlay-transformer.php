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

		if ( ! empty( $image_src['id'] ) ) {
			$url = $this->get_image_src_by_id( $value['image-src']['id'] );
		}

		if ( ! empty( $image_src['url'] ) ) {
			$url = $this->get_image_src_by_url( $value['image-src']['url'] );
		}

		if ( empty( $url ) ) {
			throw new \Exception( 'Invalid image URL.' );
		}

		if ( ! isset( $size ) && ! isset( $position ) ) {
			return  "url(\" $url \")";
		}

		if ( isset( $position ) && ! isset( $size ) ) {
			return "url(\" $url \") $position";
		}

		$position =	$position ?? '0% 0%';

		return  "url(\" $url \") $position \ $size";
	}

	private function get_image_src_by_id( $value ) {
		$src = $this->get_image_url_by_id( $value['image-src']['id'] );

		return "url(\" $src \")";
	}

	private function get_image_src_by_url( $url ) {
		return "url(\" $url \")";
	}

	private function get_image_url_by_id( $id ) {
		$image_src = wp_get_attachment_image_src(
			(int) $id, 'full'
		);

		if ( ! $image_src ) {
			throw new \Exception( 'Cannot get image src.' );
		}

		[ $src ] = $image_src;

		return $src;
	}
}
