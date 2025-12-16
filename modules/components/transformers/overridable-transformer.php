<?php

namespace Elementor\Modules\Components\Transformers;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;
<<<<<<< HEAD
use Elementor\Modules\AtomicWidgets\Elements\Base\Render_Context;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;
=======
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\No_Op_Transformer;
use Exception;
>>>>>>> 4ad01089dd (wip)

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Overridable_Transformer extends Transformer_Base {
	public function transform( $value, Props_Resolver_Context $context ) {
		[ 'override_key' => $override_key, 'origin_value' => $origin_value ] = $value;

		$result = $origin_value;

		$overrides = Render_Context::get( static::class )['overrides'] ?? [];

		if ( isset( $overrides[ $override_key ] ) ) {
			$matching_override_value = $overrides[ $override_key ];

			if ( $this->is_origin_value_override( $origin_value ) ) {
				$result = $this->transform_overridable_override( $origin_value, $matching_override_value, $context );
			} else {
				$result = $matching_override_value;
			}
		}

		return $result;
	}

<<<<<<< HEAD
	private function is_origin_value_override( array $origin_value ): bool {
		return isset( $origin_value['$$type'] ) && Override_Prop_Type::get_key() === $origin_value['$$type'];
	}
=======
	private function transform_origin_value( array $value, Props_Resolver_Context $context ) {
		if ( ! isset( $value['origin_value'] ) || ! is_array( $value['origin_value'] ) ) {
			return null;
		}
>>>>>>> 4ad01089dd (wip)

	private function transform_overridable_override( array $inner_override, array $outer_override_value, Props_Resolver_Context $context ): ?array {
		$override_transformer = new Override_Transformer();
		$transformed_inner_override = $override_transformer->transform( $inner_override['value'], $context );

<<<<<<< HEAD
		return [
			'override_key' => $transformed_inner_override['override_key'],
			'override_value' => $outer_override_value,
		];
=======
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
>>>>>>> 4ad01089dd (wip)
	}
}
