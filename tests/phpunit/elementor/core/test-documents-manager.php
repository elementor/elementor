<?php
namespace Elementor\Tests\Phpunit\Elementor\Core;

use Elementor\Core\Base\Document;
use Elementor\Core\DocumentTypes\Page as WP_Page;
use Elementor\Core\DocumentTypes\Post as WP_Post;
use Elementor\Modules\Library\Documents\Page as Theme_Page;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Documents_Manager extends Elementor_Test_Base {
	public function test_ajax_get_document_config__set_id_build_with_elementor() {
		// Arrange
		$this->act_as_admin();

		Plugin::$instance->editor->set_edit_mode( true );

		$post = $this->factory()->create_and_get_custom_post( [ 'type' => 'post' ] );

		// Act
		Plugin::$instance->documents->ajax_get_document_config( [ 'id' => $post->ID ] );

		// Assert
		$this->assertEquals(
			'builder',
			get_post_meta( $post->ID, Document::BUILT_WITH_ELEMENTOR_META_KEY, true )
		);
	}

	public function test_get_new_post_url() {
		$new_post_url =  Plugin::$instance->documents->get_create_new_post_url();

		$this->assertContains( 'edit.php?action=elementor_new_post&post_type=', $new_post_url );
		$this->assertContains( '_wpnonce=', $new_post_url );
	}

	public function test_get__empty_post_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$document = Plugin::$instance->documents->get( '', false );

		// Assert.
		$this->assertFalse( $document );
	}

	public function test_get__non_existing_post_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$document = Plugin::$instance->documents->get( 999999999, false );

		// Assert.
		$this->assertFalse( $document );
	}

	public function test_get__from_cache() {
		// Arrange.
		$this->act_as_admin();

		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
		] );

		// Act.
		$cached_document = Plugin::$instance->documents->get( $post_id );

		// Assert.
		$this->assertSame( $cached_document, Plugin::$instance->documents->get( $post_id ) );
	}

	public function test_get__non_elementor_page() {
		// Arrange.
		$this->act_as_admin();

		$post_id = $this->factory()->post->create( [
			'post_type' => 'page',
		] );

		// Act.
		$document = Plugin::$instance->documents->get( $post_id, false );

		// Assert.
		$this->assertInstanceOf( WP_Page::class, $document );
	}

	public function test_get__non_elementor_post() {
		// Arrange.
		$this->act_as_admin();

		$post_id = $this->factory()->post->create( [
			'post_type' => 'post',
		] );

		// Act.
		$document = Plugin::$instance->documents->get( $post_id, false );

		// Assert.
		$this->assertInstanceOf( WP_Post::class, $document );
	}

	public function test_get__elementor_page() {
		// Arrange.
		$this->act_as_admin();

		$post_id = $this->factory()->post->create( [
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::BUILT_WITH_ELEMENTOR_META_KEY => true,
				Document::TYPE_META_KEY => 'page',
			],
		] );

		// Act.
		$document = Plugin::$instance->documents->get( $post_id, false );

		// Assert.
		$this->assertInstanceOf( Theme_Page::class, $document );
	}

	public function test_get__elementor_page__auto_save() {
		// Arrange.
		$this->act_as_admin();

		$post = $this->factory()->post->create_and_get( [
			'post_type' => Source_Local::CPT,
			'meta_input' => [
				Document::BUILT_WITH_ELEMENTOR_META_KEY => true,
				Document::TYPE_META_KEY => 'page',
			],
		] );

		// Assert.
		$action = function($post_id) {
			$document = Plugin::$instance->documents->get( $post_id, false );

			$this->assertInstanceOf( Theme_Page::class, $document );
		};

		add_action('save_post', $action );

		// Act.
		$autosave_id = wp_create_post_autosave( [
			'post_ID' => $post->ID,
			'post_type' => $post->post_type,
			'post_title' => $post->post_title,
			'post_excerpt' => $post->post_excerpt,
			'post_content' => '<!-- Created With Elementor -->',
			'post_modified' => current_time( 'mysql' ),
		] );

		// Cleanup.
		remove_action('save_post', $action );
	}
}
