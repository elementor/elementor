<?php

namespace Elementor\Tests\Phpunit\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Document_Global_Classes_Tracker;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Document_Global_Classes_Tracker extends Elementor_Test_Base {
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();
	}

	public function tearDown(): void {
		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		$this->created_post_ids = [];

		parent::tearDown();
	}

	public function test_set_and_get_document_class_ids() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$tracker = new Document_Global_Classes_Tracker();
		$class_ids = [ 'g-1', 'g-2', 'g-3' ];

		// Act
		$tracker->set_document_class_ids( $post_id, $class_ids );

		// Assert
		$result = $tracker->get_document_class_ids( $post_id );
		$this->assertEqualsCanonicalizing( $class_ids, $result );
	}

	public function test_get_document_class_ids__returns_empty_for_untracked_document() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$tracker = new Document_Global_Classes_Tracker();

		// Act
		$result = $tracker->get_document_class_ids( $post_id );

		// Assert
		$this->assertSame( [], $result );
	}

	public function test_set_document_class_ids__removes_duplicates() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$tracker = new Document_Global_Classes_Tracker();
		$class_ids = [ 'g-1', 'g-2', 'g-1', 'g-3', 'g-2' ];

		// Act
		$tracker->set_document_class_ids( $post_id, $class_ids );

		// Assert
		$result = $tracker->get_document_class_ids( $post_id );
		$this->assertCount( 3, $result );
		$this->assertContains( 'g-1', $result );
		$this->assertContains( 'g-2', $result );
		$this->assertContains( 'g-3', $result );
	}

	public function test_set_document_class_ids__replaces_previous_classes() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$tracker = new Document_Global_Classes_Tracker();

		// Act
		$tracker->set_document_class_ids( $post_id, [ 'g-old-1', 'g-old-2' ] );
		$tracker->set_document_class_ids( $post_id, [ 'g-new-1' ] );

		// Assert
		$result = $tracker->get_document_class_ids( $post_id );
		$this->assertSame( [ 'g-new-1' ], $result );
	}

	public function test_get_documents_using_class__returns_documents_using_class() {
		// Arrange
		$post_id_1 = $this->factory()->post->create();
		$post_id_2 = $this->factory()->post->create();
		$post_id_3 = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id_1;
		$this->created_post_ids[] = $post_id_2;
		$this->created_post_ids[] = $post_id_3;

		$tracker = new Document_Global_Classes_Tracker();
		$tracker->set_document_class_ids( $post_id_1, [ 'g-shared', 'g-1-only' ] );
		$tracker->set_document_class_ids( $post_id_2, [ 'g-shared', 'g-2-only' ] );
		$tracker->set_document_class_ids( $post_id_3, [ 'g-3-only' ] );

		// Act
		$docs_using_shared = $tracker->get_documents_using_class( 'g-shared' );
		$docs_using_1_only = $tracker->get_documents_using_class( 'g-1-only' );
		$docs_using_nonexistent = $tracker->get_documents_using_class( 'g-nonexistent' );

		// Assert
		$this->assertEqualsCanonicalizing( [ $post_id_1, $post_id_2 ], $docs_using_shared );
		$this->assertSame( [ $post_id_1 ], $docs_using_1_only );
		$this->assertSame( [], $docs_using_nonexistent );
	}

	public function test_set_document_class_ids__with_empty_array_removes_all() {
		// Arrange
		$post_id = $this->factory()->post->create();
		$this->created_post_ids[] = $post_id;

		$tracker = new Document_Global_Classes_Tracker();
		$tracker->set_document_class_ids( $post_id, [ 'g-1', 'g-2' ] );

		// Act
		$tracker->set_document_class_ids( $post_id, [] );

		// Assert
		$result = $tracker->get_document_class_ids( $post_id );
		$this->assertSame( [], $result );
	}
}
