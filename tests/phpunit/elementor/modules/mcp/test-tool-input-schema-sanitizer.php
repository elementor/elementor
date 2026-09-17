<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Utils\Tool_Input_Schema_Sanitizer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Tool_Input_Schema_Sanitizer extends TestCase {

	public function test_sanitize_node__converts_empty_properties_array_to_object() {
		// Arrange
		$sanitizer = new Tool_Input_Schema_Sanitizer();
		$payload = [
			'result' => [
				'tools' => [
					[
						'name' => 'elementor-list-resources',
						'inputSchema' => [
							'type' => 'object',
							'properties' => [],
						],
					],
				],
			],
		];

		// Act
		$sanitizer->sanitize_node( $payload );

		// Assert
		$properties = $payload['result']['tools'][0]['inputSchema']['properties'];
		$this->assertInstanceOf( \stdClass::class, $properties );
		$this->assertSame( '{}', json_encode( $properties ) );
	}

	public function test_sanitize_node__leaves_non_empty_properties_untouched() {
		// Arrange
		$sanitizer = new Tool_Input_Schema_Sanitizer();
		$payload = [
			'inputSchema' => [
				'type' => 'object',
				'properties' => [
					'post_id' => [ 'type' => 'integer' ],
				],
			],
		];

		// Act
		$sanitizer->sanitize_node( $payload );

		// Assert
		$this->assertSame(
			[ 'post_id' => [ 'type' => 'integer' ] ],
			$payload['inputSchema']['properties']
		);
	}

	public function test_sanitize_node__ignores_empty_arrays_that_are_not_object_properties() {
		// Arrange
		$sanitizer = new Tool_Input_Schema_Sanitizer();
		$payload = [
			'resources' => [],
			'type' => 'array',
			'properties' => [],
		];

		// Act
		$sanitizer->sanitize_node( $payload );

		// Assert
		$this->assertSame( [], $payload['resources'] );
		$this->assertSame( [], $payload['properties'] );
	}
}
