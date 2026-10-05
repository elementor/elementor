<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Registry extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	public function test_is_supported__true_when_map_compiles_and_atomic_active() {
		// Arrange.
		$registry = $this->registry( true );

		// Act.
		$is_supported = $registry->is_supported( self::WIDGET_TYPE );

		// Assert.
		$this->assertTrue( $is_supported );
	}

	public function test_is_supported__false_when_atomic_inactive() {
		// Arrange.
		$registry = $this->registry( false );

		// Act.
		$is_supported = $registry->is_supported( self::WIDGET_TYPE );

		// Assert.
		$this->assertFalse( $is_supported );
	}

	public function test_is_supported__false_without_registered_map() {
		// Arrange.
		$registry = $this->registry( true, [] );

		// Act.
		$is_supported = $registry->is_supported( self::WIDGET_TYPE );

		// Assert.
		$this->assertFalse( $is_supported );
	}

	public function test_is_supported__false_when_map_does_not_compile() {
		// Arrange.
		$registry = $this->registry( true, null, [] );

		// Act.
		$is_supported = $registry->is_supported( self::WIDGET_TYPE );

		// Assert.
		$this->assertFalse( $is_supported );
	}

	private function registry( bool $is_atomic_active, ?array $maps = null, ?array $controls = null ): V3_Widget_Map_Registry {
		$maps = $maps ?? [ self::WIDGET_TYPE => $this->map() ];
		$controls = $controls ?? [ 'color_menu_item' => [ 'type' => 'color' ] ];

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $is_atomic_active,
			static fn() => $controls,
			$maps
		);
	}

	private function map(): array {
		return [
			'widget_type' => self::WIDGET_TYPE,
			'description' => 'Navigation menu.',
			'settings' => [],
			'default_style_target' => 'main-menu',
			'style_targets' => [
				'main-menu' => Style_Target::make( 'Main menu items' )->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) ),
			],
		];
	}
}
