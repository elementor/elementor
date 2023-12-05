<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Admin_Menu_Manager;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\First_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Hidden_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Second_Menu_Item;
use Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Mock\Top_Level_Menu_Item;
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
}
