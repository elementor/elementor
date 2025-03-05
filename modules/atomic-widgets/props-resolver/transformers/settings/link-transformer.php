<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Url_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ): ?array {
		$url = $this->extract_url( $value );

		if ( ! Url_Prop_Type::validate_url( $url ) ) {
			return null;
		}

		$link_attrs = [
			'href' => esc_url( $url ),
			'target' => $value['isTargetBlank'] ? '_blank' : '_self',
		];

		return array_filter( $link_attrs );
	}

	private function extract_url( $value ): ?string {
		$destination = $value['destination'];
		$post = is_numeric( $destination ) ? get_post( $destination ) : null;

		return $post ? $post->guid : $destination;
	}
}
