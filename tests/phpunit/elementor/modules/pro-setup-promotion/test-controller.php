<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\ProSetupPromotion;

use Elementor\Modules\ProSetupPromotion\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Controller extends Elementor_Test_Base {

	private Controller $controller;

	public function setUp(): void {
		parent::setUp();

		$this->controller = new Controller();
	}

	public function test_subscriber_cannot_access_pro_setup_promotion_routes(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'subscriber' ] ) );
		$request = new WP_REST_Request( 'GET' );

		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
		$this->assertFalse( $this->controller->get_item_permissions_check( $request ) );
		$this->assertFalse( $this->controller->create_items_permissions_check( $request ) );
		$this->assertFalse( $this->controller->create_item_permissions_check( $request ) );
	}

	public function test_administrator_can_access_pro_setup_promotion_routes(): void {
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'administrator' ] ) );
		$request = new WP_REST_Request( 'GET' );

		$this->assertTrue( $this->controller->get_items_permissions_check( $request ) );
		$this->assertTrue( $this->controller->get_item_permissions_check( $request ) );
		$this->assertTrue( $this->controller->create_items_permissions_check( $request ) );
		$this->assertTrue( $this->controller->create_item_permissions_check( $request ) );
	}
}
