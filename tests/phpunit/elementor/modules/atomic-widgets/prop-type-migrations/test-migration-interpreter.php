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
class Test_Migration_Interpreter extends Elementor_Test_Base {
	use MatchesSnapshots;

	public function test_set_creates_new_path() {
		// Arrange
		$data = [ 'settings' => [] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.new.nested.path', 'value' => 'test' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_replaces_existing_value() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ 'url' => 'old.com', 'extra' => 'data' ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.link.url', 'value' => 'new.com' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_by_default_merges_obj() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ 'value' => [ 'url' => 'test.com', 'extra' => 'data' ] ],
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'settings.link.value',
						'value' => [ 'tag' => 'a', 'new' => 'field' ],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_with_merge_false_replaces_obj() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ 'value' => [ 'url' => 'test.com', 'extra' => 'data' ] ],
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'settings.link.value',
						'value' => [ 'tag' => 'a', 'new' => 'field' ],
						'merge' => false,
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_with_wildcard() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ '$$type' => 'link', 'value' => [] ],
				'button' => [ '$$type' => 'link', 'value' => [] ],
				'text' => [ '$$type' => 'string', 'value' => 'text' ],
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.tag', 'value' => 'a' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_renames_key() {
		// Arrange
		$data = [
			'settings' => [
				'size' => [ 'value' => [ 'value' => 150, 'unit' => 'px' ] ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.size.value.value', 'key' => 'size' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_with_key_and_value() {
		// Arrange
		$data = [
			'settings' => [
				'dimension' => [ 'value' => [ 'old_key' => 150, 'unit' => 'px' ] ],
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'settings.dimension.value.old_key',
						'key' => 'size',
						'value' => 200,
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_creates_empty_object() {
		// Arrange
		$data = [ 'settings' => [] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.new.empty.obj' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_appends_to_array() {
		// Arrange
		$data = [ 'settings' => [ 'links' => [ 'item1', 'item2' ] ] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.links[]', 'value' => 'item3' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_at_array_index() {
		// Arrange
		$data = [ 'settings' => [ 'links' => [ 'item1', 'item2', 'item3' ] ] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.links[1]', 'value' => 'updated' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_set_wildcard_array_indices() {
		// Arrange
		$data = [
			'settings' => [
				'links' => [
					[ 'url' => 'a.com' ],
					[ 'url' => 'b.com' ],
					[ 'url' => 'c.com' ],
				],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.links[*].visited', 'value' => true ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_delete_removes_field() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ 'url' => 'test.com', 'label' => 'old', 'tag' => 'a' ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.link.label' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_delete_with_wildcard() {
		// Arrange
		$data = [
			'settings' => [
				'link1' => [ 'url' => 'test.com', 'label' => 'old' ],
				'link2' => [ 'url' => 'test2.com', 'label' => 'old2' ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.*.label' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_delete_removes_complex_object() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [
					'value' => [
						'destination' => [
							'id' => 105,
							'type' => 'post',
							'nested' => [
								'deep' => 'value',
							],
						],
						'tag' => 'a',
					],
					'metadata' => [ 'custom' => true ],
				],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.link.value.destination' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_delete_array_index() {
		// Arrange
		$data = [ 'settings' => [ 'items' => [ 'keep1', 'remove', 'keep2' ] ] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.items[1]' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_delete_from_all_array_items() {
		// Arrange
		$data = [
			'settings' => [
				'links' => [
					[ 'url' => 'a.com', 'temp' => 'data1' ],
					[ 'url' => 'b.com', 'temp' => 'data2' ],
					[ 'url' => 'c.com', 'temp' => 'data3' ],
				],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.links[*].temp' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_move_transfers_value() {
		// Arrange
		$data = [
			'old' => [ 'path' => 'value' ],
			'new' => [],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'move', 'src' => 'old.path', 'dest' => 'new.location' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_move_with_clean_false_preserves_source() {
		// Arrange
		$data = [
			'settings' => [
				'oldField' => 'value',
				'other' => 'data',
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [
						'fn' => 'move',
						'src' => 'settings.oldField',
						'dest' => 'settings.nested.newField',
						'clean' => false,
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_move_complex_object() {
		// Arrange
		$data = [
			'settings' => [
				'oldLocation' => [
					'nested' => [
						'deep' => 'value',
						'other' => 123,
					],
				],
			],
			'newLocation' => [],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'move', 'src' => 'settings.oldLocation.nested', 'dest' => 'newLocation.data' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_move_from_array_index() {
		// Arrange
		$data = [
			'settings' => [
				'items' => [ 'first', 'second', 'third' ],
				'target' => [],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'move', 'src' => 'settings.items[1]', 'dest' => 'settings.target.moved' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_move_to_array_append() {
		// Arrange
		$data = [
			'settings' => [
				'value' => 'to-move',
				'collection' => [ 'existing1', 'existing2' ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'move', 'src' => 'settings.value', 'dest' => 'settings.collection[]' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_condition_equals() {
		// Arrange
		$data = [ 'settings' => [ '$$type' => 'link', 'value' => [] ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_not_equals() {
		// Arrange
		$data = [ 'settings' => [ '$$type' => 'string' ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [ 'fn' => 'not_equals', 'path' => 'settings.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_exists() {
		// Arrange
		$data = [ 'settings' => [ 'url' => 'test.com' ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [ 'fn' => 'exists', 'path' => 'settings.url' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_not_exists() {
		// Arrange
		$data = [ 'settings' => [] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [ 'fn' => 'not_exists', 'path' => 'settings.url' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_in() {
		// Arrange
		$data = [ 'settings' => [ 'tag' => 'h2' ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
					'condition' => [ 'fn' => 'in', 'path' => 'settings.tag', 'value' => [ 'h1', 'h2', 'h3' ] ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['valid'] );
	}

	public function test_condition_not_in() {
		// Arrange
		$data = [ 'settings' => [ 'tag' => 'p' ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
					'condition' => [ 'fn' => 'not_in', 'path' => 'settings.tag', 'value' => [ 'h1', 'h2', 'h3' ] ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['valid'] );
	}

	public function test_condition_is_primitive() {
		// Arrange
		$data = [ 'settings' => [ 'value' => 150 ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [ 'fn' => 'is_primitive', 'path' => 'settings.value' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_is_object() {
		// Arrange
		$data = [ 'settings' => [ 'value' => [ 'size' => 150 ] ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
					'condition' => [ 'fn' => 'is_object', 'path' => 'settings.value' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['valid'] );
	}

	public function test_condition_is_array() {
		// Arrange
		$data = [ 'settings' => [ 'items' => [ 'a', 'b', 'c' ] ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
					'condition' => [ 'fn' => 'is_array', 'path' => 'settings.items' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['valid'] );
	}

	public function test_condition_and() {
		// Arrange
		$data = [ 'settings' => [ '$$type' => 'size', 'value' => 150 ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
					'condition' => [
						'fn' => 'and',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'size' ],
							[ 'fn' => 'is_primitive', 'path' => 'settings.value' ],
						],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['processed'] );
	}

	public function test_condition_or() {
		// Arrange
		$data = [ 'settings' => [ '$$type' => 'html' ] ];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.isText', 'value' => true ],
					'condition' => [
						'fn' => 'or',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'string' ],
							[ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'html' ],
						],
					],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['isText'] );
	}

	public function test_condition_with_wildcard() {
		// Arrange
		$data = [
			'settings' => [
				'link' => [ '$$type' => 'link' ],
				'button' => [ '$$type' => 'link' ],
				'text' => [ '$$type' => 'string' ],
			],
		];
		$migration = [
			'up' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.processed', 'value' => true ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
				],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertTrue( $result['settings']['link']['processed'] );
		$this->assertTrue( $result['settings']['button']['processed'] );
		$this->assertArrayNotHasKey( 'processed', $result['settings']['text'] );
	}

	public function test_interpret_down_direction() {
		// Arrange
		$data = [ 'settings' => [ 'tag' => 'h1' ] ];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.tag', 'value' => 'h2' ] ],
			],
			'down' => [
				[ 'op' => [ 'fn' => 'set', 'path' => 'settings.tag', 'value' => 'h3' ] ],
			],
		];

		// Act
		$result = Migration_Interpreter::run( $migration, $data, 'down' );

		// Assert
		$this->assertMatchesJsonSnapshot( $result );
	}

	public function test_empty_operations_returns_original_data() {
		// Arrange
		$data = [ 'settings' => [ 'tag' => 'h3' ] ];
		$migration = [ 'up' => [] ];

		// Act
		$result = Migration_Interpreter::run( $migration, $data );

		// Assert
		$this->assertSame( $data, $result );
	}

	public function test_delete_preserves_empty_object_type() {
		$data = [
			'settings' => [
				'obj' => [ 'a' => 1, 'b' => 2 ],
				'arr' => [ 'x', 'y' ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.obj.a', 'clean' => false ] ],
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.obj.b', 'clean' => false ] ],
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.arr[0]', 'clean' => false ] ],
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.arr[0]', 'clean' => false ] ],
			],
		];

		$result = Migration_Interpreter::run( $migration, $data );

		$this->assertInstanceOf( \stdClass::class, $result['settings']['obj'] );
		$this->assertIsArray( $result['settings']['arr'] );
		$this->assertEmpty( $result['settings']['arr'] );
	}

	public function test_delete_with_clean_false_preserves_structure() {
		$data = [
			'settings' => [
				'obj' => [ 'keep' => 1, 'remove' => 2 ],
			],
		];
		$migration = [
			'up' => [
				[ 'op' => [ 'fn' => 'delete', 'path' => 'settings.obj.remove', 'clean' => false ] ],
			],
		];

		$result = Migration_Interpreter::run( $migration, $data );

		$this->assertIsArray( $result['settings']['obj'] );
		$this->assertEquals( [ 'keep' => 1 ], $result['settings']['obj'] );
	}
}


