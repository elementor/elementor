<?php
namespace Elementor\Testing\Core\Upgrades;

use Elementor\Core\Base\Document;
use Elementor\Core\Upgrade\Upgrades;
use Elementor\Testing\Elementor_Test_Base;

class Elementor_Test_Upgrades extends Elementor_Test_Base {

	public function test_v_2_6_7_rename_document_types_to_wp() {
		// Create a post with post types (post, page).
		$document_post = $this->create_post( 'post' );
		$document_page = $this->create_post( 'page' );

		// Assert meta key elementor_template_type = (wp-post, wp-page).
		$post_meta = $document_post->get_meta( Document::TYPE_META_KEY );
		$page_meta = $document_page->get_meta( Document::TYPE_META_KEY );

		$this->assertEquals( 'wp-post', $post_meta );
		$this->assertEquals( 'wp-page', $page_meta );

		// Update meta without wp prefix.
		$document_post->update_meta( Document::TYPE_META_KEY, 'post' );
		$document_page->update_meta( Document::TYPE_META_KEY, 'page' );

		// Ensure the database has been updated.
		$post_meta = $document_post->get_meta( Document::TYPE_META_KEY );
		$page_meta = $document_page->get_meta( Document::TYPE_META_KEY );

		$this->assertEquals( 'post', $post_meta );
		$this->assertEquals( 'page', $page_meta );

		wp_cache_flush();

		// Run upgrade.
		Upgrades::_v_2_6_7_rename_document_types_to_wp();

		// Assert again (wp_post, wp_page).
		$post_meta = $document_post->get_meta( Document::TYPE_META_KEY );
		$page_meta = $document_page->get_meta( Document::TYPE_META_KEY );

		$this->assertEquals( 'wp-post', $post_meta );
		$this->assertEquals( 'wp-page', $page_meta );
	}

	/**
	 * @param string $post_type
	 *
	 * @return Document|false
	 */
	private function create_post( $post_type = 'post' ) {
		$admin = $this->factory()->create_and_get_administrator_user();

		wp_set_current_user( $admin->ID );

		$post = $this->factory()->create_and_get_custom_post( [
			'post_author' => $admin->ID,
			'post_type' => $post_type,
		] );

		$document = self::elementor()->documents->get( $post->ID );
		$document->save_template_type();

		return $document;
	}
}