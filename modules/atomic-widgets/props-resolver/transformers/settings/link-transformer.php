<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ): ?array {
		$url = $this->extract_url( $value );

		$shared_context = $context->get_shared_context();
		$destination_metadata = $shared_context ? $shared_context->get_field_metadata( 'destination' ) : null;
		$is_action_group = $destination_metadata && 'action' === ( $destination_metadata['dynamic_group'] ?? '' );

		$tag = $is_action_group ? 'button' : 'a';

		return [
			'tag' => $tag,
			'href' => $url,
			'target' => $value['isTargetBlank'] ? '_blank' : '_self',
		];
	}

	private function extract_url( $value ): ?string {
		$destination = $value['destination'];
		$post = is_numeric( $destination ) ? get_post( $destination ) : null;

		return $post ? get_permalink( $post ) : $destination;
	}
}
