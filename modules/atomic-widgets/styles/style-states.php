<?php

namespace Elementor\Modules\AtomicWidgets\Styles;

class Style_States {
	const HOVER = 'hover';
	const ACTIVE = 'active';
	const FOCUS = 'focus';
	const FOCUS_VISIBLE = 'focus-visible';

	const SELECTED = 'e--selected';

	private static function get_pseudo_states(): array {
		return [
			self::HOVER,
			self::ACTIVE,
			self::FOCUS,
			self::FOCUS_VISIBLE,
		];
	}

	private static function get_class_states(): array {
		return [
			self::SELECTED,
		];
	}

	private static function get_additional_states_map(): array {
		return [
			self::HOVER => [ self::FOCUS_VISIBLE ],
		];
	}

	public static function get_selector_with_state( string $base_selector, string $state ): string {
		$additional_states = self::get_additional_states( $state );
		$all_states = [ $state, ...$additional_states ];

		foreach ( $all_states as $current_state ) {
			$selector_strings[] = $base_selector . self::get_state_selector( $current_state );
		}

		return implode( ',', $selector_strings );
	}

	public static function get_additional_states( string $state ): array {
		return self::get_additional_states_map()[ $state ] ?? [];
	}

	public static function get_state_selector( string $state ): string {
		if ( self::is_class_state( $state ) ) {
			return '.' . $state;
		}

		if ( self::is_pseudo_state( $state ) ) {
			return ':' . $state;
		}

		return $state;
	}


	public static function get_valid_states(): array {
		return [
			...array_filter( self::get_pseudo_states(), function ( $state ) {
				return ! in_array( $state, self::get_additional_states_map()[ $state ] ?? [], true );
			} ),
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
