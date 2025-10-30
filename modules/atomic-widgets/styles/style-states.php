<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_States {
	const HOVER = 'hover';
	const ACTIVE = 'active';
	const FOCUS = 'focus';

	const CUSTOM_SELECTED = 'e--selected';

	public static function get_native_states(): array {
		return [
			self::HOVER,
			self::ACTIVE,
			self::FOCUS,
		];
	}

	public static function get_custom_states(): array {
		return [
			self::CUSTOM_SELECTED,
		];
	}

	public static function get_valid_states(): array {
		return [
			...self::get_native_states(),
			...self::get_custom_states(),
			null,
		];
	}

	public static function is_native_state( string $state ): bool {
		return in_array( $state, self::get_native_states(), true );
	}

	public static function is_custom_state( string $state ): bool {
		return in_array( $state, self::get_custom_states(), true );
	}

	public static function is_valid_state( $state ): bool {
		if ( null === $state ) {
			return true;
		}

		return is_string( $state ) && in_array( $state, self::get_valid_states(), true );
	}

	public static function get_custom_states_map(): array {
		return [
			'selected' => [
				'name' => 'selected',
				'value' => self::CUSTOM_SELECTED,
			],
		];
	}
}
