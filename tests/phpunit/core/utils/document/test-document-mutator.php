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

	// Helpers

	private function assertWPError( $value, string $code ): void {
		$this->assertInstanceOf( \WP_Error::class, $value );
		$this->assertSame( $code, $value->get_error_code() );
	}
}
