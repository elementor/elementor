<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Border_Shorthand_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Box_Shadow_Prefix_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Generic_Index_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Simple_Setting_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\Converters\Typography_Group_Converter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Responsive_Key_Resolver;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the ordered {@see V3_Converter_Registry}. Order matters: more specific
 * shapes are registered before the generic-index fallback.
 *
 * Mirror of {@see \Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory}.
 */
class V3_Converter_Registry_Factory {

	public static function create(): V3_Converter_Registry {
		$responsive_resolver = new Responsive_Key_Resolver();

		return ( new V3_Converter_Registry() )
			->register( new Typography_Group_Converter() )
			->register( new Border_Shorthand_Converter() )
			->register( new Box_Shadow_Prefix_Converter() )
			->register( new Simple_Setting_Converter( $responsive_resolver ) )
			->register( new Generic_Index_Converter() );
	}
}
