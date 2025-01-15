<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {

		if ( ! empty( $value['image-src']['id'] ) ) {
			return $this->get_image_src_by_id( $value['image-src']['id'] );
		}

		if ( ! empty( $value['image-src']['url'] ) ) {
			return $this->get_image_src_by_url( $value['image-src']['url'] );
		}

		throw new \Exception( 'Invalid image URL.' );
	}

	private function get_image_src_by_id( $id ) {
		$src = $this->get_image_url_by_id( $id );

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
