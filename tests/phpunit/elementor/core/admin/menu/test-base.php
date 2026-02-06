<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Base;
use Elementor\Modules\DevTools\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Base_Menu extends Base {

	protected function get_init_args() {
		return [
			'page_title' => 'Test Page',
			'menu_title' => 'Test Menu',
			'capability' => 'manage_options',
			'menu_slug' => 'test-menu',
			'function' => null,
			'icon_url' => null,
			'position' => 100,
		];
	}

	protected function register_default_submenus() {
		$this->add_submenu( [
			'page_title' => 'Submenu 1',
			'menu_title' => 'Submenu 1',
			'menu_slug' => 'test-submenu-1',
			'index' => 10,
		] );
	}
}

class Test_Base extends Elementor_Test_Base {

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

	public function test_constructor_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Test_Base_Menu::__construct' );

		$menu = new Test_Base_Menu();

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Test_Base_Menu::__construct', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Test_Base_Menu::__construct'][0] );
	}

	public function test_get_args_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::get_args' );

		$menu = new Test_Base_Menu();
		$args = $menu->get_args();

		$this->assertIsArray( $args );
		$this->assertEquals( 'test-menu', $args['menu_slug'] );
		$this->assertEquals( 'Test Menu', $args['menu_title'] );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Base::get_args', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Core\Admin\Menu\Base::get_args'][0] );
	}

	public function test_get_args_with_specific_arg() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::get_args' );

		$menu = new Test_Base_Menu();
		$menu_slug = $menu->get_args( 'menu_slug' );

		$this->assertEquals( 'test-menu', $menu_slug );
	}

	public function test_add_submenu_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::add_submenu' );

		$menu = new Test_Base_Menu();
		$menu->add_submenu( [
			'page_title' => 'Custom Submenu',
			'menu_title' => 'Custom Submenu',
			'menu_slug' => 'custom-submenu',
			'index' => 5,
		] );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Base::add_submenu', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Core\Admin\Menu\Base::add_submenu'][0] );
	}

	public function test_register_creates_menu_and_submenus() {
		$this->act_as_admin();
		remove_all_actions( 'admin_menu' );

		$menu = new Test_Base_Menu();

		do_action( 'admin_menu' );

		global $menu, $submenu;

		$menu_found = false;
		foreach ( $menu as $menu_item ) {
			if ( isset( $menu_item[2] ) && 'test-menu' === $menu_item[2] ) {
				$menu_found = true;
				$this->assertEquals( 'Test Menu', $menu_item[0] );
				break;
			}
		}

		$this->assertTrue( $menu_found, 'Menu should be registered' );
		$this->assertArrayHasKey( 'test-menu', $submenu );
		$this->assertCount( 1, $submenu['test-menu'] );
	}

	public function test_deprecated_hook_elementor_admin_menu_registered_triggers_notice() {
		$this->setExpectedDeprecated( 'elementor/admin/menu_registered/test-menu' );
		$this->setExpectedDeprecated( 'Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu\Test_Base_Menu::__construct' );

		$hook_called = false;
		add_action( 'elementor/admin/menu_registered/test-menu', function() use ( &$hook_called ) {
			$hook_called = true;
		} );

		remove_all_actions( 'admin_menu' );

		$menu = new Test_Base_Menu();
		do_action( 'admin_menu' );

		$this->assertTrue( $hook_called, 'Deprecated hook should be called' );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'elementor/admin/menu_registered/test-menu', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['elementor/admin/menu_registered/test-menu'][0] );
	}

	public function test_add_submenu_with_default_args() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::add_submenu' );

		$menu = new Test_Base_Menu();
		$menu->add_submenu( [
			'menu_title' => 'Minimal Submenu',
			'menu_slug' => 'minimal-submenu',
		] );

		$this->act_as_admin();
		remove_all_actions( 'admin_menu' );

		do_action( 'admin_menu' );

		global $submenu;
		$this->assertArrayHasKey( 'test-menu', $submenu );
		$this->assertCount( 2, $submenu['test-menu'] );
	}

	public function test_submenus_are_sorted_by_index() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::add_submenu' );

		$menu = new Test_Base_Menu();
		$menu->add_submenu( [
			'page_title' => 'Third',
			'menu_title' => 'Third',
			'menu_slug' => 'third',
			'index' => 30,
		] );
		$menu->add_submenu( [
			'page_title' => 'First',
			'menu_title' => 'First',
			'menu_slug' => 'first',
			'index' => 5,
		] );
		$menu->add_submenu( [
			'page_title' => 'Second',
			'menu_title' => 'Second',
			'menu_slug' => 'second',
			'index' => 20,
		] );

		$this->act_as_admin();
		remove_all_actions( 'admin_menu' );

		do_action( 'admin_menu' );

		global $submenu;
		$this->assertArrayHasKey( 'test-menu', $submenu );
		$this->assertCount( 4, $submenu['test-menu'] );
		$this->assertEquals( 'First', $submenu['test-menu'][1][0] );
		$this->assertEquals( 'Second', $submenu['test-menu'][2][0] );
		$this->assertEquals( 'Third', $submenu['test-menu'][3][0] );
	}
}
