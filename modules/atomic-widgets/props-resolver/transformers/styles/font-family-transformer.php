<?php

namespace Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformer_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Font_Family_Transformer extends Transformer_Base {
	/**
	 * Per the CSS spec, font-family values only need to be quoted when they contain whitespace
	 * or special characters. Quoting is actively harmful for:
	 *   - CSS variable references (`var(--x)` becomes a literal string, breaking resolution)
	 *   - Generic families (`"sans-serif"` becomes a font named "sans-serif", not the generic)
	 *   - CSS-wide keywords (`inherit`, `initial`, `unset`)
	 *   - Any other CSS function like `local(...)`
	 *
	 * We only wrap values that actually need it (multi-word font names like "Open Sans").
	 */
	public function transform( $value, Props_Resolver_Context $context ) {
		if ( ! is_string( $value ) ) {
			return null;
		}

		$trimmed = trim( $value );

		if ( '' === $trimmed || $this->is_already_quoted( $trimmed ) ) {
			return $trimmed;
		}

		return preg_match( '/\s/', $trimmed )
			? '"' . $trimmed . '"'
			: $trimmed;
	}

	private function is_already_quoted( string $value ): bool {
		return ( str_starts_with( $value, '"' ) && str_ends_with( $value, '"' ) )
			|| ( str_starts_with( $value, "'" ) && str_ends_with( $value, "'" ) );
	}
}
