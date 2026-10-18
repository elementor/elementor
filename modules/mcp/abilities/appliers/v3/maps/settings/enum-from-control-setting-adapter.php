<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Settings;

use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Enum_From_Control_Setting_Adapter implements V3_Setting_Adapter {

	const CHOICE_CONTROL_TYPES = [ 'select', 'select2', 'choose' ];

	const EMPTY_OPTION_KEY = '';

	const FALLBACK_EMPTY_OPTION = 'blank';

	public function supports( array $control ): bool {
		return in_array( $control['type'] ?? null, self::CHOICE_CONTROL_TYPES, true )
			&& ! empty( $control['options'] )
			&& is_array( $control['options'] );
	}

	public function prop_type( array $control ): Prop_Type {
		return String_Prop_Type::make()->enum( self::public_values( $control ) );
	}

	public function to_control_value( array $prop_value, array $control ) {
		$value = $prop_value['value'] ?? null;

		return is_string( $value ) ? self::stored_value( $value, $control ) : $value;
	}

	public function from_control_value( $stored, array $control ) {
		return is_scalar( $stored ) ? self::public_value( (string) $stored, $control ) : null;
	}

	/**
	 * Option keys as the schema shows them. An empty key is the label's slug, because an empty enum value is not a value an agent can send.
	 *
	 * @param array<string, mixed> $control
	 * @return string[]
	 */
	public static function public_values( array $control ): array {
		$values = [];

		foreach ( array_keys( $control['options'] ?? [] ) as $key ) {
			$values[] = self::public_value( (string) $key, $control );
		}

		return $values;
	}

	/**
	 * @param array<string, mixed> $control
	 */
	public static function public_value( string $stored, array $control ): string {
		if ( self::EMPTY_OPTION_KEY !== $stored || ! self::has_empty_option( $control ) ) {
			return $stored;
		}

		return self::empty_option_token( $control );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	public static function stored_value( string $public, array $control ): string {
		if ( self::has_empty_option( $control ) && $public === self::empty_option_token( $control ) ) {
			return self::EMPTY_OPTION_KEY;
		}

		return $public;
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function has_empty_option( array $control ): bool {
		return is_array( $control['options'] ?? null ) && array_key_exists( self::EMPTY_OPTION_KEY, $control['options'] );
	}

	/**
	 * @param array<string, mixed> $control
	 */
	private static function empty_option_token( array $control ): string {
		$label = $control['options'][ self::EMPTY_OPTION_KEY ] ?? '';

		if ( is_array( $label ) ) {
			$label = $label['title'] ?? '';
		}

		$token = strtolower( (string) preg_replace( '/[^a-z0-9]+/i', '-', (string) $label ) );
		$token = trim( $token, '-' );
		$taken = array_map( 'strval', array_keys( $control['options'] ?? [] ) );

		if ( '' === $token || in_array( $token, $taken, true ) ) {
			$token = self::FALLBACK_EMPTY_OPTION;
		}

		if ( in_array( $token, $taken, true ) ) {
			$token = self::FALLBACK_EMPTY_OPTION . '-option';
		}

		return $token;
	}
}
