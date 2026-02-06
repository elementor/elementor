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

	public function test_get_name_returns_e_onboarding() {
		// Assert
		$this->assertSame( 'e-onboarding', $this->controller->get_name() );
	}

	public function test_get_items_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'GET' );

		// Act - as subscriber (no manage_options capability)
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->get_items_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_get_items_permissions_check_allows_admin() {
		// Arrange
		$request = new WP_REST_Request( 'GET' );

		// Act - as admin
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$result = $this->controller->get_items_permissions_check( $request );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_update_items_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );

		// Act - as subscriber
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->update_items_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_update_items_permissions_check_allows_admin() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );

		// Act - as admin
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$result = $this->controller->update_items_permissions_check( $request );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_get_item_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'GET' );

		// Act - as subscriber
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->get_item_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_create_items_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );

		// Act - as subscriber
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->create_items_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_create_item_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );

		// Act - as subscriber
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->create_item_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_update_item_permissions_check_requires_manage_options() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );

		// Act - as subscriber
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$result = $this->controller->update_item_permissions_check( $request );

		// Assert
		$this->assertFalse( $result );
	}
}
