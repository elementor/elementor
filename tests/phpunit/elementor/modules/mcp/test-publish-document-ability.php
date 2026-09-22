<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Core\Utils\Document\Document_Mutator;
use Elementor\Modules\Mcp\Abilities\Publish_Document_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Publish_Document_Ability extends Elementor_Test_Base {

	private Publish_Document_Ability $ability;
	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Publish_Document_Ability();
		$this->original_documents = Plugin::$instance->documents;
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		parent::tearDown();
	}

	public function test_execute__returns_400_when_post_id_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_id', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_document_not_found() {
		// Arrange
		$this->act_as_admin();

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( null );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => 999999 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'document_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_user_cannot_publish() {
		// Arrange
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$user_id = $this->factory()->user->create( [ 'role' => 'contributor' ] );
		wp_set_current_user( $user_id );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_publish', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__transitions_draft_to_publish() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertSame( 'publish', $result['status'] );
		$this->assertSame( 'draft', $result['previous_status'] );
		$this->assertSame( 'publish', get_post_status( $post_id ) );
		$this->assertArrayHasKey( 'preview_url', $result );
		$this->assertArrayHasKey( 'llm_instructions', $result );
	}

	public function test_execute__is_idempotent_when_already_published() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'publish', 'post_type' => 'page' ] );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'publish', $result['status'] );
		$this->assertSame( 'publish', $result['previous_status'] );
		$this->assertSame( 'publish', get_post_status( $post_id ) );
	}

	public function test_execute__returns_wp_error_when_update_fails() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft', 'post_type' => 'page' ] );

		$filter = function ( $data ) {
			return new \WP_Error( 'forced_failure', 'Simulated update failure' );
		};
		add_filter( 'wp_insert_post_empty_content', '__return_false' );
		add_filter( 'wp_insert_post_data', $filter, 10, 1 );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		// Cleanup
		remove_filter( 'wp_insert_post_data', $filter, 10 );
		remove_filter( 'wp_insert_post_empty_content', '__return_false' );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'draft', get_post_status( $post_id ) );
	}

	public function test_execute__rejects_revision_id() {
		// Arrange
		$this->act_as_admin();
		$parent_id = $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_type' => 'page',
			'post_content' => 'original content',
		] );
		wp_update_post( [
			'ID' => $parent_id,
			'post_content' => 'updated content',
		] );
		$revisions = wp_get_post_revisions( $parent_id );
		$revision_id = key( $revisions );

		$this->assertNotEmpty( $revision_id );
		$this->assertNotFalse( wp_is_post_revision( $revision_id ) );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $revision_id ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_id', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
		$this->assertSame( 'draft', get_post_status( $parent_id ) );
	}

	public function test_execute__promotes_pending_autosave_when_already_published() {
		// Arrange - simulate MCP write on live doc: main has 1 element, autosave has 2 (ED-25608).
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$main_document = Plugin::$instance->documents->get( $post->ID );
		$main_document->set_is_built_with_elementor( true );
		$main_document->save( [ 'elements' => $this->containers( 1 ) ] );

		$autosave = Document_Mutator::instance()->save_as_draft( $main_document, $this->containers( 2 ), true );
		$this->assertInstanceOf( \Elementor\Core\Base\Document::class, $autosave );
		$autosave_id = $autosave->get_post()->ID;

		$this->assertNotSame( $post->ID, $autosave_id, 'Mutator must route writes to an autosave post for live docs.' );
		$this->assertCount( 2, $autosave->get_elements_data(), 'Autosave must hold the newer 2-element tree before publish.' );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post->ID ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'publish', $result['status'] );
		$this->assertSame( 'publish', $result['previous_status'] );
		$this->assertSame( 'publish', get_post_status( $post->ID ) );

		$refreshed_main = Plugin::$instance->documents->get( $post->ID, false );
		$this->assertCount( 2, $refreshed_main->get_elements_data(), 'Main document must now hold the promoted 2-element tree.' );
		$this->assertNull( get_post( $autosave_id ), 'Promoted autosave should be deleted.' );
	}

	public function test_execute__already_published_without_autosave_is_noop_success() {
		// Arrange
		$this->act_as_admin();
		$post = $this->factory()->create_and_get_custom_post( [ 'post_status' => 'publish' ] );
		$main_document = Plugin::$instance->documents->get( $post->ID );
		$main_document->save( [ 'elements' => $this->containers( 3 ) ] );

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post->ID ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'publish', $result['status'] );
		$this->assertSame( 'publish', $result['previous_status'] );

		$refreshed_main = Plugin::$instance->documents->get( $post->ID, false );
		$this->assertCount( 3, $refreshed_main->get_elements_data(), 'Main document must be untouched when there is no pending autosave.' );
	}

	public function test_execute__authorizes_against_main_id_not_input() {
		// Arrange — author has `publish_posts` but not `publish_pages`,
		// so publish_post cap passes on input (post) and fails on remapped (page).
		$author_id = $this->factory()->user->create( [ 'role' => 'author' ] );
		$input_post_id = $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_type' => 'post',
			'post_author' => $author_id,
		] );
		$remapped_post_id = $this->factory()->post->create( [
			'post_status' => 'draft',
			'post_type' => 'page',
		] );

		wp_set_current_user( $author_id );

		$filter = function ( $post_id ) use ( $input_post_id, $remapped_post_id ) {
			return (int) $post_id === $input_post_id ? $remapped_post_id : $post_id;
		};
		add_filter( 'elementor/documents/get/post_id', $filter );

		try {
			// Act
			$result = $this->ability->execute( [ 'post_id' => $input_post_id ] );

			// Assert — cap check must use remapped main_id (B), not the input (A)
			$this->assertWPError( $result );
			$this->assertSame( 'rest_cannot_publish', $result->get_error_code() );
			$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
			$this->assertSame( 'draft', get_post_status( $input_post_id ) );
			$this->assertSame( 'draft', get_post_status( $remapped_post_id ) );
		} finally {
			remove_filter( 'elementor/documents/get/post_id', $filter );
		}
	}

	private function containers( int $count ): array {
		$containers = [];

		for ( $i = 0; $i < $count; $i++ ) {
			$containers[] = [
				'id' => sprintf( 'e%07d', $i + 1 ),
				'elType' => 'container',
				'settings' => [],
				'elements' => [],
				'isInner' => false,
			];
		}

		return $containers;
	}
}
