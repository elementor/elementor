<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Style_Target_Routing extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	public function setUp(): void {
		parent::setUp();

		$controls = $this->controls();

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $this->map() ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_apply__routes_same_property_to_each_target() {
		// Act.
		$result = $this->apply( 'color: #111111; dropdown { color: #222222; }' );

		// Assert.
		$this->assertSame(
			[
				'color_menu_item' => '#111111',
				'color_dropdown_item' => '#222222',
			],
			$result['settings_patch']
		);
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__routes_target_states_including_selected() {
		// Act.
		$result = $this->apply( 'main-menu:hover { color: #333333; } &:selected { color: #444444; } dropdown:hover { color: #555555; }' );

		// Assert.
		$this->assertSame(
			[
				'color_menu_item_hover' => '#333333',
				'color_menu_item_active' => '#444444',
				'color_dropdown_item_hover' => '#555555',
			],
			$result['settings_patch']
		);
	}

	public function test_apply__routes_target_blocks_inside_breakpoints() {
		// Act.
		$result = $this->apply( '@media(--mobile) { dropdown { padding: 4px; } }' );

		// Assert.
		$this->assertSame( '4', $result['settings_patch']['padding_dropdown_mobile']['top'] );
	}

	public function test_apply__drops_unknown_target_and_keeps_siblings() {
		// Act.
		$result = $this->apply( 'footer { color: red; } dropdown { color: #222222; }' );

		// Assert.
		$this->assertSame( [ 'color_dropdown_item' => '#222222' ], $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'footer', $result['warnings'][0] );
	}

	public function test_apply__drops_unknown_state() {
		// Act.
		$result = $this->apply( 'main-menu:visited { color: red; }' );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertStringContainsString( 'main-menu:visited', $result['warnings'][0] );
	}

	public function test_apply__drops_unknown_breakpoint_block_only() {
		// Act.
		$result = $this->apply( 'color: #111111; @media(--watch) { color: red; }' );

		// Assert.
		$this->assertSame( [ 'color_menu_item' => '#111111' ], $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( '--watch', $result['warnings'][0] );
	}

	public function test_apply__warns_with_target_for_unmapped_property() {
		// Act.
		$result = $this->apply( 'dropdown { filter: blur(2px); }' );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertStringContainsString( 'filter', $result['warnings'][0] );
		$this->assertStringContainsString( 'dropdown', $result['warnings'][0] );
	}

	public function test_serialize__renders_targets_states_and_breakpoints() {
		// Arrange.
		$settings = [
			'color_menu_item' => '#111111',
			'color_menu_item_active' => '#444444',
			'color_dropdown_item' => '#222222',
			'color_dropdown_item_hover' => '#555555',
			'padding_dropdown_mobile' => $this->sides( '4' ),
		];

		// Act.
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame(
			'color: #111111; &:selected { color: #444444; } dropdown { color: #222222; } dropdown:hover { color: #555555; } @media(--mobile) { dropdown { padding: 4px; } }',
			$css
		);
	}

	public function test_round_trip__serialized_css_maps_back_to_same_settings() {
		// Arrange.
		$settings = [
			'color_menu_item' => '#111111',
			'color_menu_item_hover' => '#333333',
			'color_dropdown_item' => '#222222',
			'padding_dropdown_mobile' => $this->sides( '4' ),
		];
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Act.
		$result = $this->apply( $css );

		// Assert.
		$this->assertEquals( $settings, $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	private function apply( string $css ): array {
		return $this->mapper()->apply( $css, self::WIDGET_TYPE, [] );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function map(): array {
		return [
			'widget_type' => self::WIDGET_TYPE,
			'description' => 'Navigation menu.',
			'settings' => [],
			'default_style_target' => 'main-menu',
			'style_targets' => [
				'main-menu' => [
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'color_menu_item', 'color' ),
							'hover' => Style_Control_Target::control( 'color_menu_item_hover', 'color' ),
							'selected' => Style_Control_Target::control( 'color_menu_item_active', 'color' ),
						],
					],
				],
				'dropdown' => [
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'color_dropdown_item', 'color' ),
							'hover' => Style_Control_Target::control( 'color_dropdown_item_hover', 'color' ),
						],
						'padding' => [ 'default' => Style_Control_Target::control( 'padding_dropdown', 'sides', true ) ],
					],
				],
			],
		];
	}

	private function controls(): array {
		return [
			'color_menu_item' => [ 'type' => 'color' ],
			'color_menu_item_hover' => [ 'type' => 'color' ],
			'color_menu_item_active' => [ 'type' => 'color' ],
			'color_dropdown_item' => [ 'type' => 'color' ],
			'color_dropdown_item_hover' => [ 'type' => 'color' ],
			'padding_dropdown' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			],
		];
	}

	private function sides( string $size ): array {
		return [
			'top' => $size,
			'right' => $size,
			'bottom' => $size,
			'left' => $size,
			'unit' => 'px',
			'isLinked' => true,
		];
	}
}
