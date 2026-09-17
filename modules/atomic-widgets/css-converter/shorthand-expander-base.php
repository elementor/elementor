<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Shorthand_Expander_Base implements Shorthand_Expander {
	/**
	 * Exact, enumerated shorthand property names this expander owns.
	 *
	 * @return string[]
	 */
	abstract protected function get_supported_properties(): array;

	public function is_supported( array $rule ): bool {
		$property = $rule['property'] ?? null;

		if ( ! is_string( $property ) || '' === $property ) {
			return false;
		}

		return in_array( $property, $this->get_supported_properties(), true );
	}

	public function expand( array $rule ): array {
		if ( null === $rule['value'] ) {
			return $this->expand_null( $rule );
		}

		return $this->do_expand( $rule );
	}

	/**
	 * Override to fan out null resets to all longhand properties.
	 * Default: re-emit the same property with a null value (covers simple renamers).
	 *
	 * @return array<int, array{property: string, value: null, declaration: string}>
	 */
	protected function expand_null( array $rule ): array {
		return [ $this->null_rule( $rule['property'] ) ];
	}

	/**
	 * @return array{property: string, value: null, declaration: string}
	 */
	protected function null_rule( string $property ): array {
		return [
			'property' => $property,
			'value' => null,
			'declaration' => $property . ': ',
		];
	}

	/**
	 * @param array{property: string, value: string} $rule A rule with a guaranteed non-null value.
	 * @return array<int, array{property: string, value: string, declaration: string}>
	 */
	abstract protected function do_expand( array $rule ): array;
}
