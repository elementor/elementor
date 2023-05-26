<?php
namespace Elementor\Testing\Includes;

use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Local extends Elementor_Test_Base {
	/**
	 * @var \Elementor\TemplateLibrary\Source_Local
	 */
	private $source;

	public function setUp() {
		parent::setUp();

		$this->source = Plugin::$instance->templates_manager->get_source( 'local' );
	}

	public function test_maybe_render_blank_state() {
		// Arrange - fake globals.
		global $post_type, $wp_list_table;

		$wp_list_table = _get_list_table( 'WP_Posts_List_Table' , array( 'screen' => 'edit-page' ) );
		$post_type = 'post';

		// Act.
		ob_start();
		$this->source->maybe_render_blank_state( 'bottom', [
			'cpt' => $post_type,
			'post_type' => $post_type,
		] );
		$output = ob_get_clean();

		// Assert
		$this->assertContains( 'elementor-template-library-add-new', $output );

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
}
