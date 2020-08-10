<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals;

use Elementor\Data\Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Editor\Data\Globals;

class Test_Controller extends Elementor_Test_Base  {
	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
	}

	public function tearDown() {
		parent::tearDown();

		$this->manager->kill_server();
	}

	public function test_get_permission_callback() {
		$controller = new Globals\Controller();
		$methods = explode( ', ', \WP_REST_Server::ALLMETHODS );

		// Set Editor.
		wp_set_current_user( $this->factory()->get_editor_user()->ID );

		foreach ( $methods as $method ) {
			$request = new \WP_REST_Request( $method );
			$this->assertEquals( $controller->get_permission_callback( $request ), true );
		}

		// Set subscriber.
		wp_set_current_user( $this->factory()->get_subscriber_user()->ID );

		foreach ( $methods as $method ) {
			$request = new \WP_REST_Request( $method );
			$this->assertEquals( $controller->get_permission_callback( $request ), false );
		}

	}
}
