<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Document_Lock_Manager;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Document_Lock_Manager extends Elementor_Test_Base {

	private $lock_manager;
	private $test_user_1;
	private $test_user_2;
	private $test_document_ids;

	public function setUp(): void {
		parent::setUp();

		// Create test users
		$this->test_user_1 = $this->factory()->create_and_get_administrator_user()->ID;
		$this->test_user_2 = $this->factory()->create_and_get_administrator_user()->ID;

		// Create lock manager instance
		$this->lock_manager = new Document_Lock_Manager();

		// Register component document type
		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		// Register post type for components
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		// Create test documents of different types
		$this->test_document_ids = $this->create_test_documents();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_documents();
	}

	private function clean_up_documents() {
		// Clean up created documents
		foreach ( $this->test_document_ids as $document_id ) {
			if ( get_post( $document_id ) ) {
				wp_delete_post( $document_id, true );
			}
		}
	}

	private function create_test_documents(): array {
		$document_ids = [];

		// Create a page
		$page_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_title' => 'Test Page',
			'post_status' => 'publish',
		] );
		$document_ids['page'] = $page_id;

		// Create a post
		$post_id = $this->factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );
		$document_ids['post'] = $post_id;

		// Create a component
		$component_id = $this->create_test_component();
		$document_ids['component'] = $component_id;

		return $document_ids;
	}

	private function create_test_component(): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => 'Test Component',
				'post_status' => 'publish',
			]
		);

		$document->save( [
			'elements' => [
				[
					'id' => 'test-element-id',
					'elType' => 'widget',
					'widgetType' => 'heading',
					'settings' => [
						'title' => 'Test Heading',
					],
				],
			],
		] );

		return $document->get_main_id();
	}

	public function test_lock__successfully_locks_document() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );

		// Debug: Check if post exists and is valid
		$post = get_post( $document_id );
		$this->assertNotNull( $post, 'Test document should exist' );
		$this->assertEquals( 'page', $post->post_type, 'Test document should be a page' );

		// Act
		$result = $this->lock_manager->lock( $document_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully lock document' );
		
		// Verify custom metadata is set (this is what we can reliably test)
		$this->assertEquals( $this->test_user_1, get_post_meta( $document_id, '_lock_user', true ), 'Custom lock user metadata should be set' );
		$this->assertNotEmpty( get_post_meta( $document_id, '_lock_time', true ), 'Custom lock time metadata should be set' );
		
		// Note: WordPress post lock might not work in test environment
		// but our custom metadata approach should work
	}

	public function test_lock__fails_when_no_user_logged_in() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( 0 );

		// Act
		$result = $this->lock_manager->lock( $document_id );

		// Assert
		$this->assertFalse( $result, 'Should fail when no user is logged in' );
	}

	public function test_lock__handles_exception_gracefully() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		
		// Test with an invalid document ID that doesn't exist
		$invalid_document_id = 999999;
		
		// Verify the document doesn't exist
		$this->assertNull( get_post( $invalid_document_id ), 'Invalid document should not exist' );
		
		// Act
		$result = $this->lock_manager->lock( $invalid_document_id );
		
		// Assert
		$this->assertFalse( $result, 'Should handle invalid document ID gracefully' );
	}

	public function test_unlock__successfully_unlocks_document() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock( $document_id );

		// Act
		$result = $this->lock_manager->unlock( $document_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully unlock document' );
		
		// Verify custom metadata is removed
		$this->assertEmpty( get_post_meta( $document_id, '_lock_user', true ), 'Custom lock user metadata should be removed' );
		$this->assertEmpty( get_post_meta( $document_id, '_lock_time', true ), 'Custom lock time metadata should be removed' );
		$this->assertEmpty( get_post_meta( $document_id, '_edit_lock', true ), 'WordPress post lock metadata should be removed' );
	}

	public function test_is_locked__returns_false_when_not_locked() {
		// Arrange
		$document_id = $this->test_document_ids['page'];

		// Act
		$result = $this->lock_manager->get_lock_data( $document_id );

		// Assert
		$this->assertNull( $result['locked_by'], 'Should return false when document is not locked' );
		$this->assertNull( $result['locked_at'], 'Lock time should be null when not locked' );
	}

	public function test_get_lock_data__returns_lock_data_when_locked() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock( $document_id );

		// Act
		$result = $this->lock_manager->get_lock_data( $document_id );

		// Assert
		$this->assertIsArray( $result, 'Should return array when document is locked' );
		$this->assertArrayHasKey( 'locked_by', $result );
		$this->assertArrayHasKey( 'locked_at', $result );
		$this->assertNotNull( $result['locked_by'], 'Should be locked' );
		$this->assertEquals( $this->test_user_1, $result['locked_by'] );
		$this->assertIsNumeric( $result['locked_at'], 'Lock time should be numeric' );
	}

	
	public function test_extend_lock__successfully_extends_lock() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock( $document_id );
		$original_timestamp = get_post_meta( $document_id, '_lock_time', true );

		// Wait a moment to ensure timestamp difference
		sleep( 1 );

		// Act
		$result = $this->lock_manager->extend_lock( $document_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully extend lock' );
		
		$new_timestamp = get_post_meta( $document_id, '_lock_time', true );
		$this->assertGreaterThan( $original_timestamp, $new_timestamp, 'Lock timestamp should be updated' );
	}

	public function test_extend_lock__fails_when_not_locked() {
		// Arrange
		$document_id = $this->test_document_ids['page'];

		// Act
		$result = $this->lock_manager->extend_lock( $document_id );

		// Assert
		$this->assertFalse( $result, 'Should fail to extend lock when document is not locked' );
	}

	public function test_extend_lock__fails_when_locked_by_another_user() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock( $document_id );

		// Switch to different user
		wp_set_current_user( $this->test_user_2 );

		// Act
		$result = $this->lock_manager->extend_lock( $document_id );

		// Assert
		$this->assertFalse( $result, 'Should fail to extend lock when locked by another user' );
	}

	public function test_concurrent_lock_attempts() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock( $document_id );

		// Switch to different user
		wp_set_current_user( $this->test_user_2 );

		// Act
		$result = $this->lock_manager->lock( $document_id );

		// Assert
		$this->assertFalse( $result, 'Should reject lock attempt when document is locked by another user' );
		
		// Verify the lock is still owned by the first user
		$lock_data = $this->lock_manager->get_lock_data( $document_id );
		$this->assertNotNull( $lock_data['locked_by'], 'Document should still be locked' );
		$this->assertEquals( $this->test_user_1, $lock_data['locked_by'], 'Lock should still be owned by first user' );
	}

	public function test_lock_metadata_consistency() {
		// Arrange
		$document_id = $this->test_document_ids['page'];
		wp_set_current_user( $this->test_user_1 );

		// Act
		$this->lock_manager->lock( $document_id );

		// Assert
		$meta_lock_user = get_post_meta( $document_id, '_lock_user', true );
		$lock_time = get_post_meta( $document_id, '_lock_time', true );

		$this->assertEquals( $this->test_user_1, $meta_lock_user, 'Meta lock should match user' );
		$this->assertIsNumeric( $lock_time, 'Lock time should be numeric timestamp' );
		$this->assertLessThanOrEqual( time(), (int) $lock_time, 'Lock time should not be in the future' );
	}

	public function test_works_with_different_document_types() {
		// Test that lock manager works with posts and components too
		$post_id = $this->test_document_ids['post'];
		$component_id = $this->test_document_ids['component'];
		
		wp_set_current_user( $this->test_user_1 );
		
		// Test post
		$this->assertTrue( $this->lock_manager->lock( $post_id ), 'Should lock post' );
		$this->assertTrue( $this->lock_manager->unlock( $post_id ), 'Should unlock post' );
		
		// Test component
		$this->assertTrue( $this->lock_manager->lock( $component_id ), 'Should lock component' );
		$this->assertTrue( $this->lock_manager->unlock( $component_id ), 'Should unlock component' );
	}

}
