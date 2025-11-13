<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Attributes_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_array( $value ) ) {
			return null;
		}

		$should_render = apply_filters( 'elementor/atomic_widgets/attributes/should_render', false, $value, $context );
		if ( ! $should_render ) {
			return null;
		}

		$result = implode( ' ', array_map( function ( $item ) {
			if ( ! isset( $item['key'] ) || '' == $item['key'] || ! isset( $item['value'] ) || '' == $item['value'] ) {
				return '';
			}
			$escaped_value = esc_attr( $item['value'] );
			return $item['key'] . '="' . $escaped_value . '"';
		}, $value ) );

		return $result;
	}
}
