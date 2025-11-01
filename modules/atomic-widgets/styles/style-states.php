<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_States {
	const HOVER = 'hover';
	const ACTIVE = 'active';
	const FOCUS = 'focus';

	const SELECTED = 'e--selected';

	public static function get_pseudo_states(): array {
		return [
			self::HOVER,
			self::ACTIVE,
			self::FOCUS,
		];
	}

	public static function get_class_states(): array {
		return [
			self::SELECTED,
		];
	}

	public static function get_valid_states(): array {
		return [
			...self::get_pseudo_states(),
			...self::get_class_states(),
			null,
		];
	}

	public static function is_pseudo_state( string $state ): bool {
		return in_array( $state, self::get_pseudo_states(), true );
	}

	public static function is_class_state( string $state ): bool {
		return in_array( $state, self::get_class_states(), true );
	}

	public static function is_valid_state( $state ): bool {
		if ( null === $state ) {
			return true;
		}

		return is_string( $state ) && in_array( $state, self::get_valid_states(), true );
	}

	public static function get_class_states_map(): array {
		return [
			'selected' => [
				'name' => 'selected',
				'value' => self::SELECTED,
			],
		];
	}
}
