<?php

namespace Elementor\Modules\Interactions\Validators;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\Interactions\Presets;
use Elementor\Modules\Interactions\Props\Code_Effect_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Code_Effect_Value {
	public static function is_code_effect( array $animation_value ): bool {
		return Presets::CODE_EFFECT === ( $animation_value['effect']['value'] ?? null );
	}

	public static function is_valid( array $interaction_value ): bool {
		$animation_value = $interaction_value['animation']['value'] ?? [];

		if ( ! is_array( $animation_value ) || ! self::is_code_effect( $animation_value ) ) {
			return true;
		}

		if ( Presets::CODE_EFFECT_TRIGGER !== ( $interaction_value['trigger']['value'] ?? null ) ) {
			return false;
		}

		if ( ! isset( $animation_value['code_effect'] ) ) {
			return false;
		}

		$props_parser = Props_Parser::make( [
			'code_effect' => Code_Effect_Prop_Type::make(),
		] );

		return $props_parser->validate( [ 'code_effect' => $animation_value['code_effect'] ] )->is_valid();
	}
}
