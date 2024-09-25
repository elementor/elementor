<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\SettingsTransformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Transformer extends Transformer_Base {
	public function get_type(): string {
		return Image_Prop_Type::get_key();
	}

	public function transform( $value ) {
		if ( isset( $value['src']['id'] ) ) {
			$image_src = wp_get_attachment_image_src(
				(int) $value['src']['id'],
				$value['size'] ?? 'full'
			);

			return [
				'src' => esc_url( $image_src[0] ?? '' ),
				'width' => isset( $image_src[1] ) ? (int) $image_src[1] : null,
				'height' => isset( $image_src[2] ) ? (int) $image_src[2] : null,
				'srcset' => wp_get_attachment_image_srcset( $value['src']['id'], $value['size'] ),
				'alt' => get_post_meta( $value['src']['id'], '_wp_attachment_image_alt', true ),
			];
		}

		return [
			'src' => esc_url( $value['src']['url'] ?? '' ),
		];
	}
}
