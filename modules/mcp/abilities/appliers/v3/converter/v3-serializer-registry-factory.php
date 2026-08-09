<?php

namespace Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Border_Shorthand_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Box_Shadow_Prefix_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Simple_Setting_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Serializer\Serializers\Typography_Group_Serializer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the ordered {@see V3_Serializer_Registry}. Each concrete serializer targets
 * exactly one override shape, mirroring the converter registry.
 */
class V3_Serializer_Registry_Factory {

	public static function create(): V3_Serializer_Registry {
		return ( new V3_Serializer_Registry() )
			->register( new Typography_Group_Serializer() )
			->register( new Border_Shorthand_Serializer() )
			->register( new Box_Shadow_Prefix_Serializer() )
			->register( new Simple_Setting_Serializer() );
	}
}
