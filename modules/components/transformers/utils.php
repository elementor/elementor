<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Exception;
use Elementor\Modules\AtomicWidgets\PropsResolver\Render_Props_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Utils extends Render_Props_Resolver {
    public static function transform_unknown_value( $value, Props_Resolver_Context $context ): mixed {
        if ( ! is_array( $value ) ) {
			return null;
		}

        if ( ! isset( $value['$$type'] ) || ! isset( $value['value'] ) ) {
			return null;
		}

		$transformer = $context->get_transformer( $value['$$type'] );

		if ( ! ( $transformer instanceof Transformer_Base ) ) {
			return null;
		}

		try {
			return $transformer->transform( $value['value'], $context );
		} catch ( Exception $e ) {
			return null;
		}
    }

}