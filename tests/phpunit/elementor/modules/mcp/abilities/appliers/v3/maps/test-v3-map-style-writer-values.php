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

class Test_V3_Map_Style_Writer_Values extends TestCase {

	const DESKTOP = 'desktop';

	private array $fallbacks = [];

	private function controls(): array {
		return [
			'align' => [
				'type' => 'choose',
				'options' => [
					'start' => 'Start',
					'center' => 'Center',
					'end' => 'End',
				],
			],
			'caption_align' => [
				'type' => 'choose',
				'options' => [
					'left' => 'Left',
					'center' => 'Center',
					'right' => 'Right',
				],
			],
			'box_margin' => [
				'type' => 'dimensions',
				'size_units' => [ 'px', 'rem' ],
			],
			'image_spacing' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
			],
			'frame_width' => [
				'type' => 'slider',
				'size_units' => [ 'px' ],
			],
		];
	}

	private function write( string $alias, string $css ): V3_Conversion_Context {
		$map = V3_Widget_Map::make( 'values-widget' )
			->description( 'Values widget.' )
			->default_target(
				Style_Target::make( 'box' )
					->bind( 'text-align', V3_Control::bind_to( 'align' ) )
					->bind( 'margin', V3_Control::bind_to( 'box_margin' ) )
					->bind( 'border-width', V3_Control::bind_to( 'frame_width' )->sides( 'block-start', 'inline-end', 'block-end', 'inline-start' ) )
			)
			->targets(
				Style_Target::make( 'caption' )
					->bind( 'text-align', V3_Control::bind_to( 'caption_align' ) ),
				Style_Target::make( 'image' )
					->bind( 'margin', V3_Control::bind_to( 'image_spacing' )->sides( 'block-end' ) ),
				Style_Target::make( 'divider' )
					->bind( 'border-width', V3_Control::bind_to( 'frame_width' ) )
			);
		$compiled = ( new V3_Widget_Map_Compiler() )->compile( $map, $this->controls(), new V3_Map_Diagnostics(), 'values-widget' );
		$writer = new V3_Map_Style_Writer(
			new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) ),
			V3_Control_Adapter_Registry::create_default(),
			new Css_Declaration_Parser()
		);
		$ctx = new V3_Conversion_Context();

		$this->fallbacks = $writer->write( $ctx, $compiled->get_targets()[ $alias ]->get_bindings(), $this->controls(), self::DESKTOP, null, $css );

		return $ctx;
	}

	public function test_write__stores_physical_text_align_on_a_logical_control() {
		// Act.
		$left = $this->write( 'box', 'text-align: left;' );
		$right = $this->write( 'box', 'text-align: right;' );

		// Assert.
		$this->assertSame( [ 'align' => 'start' ], $left->settings_patch() );
		$this->assertSame( [ 'align' => 'end' ], $right->settings_patch() );
		$this->assertSame( [], $this->fallbacks );
	}

	public function test_write__stores_physical_text_align_on_a_physical_control() {
		// Act.
		$ctx = $this->write( 'caption', 'text-align: left;' );

		// Assert.
		$this->assertSame( [ 'caption_align' => 'left' ], $ctx->settings_patch() );
		$this->assertSame( [], $this->fallbacks );
	}

	public function test_write__gives_a_unitless_zero_side_the_unit_of_the_other_sides() {
		// Act.
		$ctx = $this->write( 'box', 'margin: 2rem 0;' );

		// Assert.
		$this->assertSame( [
			'box_margin' => [
				'top' => '2',
				'right' => '0',
				'bottom' => '2',
				'left' => '0',
				'unit' => 'rem',
				'isLinked' => false,
			],
		], $ctx->settings_patch() );
		$this->assertSame( [], $this->fallbacks );
	}

	public function test_write__says_a_shared_slider_needs_one_length_for_all_sides() {
		// Act.
		$ctx = $this->write( 'box', 'border-width: 2px 4px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertCount( 1, $this->fallbacks );
		$this->assertStringContainsString( 'one length for all sides', $this->fallbacks[0]['reason'] );
		$this->assertStringNotContainsString( 'Allowed units', $this->fallbacks[0]['reason'] );
	}

	public function test_write__says_a_single_length_slider_needs_a_single_value() {
		// Act.
		$ctx = $this->write( 'divider', 'border-width: 2px 4px;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertCount( 1, $this->fallbacks );
		$this->assertStringContainsString( 'use a single value', $this->fallbacks[0]['reason'] );
		$this->assertStringNotContainsString( 'Allowed units', $this->fallbacks[0]['reason'] );
	}

	public function test_write__keeps_the_allowed_units_for_a_single_length_in_a_missing_unit() {
		// Act.
		$ctx = $this->write( 'divider', 'border-width: 10%;' );

		// Assert.
		$this->assertSame( [], $ctx->settings_patch() );
		$this->assertCount( 1, $this->fallbacks );
		$this->assertStringContainsString( 'Allowed units: px.', $this->fallbacks[0]['reason'] );
	}

	public function test_border_style_defaults__defaults_the_group_style_to_solid_for_a_width() {
		// Arrange.
		$method = new \ReflectionMethod( V3_Map_Style_Writer::class, 'border_style_defaults' );
		$method->setAccessible( true );
		$controls = [
			'image_border_border' => [ 'type' => 'select' ],
			'image_border_width' => [ 'type' => 'dimensions' ],
		];
		$patch = [
			'image_border_width' => [
				'unit' => 'px',
				'top' => '2',
				'right' => '2',
				'bottom' => '2',
				'left' => '2',
				'isLinked' => true,
			],
		];

		// Act.
		$defaults = $method->invoke( null, $patch, $controls );

		// Assert.
		$this->assertSame( [ 'image_border_border' => 'solid' ], $defaults );
	}

	public function test_write__falls_back_on_sides_no_binding_stores() {
		// Act.
		$ctx = $this->write( 'image', 'margin: 0 0 16px 0;' );

		// Assert.
		$this->assertSame( [
			'image_spacing' => [
				'unit' => 'px',
				'size' => 16,
			],
		], $ctx->settings_patch() );
		$this->assertSame(
			[
				'margin-top' => '0px',
				'margin-right' => '0px',
				'margin-left' => '0px',
			],
			array_column( $this->fallbacks, 'value', 'property' )
		);
	}
}
