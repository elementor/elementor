<?php

namespace Elementor\Modules\AtomicWidgets\transformers;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Transformer extends Atomic_Transformer_Base {
	public static function type(): string {
		return 'image';
	}

	public function transform( $value ) {
		$id = $value['attachmentId'] ?? null;
		$url = $value['url'] ?? null;

		// TODO: Need to come from another settings (dependency between props?).
		$size = 'full';

		if ( ! $id && ! $url ) {
			return null;
		}

		if ( $id ) {
			return $this->get_attrs_from_attachment( $id, $size );
		}

		return $this->get_attrs_from_url( $url );
	}

	private function get_attrs_from_attachment( $id, $size ) {
		$image = wp_get_attachment_image_src( $id, $size );

		if ( ! $image ) {
			return null;
		}

		list( $src, $width, $height ) = $image;

		return [
			'src' => $src,
			'width' => $width,
			'height' => $height,
			'alt' => get_post_meta( $id, '_wp_attachment_image_alt', true ),
			'srcset' => wp_get_attachment_image_srcset( $id, $size ),
			'sizes' => wp_get_attachment_image_sizes( $id, $size ),
		];
	}

	private function get_attrs_from_url( $url ) {
		return [
			'src' => $url
		];
	}
}
