<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Query_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		if ( empty( $value['target'] ) ) {
			throw new \Exception( 'Post ID or custom URL are not provided.' );
		}

		$is_post_id = (int) $value['target'];
		$href = $is_post_id ? get_post( (int) $value['target'] )->guid : $value['target'];

		$link_attrs = [
			'href' => esc_url( $href ),
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
