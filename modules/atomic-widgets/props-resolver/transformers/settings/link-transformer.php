<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ): array {
		if ( empty( $value['enabled'] ) ) {
			return [];
		}

		if ( empty( $value['href'] ) ) {
			throw new \Exception( 'Url is not provided.' );
		}

		$link_attrs = [
			'href' => esc_url( $value['href'] ),
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
