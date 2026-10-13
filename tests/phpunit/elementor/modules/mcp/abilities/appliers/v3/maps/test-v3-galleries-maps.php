<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Galleries_Maps extends TestCase {

	/**
	 * @dataProvider widget_provider
	 */
	public function test_get_map__compiles_without_diagnostics( string $type, string $fixture, string $map_path ) {
		$controls = require $fixture;
		$registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( $this->style_schema() ),
			static fn() => true,
			static fn() => $controls,
			[ $type => require $map_path ],
			static fn() => false
		);

		V3_Widget_Map_Registry::set_instance( $registry );

		$map = $registry->get_map( $type );

		$this->assertNotNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( $type ) );
		$this->assertNotEmpty( $map->get_settings() );

		V3_Widget_Map_Registry::reset_instance();
	}

	private function style_schema(): array {
		return [
			'color' => Color_Prop_Type::make(),
			'background' => Color_Prop_Type::make(),
			'border-radius' => Union_Prop_Type::make()
				->add_prop_type( Dimensions_Prop_Type::make() )
				->add_prop_type( Size_Prop_Type::make() ),
			'gap' => Size_Prop_Type::make(),
			'font-size' => Size_Prop_Type::make(),
		];
	}

	public function widget_provider(): array {
		$root = dirname( __DIR__, 9 );
		$fixture_root = dirname( __DIR__, 4 ) . '/fixtures';
		$map_root = $root . '/modules/mcp/abilities/appliers/v3/maps';

		return [
			'image-gallery' => [ 'image-gallery', $fixture_root . '/image-gallery-controls.php', $map_root . '/image-gallery-map.php' ],
			'image-carousel' => [ 'image-carousel', $fixture_root . '/image-carousel-controls.php', $map_root . '/image-carousel-map.php' ],
		];
	}
}
