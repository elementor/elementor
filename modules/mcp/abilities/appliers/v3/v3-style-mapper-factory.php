<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Wires the default collaborators of {@see V3_Style_Mapper} so production callers
 * do not have to know about its internal collaborators.
 */
class V3_Style_Mapper_Factory {

	public static function create( Css_Converter $css_converter, array $active_breakpoints = [], ?bool $has_pro = null ): V3_Style_Mapper {
		return new V3_Style_Mapper(
			$css_converter,
			$active_breakpoints,
			new Css_Declaration_Parser(),
			$has_pro
		);
	}
}
