<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Kits;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;

class Test_Manager extends Elementor_Test_Base {

	public function test_get_active_id() {
		// Test deleted kit.
		$test_description = 'active id should return a new kit id after delete kit';
		$active_id = Plugin::$instance->kits_manager->get_active_id();
		wp_delete_post( $active_id, true );
		$active_id_after_delete = Plugin::$instance->kits_manager->get_active_id();
		$this->assertNotEquals( $active_id, $active_id_after_delete, $test_description );

		// Test trashed kit.
		$test_description = 'active id should return a new kit id after trash kit';
		$active_id = Plugin::$instance->kits_manager->get_active_id();
		wp_trash_post( $active_id );
		$active_id_after_trash = Plugin::$instance->kits_manager->get_active_id();
		$this->assertNotEquals( $active_id, $active_id_after_trash, $test_description );

		// Test unpublished kit.
		$test_description = 'active id should return a new kit id after trash kit';
		$active_id = Plugin::$instance->kits_manager->get_active_id();
		wp_trash_post( $active_id );
		$active_id_after_trash = Plugin::$instance->kits_manager->get_active_id();
		$this->assertNotEquals( $active_id, $active_id_after_trash, $test_description );

		// Test invalid kit.
		$test_description = 'active id should return a new kit id after for invalid kit';
		$active_id = Plugin::$instance->kits_manager->get_active_id();
		update_post_meta( $active_id, Kit::TYPE_META_KEY, 'invalid-type' );
		// Invalidate cache.
		Plugin::$instance->documents->get( $active_id, false );
		$active_id_after_invalidate = Plugin::$instance->kits_manager->get_active_id();
		$this->assertNotEquals( $active_id, $active_id_after_invalidate, $test_description );
	}

	public function test_when_updating_blogname_or_blogdescription_option_it_should_update_the_kit() {
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		$custom_colors_array = [
			[
				'_id' => 'test-id',
				'title' => 'test',
				'color' => '#000000',
			],
		];

		$kit->update_settings(['custom_colors' => $custom_colors_array]);

		// Make sure that it fetched again from the DB and not from the cache.
		$kit = Plugin::$instance->documents->get( $kit->get_id(), false );

		$name = get_option( 'blogname' );
		$description = get_option( 'blogdescription' );

		$expected_name = 'Test name';
		$expected_description = 'Test description';

		$this->assertNotEquals( $name, $expected_name );
		$this->assertNotEquals( $description, $expected_description );

		update_option( 'blogname', $expected_name );
		update_option( 'blogdescription', $expected_description );

		$this->assertEquals( $expected_name, $kit->get_settings( 'site_name' ) );
		$this->assertEquals( $expected_description, $kit->get_settings( 'site_description' ) );
		$this->assertEquals( $custom_colors_array, $kit->get_settings( 'custom_colors' ), 'It should not remove the old kit settings.' );

		update_option( 'blogname', $name );
		update_option( 'blogdescription', $description );
	}
}
