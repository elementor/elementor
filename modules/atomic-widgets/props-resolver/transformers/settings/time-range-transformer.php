<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Time_Range_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( empty( $value ) ) {
			return null;
		}

		return [
			'min' => empty( $value['min'] ) ? null : $value['min'],
			'max' => empty( $value['max'] ) ? null : $value['max'],
		];
	}
}
