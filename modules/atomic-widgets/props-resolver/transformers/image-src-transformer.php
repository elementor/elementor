<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Transformer extends Transformer_Base {
	const LIST_STYLE_IMAGE_KEY = 'list-style-image';

	/**
	 * This transformer (or rather this prop type) exists only to support dynamic images.
	 * Currently, the dynamic tags that return images return it with id & url no matter
	 * what, so we need to keep the same structure in the props.
	 */
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( self::LIST_STYLE_IMAGE_KEY === $context->get_key() ) {
			$image_url = $this->get_image_url( $value );

			return $image_url ? 'url("' . esc_url( $image_url ) . '")' : null;
		}

		return [
			'id' => isset( $value['id'] ) ? (int) $value['id'] : null,
			'url' => $value['url'] ?? null,
		];
	}

	private function get_image_url( array $value ): ?string {
		if ( ! empty( $value['id'] ) ) {
			$image = wp_get_attachment_image_src( (int) $value['id'], 'full' );

			if ( $image ) {
				return $image[0];
			}
		}

		return $value['url'] ?? null;
	}
}
