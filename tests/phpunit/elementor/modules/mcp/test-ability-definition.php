<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Ability_Definition;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Ability_Definition extends TestCase {

	private function make_definition( array $overrides = [] ): Ability_Definition {
		return new Ability_Definition(
			$overrides['label'] ?? 'Test Label',
			$overrides['description'] ?? 'Test description.',
			$overrides['category'] ?? 'elementor',
			$overrides['output_schema'] ?? [ 'type' => 'object' ],
			$overrides['meta'] ?? [ 'annotations' => [ 'readonly' => true ] ],
			$overrides['permission_callback'] ?? fn() => true,
			$overrides['input_schema'] ?? []
		);
	}

	public function test_to_array__includes_all_required_fields() {
		// Arrange
		$definition = $this->make_definition();

		// Act
		$result = $definition->to_array();

		// Assert
		$this->assertArrayHasKey( 'label', $result );
		$this->assertArrayHasKey( 'description', $result );
		$this->assertArrayHasKey( 'category', $result );
		$this->assertArrayHasKey( 'output_schema', $result );
		$this->assertArrayHasKey( 'meta', $result );
		$this->assertArrayHasKey( 'permission_callback', $result );
	}

	public function test_to_array__omits_input_schema_when_empty() {
		// Arrange
		$definition = $this->make_definition( [ 'input_schema' => [] ] );

		// Act
		$result = $definition->to_array();

		// Assert
		$this->assertArrayNotHasKey( 'input_schema', $result );
	}

	public function test_to_array__includes_input_schema_when_provided() {
		// Arrange
		$schema = [ 'type' => 'object', 'properties' => [ 'post_id' => [ 'type' => 'integer' ] ] ];
		$definition = $this->make_definition( [ 'input_schema' => $schema ] );

		// Act
		$result = $definition->to_array();

		// Assert
		$this->assertArrayHasKey( 'input_schema', $result );
		$this->assertSame( $schema, $result['input_schema'] );
	}

	public function test_to_array__does_not_include_execute_callback() {
		// Arrange
		$definition = $this->make_definition();

		// Act
		$result = $definition->to_array();

		// Assert — execute_callback is injected by Abstract_Ability::register(), not by the definition
		$this->assertArrayNotHasKey( 'execute_callback', $result );
	}

	public function test_constructor__stores_all_values() {
		// Arrange
		$permission_cb = fn() => false;
		$output_schema = [ 'type' => 'array' ];
		$meta = [ 'annotations' => [ 'readonly' => false ] ];
		$input_schema = [ 'type' => 'object' ];

		// Act
		$definition = new Ability_Definition(
			'My Label',
			'My description.',
			'my-category',
			$output_schema,
			$meta,
			$permission_cb,
			$input_schema
		);

		// Assert
		$this->assertSame( 'My Label', $definition->label );
		$this->assertSame( 'My description.', $definition->description );
		$this->assertSame( 'my-category', $definition->category );
		$this->assertSame( $output_schema, $definition->output_schema );
		$this->assertSame( $meta, $definition->meta );
		$this->assertSame( $permission_cb, $definition->permission_callback );
		$this->assertSame( $input_schema, $definition->input_schema );
	}
}
