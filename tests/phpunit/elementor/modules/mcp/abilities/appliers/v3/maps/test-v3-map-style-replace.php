<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Style_Replace extends Elementor_Test_Base {

	const WIDGET_TYPE = 'heading';

	const CONFIG_ID = 'Tracker';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const HORIZONTAL = 'horizontal';

	const CIRCULAR = 'circular';

	const SIZE = [
		'unit' => 'px',
		'size' => 40,
	];

	public function setUp(): void {
		parent::setUp();

		$controls = $this->controls();
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Tracker.' )
			->default_target(
				Style_Target::make( 'circle' )
					->bind( 'width', V3_Control::bind_to( 'circular_size' ) )
					->bind( 'color', V3_Control::bind_to( 'circular_color' ) )
			)
			->targets(
				Style_Target::make( 'track' )
					->bind( 'height', V3_Control::bind_to( 'horizontal_height' ) )
			);

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $map ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_replace__keeps_a_bound_setting_hidden_by_its_condition() {
		// Arrange.
		$node = $this->node( [
			'type' => self::CIRCULAR,
			'horizontal_height' => self::SIZE,
		] );

		// Act.
		$this->replace( $node, 'width: 40px;' );

		// Assert.
		$this->assertSame( self::SIZE, $node['settings']['horizontal_height'] );
	}

	public function test_replace__clears_a_visible_bound_setting_missing_from_the_new_css() {
		// Arrange.
		$node = $this->node( [
			'type' => self::CIRCULAR,
			'circular_color' => '#ff0000',
		] );

		// Act.
		$this->replace( $node, 'width: 40px;' );

		// Assert.
		$this->assertArrayNotHasKey( 'circular_color', $node['settings'] );
		$this->assertSame( self::SIZE, $node['settings']['circular_size'] );
	}

	public function test_replace__keeps_a_style_setting_the_map_does_not_bind() {
		// Arrange.
		$node = $this->node( [
			'type' => self::CIRCULAR,
			'title_color' => '#00ff00',
		] );

		// Act.
		$this->replace( $node, 'width: 40px;' );

		// Assert.
		$this->assertSame( '#00ff00', $node['settings']['title_color'] );
	}

	public function test_replace__drops_the_global_link_of_a_cleared_setting() {
		// Arrange.
		$node = $this->node( [
			'type' => self::CIRCULAR,
			'__globals__' => [
				'circular_color' => 'globals/colors?id=primary',
				'title_color' => 'globals/colors?id=secondary',
			],
		] );

		// Act.
		$this->replace( $node, 'width: 40px;' );

		// Assert.
		$this->assertSame( [ 'title_color' => 'globals/colors?id=secondary' ], $node['settings']['__globals__'] );
	}

	private function controls(): array {
		return [
			'type' => [
				'type' => 'select',
				'default' => self::HORIZONTAL,
				'options' => [
					self::HORIZONTAL => 'Horizontal',
					self::CIRCULAR => 'Circular',
				],
			],
			'horizontal_height' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
				'condition' => [ 'type' => self::HORIZONTAL ],
				'selectors' => [ '{{WRAPPER}} .track' => 'height: {{SIZE}}{{UNIT}};' ],
			],
			'circular_size' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
				'condition' => [ 'type' => self::CIRCULAR ],
				'selectors' => [ '{{WRAPPER}} .circle' => 'width: {{SIZE}}{{UNIT}};' ],
			],
			'circular_color' => [
				'type' => 'color',
				'condition' => [ 'type' => self::CIRCULAR ],
				'selectors' => [ '{{WRAPPER}} .circle' => 'color: {{VALUE}};' ],
			],
			'title_color' => [
				'type' => 'color',
				'selectors' => [ '{{WRAPPER}} .title' => 'background-color: {{VALUE}};' ],
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

	private function replace( array &$node, string $css ): void {
		$index = [ self::CONFIG_ID => &$node ];
		$applier = new Style_Applier( $this->converter(), self::BREAKPOINTS );

		$applier->apply( $index, [ self::CONFIG_ID => $css ], 'replace', [ self::WIDGET_TYPE => [ 'controls' => $this->controls() ] ] );
	}

	private function converter(): Css_Converter {
		return new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );
	}
}
