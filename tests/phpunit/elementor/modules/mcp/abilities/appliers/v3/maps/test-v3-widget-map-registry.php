<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PropTypes\Color_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Advanced_Wrapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Registry extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	const CONTROLS = [ 'color_menu_item' => [ 'type' => 'color' ] ];

	public function test_get_map__returns_compiled_map_when_experiment_and_atomic_active() {
		// Arrange.
		$registry = $this->registry();

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertInstanceOf( Compiled_V3_Map::class, $map );
		$this->assertTrue( $registry->is_supported( self::WIDGET_TYPE ) );
	}

	public function test_get_map__null_when_experiment_inactive() {
		// Arrange.
		$registry = $this->registry( [ 'is_experiment_active' => false ] );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNull( $map );
	}

	public function test_get_map__null_when_atomic_inactive() {
		// Arrange.
		$registry = $this->registry( [ 'is_atomic_active' => false ] );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNull( $map );
		$this->assertFalse( $registry->is_supported( self::WIDGET_TYPE ) );
	}

	public function test_get_map__null_without_registered_map() {
		// Arrange.
		$registry = $this->registry( [ 'maps' => [] ] );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNull( $map );
		$this->assertFalse( $registry->is_supported( self::WIDGET_TYPE ) );
	}

	public function test_get_map__null_when_widget_is_not_registered() {
		// Arrange.
		$registry = $this->registry( [ 'controls' => null ] );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertNull( $map );
		$this->assertSame( [], $registry->get_diagnostics( self::WIDGET_TYPE ) );
	}

	public function test_get_map__keeps_map_and_records_diagnostic_when_control_is_missing() {
		// Arrange.
		$registry = $this->registry( [ 'controls' => [] ] );

		// Act.
		$map = $registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertInstanceOf( Compiled_V3_Map::class, $map );
		$this->assertSame( [], $map->get_style_bindings() );
		$this->assertSame(
			[
				[
					'widget_type' => self::WIDGET_TYPE,
					'entry' => 'main-menu.color',
					'reason' => 'missing_control',
					'detail' => 'color_menu_item',
				],
			],
			$registry->get_diagnostics( self::WIDGET_TYPE )
		);
	}

	public function test_get_map__compiles_once() {
		// Arrange.
		$calls = 0;
		$registry = $this->registry( [
			'get_controls' => static function () use ( &$calls ) {
				++$calls;

				return self::CONTROLS;
			},
		] );

		// Act.
		$registry->get_map( self::WIDGET_TYPE );
		$registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertSame( 1, $calls );
		$this->assertCount( 0, $registry->get_diagnostics( self::WIDGET_TYPE ) );
	}

	public function test_get_llm_contract__returns_description_properties_and_targets() {
		// Arrange.
		$registry = $this->registry( [
			'maps' => [ self::WIDGET_TYPE => $this->map()->default_target( $this->main_menu()->bind( 'color', V3_Control::bind_to( 'color_menu_item_current' ), 'current' ) ) ],
			'controls' => self::CONTROLS + [ 'color_menu_item_current' => [ 'type' => 'color' ] ],
		] );

		// Act.
		$contract = $registry->get_llm_contract( self::WIDGET_TYPE );

		// Assert.
		$this->assertSame( 'Navigation menu.', $contract['description'] );
		$this->assertSame( [], $contract['properties'] );
		$this->assertSame( 'main-menu', $contract['default_style_target'] );
		$this->assertSame(
			[
				'main-menu' => [
					'label' => 'Main menu items',
					'states' => [ 'default', 'current' ],
					'properties' => [ 'color' ],
				],
			],
			$contract['style_targets']
		);
	}

	public function test_get_map__appends_advanced_wrapper_target_for_widgets_with_an_advanced_tab() {
		// Arrange.
		$registry = $this->registry( [
			'has_advanced_tab' => static fn() => true,
			'controls' => self::CONTROLS + [ '_margin' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			] ],
		] );

		// Act.
		$targets = $registry->get_map( self::WIDGET_TYPE )->get_targets();

		// Assert.
		$this->assertSame( [ 'main-menu', Advanced_Wrapper::ALIAS ], array_keys( $targets ) );
		$this->assertSame( [ 'margin' ], $targets[ Advanced_Wrapper::ALIAS ]->get_props() );
	}

	public function test_get_map__omits_advanced_wrapper_target_without_an_advanced_tab() {
		// Arrange.
		$registry = $this->registry( [ 'has_advanced_tab' => static fn() => false ] );

		// Act.
		$targets = $registry->get_map( self::WIDGET_TYPE )->get_targets();

		// Assert.
		$this->assertSame( [ 'main-menu' ], array_keys( $targets ) );
	}

	private function registry( array $overrides = [] ): V3_Widget_Map_Registry {
		$options = array_merge( [
			'is_experiment_active' => true,
			'is_atomic_active' => true,
			'maps' => [ self::WIDGET_TYPE => $this->map() ],
			'controls' => self::CONTROLS,
		], $overrides );
		$controls = $options['controls'];

		return new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler( [
				'color' => Color_Prop_Type::make(),
				'margin' => Dimensions_Prop_Type::make(),
			] ),
			static fn() => $options['is_experiment_active'],
			static fn() => $options['is_atomic_active'],
			$options['get_controls'] ?? static fn() => $controls,
			$options['maps'],
			$options['has_advanced_tab'] ?? null
		);
	}

	private function map(): V3_Widget_Map {
		return V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Navigation menu.' )
			->default_target( $this->main_menu() );
	}

	private function main_menu(): Style_Target {
		return Style_Target::make( 'main-menu' )
			->label( 'Main menu items' )
			->states( 'current' )
			->bind( 'color', V3_Control::bind_to( 'color_menu_item' ) );
	}
}
