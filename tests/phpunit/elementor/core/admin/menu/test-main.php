<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Admin\Menu;

use Elementor\Core\Admin\Menu\Main;
use Elementor\Modules\DevTools\Module;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Main extends Elementor_Test_Base {

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
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Main::__construct' );

		$menu = new Main();

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Main::__construct', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['Elementor\Core\Admin\Menu\Main::__construct'][0] );
	}

	public function test_get_init_args_returns_correct_values() {
		$menu = new Main();

		$args = $menu->get_args();

		$this->assertEquals( 'Elementor', $args['page_title'] );
		$this->assertEquals( 'Elementor', $args['menu_title'] );
		$this->assertEquals( 'manage_options', $args['capability'] );
		$this->assertEquals( 'elementor', $args['menu_slug'] );
		$this->assertNull( $args['function'] );
		$this->assertEquals( 58.5, $args['position'] );
	}

	public function test_get_args_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::get_args' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Main::__construct' );

		$menu = new Main();
		$args = $menu->get_args();

		$this->assertIsArray( $args );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Base::get_args', $settings['soft_notices'] );
	}

	public function test_add_submenu_triggers_deprecation_notice() {
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Base::add_submenu' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Main::__construct' );

		$menu = new Main();
		$menu->add_submenu( [
			'page_title' => 'Test Submenu',
			'menu_title' => 'Test Submenu',
			'menu_slug' => 'test-submenu',
			'index' => 10,
		] );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'Elementor\Core\Admin\Menu\Base::add_submenu', $settings['soft_notices'] );
	}

	public function test_register_creates_elementor_menu() {
		$this->act_as_admin();
		remove_all_actions( 'admin_menu' );

		$menu = new Main();

		do_action( 'admin_menu' );

		global $menu, $submenu;

		$menu_found = false;
		foreach ( $menu as $menu_item ) {
			if ( isset( $menu_item[2] ) && 'elementor' === $menu_item[2] ) {
				$menu_found = true;
				$this->assertEquals( 'Elementor', $menu_item[0] );
				break;
			}
		}

		$this->assertTrue( $menu_found, 'Elementor menu should be registered' );
	}

	public function test_deprecated_hook_elementor_admin_menu_registered_elementor_triggers_notice() {
		$this->setExpectedDeprecated( 'elementor/admin/menu_registered/elementor' );
		$this->setExpectedDeprecated( 'Elementor\Core\Admin\Menu\Main::__construct' );

		$hook_called = false;
		add_action( 'elementor/admin/menu_registered/elementor', function() use ( &$hook_called ) {
			$hook_called = true;
		} );

		remove_all_actions( 'admin_menu' );

		$menu = new Main();
		do_action( 'admin_menu' );

		$this->assertTrue( $hook_called, 'Deprecated hook should be called' );

		$deprecation = Module::instance()->deprecation;
		$settings = $deprecation->get_settings();

		$this->assertArrayHasKey( 'soft_notices', $settings );
		$this->assertArrayHasKey( 'elementor/admin/menu_registered/elementor', $settings['soft_notices'] );
		$this->assertEquals( '3.34.2', $settings['soft_notices']['elementor/admin/menu_registered/elementor'][0] );
	}

	public function test_inherits_from_base_class() {
		$menu = new Main();

		$this->assertInstanceOf( \Elementor\Core\Admin\Menu\Base::class, $menu );
	}
}
