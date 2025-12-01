<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Component_Lock_Manager;
use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Component_Lock_Manager extends Elementor_Test_Base {

	const TEST_COMPONENT_TITLE = 'Test Component';

	private $lock_manager;
	private $test_user_1;
	private $test_user_2;
	private $test_component_id;

	public function setUp(): void {
		parent::setUp();

		// Arrange: Create test users
		$this->test_user_1 = $this->factory()->create_and_get_administrator_user()->ID;
		$this->test_user_2 = $this->factory()->create_and_get_administrator_user()->ID;

		// Arrange: Create lock manager instance
		$this->lock_manager = Component_Lock_Manager::get_instance();

		// Arrange: Register component document type
		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		// Arrange: Register post type for components
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );

		// Arrange: Create test component
		$this->test_component_id = $this->create_test_component();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_documents();
	}

	private function clean_up_documents() {
		if ( $this->test_component_id && get_post( $this->test_component_id ) ) {
			wp_delete_post( $this->test_component_id, true );
		}
	}

	private function create_test_component(): int {
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => self::TEST_COMPONENT_TITLE,
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

	public function test_lock__successfully_locks_component() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );

		// Act
		$result = $this->lock_manager->lock_component	( $this->test_component_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully lock component' );
		$this->assertEquals( $this->test_user_1, get_post_meta( $this->test_component_id, '_lock_user', true ), 'Custom lock user metadata should be set' );
		$this->assertNotEmpty( get_post_meta( $this->test_component_id, '_lock_time', true ), 'Custom lock time metadata should be set' );
	}

	public function test_lock__fails_for_regular_post() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$post_id = $this->factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->lock_component( $post_id );

		// Cleanup
		wp_delete_post( $post_id, true );
	}

	public function test_lock__fails_for_regular_page() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$page_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_title' => 'Test Page',
			'post_status' => 'publish',
		] );

		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->lock_component( $page_id );

		// Cleanup
		wp_delete_post( $page_id, true );
	}

	public function test_lock__fails_when_no_user_logged_in() {
		// Arrange
		wp_set_current_user( 0 );

		// Act
		$result = $this->lock_manager->lock_component( $this->test_component_id );

		// Assert
		$this->assertFalse( $result, 'Should fail when no user is logged in' );
	}

	public function test_lock__fails_for_invalid_document_id() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		
		$invalid_document_id = 999999;
		
		$this->assertNull( get_post( $invalid_document_id ), 'Invalid document should not exist' );
		
		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->lock_component( $invalid_document_id );
	}

	public function test_unlock__successfully_unlocks_component() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );

		// Act
		$result = $this->lock_manager->unlock_component( $this->test_component_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully unlock component' );
		$this->assertEmpty( get_post_meta( $this->test_component_id, '_lock_user', true ), 'Custom lock user metadata should be removed' );
		$this->assertEmpty( get_post_meta( $this->test_component_id, '_lock_time', true ), 'Custom lock time metadata should be removed' );
		$this->assertEmpty( get_post_meta( $this->test_component_id, '_edit_lock', true ), 'WordPress post lock metadata should be removed' );
	}

	public function test_unlock__fails_for_regular_post() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$post_id = $this->factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->unlock_component( $post_id );

		// Cleanup
		wp_delete_post( $post_id, true );
	}

	public function test_unlock__fails_for_regular_page() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$page_id = $this->factory()->post->create( [
			'post_type' => 'page',
			'post_title' => 'Test Page',
			'post_status' => 'publish',
		] );

		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->unlock_component( $page_id );

		// Cleanup
		wp_delete_post( $page_id, true );
	}

	public function test_get_lock_data__returns_false_when_not_locked() {
		// Arrange

		// Act
		$result = $this->lock_manager->get_lock_data( $this->test_component_id );

		// Assert
		$this->assertNull( $result['locked_by'], 'Lock user should be null when not locked' );
		$this->assertNull( $result['locked_at'], 'Lock time should be null when not locked' );
	}

	public function test_get_lock_data__returns_lock_data_when_locked() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );

		// Act
		$result = $this->lock_manager->get_lock_data( $this->test_component_id );

		// Assert
		$this->assertIsArray( $result, 'Should return array when component is locked' );
		$this->assertArrayHasKey( 'locked_by', $result );
		$this->assertArrayHasKey( 'locked_at', $result );
		$this->assertNotNull( $result['locked_by'], 'Should be locked' );
		$this->assertEquals( $this->test_user_1, $result['locked_by'] );
		$this->assertIsNumeric( $result['locked_at'], 'Lock time should be numeric' );
	}

	public function test_get_lock_data__auto_unlocks_expired_lock() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );

		// Arrange: Simulate expired lock by setting old timestamp
		$old_timestamp = time() - ( 61 * 60 ); // 61 minutes ago (beyond 60 minute default)
		update_post_meta( $this->test_component_id, '_lock_time', $old_timestamp );

		// Act
			$result = $this->lock_manager->get_lock_data( $this->test_component_id );

		// Assert
		$this->assertNull( $result['locked_by'], 'Should auto-unlock expired lock' );
		$this->assertEmpty( get_post_meta( $this->test_component_id, '_lock_user', true ) );
		$this->assertNull( $result['locked_at'], 'Lock time should be null when not locked' );
	}	

	public function test_get_updated_status__fails_for_regular_post() {
		// Arrange
		$post_id = $this->factory()->post->create( [
			'post_type' => 'post',
			'post_title' => 'Test Post',
			'post_status' => 'publish',
		] );

		// Act & Assert
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Post is not a component type' );
		$this->lock_manager->get_lock_data( $post_id );

		// Cleanup
		wp_delete_post( $post_id, true );
	}


	public function test_extend_lock__successfully_extends_lock() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );
		$original_timestamp = get_post_meta( $this->test_component_id, '_lock_time', true );

		// Wait a moment to ensure timestamp difference
		sleep( 1 );

		// Act
		$result = $this->lock_manager->extend_lock( $this->test_component_id );

		// Assert
		$this->assertTrue( $result, 'Should successfully extend lock' );
		$new_timestamp = get_post_meta( $this->test_component_id, '_lock_time', true );
		$this->assertGreaterThan( $original_timestamp, $new_timestamp, 'Lock timestamp should be updated' );
	}

	public function test_extend_lock__fails_when_not_locked() {
		// Arrange

		// Act
		$result = $this->lock_manager->extend_lock( $this->test_component_id );

		// Assert
		$this->assertNull( $result, 'Should fail to extend lock when component is not locked' );
	}

	public function test_extend_lock__fails_when_locked_by_another_user() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );

		// Arrange: Switch to different user
		wp_set_current_user( $this->test_user_2 );

		// Act
		$result = $this->lock_manager->extend_lock( $this->test_component_id );

		// Assert
		$this->assertNull( $result, 'Should fail to extend lock when locked by another user' );
	}

	public function test_concurrent_lock_attempts() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );
		$this->lock_manager->lock_component( $this->test_component_id );

		// Arrange: Switch to different user
		wp_set_current_user( $this->test_user_2 );

		// Act
		$result = $this->lock_manager->lock_component( $this->test_component_id );

		// Assert
		$this->assertNull( $result, 'Should reject lock attempt when component is locked by another user' );
		$lock_data = $this->lock_manager->get_lock_data( $this->test_component_id );
		$this->assertNotNull( $lock_data['locked_by'], 'Component should still be locked' );
		$this->assertEquals( $this->test_user_1, $lock_data['locked_by'], 'Lock should still be owned by first user' );
	}

	public function test_lock_metadata_consistency() {
		// Arrange
		wp_set_current_user( $this->test_user_1 );

		// Act
		$this->lock_manager->lock_component( $this->test_component_id );

		// Assert
		$meta_locked_by = get_post_meta( $this->test_component_id, '_lock_user', true );
		$locked_at = get_post_meta( $this->test_component_id, '_lock_time', true );

		$this->assertEquals( $this->test_user_1, $meta_locked_by, 'Meta lock should match user' );
		$this->assertIsNumeric( $locked_at, 'Lock time should be numeric timestamp' );
		$this->assertLessThanOrEqual( time(), (int) $locked_at, 'Lock time should not be in the future' );
	}

}
