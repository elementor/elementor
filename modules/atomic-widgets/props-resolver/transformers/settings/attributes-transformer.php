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

		$result = implode( ' ', array_map( function ( $item ) {
			if ( ! isset( $item['key'] ) || '' == $item['key'] || ! isset( $item['value'] ) || '' == $item['value'] ) {
				return '';
			}
			return $item['key'] . '=' . $item['value'];
		}, $value ) );

		return $result;
	}
}
