<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		if ( ! empty( $value['src']['id'] ) ) {
			$image_src = wp_get_attachment_image_src(
				(int) $value['src']['id'],
				$value['size'] ?? 'full'
			);

			if ( ! $image_src ) {
				throw new \Exception( 'Cannot get image src.' );
			}

			[ $src, $width, $height ] = $image_src;

			return [
				'src' => $src,
				'width' => (int) $width,
				'height' => (int) $height,
				'srcset' => wp_get_attachment_image_srcset( $value['src']['id'], $value['size'] ),
				'alt' => get_post_meta( $value['src']['id'], '_wp_attachment_image_alt', true ),
			];
		}

		if ( empty( $value['src']['url'] ) ) {
			throw new \Exception( 'Invalid image URL.' );
		}

		return [
			'src' => $value['src']['url'],
		];
	}
}
