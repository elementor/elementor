<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Video_Src_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$id = isset( $value['id'] ) ? (int) $value['id'] : null;
		$url = $value['url'] ?? null;

		if ( $id ) {
			$url = wp_get_attachment_url( $id );
		}

		return [
			'id' => $id,
			'url' => $url,
		];
	}
}
