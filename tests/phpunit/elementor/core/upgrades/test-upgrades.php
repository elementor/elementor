<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrades;

use Elementor\Core\Base\Document;
use Elementor\Core\Upgrade\Manager;
use Elementor\Core\Upgrade\Updater;
use Elementor\Core\Upgrade\Upgrades;
use Elementor\Modules\Usage\Module;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Tests\Phpunit\Elementor\Modules\Usage\Test_Module;

class Test_Upgrades extends Elementor_Test_Base {

	public function test_v_2_7_0_rename_document_types_to_wp() {
		$this->markTestSkipped();
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
		$updater = $this->create_updater();
		Upgrades::_v_2_7_0_rename_document_types_to_wp( $updater );

		// Assert again (wp_post, wp_page).
		$post_meta = $document_post->get_meta( Document::TYPE_META_KEY );
		$page_meta = $document_page->get_meta( Document::TYPE_META_KEY );

		$this->assertEquals( 'wp-post', $post_meta );
		$this->assertEquals( 'wp-page', $page_meta );
	}

	public function test_v_2_7_1_remove_old_usage_data() {
		$old_usage_option_name = 'elementor_elements_usage';
		$old_usage_meta_key = '_elementor_elements_usage';

		add_option( $old_usage_option_name, 'test' );
		$document = $this->create_post();
		$document->update_main_meta( $old_usage_meta_key, 'test' );

		$this->assertEquals( 'test', get_option( $old_usage_option_name ) );
		$this->assertEquals( 'test', $document->get_main_meta( $old_usage_meta_key ) );

		// Run upgrade.
		Upgrades::_v_2_7_1_remove_old_usage_data();

		$this->assertNotEquals( 'test', get_option( $old_usage_option_name ) );
		$this->assertNotEquals( 'test', $document->get_main_meta( $old_usage_meta_key ) );
	}

	public function test_v_2_7_1_recalc_usage_data() {
		$posts_count = 10;
		$query_limit = 3;
		$expected_iterations = (int) ceil( $posts_count / $query_limit );
		$upgrade_iterations = 1;

		// Create posts.
		for ( $i = 0; $i < $posts_count; $i++ ) {
			$this->create_document_with_data();
		}

		$updater = $this->create_updater();
		$updater->set_limit( $query_limit );

		// Run upgrade.
		while ( Upgrades::_v_2_7_1_recalc_usage_data( $updater ) ) {
			$upgrade_iterations++;

			$updater->set_current_item( [
				'iterate_num' => $upgrade_iterations,
			] );

			// Avoid infinity loop.
			if ( $upgrade_iterations > $posts_count ) {
				break;
			}
		}

		$this->assertEquals( $expected_iterations, $upgrade_iterations );

		/** @var Module $module */
		$module = Plugin::$instance->modules_manager->get_modules( 'usage' );
		$usage = get_option( $module::OPTION_NAME, [] );

		// Check there usage.
		$this->assertEquals( $posts_count, $usage['wp-post']['button']['count'] );
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
		$document->save( Test_Module::$document_mock_default );
	}
}
