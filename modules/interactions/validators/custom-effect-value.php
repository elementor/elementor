<?php

namespace Elementor\Modules\Interactions\Validators;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\Interactions\Props\Custom_Effect_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * TODO: At least a value validator interface to enforce is_valid fxn for consistency
 */
class Custom_Effect_Value {
	public static function is_valid( array $animation_value ): bool {
		$effect_value = $animation_value['effect']['value'] ?? null;

		if ( 'custom' !== $effect_value ) {
			return true;
		}

		if ( ! isset( $animation_value['custom_effect'] ) ) {
			return false;
		}

		$props_parser = Props_Parser::make( [
			'custom_effect' => Custom_Effect_Prop_Type::make(),
		] );

		$result = $props_parser->parse( [ 'custom_effect' => $animation_value['custom_effect'] ] );

		return $result->is_valid();
	}
}
