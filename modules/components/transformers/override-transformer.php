<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Override_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['override_key'] ) ) {
			return null;
		}

		$transformed_override_value = $this->transform_override_value( $value, $context );

		return [ 'override_key' => $value['override_key'], 'override_value' => $transformed_override_value ];
	}

	private function transform_override_value( array $value, Props_Resolver_Context $context ): mixed {
		if ( ! isset( $value['override_value'] ) || ! is_array( $value['override_value'] ) ) {
			return null;
		}

		$override_value = $value['override_value'];

		if ( ! isset( $override_value['$$type'] ) || ! isset( $override_value['value'] ) ) {
			return null;
		}

		$transformer = $context->get_transformer( $override_value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			return $transformer->transform( $override_value['value'], $context );
		} catch ( Exception $e ) {
			return null;
		}
	}
}
