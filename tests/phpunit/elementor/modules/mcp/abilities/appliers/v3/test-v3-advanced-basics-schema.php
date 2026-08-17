<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Advanced_Basics_Schema;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Advanced_Basics_Schema extends TestCase {

	public function test_build__returns_cached_schema_with_properties() {
		// Act.
		$schema = V3_Advanced_Basics_Schema::build();

		// Assert.
		$this->assertSame( 'object', $schema['type'] );
		$this->assertIsArray( $schema['properties'] );
		$this->assertNotEmpty( $schema['properties'] );
		$this->assertSame( V3_Advanced_Basics_Schema::build(), $schema );
	}

	public function test_property_refs_for_controls__uses_ref_not_inline_schema() {
		// Arrange.
		$controls = [
			'_padding' => [
				'type' => 'dimensions',
				'tab' => 'advanced',
			],
			'title_color' => [
				'type' => 'color',
				'tab' => 'style',
			],
		];

		// Act.
		$refs = V3_Advanced_Basics_Schema::property_refs_for_controls( $controls );

		// Assert.
		$this->assertArrayHasKey( '_padding', $refs );
		$this->assertSame(
			V3_Advanced_Basics_Schema::RESOURCE_URI . '#/properties/_padding',
			$refs['_padding']['$ref']
		);
		$this->assertArrayNotHasKey( 'title_color', $refs );
	}
}
