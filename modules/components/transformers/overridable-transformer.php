<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\No_Op_Transformer;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overridable_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		// todo: render component overrides
		return $this->transform_origin_value( $value, $context );
	}

	private function transform_origin_value( array $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['origin_value'] ) || ! is_array( $value['origin_value'] ) ) {
			return null;
		}

		$origin_value = $value['origin_value'];

		if ( ! isset( $origin_value['$$type'] ) || ! isset( $origin_value['value'] ) ) {
			return null;
		}

		$transformer = $context->get_transformer( $origin_value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		if ( $transformer instanceof No_Op_Transformer ) {
			return $origin_value;
		}

		try {
			$result = $transformer->transform( $origin_value['value'], $context );
			return $result;
		} catch ( Exception $e ) {
			return $origin_value;
		}
	}
}
