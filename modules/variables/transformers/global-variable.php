<?php

namespace Elementor\Modules\Variables\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Global_Variable extends Transformer_Base {
	public function transform( $value, $key ) {
		if ( ! trim( $value ) ) {
			return null;
		}

		return "var(--${value})";
	}
}
