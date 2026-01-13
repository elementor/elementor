<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Menu_Data_Provider extends Elementor_Test_Base {

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

	public function test_instance__returns_singleton() {
		$instance1 = Menu_Data_Provider::instance();
		$instance2 = Menu_Data_Provider::instance();

		$this->assertSame( $instance1, $instance2 );
	}

	public function test_register_level3_item__adds_item_to_level3() {
		$item = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$item->method( 'get_slug' )->willReturn( 'test-item' );
		$item->method( 'get_group_id' )->willReturn( 'test-group' );

		$this->provider->register_level3_item( $item );

		$level3_items = $this->provider->get_level3_items();
		$this->assertArrayHasKey( 'test-group', $level3_items );
		$this->assertArrayHasKey( 'test-item', $level3_items['test-group'] );
	}

	public function test_register_level4_item__adds_item_to_level4() {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( 'test-item' );
		$item->method( 'get_group_id' )->willReturn( 'test-group' );

		$this->provider->register_level4_item( $item );

		$level4_items = $this->provider->get_level4_items();
		$this->assertArrayHasKey( 'test-group', $level4_items );
		$this->assertArrayHasKey( 'test-item', $level4_items['test-group'] );
	}

	public function test_is_item_already_registered__returns_true_for_level3_item() {
		$item = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$item->method( 'get_slug' )->willReturn( 'existing-item' );
		$item->method( 'get_group_id' )->willReturn( 'test-group' );

		$this->provider->register_level3_item( $item );

		$this->assertTrue( $this->provider->is_item_already_registered( 'existing-item' ) );
	}

	public function test_is_item_already_registered__returns_true_for_level4_item() {
		$item = $this->createMock( Menu_Item_Interface::class );
		$item->method( 'get_slug' )->willReturn( 'existing-item' );
		$item->method( 'get_group_id' )->willReturn( 'test-group' );

		$this->provider->register_level4_item( $item );

		$this->assertTrue( $this->provider->is_item_already_registered( 'existing-item' ) );
	}

	public function test_is_item_already_registered__returns_false_for_non_existing_item() {
		$this->assertFalse( $this->provider->is_item_already_registered( 'non-existing' ) );
	}

	public function test_get_dynamic_page_slugs__filters_elementor_prefixed_slugs() {
		$item1 = $this->create_test_item( 'elementor-settings', 'test-group', true );
		$item2 = $this->create_test_item( 'e-custom-code', 'test-group', true );
		$item3 = $this->create_test_item( 'popup_templates', 'test-group', true );
		$item4 = $this->create_test_item( 'other-plugin-page', 'test-group', true );

		$this->provider->register_level3_item( $item1 );
		$this->provider->register_level3_item( $item2 );
		$this->provider->register_level3_item( $item3 );
		$this->provider->register_level3_item( $item4 );

		$slugs = $this->invoke_private_method( $this->provider, 'get_dynamic_page_slugs' );

		$this->assertContains( 'elementor-settings', $slugs );
		$this->assertContains( 'e-custom-code', $slugs );
		$this->assertContains( 'popup_templates', $slugs );
		$this->assertNotContains( 'other-plugin-page', $slugs );
	}

	public function test_get_dynamic_page_slugs__includes_level4_items() {
		$item = $this->create_test_item( 'elementor-custom-fonts', 'custom-group', false );

		$this->provider->register_level4_item( $item );

		$slugs = $this->invoke_private_method( $this->provider, 'get_dynamic_page_slugs' );

		$this->assertContains( 'elementor-custom-fonts', $slugs );
	}

	public function test_get_item_url__returns_admin_url_for_simple_slug() {
		$url = $this->invoke_private_method( $this->provider, 'get_item_url', [ 'elementor-settings' ] );

		$this->assertStringContainsString( 'admin.php?page=elementor-settings', $url );
	}

	public function test_get_item_url__returns_url_for_edit_php_slug() {
		$url = $this->invoke_private_method( $this->provider, 'get_item_url', [ 'edit.php?post_type=elementor_library' ] );

		$this->assertStringContainsString( 'edit.php?post_type=elementor_library', $url );
	}

	public function test_get_item_url__returns_url_as_is_for_http_url() {
		$full_url = 'https://example.com/custom-page';
		$url = $this->invoke_private_method( $this->provider, 'get_item_url', [ $full_url ] );

		$this->assertEquals( $full_url, $url );
	}

	public function test_get_item_url__handles_parent_slug_with_edit_php() {
		$url = $this->invoke_private_method( 
			$this->provider, 
			'get_item_url', 
			[ 'elementor_custom_fonts', 'edit.php?post_type=elementor_library' ] 
		);

		$this->assertStringContainsString( 'edit.php?post_type=elementor_library&page=elementor_custom_fonts', $url );
	}

	public function test_sort_items_by_priority__sorts_by_ascending_priority() {
		$items = [
			[ 'slug' => 'item3', 'priority' => 30 ],
			[ 'slug' => 'item1', 'priority' => 10 ],
			[ 'slug' => 'item2', 'priority' => 20 ],
		];

		$this->invoke_private_method( $this->provider, 'sort_items_by_priority', [ &$items ] );

		$this->assertEquals( 'item1', $items[0]['slug'] );
		$this->assertEquals( 'item2', $items[1]['slug'] );
		$this->assertEquals( 'item3', $items[2]['slug'] );
	}

	public function test_sort_items_by_priority__handles_missing_priority() {
		$items = [
			[ 'slug' => 'item2', 'priority' => 50 ],
			[ 'slug' => 'item1' ],
		];

		$this->invoke_private_method( $this->provider, 'sort_items_by_priority', [ &$items ] );

		$this->assertEquals( 'item2', $items[0]['slug'] );
		$this->assertEquals( 'item1', $items[1]['slug'] );
	}

	public function test_get_all_sidebar_page_slugs__includes_base_and_dynamic_slugs() {
		$item = $this->create_test_item( 'elementor-settings', 'test-group', true );
		$this->provider->register_level3_item( $item );

		$slugs = $this->provider->get_all_sidebar_page_slugs();

		$this->assertContains( 'elementor', $slugs );
		$this->assertContains( 'elementor-editor', $slugs );
		$this->assertContains( 'elementor-settings', $slugs );
	}

	public function test_get_all_sidebar_page_slugs__removes_duplicates() {
		$item1 = $this->create_test_item( 'elementor-settings', 'test-group', true );
		$item2 = $this->create_test_item( 'elementor-settings', 'test-group-2', true );

		$this->provider->register_level3_item( $item1 );
		$this->provider->register_level3_item( $item2 );

		$slugs = $this->provider->get_all_sidebar_page_slugs();
		$slug_counts = array_count_values( $slugs );

		$this->assertEquals( 1, $slug_counts['elementor-settings'] );
	}

	private function create_test_item( string $slug, string $group_id, bool $is_level3 ) {
		if ( $is_level3 ) {
			$item = $this->createMock( Menu_Item_Third_Level_Interface::class );
			$item->method( 'has_children' )->willReturn( false );
			$item->method( 'get_icon' )->willReturn( 'icon' );
		} else {
			$item = $this->createMock( Menu_Item_Interface::class );
		}

		$item->method( 'get_slug' )->willReturn( $slug );
		$item->method( 'get_group_id' )->willReturn( $group_id );
		$item->method( 'get_label' )->willReturn( ucfirst( $slug ) );
		$item->method( 'get_capability' )->willReturn( 'manage_options' );
		$item->method( 'get_position' )->willReturn( 100 );
		$item->method( 'is_visible' )->willReturn( true );
		$item->method( 'get_parent_slug' )->willReturn( '' );

		return $item;
	}

	private function invoke_private_method( $object, string $method_name, array $parameters = [] ) {
		$reflection = new \ReflectionClass( get_class( $object ) );
		$method = $reflection->getMethod( $method_name );
		$method->setAccessible( true );

		return $method->invokeArgs( $object, $parameters );
	}

	private function reset_menu_data_provider(): void {
		$reflection = new \ReflectionClass( Menu_Data_Provider::class );
		$instance_property = $reflection->getProperty( 'instance' );
		$instance_property->setAccessible( true );
		$instance_property->setValue( null, null );
	}
}

