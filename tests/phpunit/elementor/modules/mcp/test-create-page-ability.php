<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\Mcp\Abilities\Create_Page_Ability;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'wp_register_ability' ) ) {
	function wp_register_ability( $id, $args ) {}
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Create_Page_Ability extends Elementor_Test_Base {

	private Create_Page_Ability $ability;
	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Create_Page_Ability();
		$this->original_documents = Plugin::$instance->documents;
	}

	public function tearDown(): void {
		Plugin::$instance->documents = $this->original_documents;
		parent::tearDown();
	}

	public function test_execute__returns_400_for_unsupported_post_type() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'nonexistent_type_xyz' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_type', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_user_cannot_create_posts() {
		// Arrange — subscriber has no create_pages cap
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'page' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_create', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_500_when_document_cannot_be_loaded() {
		// Arrange
		$this->act_as_admin();

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( null );
		Plugin::$instance->documents = $mock_docs;

		// Act — page post type exists and admin can create it
		$result = $this->ability->execute( [ 'post_type' => 'page' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'document_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::INTERNAL_SERVER_ERROR, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_post_data_on_success() {
		// Arrange
		$this->act_as_admin();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'get_edit_url' )->willReturn( 'https://example.com/edit/1' );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'page', 'title' => 'My Test Page' ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'id', $result );
		$this->assertArrayHasKey( 'edit_url', $result );
		$this->assertArrayHasKey( 'status', $result );
		$this->assertArrayHasKey( 'type', $result );
		$this->assertSame( 'page', $result['type'] );
		$this->assertSame( 'draft', $result['status'] );
	}

	public function test_execute__uses_default_title_when_not_provided() {
		// Arrange
		$this->act_as_admin();

		$captured_post_id = null;

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'get_edit_url' )->willReturn( 'https://example.com/edit/1' );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturnCallback( function ( $post_id ) use ( &$captured_post_id, $mock_document ) {
			$captured_post_id = $post_id;
			return $mock_document;
		} );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'page' ] );

		// Assert
		$this->assertIsArray( $result );
		$post = get_post( $captured_post_id );
		$this->assertSame( 'Elementor Draft', $post->post_title );
	}
}
