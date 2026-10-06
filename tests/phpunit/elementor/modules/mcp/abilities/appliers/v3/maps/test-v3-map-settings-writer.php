<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Boolean_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Passthrough_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Compiled_V3_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Diagnostics;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Reader;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Setting;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Map_Settings_Writer extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	private function controls(): array {
		return [
			'menu_name' => [ 'type' => 'text' ],
			'layout' => [
				'type' => 'select',
				'default' => 'horizontal',
				'options' => [
					'horizontal' => 'Horizontal',
					'vertical' => 'Vertical',
				],
			],
			'full_width' => [
				'type' => 'switcher',
				'return_value' => 'stretch',
			],
			'link' => [ 'type' => 'url' ],
			'icon' => [ 'type' => 'icons' ],
		];
	}

	private function compiled_map(): Compiled_V3_Map {
		$map = V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Nav menu.' )
			->settings( [
				'menu_name' => V3_Setting::bind_to( 'menu_name' )->string(),
				'layout' => V3_Setting::bind_to( 'layout' )->enum_from_control(),
				'full_width' => V3_Setting::bind_to( 'full_width' )->switcher(),
				'link' => V3_Setting::bind_to( 'link' )->link(),
				'icon' => V3_Setting::bind_to( 'icon' )->icons(),
			] )
			->default_target( Style_Target::make( 'menu' ) );

		return ( new V3_Widget_Map_Compiler( [] ) )
			->compile( $map, $this->controls(), new V3_Map_Diagnostics(), self::WIDGET_TYPE );
	}

	private function writer(): V3_Map_Settings_Writer {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Passthrough_Plain_Resolver() );
		$registry->register( Boolean_Prop_Type::get_key(), new Boolean_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );

		return new V3_Map_Settings_Writer( new Plain_Values_Resolver( $registry ) );
	}

	public function test_write__converts_plain_values_to_control_storage() {
		// Arrange.
		$plain = [
			'menu_name' => 'Main',
			'layout' => 'vertical',
			'full_width' => true,
			'link' => [
				'url' => 'https://example.com',
				'is_external' => true,
			],
			'icon' => [
				'value' => 'fas fa-bars',
				'library' => 'fa-solid',
			],
		];

		// Act.
		$result = $this->writer()->write( $this->compiled_map(), $plain );

		// Assert.
		$this->assertSame( [
			'menu_name' => 'Main',
			'layout' => 'vertical',
			'full_width' => 'stretch',
			'link' => [
				'url' => 'https://example.com',
				'is_external' => 'on',
				'nofollow' => '',
			],
			'icon' => [
				'value' => 'fas fa-bars',
				'library' => 'fa-solid',
			],
		], $result['settings'] );
		$this->assertSame( [], $result['rejected'] );
	}

	public function test_write__skips_values_outside_control_options_and_keeps_the_rest() {
		// Arrange.
		$plain = [
			'menu_name' => 'Main',
			'layout' => 'diagonal',
		];

		// Act.
		$result = $this->writer()->write( $this->compiled_map(), $plain );

		// Assert.
		$this->assertSame( [ 'menu_name' => 'Main' ], $result['settings'] );
		$this->assertSame( [ 'layout' ], array_keys( $result['rejected'] ) );
	}

	public function test_write__skips_values_that_cannot_be_resolved() {
		// Arrange.
		$plain = [ 'menu_name' => [ 'not', 'a', 'string' ] ];

		// Act.
		$result = $this->writer()->write( $this->compiled_map(), $plain );

		// Assert.
		$this->assertSame( [], $result['settings'] );
		$this->assertSame( [ 'menu_name' ], array_keys( $result['rejected'] ) );
	}

	public function test_write__passes_null_through_as_a_clear() {
		// Arrange.
		$plain = [ 'layout' => null ];

		// Act.
		$result = $this->writer()->write( $this->compiled_map(), $plain );

		// Assert.
		$this->assertSame( [ 'layout' => null ], $result['settings'] );
		$this->assertSame( [], $result['rejected'] );
	}

	public function test_read__returns_plain_values_keyed_by_public_key() {
		// Arrange.
		$raw = [
			'menu_name' => 'Main',
			'layout' => 'vertical',
			'full_width' => 'stretch',
			'link' => [
				'url' => 'https://example.com',
				'is_external' => 'on',
				'nofollow' => '',
			],
			'unmapped_control' => 'ignored',
		];

		// Act.
		$read = V3_Map_Settings_Reader::read( $this->compiled_map(), $raw );

		// Assert.
		$this->assertSame( [
			'menu_name' => 'Main',
			'layout' => 'vertical',
			'full_width' => true,
			'link' => [
				'url' => 'https://example.com',
				'is_external' => true,
				'nofollow' => false,
			],
		], $read );
	}

	public function test_write_then_read__round_trips_plain_values() {
		// Arrange.
		$map = $this->compiled_map();
		$plain = [
			'layout' => 'horizontal',
			'full_width' => false,
			'icon' => [
				'value' => 'fas fa-bars',
				'library' => 'fa-solid',
			],
		];

		// Act.
		$stored = $this->writer()->write( $map, $plain )['settings'];
		$read = V3_Map_Settings_Reader::read( $map, $stored );

		// Assert.
		$this->assertSame( $plain, $read );
	}
}
