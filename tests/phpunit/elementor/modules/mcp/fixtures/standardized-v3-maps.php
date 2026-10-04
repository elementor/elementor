<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Fixtures;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Standardized_V3_Maps_Fixture {

	const MAPS_DIR = __DIR__ . '/v3-maps';

	const WIDGET_TYPES = [ 'heading', 'button', 'text-editor' ];

	public static function install(): void {
		V3_Widget_Map_Registry::set_instance( V3_Widget_Map_Registry::create_default( self::load_maps() ) );
	}

	/**
	 * @return array<string, array<string, mixed>>
	 */
	public static function load_maps(): array {
		$maps = [];

		foreach ( self::WIDGET_TYPES as $widget_type ) {
			$maps[ $widget_type ] = require self::MAPS_DIR . '/' . $widget_type . '-map.php';
		}

		return $maps;
	}
}
