<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Admin\Config\WP_Blog_Description;
use Elementor\Core\Admin\Config\WP_Blog_Name;
use Elementor\Core\Config\Manager;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Config_Manager extends Elementor_Test_Base {
	function test_register() {
		$manager = new Manager();
		$manager->register( WP_Blog_Name::class );
		$this->assertArrayHasKey( WP_Blog_Name::get_key(), $manager->get_all() );
	}

	function test_get() {
		$manager = new Manager();
		$manager->register( WP_Blog_Name::class );
		$this->assertEquals( WP_Blog_Name::class, $manager->get( WP_Blog_Name::get_key() ) );
	}

	function test_get_all() {
		$manager = new Manager();
		$manager->register( WP_Blog_Name::class );
		$manager->register( WP_Blog_Description::class );
		$this->assertArrayHasKey( WP_Blog_Name::get_key(), $manager->get_all() );
		$this->assertArrayHasKey( WP_Blog_Description::get_key(), $manager->get_all() );
	}

	function test_is_admin_on_activate_plugin() {
		$this->act_as_admin();

		add_action( 'activate_plugin', function () {
			WP_Blog_Name::set( 'test' );
		} );

		do_action( 'activate_plugin' );

		$this->assertEquals( 'test', get_option( WP_Blog_Name::get_key() ) );
	}
}
