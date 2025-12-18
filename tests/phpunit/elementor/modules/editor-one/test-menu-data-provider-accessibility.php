<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Modules\EditorOne\Classes\Menu\Menu_Item_Interface;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Menu_Data_Provider_Accessibility extends Elementor_Test_Base {

	private Menu_Data_Provider $provider;

	public function setUp(): void {
		parent::setUp();
		$this->reset_menu_data_provider();
		$this->provider = Menu_Data_Provider::instance();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->reset_menu_data_provider();
	}

	public function test_is_item_accessible__returns_false_if_item_not_visible() {
		$item = $this->create_mock_menu_item( 'test-item', 'edit_posts', false );

		$result = $this->provider->is_item_accessible( $item );

		$this->assertFalse( $result );
	}

	public function test_is_item_accessible__returns_true_if_user_has_capability() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user->ID );

		$item = $this->create_mock_menu_item( 'test-item', 'edit_posts', true );

		$result = $this->provider->is_item_accessible( $item );

		$this->assertTrue( $result );

		wp_set_current_user( 0 );
		wp_delete_user( $editor_user->ID );
	}

	public function test_is_item_accessible__returns_false_if_user_lacks_capability() {
		$subscriber_user = $this->create_user_with_role( 'subscriber' );
		wp_set_current_user( $subscriber_user->ID );

		$item = $this->create_mock_menu_item( 'test-item', 'manage_options', true );

		$result = $this->provider->is_item_accessible( $item );

		$this->assertFalse( $result );

		wp_set_current_user( 0 );
		wp_delete_user( $subscriber_user->ID );
	}

	public function test_is_item_accessible__checks_edit_posts_capability() {
		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user->ID );

		$item = $this->create_mock_menu_item( 'test-item', 'edit_posts', true );

		$editor_result = $this->provider->is_item_accessible( $item );

		wp_set_current_user( 0 );
		wp_delete_user( $editor_user->ID );

		$contributor_user = $this->create_user_with_role( 'contributor' );
		wp_set_current_user( $contributor_user->ID );

		$contributor_result = $this->provider->is_item_accessible( $item );

		$this->assertTrue( $editor_result );
		$this->assertTrue( $contributor_result );

		wp_set_current_user( 0 );
		wp_delete_user( $contributor_user->ID );
	}

	public function test_is_item_accessible__checks_manage_options_capability() {
		$admin_user = $this->create_user_with_role( 'administrator' );
		wp_set_current_user( $admin_user->ID );

		$item = $this->create_mock_menu_item( 'test-item', 'manage_options', true );

		$admin_result = $this->provider->is_item_accessible( $item );

		wp_set_current_user( 0 );
		wp_delete_user( $admin_user->ID );

		$editor_user = $this->create_user_with_role( 'editor' );
		wp_set_current_user( $editor_user->ID );

		$editor_result = $this->provider->is_item_accessible( $item );

		$this->assertTrue( $admin_result );
		$this->assertFalse( $editor_result );

		wp_set_current_user( 0 );
		wp_delete_user( $editor_user->ID );
	}

	private function create_user_with_role( string $role ): \WP_User {
		$user_id = wp_insert_user( [
			'user_login' => 'test_user_' . uniqid(),
			'user_pass' => 'password',
			'user_email' => 'test_' . uniqid() . '@example.com',
			'role' => $role,
		] );

		if ( is_wp_error( $user_id ) ) {
			$this->fail( 'Failed to create test user: ' . $user_id->get_error_message() );
		}

		return new \WP_User( $user_id );
	}

	private function create_mock_menu_item( string $slug, string $capability, bool $is_visible ): Menu_Item_Interface {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_capability' )->willReturn( $capability );
		$item->method( 'is_visible' )->willReturn( $is_visible );
		$item->method( 'get_label' )->willReturn( ucfirst( $slug ) );
		$item->method( 'get_position' )->willReturn( 100 );
		$item->method( 'get_group_id' )->willReturn( 'test-group' );
		$item->method( 'get_parent_slug' )->willReturn( null );

		return $item;
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}

