<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
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
		$this->assertSame( 'forced_failure', $result->get_error_code() );
		$this->assertSame( 'draft', get_post_status( $post_id ) );
	}
}
