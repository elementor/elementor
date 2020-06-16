<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Editor\Data;

class Test_Colors extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Base\Module|\Elementor\Data\Manager
	 */
	private $manager;

	public function get_endpoint( $id = null ) {
		$endpoint = 'globals/colors';

		if ( $id ) {
			$endpoint .= '/' . $id;
		}

		return $endpoint;
	}

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->manager->kill_server();

		$this->manager->register_controller( Data\Globals\Controller::class );

		wp_set_current_user( $this->factory()->get_administrator_user()->ID);
	}

	public function test_create() {
		$id = (string) rand();
		$args = [
			'id' => $id,
			'color' => 'red',
			'title' => 'whatever',
		];

		$result = $this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$this->assertEquals( $args, $result );

		return $result;
	}

	public function test_get() {
		$create_result = $this->test_create();

		$this->manager->run_server();

		$get_result = $this->manager->run_endpoint( $this->get_endpoint( $create_result['id'] ) );

		$this->assertEquals( $create_result, $get_result );
	}
}
