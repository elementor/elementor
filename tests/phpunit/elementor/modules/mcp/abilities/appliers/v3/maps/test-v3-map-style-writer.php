<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Adapters\V3_Control_Adapter_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Converter\V3_Conversion_Context;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Mapper\Css_Declaration_Parser;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Box_Shadow_Group;
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

	const FONT_WEIGHT_OPTIONS = [
		'400' => '400',
		'700' => '700',
	];

	private function controls(): array {
		return [
			'title_color' => [ 'type' => 'color' ],
			'title_hover_color' => [ 'type' => 'color' ],
			'typography_typography' => [ 'type' => 'popover_toggle' ],
			'typography_font_size' => [
				'type' => 'slider',
				'is_responsive' => true,
			],
			'padding_horizontal' => [ 'type' => 'slider' ],
			'padding_vertical' => [ 'type' => 'slider' ],
			'title_font_weight' => [
				'type' => 'select',
				'options' => self::FONT_WEIGHT_OPTIONS,
			],
			'shadow_box_shadow_type' => [
				'type' => 'popover_toggle',
				'return_value' => 'yes',
			],
			'shadow_box_shadow' => [
				'type' => 'box_shadow',
				'condition' => [ 'shadow_box_shadow_type!' => '' ],
			],
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
					->bind( 'font-weight', V3_Control::bind_to( 'title_font_weight' ) )
					->with( Box_Shadow_Group::from_prefix( 'shadow' ) )
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

	private array $fallbacks = [];

	private function write( string $css, string $breakpoint = self::DESKTOP, ?string $state = null ): V3_Conversion_Context {
		return $this->write_bindings( $this->bindings(), $css, $breakpoint, $state );
	}

	private function write_bindings( array $bindings, string $css, string $breakpoint = self::DESKTOP, ?string $state = null ): V3_Conversion_Context {
		$writer = new V3_Map_Style_Writer(
			new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) ),
			V3_Control_Adapter_Registry::create_default(),
			new Css_Declaration_Parser()
		);
		$ctx = new V3_Conversion_Context();

		$this->fallbacks = $writer->write( $ctx, $bindings, $this->controls(), $breakpoint, $state, $css );

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

	public function test_write__returns_sides_sharing_one_slider_as_fallback_when_they_differ() {
		// Act.
		$ctx = $this->write( 'padding-left: 10px; padding-right: 30px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [ 'padding-left', 'padding-right' ], array_column( $this->fallbacks, 'property' ) );
		$this->assertSame( [], $ctx->warnings() );
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

	public function test_write__returns_breakpoint_value_of_non_responsive_control_as_fallback() {
		// Act.
		$ctx = $this->write( 'color: red;', self::TABLET );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
		$this->assertSame( [
			[
				'property' => 'color',
				'value' => 'red',
				'reason' => 'CSS property color has no per-device value in this Elementor widget at @media(--tablet).',
			],
		], $this->fallbacks );
	}

	public function test_write__returns_property_without_binding_as_fallback() {
		// Act.
		$ctx = $this->write( 'letter-spacing: 2px; color: #111;' );

		// Assert.
		$this->assertSame( [ 'title_color' => '#111' ], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
		$this->assertSame( [
			[
				'property' => 'letter-spacing',
				'value' => '2px',
				'reason' => 'CSS property letter-spacing is not supported by this Elementor widget.',
			],
		], $this->fallbacks );
	}

	public function test_write__returns_unstorable_value_as_fallback_with_the_allowed_values() {
		// Act.
		$ctx = $this->write( 'font-weight: 650;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
		$this->assertSame( [
			[
				'property' => 'font-weight',
				'value' => '650',
				'reason' => 'CSS property font-weight has a value this Elementor widget cannot store. Allowed values: 400, 700.',
			],
		], $this->fallbacks );
	}

	public function test_write__names_the_states_a_state_only_property_is_bound_in() {
		// Arrange.
		$bindings = $this->hover_only_bindings();

		// Act.
		$ctx = $this->write_bindings( $bindings, 'color: #111;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [], $this->fallbacks );
		$this->assertSame(
			[ 'CSS property color is only supported in the :hover state of this style target. Move it into a `<target>:hover { }` block.' ],
			$ctx->warnings()
		);
	}

	public function test_write__turns_the_box_shadow_toggle_off_for_box_shadow_none() {
		// Act.
		$ctx = $this->write( 'box-shadow: none;' );

		// Assert.
		$this->assertSame( [ 'shadow_box_shadow_type' => '' ], $ctx->settings_patch() );
		$this->assertSame( [], $this->fallbacks );
		$this->assertSame( [], $ctx->warnings() );
	}

	public function test_write__stores_a_box_shadow_with_its_toggle_on() {
		// Act.
		$ctx = $this->write( 'box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);' );

		// Assert.
		$this->assertSame( 'yes', $ctx->settings_patch()['shadow_box_shadow_type'] ?? null );
		$this->assertSame( [], $this->fallbacks );
	}

	public function test_write__returns_css_the_converter_cannot_read_as_fallback() {
		// Act.
		$ctx = $this->write( 'padding-inline: 12px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertSame( [], $ctx->warnings() );
		$this->assertSame( [
			[
				'property' => 'padding-inline',
				'value' => '12px',
				'reason' => 'CSS property padding-inline is not supported by this Elementor widget.',
			],
		], $this->fallbacks );
	}
}
