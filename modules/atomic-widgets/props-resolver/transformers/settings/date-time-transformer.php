<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Date_Time_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$date = isset( $value['date'] ) ? trim( $value['date'] ) : '';
		$time = isset( $value['time'] ) ? trim( $value['time'] ) : '';

		if ( '' === $date && '' === $time ) {
			return '';
		}

		$result = trim( $date . ' ' . $time );

		return esc_attr( $result );
	}
}
