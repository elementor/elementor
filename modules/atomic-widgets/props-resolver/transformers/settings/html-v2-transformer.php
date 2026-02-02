<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Html_V2_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( is_string( $value ) ) {
			return $value;
		}

		if ( ! is_array( $value ) ) {
			return '';
		}

		return $value['content'] ?? '';
	}
}
