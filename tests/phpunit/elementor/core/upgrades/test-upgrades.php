<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrades;

use Elementor\Core\Base\Document;
use Elementor\Core\Upgrade\Manager;
use Elementor\Core\Upgrade\Updater;
use Elementor\Core\Upgrade\Upgrades;
use Elementor\Modules\Usage\Module;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\Elementor_Test_Module;

class Elementor_Test_Upgrades extends Elementor_Test_Base {

	public function test_v_2_7_0_rename_document_types_to_wp() {
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
		Upgrades::_v_2_7_0_rename_document_types_to_wp();

		// Assert again (wp_post, wp_page).
		$post_meta = $document_post->get_meta( Document::TYPE_META_KEY );
		$page_meta = $document_page->get_meta( Document::TYPE_META_KEY );

		$this->assertEquals( 'wp-post', $post_meta );
		$this->assertEquals( 'wp-page', $page_meta );
	}

	public function test_v_2_7_0_remove_old_usage_data() {
		/** @var Module $module */
		$module = Plugin::$instance->modules_manager->get_modules( 'usage' );

		$this->create_document_with_data();

		$this->assertNotEquals( 0, count($module->get_formatted_usage()) );

		// Run upgrade.
		Upgrades::_v_2_7_0_remove_old_usage_data();

		// Check there is no usage.
		$this->assertEquals( 0, count($module->get_formatted_usage()) );
	}

	public function test_v_2_7_0_recalc_usage_data() {
		// Create a post but delete the usage data.
		$this->test_v_2_7_0_remove_old_usage_data();

		$updater = $this->create_updater();

		// Run upgrade.
		Upgrades::_v_2_7_0_recalc_usage_data( $updater );

		/** @var Module $module */
		$module = Plugin::$instance->modules_manager->get_modules( 'usage' );

		// Check there usage.
		$this->assertEquals( 1, count($module->get_formatted_usage()) );
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

	/**
	 * @return Updater
	 */
	private function create_updater() {
		$upgrades_manager = new Manager();

		/** @var Updater $updater */
		$updater = $upgrades_manager->get_task_runner();

		$updater->set_current_item( [
			'iterate_num' => 1,
		] );

		return $updater;
	}

	private function create_document_with_data() {
		$document = $this->create_post();

		// Save document.
		$document->save( Elementor_Test_Module::$document_mock_default );
	}
}
