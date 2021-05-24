<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\App;

use Elementor\Core\App\App;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\Testing\Elementor_Test_Base;

class Test_App extends Elementor_Test_Base {
	static $submenu_mock = [
		Source_Local::ADMIN_MENU_SLUG => [
			[
				2 => App::PAGE_ID,
			]
		],
	];

	public function test_fix_submenu() {
		global $submenu;

		// Test it works.
		$test_description = 'menu should get the app default route URL.';
		$submenu = self::$submenu_mock;
		Plugin::$instance->app->fix_submenu( [] );
		$this->assertEquals( Plugin::$instance->app->get_settings( 'menu_url' ), $submenu[ Source_Local::ADMIN_MENU_SLUG ][0][2], $test_description );

		// Empty submenu.
		$test_description = 'empty menu should stay empty without errors.';
		$submenu = [];
		Plugin::$instance->app->fix_submenu( [] );
		$this->assertEquals( [], $submenu, $test_description );
	}
}
