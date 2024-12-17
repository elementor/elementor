<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Link_Transformer extends Transformer_Base {
	public function transform( $value, $key ) {
		if ( empty( $value['href'] ) ) {
			throw new \Exception( 'Invalid link URL.' );
		}

		$link_attrs = [
			'href' => esc_url( $value['href'] ) ?? '',
			'target' => $value['isTargetBlank'] ? '_blank' : '',
		];

		return array_filter( $link_attrs );
	}
}
