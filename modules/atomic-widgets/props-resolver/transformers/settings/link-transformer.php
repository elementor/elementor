<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		if ( empty( $value['destination'] ) ) {
			throw new \Exception( 'Post ID or custom URL are not provided.' );
		}

		$post = get_post( (int) $value['destination'] );
		$href = $post ? $post->guid : $value['destination'];

		$link_attrs = [
			'href' => esc_url( $href ),
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
