<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Transformer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Src_Transformer implements Transformer {
	// This transformer (or rather this prop type) exists only to support dynamic images.
	// Currently, the dynamic tags that return images return it with id & url no matter
	// what, so we need to keep the same structure in the props.
	public function transform( $value ) {
		return [
			'id' => isset( $value['id'] ) ? (int) $value['id'] : null,
			'url' => $value['url'] ?? null,
		];
	}
}
