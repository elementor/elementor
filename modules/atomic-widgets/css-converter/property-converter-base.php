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
		$custom = $this->get_custom_converter( $context, $rule );

		if ( null !== $custom ) {
			return $custom();
		}

		if ( null === $rule['value'] ) {
			return $this->convert_null( $context, $rule );
		}

		return $this->do_convert( $context, $rule );
	}

	/**
	 * Override to handle special-case rules before the standard null-check and do_convert path.
	 * Receives the full rule (value may be null). Return null to fall through to default behavior.
	 */
	protected function get_custom_converter( Conversion_Context $context, array $rule ): ?callable {
		return null;
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
