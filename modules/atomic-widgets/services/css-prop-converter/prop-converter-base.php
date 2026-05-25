<?php

namespace Elementor\Modules\AtomicWidgets\Services\CssPropConverter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

abstract class Prop_Converter_Base {

	abstract public function get_supported_properties(): array;

	/**
	 * Convert declarations into typed prop shapes.
	 *
	 * @param array $declarations List of [ 'property' => string, 'value' => string ].
	 * @return array {
	 *     @type array $props Map of output property key => prop shape.
	 *     @type array $unconverted List of [ 'declaration' => string, 'hint' => string ].
	 * }
	 */
	abstract public function convert( array $declarations ): array;

	public function supports( string $property ): bool {
		return in_array( $property, $this->get_supported_properties(), true );
	}

	protected function unconverted( string $property, string $value, string $hint ): array {
		return [
			'declaration' => $property . ': ' . $value,
			'hint' => $hint,
		];
	}
}
