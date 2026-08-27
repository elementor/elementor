<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Converter_Registry_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Unmapped_Css_Serializer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Wires the default collaborators of {@see V3_Style_Mapper} so production callers
 * do not have to know about the internal converter/serializer/resolver graph.
 */
class V3_Style_Mapper_Factory {

	public static function create( Css_Converter $css_converter, array $active_breakpoints = [] ): V3_Style_Mapper {
		return new V3_Style_Mapper(
			$css_converter,
			$active_breakpoints,
			V3_Converter_Registry_Factory::create(),
			new Css_Declaration_Parser(),
			new Unmapped_Css_Serializer(),
			new Responsive_Key_Resolver()
		);
	}
}
