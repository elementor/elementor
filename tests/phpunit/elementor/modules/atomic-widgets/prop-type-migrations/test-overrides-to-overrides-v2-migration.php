<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;
use Spatie\Snapshots\MatchesSnapshots;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Overrides_To_Overrides_V2_Migration extends Elementor_Test_Base {
	use MatchesSnapshots;
	private array $migration;

	public function setUp(): void {
		parent::setUp();

		$migration_file = ELEMENTOR_PATH . 'migrations/operations/overrides-to-overrides-v2.json';
		$this->migration = json_decode( file_get_contents( $migration_file ), true );
	}

	public function test_up_migration_fixes_corrupted_overrides_array() {
		// Arrange
		$data = [
			'$$type' => 'overrides',
			'value' => [
				'1' => [
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-2',
						'override_value' => [ '$$type' => 'string', 'value' => 'Second override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
				'3' => [
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-4',
						'override_value' => [ '$$type' => 'string', 'value' => 'Fourth override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertEquals( 'overrides-v2', $result['$$type'] );
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_up_migration_preserves_valid_indexed_array() {
		// Arrange
		$data = [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-1',
						'override_value' => [ '$$type' => 'string', 'value' => 'First override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-2',
						'override_value' => [ '$$type' => 'string', 'value' => 'Second override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertEquals( 'overrides-v2', $result['$$type'] );
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_up_migration_handles_empty_overrides() {
		// Arrange
		$data = [
			'$$type' => 'overrides',
			'value' => [],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'up' );

		// Assert
		$this->assertEquals( 'overrides-v2', $result['$$type'] );
		$this->assertIsArray( $result['value'] );
		$this->assertEmpty( $result['value'] );
	}

	public function test_down_migration_reverts_type_only_and_preserves_value() {
		// Arrange
		$data = [
			'$$type' => 'overrides-v2',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-1',
						'override_value' => [ '$$type' => 'string', 'value' => 'First override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-3',
						'override_value' => [ '$$type' => 'string', 'value' => 'Third override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $this->migration, $data, 'down' );

		// Assert
		$this->assertEquals( 'overrides', $result['$$type'] );
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_migration_is_reversible_with_valid_data() {
		// Arrange
		$original_data = [
			'$$type' => 'overrides',
			'value' => [
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-1',
						'override_value' => [ '$$type' => 'string', 'value' => 'First override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
				[
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-2',
						'override_value' => [ '$$type' => 'string', 'value' => 'Second override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
			],
		];

		// Act
		$up = Migration_Interpreter::run( $this->migration, $original_data, 'up' );

		// Assert
		$this->assertEquals( 'overrides-v2', $up['$$type'] );
		$this->assertJsonStringEqualsJsonString( json_encode( $original_data['value'] ), json_encode( $up['value'] ) );

		// Act
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		// Assert
		$this->assertEquals( 'overrides', $down['$$type'] );
		$this->assertJsonStringEqualsJsonString( json_encode( $original_data['value'] ), json_encode( $down['value'] ) );
	}

	public function test_migration_is_reversible_with_corrupted_data() {
		// Arrange
		$corrupted_data = [
			'$$type' => 'overrides',
			'value' => [
				'0' => [
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-1',
						'override_value' => [ '$$type' => 'string', 'value' => 'First override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
				'2' => [
					'$$type' => 'override',
					'value' => [
						'override_key' => 'prop-uuid-3',
						'override_value' => [ '$$type' => 'string', 'value' => 'Third override text' ],
						'schema_source' => [ 'type' => 'component', 'id' => 123 ],
					],
				],
			],
		];

		$expected_value = '[
			{
				"$$type": "override",
				"value": {
					"override_key": "prop-uuid-1",
					"override_value": { "$$type": "string", "value": "First override text" },
					"schema_source": { "type": "component", "id": 123 }
				}
			},
			{
				"$$type": "override",
				"value": {
					"override_key": "prop-uuid-3",
					"override_value": { "$$type": "string", "value": "Third override text" },
					"schema_source": { "type": "component", "id": 123 }
				}
			}
		]';

		// Act
		$up = Migration_Interpreter::run( $this->migration, $corrupted_data, 'up' );

		// Assert
		$this->assertEquals( 'overrides-v2', $up['$$type'] );
		$this->assertEquals( [ 0, 1 ], array_keys( $up['value'] ) );
		$this->assertJsonStringEqualsJsonString( $expected_value, json_encode( $up['value'] ) );

		// Act
		$down = Migration_Interpreter::run( $this->migration, $up, 'down' );

		// Assert
		$this->assertEquals( 'overrides', $down['$$type'] );
		$this->assertEquals( [ 0, 1 ], array_keys( $down['value'] ) );
		$this->assertJsonStringEqualsJsonString( $expected_value, json_encode( $down['value'] ) );
	}
}
