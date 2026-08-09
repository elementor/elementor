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
}
