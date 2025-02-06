<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		if ( empty( $value['destination'] ) ) {
			throw new \Exception( 'Post ID or custom URL are not provided.' );
		}

		$destination = $value['destination'];
		$post = is_numeric( $destination ) ? get_post( $destination ) : null;
		$href = $post ? $post->guid : $destination;

		if ( ! Url_Prop_Type::validate_url( $href ) ) {
			return [];
		}

		$link_attrs = [
			'href' => esc_url( $href ),
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
