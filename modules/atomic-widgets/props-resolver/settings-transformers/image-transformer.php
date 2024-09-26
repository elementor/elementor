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
