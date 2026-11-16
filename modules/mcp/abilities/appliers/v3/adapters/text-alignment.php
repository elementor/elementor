<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The style schema only accepts logical alignments, while some V3 controls list physical ones,
 * so `left` and `right` map to `start` and `end` by the site's text direction.
 */
class Text_Alignment {

	const LTR_PHYSICAL = [
		'start' => 'left',
		'end' => 'right',
	];

	const RTL_PHYSICAL = [
		'start' => 'right',
		'end' => 'left',
	];

	public static function to_physical( string $logical ): ?string {
		return self::physical_map()[ $logical ] ?? null;
	}

	public static function to_logical( string $physical ): ?string {
		return array_flip( self::physical_map() )[ strtolower( $physical ) ] ?? null;
	}

	/**
	 * @return array<string, string>
	 */
	private static function physical_map(): array {
		return is_rtl() ? self::RTL_PHYSICAL : self::LTR_PHYSICAL;
	}
}
