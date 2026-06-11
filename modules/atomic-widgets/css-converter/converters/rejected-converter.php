<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Claims a property and unconditionally rejects it: the declaration is added to the `rejected`
 * bucket instead of `customCss`. Used for properties that are structurally incompatible with
 * Elementor's style system (e.g. `animation`, `@keyframes`), so the client can surface a hint
 * to the LLM rather than silently emitting broken CSS.
 */
class Rejected_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		$context->reject( $rule['declaration'] . ';' );

		return true;
	}
}
