<?php

namespace Elementor\Modules\AtomicWidgets\transformers;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Image_Url_Transformer extends Atomic_Transformer_Base {
	public static function type(): string {
		return 'image-url';
	}

	public function transform( $value ) {
		$url = $value['url'] ?? null;

		if ( ! $url ) {
			return null;
		}

		return [
			'src' => $url,
		];
	}
}
