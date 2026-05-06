<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Core\Documents_Manager;
use Elementor\Modules\Mcp\Abilities\Update_Settings_Ability;
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
class Test_Update_Settings_Ability extends Elementor_Test_Base {

	private Update_Settings_Ability $ability;
	private Documents_Manager $original_documents;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Update_Settings_Ability();
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
		$result = $this->ability->execute( [ 'settings' => [ 'key' => 'value' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_id', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_settings_missing() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'post_id' => 1 ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_settings', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_404_when_document_not_found() {
		// Arrange
		$this->act_as_admin();

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( null );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => 999999, 'settings' => [] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'document_not_found', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_403_when_document_not_editable() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'foo' => 'bar' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_500_when_save_fails() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'save' )->willReturn( false );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'foo' => 'bar' ] ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'save_failed', $result->get_error_code() );
		$this->assertSame( \WP_Http::INTERNAL_SERVER_ERROR, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_success_on_save() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->method( 'save' )->willReturn( true );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'settings' => [ 'template' => 'elementor_canvas' ] ] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertTrue( $result['success'] );
		$this->assertSame( $post_id, $result['post_id'] );
	}

	public function test_execute__passes_settings_to_document_save() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();
		$settings = [ 'template' => 'elementor_canvas', 'hide_title' => 'yes' ];

		$mock_document = $this->createMock( \Elementor\Core\Base\Document::class );
		$mock_document->method( 'is_editable_by_current_user' )->willReturn( true );
		$mock_document->expects( $this->once() )
			->method( 'save' )
			->with( [ 'settings' => $settings ] )
			->willReturn( true );

		$mock_docs = $this->createMock( Documents_Manager::class );
		$mock_docs->method( 'get' )->willReturn( $mock_document );
		Plugin::$instance->documents = $mock_docs;

		// Act
		$this->ability->execute( [ 'post_id' => $post_id, 'settings' => $settings ] );
	}
}
