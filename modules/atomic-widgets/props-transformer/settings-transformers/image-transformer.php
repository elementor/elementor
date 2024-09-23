<?php

namespace Elementor\Modules\AtomicWidgets\PropsTransformer\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsTransformer\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Image_Prop_Type::get_key();
	}

	public function transform( $value ) {
		if ( isset( $value['src']['id'], $value['size'] ) ) {
			$image_src = wp_get_attachment_image_src( $value['src']['id'], $value['size'] );

			return [
				'src' => $image_src[0] ?? '',
				'width' => $image_src[1] ?? null,
				'height' => $image_src[2] ?? null,
				'srcset' => wp_get_attachment_image_srcset( $value['src']['id'], $value['size'] ),
				'alt' => get_post_meta( $value['src']['id'], '_wp_attachment_image_alt', true ),
			];
		}

		return [
			'src' => $value['src']['url'] ?? '',
		];
	}
}
