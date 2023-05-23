<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Config;

use Elementor\Core\Admin\Config\WP_Blog_Name;
use ElementorEditorTesting\Elementor_Test_Base;

class Test_Config_Manager extends Elementor_Test_Base {

	function test_is_admin_on_activate_plugin() {
		$this->act_as_admin();

		add_action( 'activate_plugin', function () {
			WP_Blog_Name::set( 'test' );
		} );

		do_action( 'activate_plugin' );

		$this->assertEquals( 'test', get_option( WP_Blog_Name::get_key() ) );
	}
}
