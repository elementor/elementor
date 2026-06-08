<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Property_Converter_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Placeholder that explicitly claims a schema property but declines conversion, so the rule
 * routes to customCss. Real converters replace the no-op for their property (Phase 1+).
 */
class Noop_Converter extends Property_Converter_Base {
	private string $property;

	public function __construct( string $property ) {
		$this->property = $property;
	}

	protected function get_supported_properties(): array {
		return [ $this->property ];
	}

	public function convert( Conversion_Context $context, array $rule ): bool {
		return false;
	}
}
