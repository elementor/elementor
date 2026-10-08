<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Diagnostics;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Style_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Style_Writer extends TestCase {

	const DESKTOP = 'desktop';
	const TABLET = 'tablet';
	const HOVER = 'hover';

	const TABLET_MAX_WIDTH = 1024;

	private function controls(): array {
		return [
			'title_color' => [
				'type' => 'color',
				'selectors' => [ '{{WRAPPER}} .elementor-heading-title' => 'color: {{VALUE}};' ],
			],
			'title_hover_color' => [
				'type' => 'color',
				'selectors' => [ '{{WRAPPER}} .elementor-heading-title:hover, {{WRAPPER}} .elementor-heading-title:focus' => 'color: {{VALUE}};' ],
			],
			'typography_typography' => [ 'type' => 'popover_toggle' ],
			'typography_font_size' => [
				'type' => 'slider',
				'is_responsive' => true,
			],
			'padding_horizontal' => [ 'type' => 'slider' ],
			'padding_vertical' => [ 'type' => 'slider' ],
		];
	}

	private function bindings(): array {
		$map = V3_Widget_Map::make( 'heading' )
			->description( 'Heading widget.' )
			->default_target(
				Style_Target::make( 'heading' )
					->bind( 'color', V3_Control::bind_to( 'title_color' ) )
					->bind( 'color', V3_Control::bind_to( 'title_hover_color' ), self::HOVER )
					->bind( 'font-size', V3_Control::bind_to( 'typography_font_size' )->responsive()->requires( [ 'typography_typography' => 'custom' ] ) )
					->bind( 'padding', V3_Control::bind_to( 'padding_horizontal' )->sides( 'inline-start', 'inline-end' ) )
					->bind( 'padding', V3_Control::bind_to( 'padding_vertical' )->sides( 'block-start', 'block-end' ) )
			);

		return ( new V3_Widget_Map_Compiler() )
			->compile( $map, $this->controls(), new V3_Map_Diagnostics(), 'heading' )
			->get_style_bindings();
	}

	private function hover_only_bindings(): array {
		$map = V3_Widget_Map::make( 'pointer-widget' )
			->description( 'Widget with a hover-only pointer.' )
			->default_target(
				Style_Target::make( 'pointer' )
					->bind( 'color', V3_Control::bind_to( 'title_hover_color' ), self::HOVER )
			);

		return ( new V3_Widget_Map_Compiler() )
			->compile( $map, $this->controls(), new V3_Map_Diagnostics(), 'pointer-widget' )
			->get_style_bindings();
	}

	private function write( string $css, string $breakpoint = self::DESKTOP, ?string $state = null ): V3_Conversion_Context {
		return $this->write_bindings( $this->bindings(), $css, $breakpoint, $state );
	}

	private function write_bindings( array $bindings, string $css, string $breakpoint = self::DESKTOP, ?string $state = null ): V3_Conversion_Context {
		$writer = new V3_Map_Style_Writer(
			new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) ),
			V3_Control_Adapter_Registry::create_default(),
			new Css_Declaration_Parser(),
			[
				self::TABLET => [
					'direction' => 'max',
					'value' => self::TABLET_MAX_WIDTH,
					'is_enabled' => true,
				],
			]
		);
		$ctx = new V3_Conversion_Context();

		$writer->write( $ctx, $bindings, $this->controls(), $breakpoint, $state, $css );

		return $ctx;
	}

	public function test_write__fills_eq_dependency_of_typography_field() {
		// Act.
		$ctx = $this->write( 'font-size: 18px;' );

		// Assert.
		$this->assertSame( [
			'typography_font_size' => [
				'unit' => 'px',
				'size' => 18,
			],
			'typography_typography' => 'custom',
		], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
	}

	public function test_write__splits_padding_shorthand_across_side_bindings() {
		// Act.
		$ctx = $this->write( 'padding: 10px 20px;' );

		// Assert.
		$this->assertSame( [
			'padding_horizontal' => [
				'unit' => 'px',
				'size' => 20,
			],
			'padding_vertical' => [
				'unit' => 'px',
				'size' => 10,
			],
		], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
	}

	public function test_write__warns_when_sides_sharing_one_slider_differ() {
		// Act.
		$ctx = $this->write( 'padding-left: 10px; padding-right: 30px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertCount( 1, $ctx->warnings() );
		$this->assertStringContainsString( 'padding', $ctx->warnings()[0] );
	}

	public function test_write__routes_hover_state_to_hover_control() {
		// Act.
		$ctx = $this->write( 'color: #c00;', self::DESKTOP, self::HOVER );

		// Assert.
		$this->assertSame( [ 'title_hover_color' => '#c00' ], $ctx->settings_patch() );
	}

	public function test_write__suffixes_responsive_control_for_breakpoint() {
		// Act.
		$ctx = $this->write( 'font-size: 14px;', self::TABLET );

		// Assert.
		$this->assertSame( [
			'typography_font_size_tablet' => [
				'unit' => 'px',
				'size' => 14,
			],
			'typography_typography' => 'custom',
		], $ctx->settings_patch() );
	}

	public function test_write__falls_back_to_custom_css_for_breakpoint_value_of_non_responsive_control() {
		// Act.
		$ctx = $this->write( 'color: red; font-size: 14px;', self::TABLET );

		// Assert.
		$this->assertSame( [ '@media (max-width:1024px) { selector .elementor-heading-title { color: red; } }' ], $ctx->unmapped_parts() );
		$this->assertSame( [ 'typography_font_size_tablet', 'typography_typography' ], array_keys( $ctx->settings_patch() ) );
		$this->assertSame( [], $ctx->warnings() );
	}

	public function test_write__falls_back_to_the_state_control_selector() {
		// Act.
		$ctx = $this->write( 'color: #c00;', self::TABLET, self::HOVER );

		// Assert.
		$this->assertSame(
			[ '@media (max-width:1024px) { selector .elementor-heading-title:hover, selector .elementor-heading-title:focus { color: #c00; } }' ],
			$ctx->unmapped_parts()
		);
	}

	public function test_write__skips_breakpoint_value_with_warning_when_control_has_no_selector() {
		// Act.
		$ctx = $this->write( 'padding: 10px;', self::TABLET );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->unmapped_parts() );
		$this->assertCount( 1, $ctx->warnings() );
		$this->assertStringContainsString( '@media(--tablet)', $ctx->warnings()[0] );
	}

	public function test_write__warns_for_property_without_binding() {
		// Act.
		$ctx = $this->write( 'letter-spacing: 2px; color: #111;' );

		// Assert.
		$this->assertSame( [ 'title_color' => '#111' ], $ctx->settings_patch() );
		$this->assertCount( 1, $ctx->warnings() );
		$this->assertStringContainsString( 'letter-spacing', $ctx->warnings()[0] );
	}

	public function test_write__names_the_states_a_state_only_property_is_bound_in() {
		// Arrange.
		$bindings = $this->hover_only_bindings();

		// Act.
		$ctx = $this->write_bindings( $bindings, 'color: #111;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame(
			[ 'CSS property color is only supported in the :hover state of this style target. Move it into a `<target>:hover { }` block.' ],
			$ctx->warnings()
		);
	}

	public function test_write__warns_for_css_the_converter_cannot_read() {
		// Act.
		$ctx = $this->write( 'padding-inline: 12px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertCount( 1, $ctx->warnings() );
		$this->assertStringContainsString( 'padding-inline', $ctx->warnings()[0] );
	}
}
