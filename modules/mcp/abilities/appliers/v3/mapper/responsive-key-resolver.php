<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Breakpoint naming of V3 settings: the base breakpoint writes the bare key, the others
 * write `<setting>_<breakpoint>`.
 */
class Responsive_Key_Resolver {

	const BASE_BREAKPOINT = 'desktop';

	const RESPONSIVE_SUFFIXES = [
		'_tablet' => 'tablet',
		'_mobile' => 'mobile',
	];
}
