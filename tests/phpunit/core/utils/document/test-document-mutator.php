<?php

namespace Elementor\Testing\Core\Utils\Document;

use Elementor\Core\Utils\Document\Document_Mutator;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Document_Mutator_Test extends TestCase {

	private Document_Mutator $mutator;

	protected function setUp(): void {
		parent::setUp();
		$this->mutator = new Document_Mutator(
			$this->createMock( \Elementor\Elements_Manager::class ),
			$this->createMock( \Elementor\Widgets_Manager::class )
		);
	}

	// Arrange helpers

	private function make_container( string $id, array $children = [] ): array {
		return [ 'id' => $id, 'elType' => 'container', 'settings' => [], 'elements' => $children ];
	}

	private function make_widget( string $id ): array {
		return [ 'id' => $id, 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ];
	}

	// find_by_id

	public function test_find_by_id_returns_node_from_flat_tree() {
		// Arrange
		$container = $this->make_container( 'c1' );
		$tree      = [ $container ];

		// Act
		$result = $this->mutator->find_by_id( $tree, 'c1' );

		// Assert
		$this->assertSame( $container, $result );
	}

	public function test_find_by_id_returns_nested_node() {
		// Arrange
		$widget = $this->make_widget( 'w1' );
		$tree   = [ $this->make_container( 'c1', [ $widget ] ) ];

		// Act
		$result = $this->mutator->find_by_id( $tree, 'w1' );

		// Assert
		$this->assertSame( $widget, $result );
	}

	public function test_find_by_id_returns_null_when_absent() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->find_by_id( $tree, 'nope' );

		// Assert
		$this->assertNull( $result );
	}

	// insert_at — document root

	public function test_insert_at_document_root_appends_when_no_index() {
		// Arrange
		$existing = $this->make_container( 'c1' );
		$new      = $this->make_container( 'c2' );
		$tree     = [ $existing ];

		// Act
		$result = $this->mutator->insert_at( $tree, 'document', null, $new );

		// Assert
		$this->assertCount( 2, $result );
		$this->assertSame( 'c2', $result[1]['id'] );
	}

	public function test_insert_at_document_root_inserts_at_index() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ), $this->make_container( 'c2' ) ];
		$new  = $this->make_container( 'c3' );

		// Act
		$result = $this->mutator->insert_at( $tree, 'document', 0, $new );

		// Assert
		$this->assertSame( 'c3', $result[0]['id'] );
		$this->assertSame( 'c1', $result[1]['id'] );
	}

	public function test_insert_at_out_of_bounds_index_clamps_to_end() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];
		$new  = $this->make_container( 'c2' );

		// Act
		$result = $this->mutator->insert_at( $tree, 'document', 9999, $new );

		// Assert
		$this->assertSame( 'c2', end( $result )['id'] );
	}

	// insert_at — named parent

	public function test_insert_at_widget_parent_returns_invalid_parent_error() {
		// Arrange
		$widget = $this->make_widget( 'w1' );
		$tree   = [ $widget ];
		$new    = $this->make_widget( 'w2' );

		// Act
		$result = $this->mutator->insert_at( $tree, 'w1', null, $new );

		// Assert
		$this->assertWPError( $result, 'elementor_invalid_parent' );
	}

	public function test_insert_at_unknown_parent_returns_not_found_error() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];
		$new  = $this->make_container( 'c2' );

		// Act
		$result = $this->mutator->insert_at( $tree, 'ghost', null, $new );

		// Assert
		$this->assertWPError( $result, 'elementor_not_found' );
	}

	// remove

	public function test_remove_deletes_node_from_flat_tree() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ), $this->make_container( 'c2' ) ];

		// Act
		$result = $this->mutator->remove( $tree, 'c1' );

		// Assert
		$this->assertCount( 1, $result );
		$this->assertSame( 'c2', $result[0]['id'] );
	}

	public function test_remove_deletes_nested_node_and_descendants() {
		// Arrange
		$child = $this->make_widget( 'w1' );
		$tree  = [ $this->make_container( 'c1', [ $child ] ) ];

		// Act
		$result = $this->mutator->remove( $tree, 'c1' );

		// Assert
		$this->assertCount( 0, $result );
	}

	public function test_remove_absent_id_returns_not_found_error() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->remove( $tree, 'ghost' );

		// Assert
		$this->assertWPError( $result, 'elementor_not_found' );
	}

	// patch_settings

	public function test_patch_settings_shallow_merges_without_clobbering() {
		// Arrange
		$node = array_merge( $this->make_container( 'c1' ), [ 'settings' => [ 'color' => 'red', 'size' => 10 ] ] );
		$tree = [ $node ];

		// Act
		$result = $this->mutator->patch_settings( $tree, 'c1', [ 'color' => 'blue' ] );

		// Assert
		$settings = $result[0]['settings'];
		$this->assertSame( 'blue', $settings['color'] );
		$this->assertSame( 10, $settings['size'] );
	}

	public function test_patch_settings_absent_id_returns_not_found_error() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->patch_settings( $tree, 'ghost', [ 'color' => 'blue' ] );

		// Assert
		$this->assertWPError( $result, 'elementor_not_found' );
	}

	// move

	public function test_move_relocates_node_to_new_parent() {
		// Arrange
		$widget = $this->make_widget( 'w1' );
		$tree   = [
			$this->make_container( 'c1', [ $widget ] ),
			$this->make_container( 'c2' ),
		];

		// Act
		$result = $this->mutator->move( $tree, 'w1', 'c2', null );

		// Assert
		$this->assertCount( 0, $result[0]['elements'] );
		$this->assertCount( 1, $result[1]['elements'] );
		$this->assertSame( 'w1', $result[1]['elements'][0]['id'] );
	}

	public function test_move_absent_id_returns_not_found_error() {
		// Arrange
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->move( $tree, 'ghost', 'c1', null );

		// Assert
		$this->assertWPError( $result, 'elementor_not_found' );
	}

	public function test_move_to_invalid_parent_returns_error() {
		// Arrange
		$widget  = $this->make_widget( 'w1' );
		$widget2 = $this->make_widget( 'w2' );
		$tree    = [ $this->make_container( 'c1', [ $widget, $widget2 ] ) ];

		// Act — try to move w1 into w2 (widget parent)
		$result = $this->mutator->move( $tree, 'w1', 'w2', null );

		// Assert
		$this->assertWPError( $result, 'elementor_invalid_parent' );
	}

	// build_ref_index

	public function test_build_ref_index_returns_by_reference_index_for_nested_node() {
		$widget = $this->make_widget( 'w1' );
		$tree   = [ $this->make_container( 'c1', [ $widget ] ) ];

		$index = $this->mutator->build_ref_index( $tree, 'w1' );

		$this->assertArrayHasKey( 'w1', $index );
		$index['w1']['settings']['title'] = 'edited';
		$this->assertSame( 'edited', $tree[0]['elements'][0]['settings']['title'] );
	}

	public function test_build_ref_index_returns_empty_when_absent() {
		$tree = [ $this->make_container( 'c1' ) ];

		$this->assertSame( [], $this->mutator->build_ref_index( $tree, 'ghost' ) );
	}

	// duplicate

	public function test_duplicate_inserts_clone_after_source_with_fresh_ids() {
		$widget = $this->make_widget( 'w1' );
		$tree   = [ $this->make_container( 'c1', [ $widget ] ) ];

		$result = $this->mutator->duplicate( $tree, 'w1' );

		$this->assertCount( 2, $result[0]['elements'] );
		$this->assertSame( 'w1', $result[0]['elements'][0]['id'] );
		$this->assertNotSame( 'w1', $result[0]['elements'][1]['id'] );
		$this->assertSame( 'text-editor', $result[0]['elements'][1]['widgetType'] );
	}

	public function test_duplicate_regenerates_ids_of_all_descendants() {
		$inner = $this->make_widget( 'w1' );
		$tree  = [ $this->make_container( 'c1', [ $inner ] ) ];

		$result = $this->mutator->duplicate( $tree, 'c1' );

		$this->assertCount( 2, $result );
		$this->assertNotSame( 'c1', $result[1]['id'] );
		$this->assertNotSame( 'w1', $result[1]['elements'][0]['id'] );
	}

	public function test_duplicate_absent_id_returns_not_found_error() {
		$tree = [ $this->make_container( 'c1' ) ];

		$result = $this->mutator->duplicate( $tree, 'ghost' );

		$this->assertWPError( $result, 'elementor_not_found' );
	}

	// child-type restrictions

	public function test_insert_at_respects_allowed_child_types_when_restricted() {
		// Arrange
		$mock_instance = new class {
			public function get_config(): array {
				return [ 'allowed_child_types' => [ 'e-tab-content' ] ];
			}
		};

		$mock_element_manager = $this->createMock( \Elementor\Elements_Manager::class );
		$mock_element_manager->method( 'get_element_types' )->willReturn( $mock_instance );

		$mutator = new Document_Mutator( $mock_element_manager, $this->createMock( \Elementor\Widgets_Manager::class ) );

		$parent = $this->make_container( 'c1' );
		$tree   = [ $parent ];
		$child  = $this->make_widget( 'w1' ); // widgetType = 'text-editor', not in allowed list

		// Act
		$result = $mutator->insert_at( $tree, 'c1', null, $child );

		// Assert
		$this->assertWPError( $result, 'elementor_invalid_parent' );
	}

	public function test_insert_at_allows_child_when_type_in_allowed_list() {
		// Arrange
		$mock_instance = new class {
			public function get_config(): array {
				return [ 'allowed_child_types' => [ 'e-tab-content' ] ];
			}
		};

		$mock_element_manager = $this->createMock( \Elementor\Elements_Manager::class );
		$mock_element_manager->method( 'get_element_types' )->willReturn( $mock_instance );

		$mutator = new Document_Mutator( $mock_element_manager, $this->createMock( \Elementor\Widgets_Manager::class ) );

		$parent = $this->make_container( 'c1' );
		$tree   = [ $parent ];
		$child  = [ 'id' => 'tc1', 'elType' => 'e-tab-content', 'elements' => [] ];

		// Act
		$result = $mutator->insert_at( $tree, 'c1', null, $child );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'tc1', $result[0]['elements'][0]['id'] );
	}

	// Input immutability

	public function test_insert_at_does_not_mutate_input_tree() {
		// Arrange
		$tree    = [ $this->make_container( 'c1' ) ];
		$original = $tree;

		// Act
		$this->mutator->insert_at( $tree, 'document', null, $this->make_container( 'c2' ) );

		// Assert
		$this->assertSame( $original, $tree );
	}

	// insert_subtree

	public function test_insert_subtree_generates_ids_for_all_elements() {
		// Arrange
		$subtree = [
			'elType' => 'container',
			'settings' => [],
			'elements' => [
				[ 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ],
				[ 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ],
			],
		];
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->insert_subtree( $tree, 'document', null, $subtree );

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 2, $result );

		$inserted = $result[1];
		$this->assertNotEmpty( $inserted['id'] );
		$this->assertNotEmpty( $inserted['elements'][0]['id'] );
		$this->assertNotEmpty( $inserted['elements'][1]['id'] );

		$this->assertNotEquals( $inserted['id'], $inserted['elements'][0]['id'] );
		$this->assertNotEquals( $inserted['elements'][0]['id'], $inserted['elements'][1]['id'] );
	}

	public function test_insert_subtree_always_regenerates_ids() {
		// Arrange
		$subtree = [
			'id' => 'my-custom-id',
			'elType' => 'container',
			'settings' => [],
			'elements' => [
				[ 'id' => 'child-1', 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ],
				[ 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ],
			],
		];
		$tree = [];

		// Act
		$result = $this->mutator->insert_subtree( $tree, 'document', null, $subtree );

		// Assert - all IDs should be regenerated, never preserved
		$inserted = $result[0];
		$this->assertNotSame( 'my-custom-id', $inserted['id'] );
		$this->assertNotEmpty( $inserted['id'] );
		$this->assertNotSame( 'child-1', $inserted['elements'][0]['id'] );
		$this->assertNotEmpty( $inserted['elements'][0]['id'] );
		$this->assertNotEmpty( $inserted['elements'][1]['id'] );
	}

	public function test_insert_subtree_into_parent_container() {
		// Arrange
		$subtree = [
			'elType' => 'widget',
			'widgetType' => 'text-editor',
			'settings' => [],
			'elements' => [],
		];
		$tree = [ $this->make_container( 'c1' ) ];

		// Act
		$result = $this->mutator->insert_subtree( $tree, 'c1', null, $subtree );

		// Assert
		$this->assertIsArray( $result );
		$this->assertCount( 1, $result[0]['elements'] );
		$this->assertNotEmpty( $result[0]['elements'][0]['id'] );
	}

	public function test_insert_subtree_handles_deeply_nested_elements() {
		// Arrange
		$subtree = [
			'elType' => 'container',
			'settings' => [],
			'elements' => [
				[
					'elType' => 'container',
					'settings' => [],
					'elements' => [
						[
							'elType' => 'container',
							'settings' => [],
							'elements' => [
								[ 'elType' => 'widget', 'widgetType' => 'text-editor', 'settings' => [], 'elements' => [] ],
							],
						],
					],
				],
			],
		];
		$tree = [];

		// Act
		$result = $this->mutator->insert_subtree( $tree, 'document', null, $subtree );

		// Assert
		$inserted = $result[0];
		$this->assertNotEmpty( $inserted['id'] );
		$this->assertNotEmpty( $inserted['elements'][0]['id'] );
		$this->assertNotEmpty( $inserted['elements'][0]['elements'][0]['id'] );
		$this->assertNotEmpty( $inserted['elements'][0]['elements'][0]['elements'][0]['id'] );

		$all_ids = [
			$inserted['id'],
			$inserted['elements'][0]['id'],
			$inserted['elements'][0]['elements'][0]['id'],
			$inserted['elements'][0]['elements'][0]['elements'][0]['id'],
		];
		$this->assertCount( 4, array_unique( $all_ids ) );
	}

	// Helpers

	private function assertWPError( $value, string $code ): void {
		$this->assertInstanceOf( \WP_Error::class, $value );
		$this->assertSame( $code, $value->get_error_code() );
	}
}
