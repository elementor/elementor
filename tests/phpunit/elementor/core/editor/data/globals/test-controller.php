<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals;

use Elementor\Core\Editor\Data\Globals;
use Elementor\Tests\Phpunit\Elementor\Data\V2\Base\Data_Test_Base;

class Test_Controller extends Data_Test_Base  {
	public function test_get_permission_callback() {
		$controller = new Globals\Controller();

		$expected_by_method = [
			\WP_REST_Server::READABLE  => true,
			\WP_REST_Server::CREATABLE => false,
			\WP_REST_Server::DELETABLE => false,
			'PUT'                      => false,
			'PATCH'                    => false,
		];

		// Set Editor — can only read globals, not modify them.
		wp_set_current_user( $this->factory()->get_editor_user()->ID );

		foreach ( $expected_by_method as $method => $expected ) {
			$request = new \WP_REST_Request( $method );
			$this->assertEquals( $expected, $controller->get_permission_callback( $request ), "Method: $method" );
		}

		// Set subscriber — no access at all.
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );

		foreach ( array_keys( $expected_by_method ) as $method ) {
			$request = new \WP_REST_Request( $method );
			$this->assertEquals( false, $controller->get_permission_callback( $request ), "Method: $method" );
		}

		// Set admin — can read and write globals, but PUT/PATCH are not supported.
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );

		$admin_expected_by_method = [
			\WP_REST_Server::READABLE  => true,
			\WP_REST_Server::CREATABLE => true,
			\WP_REST_Server::DELETABLE => true,
			'PUT'                      => false,
			'PATCH'                    => false,
		];

		foreach ( $admin_expected_by_method as $method => $expected ) {
			$request = new \WP_REST_Request( $method );
			$this->assertEquals( $expected, $controller->get_permission_callback( $request ), "Method: $method" );
		}
	}
}
