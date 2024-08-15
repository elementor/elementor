<?php

namespace Elementor\Modules\AtomicWidgets\transformers;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Attachment_Transformer extends Atomic_Transformer_Base {
	public static function type(): string {
		return 'image-attachment';
	}

	public function transform( $value ) {
		$id = $value['id'] ?? null;
		$size = $value['size'] ?? 'full';

		if ( ! $id ) {
			return null;
		}

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
}
