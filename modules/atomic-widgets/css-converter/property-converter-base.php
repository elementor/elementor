<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Property_Converter_Base implements Property_Converter {
	/**
	 * Exact, enumerated property names this converter owns.
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

	public function convert( Conversion_Context $context, array $rule ): bool {
		if ( null === $rule['value'] ) {
			return $this->convert_null( $context, $rule );
		}

		return $this->do_convert( $context, $rule );
	}

	/**
	 * Override to customize null-reset behavior. Default: set the prop to null directly.
	 */
	protected function convert_null( Conversion_Context $context, array $rule ): bool {
		$context->set_prop( $rule['property'], null );

		return true;
	}

	abstract protected function do_convert( Conversion_Context $context, array $rule ): bool;
}
