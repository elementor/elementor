<?php
namespace Elementor\Testing\Includes;

use Elementor\Core\Documents_Manager;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Testing\Includes\Mocks\Extended_Library_Document;
use Elementor\Testing\Includes\Mocks\Non_Library_Document;
use ElementorEditorTesting\Elementor_Test_Base;

require_once __DIR__ . '/mocks/extended-library-document.php';
require_once __DIR__ . '/mocks/non-library-document.php';

class Test_Local extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Source_Local
	 */
	private $source;

	public function setUp(): void {
		parent::setUp();

		$this->source = $this
			->getMockBuilder( Source_Local::class )
			->setMethods( [ 'is_wp_cli' ] )
			->getMock();
	}

	public function test_maybe_render_blank_state() {
		// Arrange - fake globals.
		global $post_type, $wp_list_table;

		$wp_list_table = _get_list_table( 'WP_Posts_List_Table' , [ 'screen' => 'edit-page' ] );
		$post_type = 'post';

		// Act.
		ob_start();
		$this->source->maybe_render_blank_state( 'bottom', [
			'cpt' => $post_type,
			'post_type' => $post_type,
		] );
		$output = ob_get_clean();

		// Assert
		$this->assertStringContainsString( 'elementor-template-library-add-new', $output );

		// Clean - globals.
		$post_type = null;
		$wp_list_table = null;
	}

	public function test_save_item__subscribers_cannot_create_template() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$result = $this->source->save_item( [
			'title' => 'test-title',
			'type' => 'page',
			'content' => [],
			'status' => 'publish',
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( 'save_error', $result->get_error_code() );
	}

	public function test_save_item__contributors_cannot_publish_templates() {
		// Arrange
		$this->act_as( 'contributor' );

		// Act
		$document_id = $this->source->save_item( [
			'title' => 'test-title',
			'type' => 'page',
			'content' => [],
			'status' => 'publish',
		] );

		// Assert
		$document = Plugin::$instance->documents->get( $document_id );

		$this->assertEquals( 'pending', $document->get_post()->post_status );
	}

	public function test_save_item__contributors_cannot_create_pages() {
		// Arrange
		$this->act_as( 'contributor' );

		// Act
		$result = $this->source->save_item( [
			'title' => 'test-title',
			'type' => 'wp-page',
			'content' => [],
		] );

		// Assert
		$this->assertWPError( $result );
		$this->assertEquals( 'invalid_template_type', $result->get_error_code() );
	}

	public function test_save_item__editors_can_create_templates() {
		// Arrange
		$this->act_as_editor();

		// Act
		$document_id = $this->source->save_item( [
			'title' => 'test-title',
			'type' => 'page',
			'content' => [],
		] );

		// Assert
		$document = Plugin::$instance->documents->get( $document_id );

		$this->assertEquals( 'publish', $document->get_post()->post_status );
	}

	public function test_save_item__any_library_document_should_be_supported() {
		// Arrange
		$this->act_as_editor();

		$original_documents_manager = Plugin::$instance->documents;
		Plugin::$instance->documents = new Documents_Manager();

		Plugin::$instance->documents->register_document_type(
			Extended_Library_Document::get_type(),
			Extended_Library_Document::class
		);

		// Act
		$document_id = $this->source->save_item( [
			'title' => 'test-title',
			'type' => Extended_Library_Document::get_type(),
			'content' => [],
		] );

		// Assert
		$document = Plugin::$instance->documents->get( $document_id );

		$this->assertEquals( 'publish', $document->get_post()->post_status );

		// Cleanup
		Plugin::$instance->documents = $original_documents_manager;
	}

	public function test_save_item__non_library_document_should_not_be_supported() {
		// Arrange
		$this->act_as_editor();

		$original_documents_manager = Plugin::$instance->documents;
		Plugin::$instance->documents = new Documents_Manager();

		Plugin::$instance->documents->register_document_type(
			Non_Library_Document::get_type(),
			Non_Library_Document::class
		);

		// Act
		$result = $this->source->save_item( [
			'title' => 'test-title',
			'type' => Non_Library_Document::get_type(),
			'content' => [],
		] );

		// Assert
		$this->assertWPError( $result );

		// Cleanup
		Plugin::$instance->documents = $original_documents_manager;
	}

	public function test_save_item__should_skip_template_type_check_in_cli() {
		// Arrange
		$this->act_as_admin();

		$this->source
			->method( 'is_wp_cli' )
			->willReturn( true );

		// Act
		$document_id = $this->source->save_item( [
			'title' => 'test-title',
			'type' => 'wp-page',
			'content' => [],
		] );

		// Assert
		$document = Plugin::$instance->documents->get( $document_id );

		$this->assertEquals( 'publish', $document->get_post()->post_status );
	}
}
