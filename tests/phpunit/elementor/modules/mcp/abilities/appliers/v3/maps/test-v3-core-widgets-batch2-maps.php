<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Core_Widgets_Batch2_Maps extends TestCase {

	/**
	 * @dataProvider widget_provider
	 */
	public function test_get_map__compiles_without_diagnostics( string $type, string $fixture, string $map_path ) {
		$controls = require $fixture;
		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $controls,
			[ $type => require $map_path ],
			static fn() => true
		);

		V3_Widget_Map_Registry::set_instance( $registry );

		$map = $registry->get_map( $type );

		$this->assertNotNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( $type ) );
		$this->assertNotEmpty( $map->get_settings() );

		V3_Widget_Map_Registry::reset_instance();
	}

	public function widget_provider(): array {
		$root = dirname( __DIR__, 9 );
		$fixture_root = dirname( __DIR__, 4 ) . '/fixtures';
		$map_root = $root . '/modules/mcp/abilities/appliers/v3/maps';

		return [
			'progress' => [ 'progress', $fixture_root . '/progress-controls.php', $map_root . '/progress-map.php' ],
			'social-icons' => [ 'social-icons', $fixture_root . '/social-icons-controls.php', $map_root . '/social-icons-map.php' ],
			'shortcode' => [ 'shortcode', $fixture_root . '/shortcode-controls.php', $map_root . '/shortcode-map.php' ],
		];
	}
}
