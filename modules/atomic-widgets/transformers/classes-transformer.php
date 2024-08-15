<?php

namespace Elementor\Modules\AtomicWidgets\transformers;

use Elementor\Modules\AtomicWidgets\Base\Atomic_Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Classes_Transformer extends Atomic_Transformer_Base {
	public static function type(): string {
		return 'classes';
	}

	public function transform( $value ) {
		if ( ! is_array( $value ) ) {
			return '';
		}

		return implode( ' ', array_filter( $value ) );
	}
}
