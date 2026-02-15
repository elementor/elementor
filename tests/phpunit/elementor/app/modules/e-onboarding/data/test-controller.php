<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data;

use Elementor\App\Modules\E_Onboarding\Data\Controller;
use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Controller extends Test_Base {

	private Controller $controller;

	public function setUp(): void {
		parent::setUp();

		$this->controller = new Controller();
	}

	public function test_subscriber_cannot_access_endpoints() {
		// Arrange
		$request = new WP_REST_Request( 'GET' );
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );

		// Assert - all permission checks should fail for subscriber
		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
		$this->assertFalse( $this->controller->update_items_permissions_check( $request ) );
		$this->assertFalse( $this->controller->get_item_permissions_check( $request ) );
		$this->assertFalse( $this->controller->create_items_permissions_check( $request ) );
		$this->assertFalse( $this->controller->create_item_permissions_check( $request ) );
		$this->assertFalse( $this->controller->update_item_permissions_check( $request ) );
	}

	public function test_admin_can_access_endpoints() {
		// Arrange
		$request = new WP_REST_Request( 'GET' );
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );

		// Assert - all permission checks should pass for admin
		$this->assertTrue( $this->controller->get_items_permissions_check( $request ) );
		$this->assertTrue( $this->controller->update_items_permissions_check( $request ) );
	}
}
