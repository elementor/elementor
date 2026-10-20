<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Border_Group;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Border_Style_Default extends Elementor_Test_Base {

	const WIDGET_TYPE = 'heading';

	const CONFIG_ID = 'Card';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const STYLE_SETTING = 'frame_border';

	const WIDTH_SETTING = 'frame_width';

	const SOLID = 'solid';

	const DASHED = 'dashed';

	const NONE = 'none';

	public function setUp(): void {
		parent::setUp();

		$controls = $this->controls();
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Card.' )
			->default_target(
				Style_Target::make( 'card' )->with( Border_Group::from_prefix( 'frame' ) )
			);

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => $controls,
			[ self::WIDGET_TYPE => $map ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_patch__keeps_a_saved_border_style_when_only_the_width_is_written() {
		// Arrange.
		$node = $this->node( [ self::STYLE_SETTING => self::DASHED ] );

		// Act.
		$this->apply( $node, 'border-width: 3px;', 'patch' );

		// Assert.
		$this->assertSame( self::DASHED, $node['settings'][ self::STYLE_SETTING ] );
		$this->assertArrayHasKey( self::WIDTH_SETTING, $node['settings'] );
	}

	public function test_patch__keeps_a_saved_border_style_when_only_the_color_is_written() {
		// Arrange.
		$node = $this->node( [ self::STYLE_SETTING => self::DASHED ] );

		// Act.
		$this->apply( $node, 'border-color: #ff0000;', 'patch' );

		// Assert.
		$this->assertSame( self::DASHED, $node['settings'][ self::STYLE_SETTING ] );
	}

	public function test_patch__defaults_the_border_style_to_solid_without_a_saved_style() {
		// Arrange.
		$node = $this->node( [] );

		// Act.
		$this->apply( $node, 'border-width: 3px;', 'patch' );

		// Assert.
		$this->assertSame( self::SOLID, $node['settings'][ self::STYLE_SETTING ] );
	}

	public function test_patch__defaults_the_border_style_to_solid_over_a_saved_none() {
		// Arrange.
		$node = $this->node( [ self::STYLE_SETTING => self::NONE ] );

		// Act.
		$this->apply( $node, 'border-width: 3px;', 'patch' );

		// Assert.
		$this->assertSame( self::SOLID, $node['settings'][ self::STYLE_SETTING ] );
	}

	public function test_patch__a_written_border_style_wins_over_the_default_in_any_order() {
		// Arrange.
		$node = $this->node( [] );

		// Act.
		$this->apply( $node, 'border-style: dashed; border-width: 3px;', 'patch' );

		// Assert.
		$this->assertSame( self::DASHED, $node['settings'][ self::STYLE_SETTING ] );
	}

	public function test_patch__a_written_solid_border_style_replaces_a_saved_one() {
		// Arrange.
		$node = $this->node( [ self::STYLE_SETTING => self::DASHED ] );

		// Act.
		$this->apply( $node, 'border-style: solid; border-width: 3px;', 'patch' );

		// Assert.
		$this->assertSame( self::SOLID, $node['settings'][ self::STYLE_SETTING ] );
	}

	public function test_replace__defaults_the_border_style_to_solid_over_a_cleared_saved_style() {
		// Arrange.
		$node = $this->node( [ self::STYLE_SETTING => self::DASHED ] );

		// Act.
		$this->apply( $node, 'border-width: 3px;', 'replace' );

		// Assert.
		$this->assertSame( self::SOLID, $node['settings'][ self::STYLE_SETTING ] );
	}

	private function controls(): array {
		return [
			self::STYLE_SETTING => [
				'type' => 'select',
				'options' => [
					'' => 'Default',
					self::NONE => 'None',
					self::SOLID => 'Solid',
					self::DASHED => 'Dashed',
				],
				'selectors' => [ '{{WRAPPER}} .card' => 'border-style: {{VALUE}};' ],
			],
			self::WIDTH_SETTING => [
				'type' => 'dimensions',
				'is_responsive' => true,
				'size_units' => [ 'px' ],
				'condition' => [ self::STYLE_SETTING . '!' => [ '', self::NONE ] ],
				'selectors' => [ '{{WRAPPER}} .card' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};' ],
			],
			'frame_color' => [
				'type' => 'color',
				'condition' => [ self::STYLE_SETTING . '!' => [ '', self::NONE ] ],
				'selectors' => [ '{{WRAPPER}} .card' => 'border-color: {{VALUE}};' ],
			],
		];
	}

	private function node( array $settings ): array {
		return [
			'id' => 'elem-1',
			'elType' => 'widget',
			'widgetType' => self::WIDGET_TYPE,
			'settings' => $settings,
			'styles' => [],
		];
	}

	private function apply( array &$node, string $css, string $mode ): void {
		$index = [ self::CONFIG_ID => &$node ];
		$applier = new Style_Applier( $this->converter(), self::BREAKPOINTS );

		$applier->apply( $index, [ self::CONFIG_ID => $css ], $mode );
	}

	private function converter(): Css_Converter {
		return new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );
	}
}
