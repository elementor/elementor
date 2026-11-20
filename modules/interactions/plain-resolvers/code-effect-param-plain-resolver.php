<?php

namespace Elementor\Modules\Interactions\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Interactions\Props\Code_Effect_Param_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * A param's value type depends on its sibling `control`, which the generic union walker can't see:
 * it would truncate float numbers and resolve colors as plain strings.
 */
class Code_Effect_Param_Plain_Resolver extends Plain_Resolver_Base {
	const VALUE_FIELDS = [ 'value', 'default' ];
	const NUMBER_FIELDS = [ 'min', 'max', 'step' ];

	public function resolve( $plain_value ) {
		if ( ! is_array( $plain_value ) ) {
			return null;
		}

		if ( isset( $plain_value['$$type'] ) ) {
			return $plain_value;
		}

		$value_type = Code_Effect_Param_Prop_Type::CONTROL_VALUE_TYPES[ $plain_value['control'] ?? '' ] ?? null;

		if ( null === $value_type || ! isset( $plain_value['key'], $plain_value['label'] ) ) {
			return null;
		}

		$param = [
			'key' => String_Prop_Type::generate( (string) $plain_value['key'] ),
			'label' => String_Prop_Type::generate( (string) $plain_value['label'] ),
			'control' => String_Prop_Type::generate( $plain_value['control'] ),
		];

		foreach ( self::VALUE_FIELDS as $field ) {
			$typed = array_key_exists( $field, $plain_value ) ? $this->resolve_typed_value( $value_type, $plain_value[ $field ] ) : null;

			if ( null !== $typed ) {
				$param[ $field ] = $typed;
			}
		}

		foreach ( self::NUMBER_FIELDS as $field ) {
			if ( isset( $plain_value[ $field ] ) && is_numeric( $plain_value[ $field ] ) ) {
				$param[ $field ] = Number_Prop_Type::generate( (float) $plain_value[ $field ] );
			}
		}

		if ( isset( $plain_value['options'] ) && is_array( $plain_value['options'] ) ) {
			$param['options'] = String_Array_Prop_Type::generate( array_map(
				fn( $option ) => String_Prop_Type::generate( (string) $option ),
				array_values( array_filter( $plain_value['options'], 'is_scalar' ) )
			) );
		}

		return Code_Effect_Param_Prop_Type::generate( $param );
	}

	private function resolve_typed_value( string $value_type, $value ): ?array {
		switch ( $value_type ) {
			case Number_Prop_Type::get_key():
				return is_numeric( $value ) ? Number_Prop_Type::generate( (float) $value ) : null;
			case Color_Prop_Type::get_key():
				return is_string( $value ) ? Color_Prop_Type::generate( $value ) : null;
			case Boolean_Prop_Type::get_key():
				$boolean = filter_var( $value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE );

				return null === $boolean ? null : Boolean_Prop_Type::generate( $boolean );
			default:
				return is_scalar( $value ) ? String_Prop_Type::generate( (string) $value ) : null;
		}
	}
}
