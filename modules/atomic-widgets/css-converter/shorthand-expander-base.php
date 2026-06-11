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

	abstract public function expand( array $rule ): array;
}
