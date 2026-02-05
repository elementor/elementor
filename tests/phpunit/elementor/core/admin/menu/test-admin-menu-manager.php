<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\First_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Hidden_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Second_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Top_Level_Menu_Item;
use Elementor\Modules\DevTools\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mock/top-level-menu-item.php';
require_once __DIR__ . '/mock/first-menu-item.php';
require_once __DIR__ . '/mock/second-menu-item.php';
require_once __DIR__ . '/mock/hidden-menu-item.php';

class Test_Admin_Menu_Manager extends Elementor_Test_Base {

	private $original_submenu;

	private $original_menu;

	public function setUp(): void {
		parent::setUp();

		global $menu, $submenu;

		$this->original_submenu = $submenu;
		$this->original_menu = $menu;
	}

	public function tearDown(): void {
		parent::tearDown();

		global $menu, $submenu;

		$submenu = $this->original_submenu;
		$menu = $this->original_menu;
	}

	public function test_register_wp_menus() {
		// Arrange.
		$this->act_as_admin();

		remove_all_actions( 'admin_menu' );
		remove_all_actions( 'admin_head' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register_actions();

		$admin_menu_manager->register( 'top-level-menu-item', new Top_Level_Menu_Item() );
		$admin_menu_manager->register( 'first-menu-item', new First_Menu_Item() );
		$admin_menu_manager->register( 'second-menu-item', new Second_Menu_Item() );

		// Act.
		do_action( 'admin_menu' );
		do_action( 'admin_head' );

		// Assert.
		global $submenu;

		$this->assertEquals( [
			[
				'top-level-item-label',
				'edit_posts',
				'top-level-menu-item',
				'',
			],
			[
				'first-item-label',
				'manage_options',
				'first-menu-item',
				'',
			],
			[
				'second-item-label',
				'edit_posts',
				'second-menu-item',
				'',
			],
		], $submenu['top-level-menu-item'] );
	}

	public function test_register_wp_menus__registers_based_on_capability() {
		// Arrange.
		$this->act_as_editor();

		remove_all_actions( 'admin_menu' );
		remove_all_actions( 'admin_head' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register_actions();

		$admin_menu_manager->register( 'top-level-menu-item', new Top_Level_Menu_Item() );
		$admin_menu_manager->register( 'first-menu-item', new First_Menu_Item() );
		$admin_menu_manager->register( 'second-menu-item', new Second_Menu_Item() );

		// Act.
		do_action( 'admin_menu' );
		do_action( 'admin_head' );

		// Assert.
		global $submenu;

		$this->assertEquals( [
			[
				'top-level-item-label',
				'edit_posts',
				'top-level-menu-item',
				'',
			],
			[
				'second-item-label',
				'edit_posts',
				'second-menu-item',
				'',
			],
		], $submenu['top-level-menu-item'] );
	}

	public function test_register_wp_menus__doesnt_show_hidden_menus() {
		// Arrange.
		$this->act_as_admin();

		remove_all_actions( 'admin_menu' );
		remove_all_actions( 'admin_head' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register_actions();

		$admin_menu_manager->register( 'top-level-menu-item', new Top_Level_Menu_Item() );
		$admin_menu_manager->register( 'first-menu-item', new First_Menu_Item() );
		$admin_menu_manager->register( 'second-menu-item', new Second_Menu_Item() );
		$admin_menu_manager->register( 'hidden-menu-item', new Hidden_Menu_Item() );

		// Act.
		do_action( 'admin_menu' );
		do_action( 'admin_head' );

		// Assert.
		global $submenu;

		$this->assertEquals( [
			[
				'top-level-item-label',
				'edit_posts',
				'top-level-menu-item',
				'',
			],
			[
				'first-item-label',
				'manage_options',
				'first-menu-item',
				'',
			],
			[
				'second-item-label',
				'edit_posts',
				'second-menu-item',
				'',
			],
		], $submenu['top-level-menu-item'] );
	}

	public function test_unregister() {
		// Arrange.
		$admin_menu_manager = new Admin_Menu_Manager();

		$item0 = new Top_Level_Menu_Item();
		$item1 = new First_Menu_Item();
		$item2 = new Second_Menu_Item();

		$admin_menu_manager->register( 'top-level-menu-item', $item0 );
		$admin_menu_manager->register( 'first-menu-item', $item1 );
		$admin_menu_manager->register( 'second-menu-item', $item2 );

		// Act.
		$admin_menu_manager->unregister( 'second-menu-item' );

		// Assert.
		$this->assertEqualSets( [
			'top-level-menu-item' => $item0,
			'first-menu-item' => $item1,
		], $admin_menu_manager->get_all() );
	}

	public function test_get() {
		// Arrange.
		$admin_menu_manager = new Admin_Menu_Manager();

		$item1 = new First_Menu_Item();
		$item2 = new Second_Menu_Item();

		$admin_menu_manager->register( 'top-level-menu-item', new Top_Level_Menu_Item() );
		$admin_menu_manager->register( 'first-menu-item', $item1 );
		$admin_menu_manager->register( 'second-menu-item', $item2 );

		// Act.
		$item_from_manager = $admin_menu_manager->get( 'first-menu-item' );

		// Assert.
		$this->assertEquals( $item1, $item_from_manager );
	}

	public function test_get__non_existing_item() {
		// Arrange.
		$admin_menu_manager = new Admin_Menu_Manager();

		$item1 = new First_Menu_Item();
		$item2 = new Second_Menu_Item();

		$admin_menu_manager->register( 'top-level-menu-item', new Top_Level_Menu_Item() );
		$admin_menu_manager->register( 'first-menu-item', $item1 );
		$admin_menu_manager->register( 'second-menu-item', $item2 );

		// Act.
		$item_from_manager = $admin_menu_manager->get( 'non-existing-item' );

		// Assert.
		$this->assertEquals( null, $item_from_manager );
	}

	public function test_get_all() {
		// Arrange.
		$admin_menu_manager = new Admin_Menu_Manager();

		$item0 = new Top_Level_Menu_Item();
		$item1 = new First_Menu_Item();
		$item2 = new Second_Menu_Item();

		$admin_menu_manager->register( 'top-level-menu-item', $item0 );
		$admin_menu_manager->register( 'first-menu-item', $item1 );
		$admin_menu_manager->register( 'second-menu-item', $item2 );

		// Act.
		$items_from_manager = $admin_menu_manager->get_all();

		// Assert.
		$this->assertEqualSets( [
			'top-level-menu-item' => $item0,
			'first-menu-item' => $item1,
			'second-menu-item' => $item2,
		], $items_from_manager );
	}

	public function test_register_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register( 'test-menu', new Top_Level_Menu_Item() );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Core\Admin\Menu\Admin_Menu_Manager::register'][0] );
	}

	public function test_unregister_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::unregister' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register( 'test-menu', new Top_Level_Menu_Item() );
		$admin_menu_manager->unregister( 'test-menu' );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::unregister', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Core\Admin\Menu\Admin_Menu_Manager::unregister'][0] );
	}

	public function test_deprecated_hook_elementor_admin_menu_register_triggers_notice() {
		$this->setExpectedDeprecated( 'elementor/admin/menu/register' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register_actions' );

		$hook_called = false;
		add_action( 'elementor/admin/menu/register', function() use ( &$hook_called ) {
			$hook_called = true;
		} );

		remove_all_actions( 'admin_menu' );
		remove_all_actions( 'admin_head' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register_actions();
		$admin_menu_manager->register( 'test-menu', new Top_Level_Menu_Item() );

		do_action( 'admin_menu' );

		$this->assertTrue( $hook_called, 'Deprecated hook should be called' );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'elementor/admin/menu/register', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['elementor/admin/menu/register'][0] );
	}

	public function test_deprecated_hook_elementor_admin_menu_after_register_triggers_notice() {
		$this->setExpectedDeprecated( 'elementor/admin/menu/after_register' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Admin_Menu_Manager::register_actions' );

		$hook_called = false;
		add_action( 'elementor/admin/menu/after_register', function() use ( &$hook_called ) {
			$hook_called = true;
		} );

		remove_all_actions( 'admin_menu' );
		remove_all_actions( 'admin_head' );

		$admin_menu_manager = new Admin_Menu_Manager();
		$admin_menu_manager->register_actions();
		$admin_menu_manager->register( 'test-menu', new Top_Level_Menu_Item() );

		do_action( 'admin_menu' );

		$this->assertTrue( $hook_called, 'Deprecated hook should be called' );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'elementor/admin/menu/after_register', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['elementor/admin/menu/after_register'][0] );
	}
}
