<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		if ( empty( $value['target'] ) ) {
			throw new \Exception( 'Post ID or custom URL are not provided.' );
		}

		$is_post_id = (int) $value['target'];
		$post = $is_post_id ? get_post( (int) $value['target'] ) : null;
		$href = $post ? $post->guid : $value['target'];

		if ( wp_http_validate_url( $href ) ) {
			throw new \Exception( 'Url is invalid.' );
		}

		$link_attrs = [
			'href' => esc_url( $href ),
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
