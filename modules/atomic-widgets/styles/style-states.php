<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_States {
	const NATIVE_HOVER = 'hover';
	const NATIVE_ACTIVE = 'active';
	const NATIVE_FOCUS = 'focus';

	const CUSTOM_SELECTED = 'e--selected';

	/**
	 * Get all native CSS states (pseudo-classes).
	 *
	 * @return array<string>
	 */
	public static function get_native_states(): array {
		return [
			self::NATIVE_HOVER,
			self::NATIVE_ACTIVE,
			self::NATIVE_FOCUS,
		];
	}

	/**
	 * Get all custom states (classes).
	 *
	 * @return array<string>
	 */
	public static function get_custom_states(): array {
		return [
			self::CUSTOM_SELECTED,
		];
	}

	/**
	 * Get all valid states including null.
	 *
	 * @return array<string|null>
	 */
	public static function get_valid_states(): array {
		return [
			...self::get_native_states(),
			...self::get_custom_states(),
			null,
		];
	}

	/**
	 * Check if a state is a native CSS state (pseudo-class).
	 *
	 * @param string $state
	 * @return bool
	 */
	public static function is_native_state( string $state ): bool {
		return in_array( $state, self::get_native_states(), true );
	}

	/**
	 * Check if a state is a custom state (class).
	 *
	 * @param string $state
	 * @return bool
	 */
	public static function is_custom_state( string $state ): bool {
		return in_array( $state, self::get_custom_states(), true );
	}

	/**
	 * Check if a state is valid.
	 *
	 * @param mixed $state
	 * @return bool
	 */
	public static function is_valid_state( $state ): bool {
		if ( null === $state ) {
			return true;
		}

		return is_string( $state ) && in_array( $state, self::get_valid_states(), true );
	}

	/**
	 * Get available custom states as key-value pairs for UI.
	 * Returns an associative array where keys are state names and values are objects with 'value' and 'label'.
	 *
	 * @return array<string, array{value: string, label: string}>
	 */
	public static function get_custom_states_map(): array {
		return [
			'selected' => [
				'name' => 'selected',
				'value' => self::CUSTOM_SELECTED,
			],
		];
	}
}
