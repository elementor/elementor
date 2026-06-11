<?php

namespace Elementor\Modules\AtomicWidgets\CssConverter\Expanders;

use Elementor\Modules\AtomicWidgets\CssConverter\Shorthand_Expander_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Rewrites physical inset properties (top, right, bottom, left) to their logical equivalents
 * (inset-block-start, inset-inline-end, inset-block-end, inset-inline-start) so the standard
 * Size converters can handle them without needing separate converter registrations.
 *
 * Assumes LTR writing mode, which matches the Elementor canvas default.
 */
class Physical_To_Logical_Expander extends Shorthand_Expander_Base {
	const PHYSICAL_TO_LOGICAL = [
		'top'    => 'inset-block-start',
		'right'  => 'inset-inline-end',
		'bottom' => 'inset-block-end',
		'left'   => 'inset-inline-start',
	];

	protected function get_supported_properties(): array {
		return array_keys( self::PHYSICAL_TO_LOGICAL );
	}

	public function expand( array $rule ): array {
		$logical = self::PHYSICAL_TO_LOGICAL[ $rule['property'] ];
		$value = $rule['value'];

		return [
			[
				'property'    => $logical,
				'value'       => $value,
				'declaration' => $logical . ': ' . $value,
			],
		];
	}
}
