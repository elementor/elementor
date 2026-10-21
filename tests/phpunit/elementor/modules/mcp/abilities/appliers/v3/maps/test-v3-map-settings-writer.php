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
			'columns' => [
				'type' => 'number',
				'min' => 1,
				'max' => 24,
			],
			'speed' => [ 'type' => 'number' ],
			'duration' => [
				'type' => 'number',
				'min' => 100,
				'step' => 100,
			],
			'due_date' => [ 'type' => 'date_time' ],
			'selector' => [ 'type' => 'text' ],
			'gallery' => [ 'type' => 'gallery' ],
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
				'columns' => V3_Setting::bind_to( 'columns' )->whole_number(),
				'speed' => V3_Setting::bind_to( 'speed' )->number(),
				'duration' => V3_Setting::bind_to( 'duration' )->number(),
				'due_date' => V3_Setting::bind_to( 'due_date' )->date_time(),
				'selector' => V3_Setting::bind_to( 'selector' )->css_selector(),
				'gallery' => V3_Setting::bind_to( 'gallery' )->gallery(),
			] )
			->default_target( Style_Target::make( 'menu' ) );

		return ( new V3_Widget_Map_Compiler( [] ) )
			->compile( $map, $this->controls(), new V3_Map_Diagnostics(), self::WIDGET_TYPE );
	}

	private static function factory_attachment(): int {
		return wp_insert_attachment( [
			'post_title' => 'Gallery image',
			'post_mime_type' => 'image/jpeg',
		] );
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

	public function test_write__stores_a_boolean_string_as_the_boolean_it_names() {
		// Act.
		$result = $this->writer()->write( $this->compiled_map(), [ 'full_width' => 'false' ] );

		// Assert.
		$this->assertSame( [ 'full_width' => '' ], $result['settings'] );
		$this->assertSame( [], $result['rejected'] );
	}

	/**
	 * @dataProvider provide_values_the_published_schema_rejects
	 */
	public function test_write__rejects_with_the_reason_from_the_published_schema( string $key, $value, string $expected_reason ) {
		// Act.
		$result = $this->writer()->write( $this->compiled_map(), [ $key => $value ] );

		// Assert.
		$this->assertSame( [], $result['settings'] );
		$this->assertStringContainsString( $expected_reason, $result['rejected'][ $key ] ?? '' );
	}

	public function provide_values_the_published_schema_rejects(): array {
		return [
			'switcher word' => [ 'full_width', 'no', 'full_width is not of type boolean' ],
			'number above the control max' => [ 'columns', 100, 'columns must be between 1 (inclusive) and 24 (inclusive)' ],
			'number below the control min' => [ 'columns', 0, 'columns must be between 1 (inclusive) and 24 (inclusive)' ],
			'fraction for a whole number' => [ 'columns', 2.5, 'columns is not of type integer' ],
			'fraction for a whole-step control' => [ 'duration', 150.5, 'duration is not of type integer' ],
			'date text' => [ 'due_date', 'next friday', 'due_date does not match pattern' ],
			'selector markup' => [ 'selector', '"><script>', 'selector does not match pattern' ],
			'selector too long' => [ 'selector', str_repeat( 'a', 300 ), 'selector must be at most 200 characters long' ],
			'icon markup' => [ 'icon', [ 'value' => '"><b>', 'library' => 'fa-solid' ], 'icon[value] does not match pattern' ],
			'icon extra key' => [ 'icon', [ 'value' => 'fas fa-bars', 'color' => 'red' ], 'icon[color] is not a valid property of Object' ],
			'gallery negative id' => [ 'gallery', [ [ 'id' => -1 ] ], 'gallery[0][id] must be greater than or equal to 1' ],
			'gallery fractional id' => [ 'gallery', [ [ 'id' => 1.5 ] ], 'gallery[0][id] is not of type integer' ],
			'gallery extra key' => [ 'gallery', [ [ 'id' => 1, 'caption' => 'x' ] ], 'gallery[0][caption] is not a valid property of Object' ],
		];
	}

	/**
	 * @dataProvider provide_values_only_the_explicit_exceptions_reject
	 */
	public function test_write__rejects_what_the_schema_cannot_express_with_an_explicit_exception( string $key, $value ) {
		// Act.
		$result = $this->writer()->write( $this->compiled_map(), [ $key => $value ] );

		// Assert.
		$this->assertSame( [], $result['settings'] );
		$this->assertArrayHasKey( $key, $result['rejected'] );
	}

	public function provide_values_only_the_explicit_exceptions_reject(): array {
		return [
			'impossible date' => [ 'due_date', '2027-02-30 10:00' ],
			'unbalanced selector' => [ 'selector', 'div[data-x="1"' ],
			'dangling combinator' => [ 'selector', '.a >' ],
			'missing attachment' => [ 'gallery', [ [ 'id' => 999999999 ] ] ],
		];
	}

	public function test_write__keeps_decimals_on_an_unbounded_number_and_rejects_unsafe_magnitudes() {
		// Act.
		$decimal = $this->writer()->write( $this->compiled_map(), [ 'speed' => -4.5 ] );
		$unsafe = $this->writer()->write( $this->compiled_map(), [ 'speed' => 1e19 ] );

		// Assert.
		$this->assertSame( [ 'speed' => -4.5 ], $decimal['settings'] );
		$this->assertSame( [], $unsafe['settings'] );
		$this->assertArrayHasKey( 'speed', $unsafe['rejected'] );
	}

	public function test_write__names_the_gallery_item_whose_attachment_is_missing() {
		// Arrange.
		$existing_id = self::factory_attachment();
		$missing_id = 999999999;

		// Act.
		$result = $this->writer()->write( $this->compiled_map(), [ 'gallery' => [ [ 'id' => $existing_id ], [ 'id' => $missing_id ] ] ] );
		wp_delete_attachment( $existing_id, true );

		// Assert.
		$this->assertSame( [], $result['settings'] );
		$this->assertStringContainsString( "item 1 references Media Library id {$missing_id}", $result['rejected']['gallery'] ?? '' );
		$this->assertStringContainsString( 'no item in the list was saved', $result['rejected']['gallery'] ?? '' );
	}

	public function test_compile__publishes_the_rules_the_writer_enforces() {
		// Act.
		$settings = $this->compiled_map()->get_settings();

		// Assert.
		$this->assertSame( 1, $settings['columns']->get_schema()['minimum'] ?? null );
		$this->assertSame( 24, $settings['columns']->get_schema()['maximum'] ?? null );
		$this->assertSame( 'integer', $settings['columns']->get_schema()['type'] ?? null );
		$this->assertSame( 'integer', $settings['duration']->get_schema()['type'] ?? null );
		$this->assertSame( 'number', $settings['speed']->get_schema()['type'] ?? null );
		$this->assertArrayNotHasKey( 'minimum', $settings['speed']->get_schema() );
		$this->assertArrayNotHasKey( 'maximum', $settings['speed']->get_schema() );
		$this->assertArrayHasKey( 'pattern', $settings['due_date']->get_schema() );
		$this->assertArrayHasKey( 'pattern', $settings['selector']->get_schema() );
		$this->assertSame( 200, $settings['selector']->get_schema()['maxLength'] ?? null );
		$this->assertArrayHasKey( 'pattern', $settings['icon']->get_schema()['properties']['value'] );
		$this->assertSame(
			[
				'type' => 'integer',
				'minimum' => 1,
			],
			array_intersect_key( $settings['gallery']->get_schema()['items']['properties']['id'], array_flip( [ 'type', 'minimum' ] ) )
		);
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
