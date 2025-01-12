<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Background_Image_Overlay_Transformer extends Transformer_Base {
		public function transform( $value, $key ) {
			var_dump($value);
			if ( ! empty( $value['image-src']['url'] ) ) {
				$src = $value['image-src']['url'];
				return "url(\" $src \")";
			}

			if ( ! empty( $value['image-src']['id'] ) ) {
				var_dump( 'mm here');
				$image_src = wp_get_attachment_image_src(
					(int) $value['image-src']['id'],
					$value['size'] ?? '300'
				);

				var_dump( $image_src );

				if ( ! $image_src ) {
					throw new \Exception( 'Cannot get image src.' );
				}

				[ $src ] = $image_src;

				return "url(\" $src \")";
			}

			if ( empty( $value['image-src']['url'] ) ) {
				throw new \Exception( 'Invalid image URL.' );
			}
		}
}
