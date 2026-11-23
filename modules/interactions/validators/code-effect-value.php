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

	public static function is_code_effect_only_trigger( array $interaction_value ): bool {
		return in_array( $interaction_value['trigger']['value'] ?? null, Presets::CODE_EFFECT_ONLY_TRIGGERS, true );
	}

	public static function get_listened_event( array $interaction_value ): ?string {
		if ( Presets::EVENT_TRIGGER !== ( $interaction_value['trigger']['value'] ?? null ) ) {
			return null;
		}

		$event_name = $interaction_value['event']['value'] ?? null;

		return is_string( $event_name ) ? $event_name : null;
	}

	public static function get_fired_event( array $interaction_value ): ?string {
		$event_name = $interaction_value['fires_event']['value'] ?? null;

		return is_string( $event_name ) ? $event_name : null;
	}

	private static function has_valid_event_name( array $interaction_value ): bool {
		if ( Presets::EVENT_TRIGGER !== ( $interaction_value['trigger']['value'] ?? null ) ) {
			return true;
		}

		return self::is_event_name( self::get_listened_event( $interaction_value ) );
	}

	private static function has_valid_fires_event( array $interaction_value ): bool {
		return ! isset( $interaction_value['fires_event'] ) || self::is_event_name( self::get_fired_event( $interaction_value ) );
	}

	private static function is_event_name( ?string $name ): bool {
		return null !== $name && 1 === preg_match( Presets::EVENT_NAME_PATTERN, $name );
	}

	public static function is_valid( array $interaction_value ): bool {
		$animation_value = $interaction_value['animation']['value'] ?? [];

		if ( ! is_array( $animation_value ) || ! self::is_code_effect( $animation_value ) ) {
			return ! self::is_code_effect_only_trigger( $interaction_value ) && ! isset( $interaction_value['fires_event'] );
		}

		if ( ! self::has_valid_fires_event( $interaction_value ) ) {
			return false;
		}

		if ( ! Trigger_Value::is_valid( $interaction_value['trigger'] ?? null ) ) {
			return false;
		}

		if ( ! isset( $animation_value['code_effect'] ) ) {
			return false;
		}

		if ( ! self::has_valid_event_name( $interaction_value ) ) {
			return false;
		}

		$props_parser = Props_Parser::make( [
			'code_effect' => Code_Effect_Prop_Type::make(),
		] );

		return $props_parser->validate( [ 'code_effect' => $animation_value['code_effect'] ] )->is_valid();
	}
}
