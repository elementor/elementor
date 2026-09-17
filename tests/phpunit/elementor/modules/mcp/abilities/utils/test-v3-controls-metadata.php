<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\V3_Controls_Metadata;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Controls_Metadata extends TestCase {

	public function test_extract__skips_layout_controls() {
		// Arrange.
		$controls = [
			'section_content' => [ 'type' => 'section' ],
			'title' => [ 'type' => 'text', 'default' => 'Hello' ],
			'tab_style' => [ 'type' => 'tab' ],
		];

		// Act.
		$result = V3_Controls_Metadata::extract( $controls );

		// Assert.
		$this->assertArrayHasKey( 'title', $result );
		$this->assertArrayNotHasKey( 'section_content', $result );
		$this->assertArrayNotHasKey( 'tab_style', $result );
		$this->assertSame( 'Hello', $result['title']['default'] );
		$this->assertSame( 'text', $result['title']['type'] );
	}

	public function test_extract__filters_to_allowed_keys() {
		// Arrange.
		$controls = [
			'title' => [ 'type' => 'text', 'default' => 'Hello' ],
			'title_color' => [ 'type' => 'color', 'default' => '#000' ],
			'header_size' => [
				'type' => 'select',
				'options' => [
					'h1' => 'H1',
					'h2' => 'H2',
				],
			],
		];

		// Act.
		$result = V3_Controls_Metadata::extract( $controls, [ 'title', 'header_size' ] );

		// Assert.
		$this->assertArrayHasKey( 'title', $result );
		$this->assertArrayHasKey( 'header_size', $result );
		$this->assertArrayNotHasKey( 'title_color', $result );
		$this->assertSame( [ 'h1', 'h2' ], $result['header_size']['options'] );
	}

	public function test_extract__empty_allowlist_returns_empty() {
		$result = V3_Controls_Metadata::extract(
			[ 'title' => [ 'type' => 'text' ] ],
			[]
		);

		$this->assertSame( [], $result );
	}
}
