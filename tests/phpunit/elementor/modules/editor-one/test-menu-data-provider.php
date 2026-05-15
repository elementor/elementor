<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\EditorOne;

use Elementor\Modules\EditorOne\Classes\Menu_Data_Provider;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_Third_Level_Interface;
use Elementor\Core\Admin\EditorOneMenu\Interfaces\Menu_Item_With_Custom_Url_Interface;
use Elementor\Modules\EditorOne\Classes\Menu_Config;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Menu_Data_Provider extends Elementor_Test_Base {

	private Menu_Data_Provider $provider;
	private $original_plugin_app;

	public function setUp(): void {
		parent::setUp();
		$this->original_plugin_app = \Elementor\Plugin::$instance->app ?? null;
		$this->reset_menu_data_provider();
		$this->provider = Menu_Data_Provider::instance();
	}

	public function tearDown(): void {
		parent::tearDown();
		\Elementor\Plugin::$instance->app = $this->original_plugin_app;
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

	public function test_get_third_level_data__uses_custom_url_for_custom_item() {
		$this->set_admin_user();
		$custom_url = 'https://example.com/custom';
		$item = new Test_Custom_Url_Menu_Item(
			'custom-item',
			Menu_Config::EDITOR_GROUP_ID,
			$custom_url,
			false,
			'Custom Item'
		);

		$this->provider->register_level3_item( $item );

		$data = $this->provider->get_third_level_data( Menu_Data_Provider::THIRD_LEVEL_EDITOR_FLYOUT );

		$this->assertCount( 1, $data['items'] );
		$this->assertEquals( $custom_url, $data['items'][0]['url'] );
	}

	public function test_get_third_level_data__expands_third_party_children() {
		$this->set_admin_user();
		$parent = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$parent->method( 'get_slug' )->willReturn( 'third-party-parent' );
		$parent->method( 'get_group_id' )->willReturn( Menu_Config::THIRD_PARTY_GROUP_ID );
		$parent->method( 'get_label' )->willReturn( 'Third Party' );
		$parent->method( 'get_capability' )->willReturn( 'manage_options' );
		$parent->method( 'get_position' )->willReturn( 10 );
		$parent->method( 'is_visible' )->willReturn( true );
		$parent->method( 'get_parent_slug' )->willReturn( '' );
		$parent->method( 'get_icon' )->willReturn( 'extension' );
		$parent->method( 'has_children' )->willReturn( true );

		$child1 = $this->create_test_item( 'third-party-child-one', Menu_Config::THIRD_PARTY_GROUP_ID, false );
		$child2 = $this->create_test_item( 'third-party-child-two', Menu_Config::THIRD_PARTY_GROUP_ID, false );

		$this->provider->register_level3_item( $parent );
		$this->provider->register_level4_item( $child1 );
		$this->provider->register_level4_item( $child2 );

		$data = $this->provider->get_third_level_data( Menu_Data_Provider::THIRD_LEVEL_FLYOUT_MENU );
		$slugs = array_column( $data['items'], 'slug' );

		$this->assertNotContains( 'third-party-parent', $slugs );
		$this->assertContains( 'third-party-child-one', $slugs );
		$this->assertContains( 'third-party-child-two', $slugs );

		$first_item = $data['items'][0];
		$second_item = $data['items'][1];

		$this->assertTrue( $first_item['has_divider_before'] );
		$this->assertFalse( $second_item['has_divider_before'] );
		$this->assertSame( '', $first_item['group_id'] );
	}

	public function test_get_theme_builder_url__adds_return_to_only_when_url_has_hash() {
		$_SERVER['REQUEST_URI'] = '/wp-admin/admin.php?page=elementor-settings';

		$pro_url = admin_url( 'admin.php?page=elementor-app' ) . '#/site-editor';

		\Elementor\Plugin::$instance->app = new class( $pro_url ) {
			private string $menu_url;

			public function __construct( string $menu_url ) {
				$this->menu_url = $menu_url;
			}

			public function get_settings( string $key ) {
				return 'menu_url' === $key ? $this->menu_url : null;
			}
		};

		$url = $this->provider->get_theme_builder_url();

		$this->assertStringContainsString( '#/site-editor', $url );
		$this->assertStringContainsString( 'return_to=', $url );
	}

	public function test_get_theme_builder_url__does_not_add_return_to_when_url_has_no_hash() {
		$_SERVER['REQUEST_URI'] = '/wp-admin/admin.php?page=elementor-settings';

		$pro_url = admin_url( 'admin.php?page=elementor-app' );

		\Elementor\Plugin::$instance->app = new class( $pro_url ) {
			private string $menu_url;

			public function __construct( string $menu_url ) {
				$this->menu_url = $menu_url;
			}

			public function get_settings( string $key ) {
				return 'menu_url' === $key ? $this->menu_url : null;
			}
		};

		$url = $this->provider->get_theme_builder_url();

		$this->assertSame( $pro_url, $url );
		$this->assertStringNotContainsString( 'return_to=', $url );
	}

	public function test_get_third_level_data__parent_uses_first_child_custom_url() {
		$this->set_admin_user();
		
		$parent = $this->createMock( Menu_Item_Third_Level_Interface::class );
		$parent->method( 'get_slug' )->willReturn( 'elementor-templates' );
		$parent->method( 'get_group_id' )->willReturn( Menu_Config::TEMPLATES_GROUP_ID );
		$parent->method( 'get_label' )->willReturn( 'Templates' );
		$parent->method( 'get_capability' )->willReturn( 'edit_posts' );
		$parent->method( 'get_position' )->willReturn( 60 );
		$parent->method( 'is_visible' )->willReturn( true );
		$parent->method( 'get_parent_slug' )->willReturn( Menu_Config::ELEMENTOR_MENU_SLUG );
		$parent->method( 'get_icon' )->willReturn( 'folder' );
		$parent->method( 'has_children' )->willReturn( true );

		$child_custom_url = admin_url( 'edit.php?post_type=elementor_library&tabs_group=library' );
		$child = new Test_Custom_Url_Menu_Item(
			'edit.php?post_type=elementor_library',
			Menu_Config::TEMPLATES_GROUP_ID,
			$child_custom_url,
			false,
			'Saved Templates',
			10
		);

		$this->provider->register_level3_item( $parent );
		$this->provider->register_level4_item( $child );

		$data = $this->provider->get_third_level_data( Menu_Data_Provider::THIRD_LEVEL_EDITOR_FLYOUT );

		$parent_item = array_values( array_filter( $data['items'], function( $item ) {
			return $item['slug'] === 'elementor-templates';
		} ) )[0] ?? null;

		$this->assertNotNull( $parent_item, 'Parent item should be present in data' );
		$this->assertEquals( $child_custom_url, $parent_item['url'], 'Parent should use first child custom URL' );
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

	private function set_admin_user(): void {
		$user_id = self::factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $user_id );
	}
}

class Test_Custom_Url_Menu_Item implements Menu_Item_Third_Level_Interface, Menu_Item_With_Custom_Url_Interface {
	private string $slug;
	private string $group_id;
	private string $url;
	private bool $has_children;
	private string $label;
	private int $position;

	public function __construct( string $slug, string $group_id, string $url, bool $has_children, string $label, int $position = 100 ) {
		$this->slug = $slug;
		$this->group_id = $group_id;
		$this->url = $url;
		$this->has_children = $has_children;
		$this->label = $label;
		$this->position = $position;
	}

	public function get_capability(): string {
		return 'manage_options';
	}

	public function get_label(): string {
		return $this->label;
	}

	public function get_parent_slug(): string {
		return '';
	}

	public function is_visible(): bool {
		return true;
	}

	public function get_position(): int {
		return $this->position;
	}

	public function get_slug(): string {
		return $this->slug;
	}

	public function get_group_id(): string {
		return $this->group_id;
	}

	public function get_icon(): string {
		return 'extension';
	}

	public function has_children(): bool {
		return $this->has_children;
	}

	public function get_menu_url(): string {
		return $this->url;
	}
}

