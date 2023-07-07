<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Upgrade;

use Elementor\Core\Base\Document;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Settings\Manager as Settings_Manager;
use Elementor\Core\Upgrade\Upgrades;
use Elementor\Icons_Manager;
use Elementor\Modules\Usage\Module;
use Elementor\Plugin;
use Elementor\Testing\Core\Base\Mock\Mock_Upgrades_Manager;
use Elementor\Tests\Phpunit\Test_Upgrades_Trait;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Upgrades extends Elementor_Test_Base {

	use Test_Upgrades_Trait;

	public function test_on_each_on_each_version_ensure_usage_recalculation() {
		// Arrange.
		require_once __DIR__ . '/../base/mock/mock-upgrades-manager.php';

		/**
		 * @var Module $usage_module
		 */
		$usage_module = Module::instance();

		// Set current version for mock upgrades manager.
		update_option( Mock_Upgrades_Manager::OPTION_CURRENT_VERSION_NAME, '0.0.0' );

		// Set the new version.
		update_option( Mock_Upgrades_Manager::OPTION_NEW_VERSION_NAME, '0.0.1' );

		// Create document with button element.
		$this->factory()->documents->publish_and_get();

		// Delete current elements usage.
		update_option( Module::OPTION_NAME, [] );

		// Act.
		$upgrades_manager = new Mock_Upgrades_Manager();
		$upgrades_manager->mock_continue_run();
		$usage = $usage_module->get_formatted_usage();

		// Assert.
		$this->assertEquals( 1, $usage['wp-post']['elements']['Button'] );

		// Arrange
		$this->factory()->documents->publish_and_get();

		// Delete current elements usage.
		update_option( Module::OPTION_NAME, [] );

		// Set the new version.
		update_option( Mock_Upgrades_Manager::OPTION_NEW_VERSION_NAME, '0.0.2' );

		// Act.
		$upgrades_manager = new Mock_Upgrades_Manager();
		$upgrades_manager->mock_continue_run();
		$usage = $usage_module->get_formatted_usage();

		// Assert - Ensure next upgrade also do recalculation.
		$this->assertEquals( 2, $usage['wp-post']['elements']['Button'] );
	}

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
		$expected_iterations = (int) ceil( $posts_count / $this->query_limit );
		$upgrade_iterations = 1;

		// Create posts.
		for ( $i = 0; $i < $posts_count; $i++ ) {
			$this->create_document_with_data();
		}

		$updater = $this->create_updater();
		$updater->set_limit( $this->query_limit );

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

	public function test_v_3_0_0_move_general_settings_to_kit() {
		$updater = $this->create_updater();

		// Prepare.
		$generic_font = 'some-generic-font';
		$lightbox_color = '#e1e3ef';
		$container_width = '1000';
		$space_between_widgets = '0'; // Ensure that value 0 is also upgraded (#12298).
		$viewport_lg = '900';
		$viewport_md = '800';

		$general_settings = [
			'default_generic_fonts' => $generic_font,
			'lightbox_color' => $lightbox_color,
			'container_width' => $container_width,
		];

		update_option( '_elementor_general_settings', $general_settings );

		// Take the `space_between_widgets` from the option due to a bug on E < 3.0.0 that the value `0` is stored separated.
		update_option( 'elementor_space_between_widgets', $space_between_widgets );
		update_option( 'elementor_viewport_lg', $viewport_lg );
		update_option( 'elementor_viewport_md', $viewport_md );

		$user_id = $this->factory()->create_and_get_administrator_user()->ID;
		wp_set_current_user( $user_id );

		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$kit = Plugin::$instance->documents->get( $kit_id );

		// Create revisions.
		$expected_iterations = (int) ceil( $this->revisions_count / $this->query_limit );
		$upgrade_iterations = 1;

		for ( $i = 0; $i < $this->revisions_count; $i++ ) {
			$kit->save( [
				'elements' => [],
			] );
		}

		// Ensure the testable values are not default values of the kit.
		$kit_generic_font_before = $kit->get_settings( 'default_generic_fonts' );
		$kit_lightbox_color_before = $kit->get_settings( 'lightbox_color' );
		$kit_container_width_before = $kit->get_settings( 'container_width' );
		$kit_space_between_widgets_before = $kit->get_settings( 'space_between_widgets' );
		$kit_viewport_md_before = $kit->get_settings( 'viewport_md' );

		$this->assertNotEquals( $generic_font, $kit_generic_font_before );
		$this->assertNotEquals( $lightbox_color, $kit_lightbox_color_before );
		$this->assertNotEquals( $container_width, $kit_container_width_before );
		$this->assertNotEquals( $space_between_widgets, $kit_space_between_widgets_before );
		$this->assertNotEquals( $viewport_md, $kit_viewport_md_before );

		$updater->set_limit( $this->query_limit );

		// Run upgrade.
		while ( Upgrades::_v_3_0_0_move_general_settings_to_kit( $updater ) ) {
			$upgrade_iterations++;

			$updater->set_current_item( [
				'iterate_num' => $upgrade_iterations,
			] );

			// Avoid infinity loop.
			if ( $upgrade_iterations > $this->revisions_count ) {
				break;
			}
		}

		// Assert iterations.
		$this->assertEquals( $expected_iterations, $upgrade_iterations );

		// Refresh kit.
		$kit = Plugin::$instance->documents->get( $kit_id, false );

		// Assert kit upgraded.
		$kit_generic_font_after = $kit->get_settings( 'default_generic_fonts' );
		$kit_lightbox_color_after = $kit->get_settings( 'lightbox_color' );
		$kit_container_width_after = $kit->get_settings( 'container_width' );
		$kit_space_between_widgets_after = $kit->get_settings( 'space_between_widgets' );
		$kit_viewport_md_after = $kit->get_settings( 'viewport_md' );

		$this->assertEquals( $generic_font, $kit_generic_font_after );
		$this->assertEquals( $lightbox_color, $kit_lightbox_color_after );
		$this->assertEquals( $container_width, $kit_container_width_after['size'] );
		$this->assertEquals( $space_between_widgets, $kit_space_between_widgets_after['size'] );
		$this->assertEquals( $viewport_md, $kit_viewport_md_after );

		// Assert revisions upgraded.

		$revisions_ids = wp_get_post_revisions( $kit_id, [
			'fields' => 'ids',
		] );

		foreach ( $revisions_ids as $revision_id ) {
			$revision = Plugin::$instance->documents->get( $revision_id, false );

			$revision_generic_font_after = $revision->get_settings( 'default_generic_fonts' );
			$revision_lightbox_color_after = $revision->get_settings( 'lightbox_color' );

			$this->assertEquals( $generic_font, $revision_generic_font_after );
			$this->assertEquals( $lightbox_color, $revision_lightbox_color_after );
		}
	}

	public function test_v_3_1_0_move_optimized_dom_output_to_experiments() {
		add_option( 'elementor_optimized_dom_output', 'disabled' );

		$is_old_feature_active = Plugin::$instance->experiments->is_feature_active( 'e_dom_optimization' );

		Upgrades::v_3_1_0_move_optimized_dom_output_to_experiments();

		$experiments = new Experiments_Manager();

		$this->assertTrue( $is_old_feature_active );

		$this->assertFalse( $experiments->is_feature_active( 'e_dom_optimization' ) );
	}

	public function test_v_3_2_0_migrate_breakpoints_to_new_system() {
		$updater = $this->create_updater();

		// Set admin user so the kit will be able to be edited.
		$user_id = $this->factory()->create_and_get_administrator_user()->ID;
		wp_set_current_user( $user_id );

		$kit_id = Plugin::$instance->kits_manager->get_active_id();
		$kit = Plugin::$instance->documents->get( $kit_id );

		// Set a custom value for 'viewport_md' before running the upgrade, to test the migration in case the user has
		// a saved custom breakpoint value.
		$kit_settings = $kit->get_settings();
		$kit_settings['viewport_md'] = 600;

		$page_settings_manager = Settings_Manager::get_settings_managers( 'page' );
		$page_settings_manager->save_settings( $kit_settings, $kit_id );

		// Refresh kit after update.
		$kit = Plugin::$instance->documents->get( $kit_id, false );

		// Create revisions.
		$expected_iterations = (int) ceil( $this->revisions_count / $this->query_limit );
		$upgrade_iterations = 1;

		for ( $i = 0; $i < $this->revisions_count; $i++ ) {
			$kit->save( [
				'elements' => [],
			] );
		}

		$updater->set_limit( $this->query_limit );

		// Run upgrade.
		while ( Upgrades::_v_3_2_0_migrate_breakpoints_to_new_system( $updater ) ) {
			$upgrade_iterations++;

			$updater->set_current_item( [
				'iterate_num' => $upgrade_iterations,
			] );

			// Avoid infinity loop.
			if ( $upgrade_iterations > $this->revisions_count ) {
				break;
			}
		}

		// Assert iterations.
		$this->assertEquals( $expected_iterations, $upgrade_iterations );

		// Refresh kit.
		$kit = Plugin::$instance->documents->get( $kit_id, false );
		$kit_settings = $kit->get_settings();

		$this->run_breakpoint_assertions( $kit_settings );

		// Assert revisions upgraded.
		$revisions_ids = wp_get_post_revisions( $kit_id, [
			'fields' => 'ids',
		] );

		foreach ( $revisions_ids as $revision_id ) {
			$revision = Plugin::$instance->documents->get( $revision_id, false );
			$revision_settings = $revision->get_settings();

			$this->run_breakpoint_assertions( $revision_settings );
		}
	}

	public function test_v_3_4_8_fix_font_awesome_default_value_from_1_to_yes() {
		// Test if 'Upgrades::fix_font_awesome_default_value_from_1_to_yes' sets `Icons_Manager::LOAD_FA4_SHIM_OPTION_KEY` value to 'yes'.
		// Arrange - Set value to '1' in DB.
		update_option( Icons_Manager::LOAD_FA4_SHIM_OPTION_KEY, '1' );

		// Act.
		Upgrades::_v_3_4_8_fix_font_awesome_default_value_from_1_to_yes();

		// Assert.
		$this->assertEquals( 'yes', get_option( Icons_Manager::LOAD_FA4_SHIM_OPTION_KEY ) );
	}

	private function run_breakpoint_assertions( $settings ) {
		// Mobile.
		$this->assertEquals( $settings['viewport_md'] - 1, $settings['viewport_mobile'] );

		// Tablet - Check the case where there is no custom breakpoint saved, so the value is empty.
		$expected_value = '' !== $settings['viewport_lg'] ? $settings['viewport_lg'] - 1 : $settings['viewport_lg'];
		$actual_value = $settings['viewport_tablet'];

		$this->assertEquals( $expected_value, $actual_value );
	}

	public function test_v_3_8_0_fix_php8_image_custom_size() {
		// Arrange
		$attachment_id = $this->create_image();

		// Act
		$image_meta = wp_get_attachment_metadata( $attachment_id );

		$image_path = 'elementor/thumbs/mock-image.png';
		$attachment_mine_type = get_post_mime_type( $attachment_id );

		$image_meta['sizes']['elementor_custom_150x150'] = [
			'file' => $image_path,
			'width' => '150',
			'height' => '150',
			'mime-type' => $attachment_mine_type,
		];

		$image_meta['sizes']['elementor_custom_100x'] = [
			'file' => $image_path,
			'width' => '100',
			'height' => '',
			'mime-type' => $attachment_mine_type,
		];

		$image_meta['sizes']['elementor_custom_x200'] = [
			'file' => $image_path,
			'width' => '',
			'height' => '200',
			'mime-type' => $attachment_mine_type,
		];

		wp_update_attachment_metadata( $attachment_id, $image_meta );

		\Elementor\Core\Upgrade\Upgrades::_v_3_8_0_fix_php8_image_custom_size();

		// Assert
		$new_metadata = wp_get_attachment_metadata( $attachment_id );

		$this->assertSame( [
			'file' => $image_path,
			'width' => 150,
			'height' => 150,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_150x150'] );

		$this->assertSame( [
			'file' => $image_path,
			'width' => 100,
			'height' => 0,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_100x'] );

		$this->assertSame( [
			'file' => $image_path,
			'width' => 0,
			'height' => 200,
			'mime-type' => 'image/png',
		], $new_metadata['sizes']['elementor_custom_x200'] );

		// Cleanup
		$this->delete_image( $attachment_id );
	}

	private function create_image() {
		$attachment_id = $this->_make_attachment( [
			'file' => __DIR__ . '/../../../resources/mock-image.png',
			'url' => 'https://test.local/image.png',
		] );

		$image_meta = wp_get_attachment_metadata( $attachment_id );

		$image_meta['sizes']['test_size'] = [
			'file' => 'test-image.png',
			'width' => 300,
			'height' => 300,
			'mime-type' => 'image/png',
		];

		wp_update_attachment_metadata( $attachment_id, $image_meta );

		return $attachment_id;
	}

	private function delete_image( $attachment_id ) {
		wp_delete_attachment( $attachment_id, true );
	}
}
