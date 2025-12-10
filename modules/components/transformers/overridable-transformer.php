<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
use Exception;
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\Components\Transformers\Component_Instance_Transformer;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overridable_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		$override_key = $value['override_key'];
		$overrides = Render_Context::get( static::class )['overrides'] ?? [];

		if ( isset( $overrides[ $override_key ] ) ) {
			if (isset( $value['origin_value']) && $value['origin_value']['$$type'] === 'override') {
				$transformed_override = $this->transform_origin_value( $value, $context );
				return [ 'override_key' => $transformed_override['override_key'], 'override_value' => $overrides[ $override_key ] ];

				
			}
			return $overrides[ $override_key ];
		}

		return $this->transform_origin_value( $value, $context );
	}

	private function transform_origin_value( array $value, Props_Resolver_Context $context ): mixed {
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

		try {
			return $transformer->transform( $origin_value['value'], $context );
		} catch ( Exception $e ) {
			return null;
		}
	}
}
