<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Json_Schema_Builder;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Json_Schema_Builder extends TestCase {

	public function test_build__maps_select_to_string_enum() {
		// Arrange.
		$controls = [
			'layout' => [
				'type' => 'select',
				'default' => 'horizontal',
				'options' => [
					'horizontal' => 'Horizontal',
					'vertical' => 'Vertical',
				],
			],
		];

		// Act.
		$result = V3_Json_Schema_Builder::build( $controls );

		// Assert.
		$this->assertSame( 'string', $result['properties']['layout']['type'] );
		$this->assertSame( [ 'horizontal', 'vertical' ], $result['properties']['layout']['enum'] );
		$this->assertSame( 'horizontal', $result['properties']['layout']['default'] );
	}

	public function test_build__maps_switcher_to_string_enum_yes_or_empty() {
		$controls = [ 'open_lightbox' => [ 'type' => 'switcher' ] ];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertSame( 'string', $result['properties']['open_lightbox']['type'] );
		$this->assertSame( [ 'yes', '' ], $result['properties']['open_lightbox']['enum'] );
	}

	public function test_build__maps_number_and_text() {
		$controls = [
			'count' => [ 'type' => 'number', 'default' => 3 ],
			'title' => [ 'type' => 'text', 'default' => 'Hello' ],
		];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertSame( 'number', $result['properties']['count']['type'] );
		$this->assertSame( 3, $result['properties']['count']['default'] );
		$this->assertSame( 'string', $result['properties']['title']['type'] );
		$this->assertSame( 'Hello', $result['properties']['title']['default'] );
	}

	public function test_build__maps_media_and_icons_to_object_shapes() {
		$controls = [
			'image' => [ 'type' => 'media' ],
			'icon' => [ 'type' => 'icons' ],
		];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertSame( 'object', $result['properties']['image']['type'] );
		$this->assertArrayHasKey( 'url', $result['properties']['image']['properties'] );
		$this->assertArrayHasKey( 'id', $result['properties']['image']['properties'] );

		$this->assertSame( 'object', $result['properties']['icon']['type'] );
		$this->assertArrayHasKey( 'value', $result['properties']['icon']['properties'] );
		$this->assertArrayHasKey( 'library', $result['properties']['icon']['properties'] );
	}

	public function test_build__maps_slider_and_dimensions_to_object_shapes() {
		$controls = [
			'gap' => [ 'type' => 'slider' ],
			'padding' => [ 'type' => 'dimensions' ],
		];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertSame( 'object', $result['properties']['gap']['type'] );
		$this->assertArrayHasKey( 'size', $result['properties']['gap']['properties'] );
		$this->assertArrayHasKey( 'unit', $result['properties']['gap']['properties'] );

		$this->assertSame( 'object', $result['properties']['padding']['type'] );
		$this->assertArrayHasKey( 'top', $result['properties']['padding']['properties'] );
		$this->assertArrayHasKey( 'isLinked', $result['properties']['padding']['properties'] );
	}

	public function test_build__filters_by_allowed_keys_and_drops_layout_wrappers() {
		$controls = [
			'section' => [ 'type' => 'section' ],
			'menu' => [ 'type' => 'select', 'options' => [ 'a' => 'A', 'b' => 'B' ] ],
			'title_color' => [ 'type' => 'color' ],
		];

		$result = V3_Json_Schema_Builder::build( $controls, [ 'menu', 'title_color' ] );

		$this->assertArrayHasKey( 'menu', $result['properties'] );
		$this->assertArrayHasKey( 'title_color', $result['properties'] );
		$this->assertArrayNotHasKey( 'section', $result['properties'] );

		$filtered = V3_Json_Schema_Builder::build( $controls, [ 'menu' ] );
		$this->assertArrayNotHasKey( 'title_color', $filtered['properties'] );
	}

	public function test_build__empty_allowlist_returns_empty_properties() {
		$result = V3_Json_Schema_Builder::build( [ 'title' => [ 'type' => 'text' ] ], [] );

		$this->assertSame( [], $result['properties'] );
	}

	public function test_build__wraps_dynamic_capable_control_in_anyOf_union() {
		// Arrange.
		$controls = [
			'title' => [
				'type' => 'text',
				'default' => 'Hello',
				'dynamic' => [ 'active' => true, 'categories' => [ 'text', 'post_meta' ] ],
			],
		];

		// Act.
		$result = V3_Json_Schema_Builder::build( $controls );

		// Assert.
		$entry = $result['properties']['title'];
		$this->assertArrayHasKey( 'anyOf', $entry );
		$this->assertCount( 2, $entry['anyOf'] );

		$this->assertSame( 'string', $entry['anyOf'][0]['type'] );
		$this->assertSame( 'Hello', $entry['anyOf'][0]['default'] );

		$this->assertSame( 'object', $entry['anyOf'][1]['type'] );
		$this->assertSame( [ 'name' ], $entry['anyOf'][1]['required'] );
		$this->assertSame( 'string', $entry['anyOf'][1]['properties']['name']['type'] );
		$this->assertStringContainsString( 'text', $entry['anyOf'][1]['description'] );
		$this->assertStringContainsString( 'post_meta', $entry['anyOf'][1]['description'] );
		$this->assertFalse( $entry['anyOf'][1]['additionalProperties'] );
	}

	public function test_build__wraps_control_with_dynamic_default_only() {
		$controls = [
			'title' => [
				'type' => 'text',
				'dynamic' => [ 'default' => 'post-title', 'categories' => [ 'text' ] ],
			],
		];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertArrayHasKey( 'anyOf', $result['properties']['title'] );
		$this->assertFalse( $result['properties']['title']['anyOf'][1]['additionalProperties'] );
	}

	public function test_build__does_not_wrap_non_dynamic_control() {
		// Arrange.
		$controls = [
			'size' => [
				'type' => 'select',
				'options' => [ 'a' => 'A', 'b' => 'B' ],
			],
		];

		// Act.
		$result = V3_Json_Schema_Builder::build( $controls );

		// Assert.
		$this->assertArrayNotHasKey( 'anyOf', $result['properties']['size'] );
		$this->assertSame( 'string', $result['properties']['size']['type'] );
	}

	public function test_build__hoists_description_above_anyOf_when_control_is_dynamic() {
		// Arrange.
		$controls = [
			'title' => [
				'type' => 'text',
				'description' => 'Heading text.',
				'dynamic' => [ 'active' => true ],
			],
		];

		// Act.
		$result = V3_Json_Schema_Builder::build( $controls );

		// Assert.
		$this->assertSame( 'Heading text.', $result['properties']['title']['description'] );
		$this->assertArrayHasKey( 'anyOf', $result['properties']['title'] );
	}

	public function test_build__preserves_description_stripped_of_tags() {
		$controls = [
			'menu' => [
				'type' => 'select',
				'description' => 'Go to the <a href="#">menus screen</a>',
			],
		];

		$result = V3_Json_Schema_Builder::build( $controls );

		$this->assertSame( 'Go to the menus screen', $result['properties']['menu']['description'] );
	}

	public function test_check_value_shape__passes_plain_scalar() {
		$entry = [ 'type' => 'string' ];

		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( 'Hello world', $entry ) );
	}

	public function test_check_value_shape__rejects_array_on_scalar_slot() {
		$entry = [ 'type' => 'string' ];

		$result = V3_Json_Schema_Builder::check_value_shape( [ 'not' => 'a scalar' ], $entry );

		$this->assertNotNull( $result );
		$this->assertStringContainsString( 'invalid shape', $result );
		$this->assertStringContainsString( 'expected string', $result );
		$this->assertStringContainsString( 'got object', $result );
	}

	public function test_check_value_shape__rejects_enum_violation() {
		$entry = [
			'type' => 'string',
			'enum' => [ 'h1', 'h2', 'h3' ],
		];

		$result = V3_Json_Schema_Builder::check_value_shape( 'h9', $entry );

		$this->assertNotNull( $result );
		$this->assertStringContainsString( 'value must be one of', $result );
	}

	public function test_check_value_shape__rejects_nested_property_type_mismatch() {
		$entry = [
			'type' => 'object',
			'properties' => [
				'url' => [ 'type' => 'string' ],
				'id' => [ 'type' => 'number' ],
			],
		];

		$result = V3_Json_Schema_Builder::check_value_shape(
			[
				'url' => 'https://example.com',
				'id' => 'not-a-number',
			],
			$entry
		);

		$this->assertNotNull( $result );
		$this->assertStringContainsString( 'invalid shape at "id"', $result );
	}

	public function test_check_settings_shape__collects_valid_and_errors() {
		$schema = V3_Json_Schema_Builder::build(
			[
				'title' => [ 'type' => 'text' ],
				'header_size' => [
					'type' => 'select',
					'options' => [ 'h1' => 'H1', 'h2' => 'H2' ],
				],
			],
			[ 'title', 'header_size' ]
		);

		$result = V3_Json_Schema_Builder::check_settings_shape(
			[
				'title' => 'Hello',
				'header_size' => 'h9',
			],
			$schema
		);

		$this->assertSame( 'Hello', $result['valid']['title'] );
		$this->assertArrayNotHasKey( 'header_size', $result['valid'] );
		$this->assertArrayHasKey( 'header_size', $result['errors'] );
	}

	public function test_check_value_shape__accepts_empty_array_for_array_and_object_types() {
		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( [], [ 'type' => 'array' ] ) );
		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( [], [ 'type' => 'object' ] ) );
	}

	public function test_check_value_shape__accepts_numeric_string_for_number_type() {
		$entry = [ 'type' => 'number' ];

		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( '123', $entry ) );
		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( '1.5', $entry ) );
	}

	public function test_check_value_shape__accepts_loose_enum_scalar_match() {
		$entry = [
			'type' => 'string',
			'enum' => [ '1', '2', '3' ],
		];

		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( 1, $entry ) );
	}

	public function test_json_type_of__empty_array_is_array() {
		$schema = V3_Json_Schema_Builder::build( [ 'items' => [ 'type' => 'repeater' ] ] );

		$this->assertSame( 'array', $schema['properties']['items']['type'] );
		$this->assertNull( V3_Json_Schema_Builder::check_value_shape( [], $schema['properties']['items'] ) );
	}

	public function test_check_settings_shape__rejects_allowlisted_key_without_schema_entry() {
		$schema = V3_Json_Schema_Builder::build(
			[
				'title' => [ 'type' => 'text' ],
			],
			[ 'title' ]
		);

		$result = V3_Json_Schema_Builder::check_settings_shape(
			[
				'title' => 'Hello',
				'missing_control' => 'value',
			],
			$schema
		);

		$this->assertSame( 'Hello', $result['valid']['title'] );
		$this->assertArrayNotHasKey( 'missing_control', $result['valid'] );
		$this->assertSame( 'no schema for allowlisted key.', $result['errors']['missing_control'] );
	}
}
