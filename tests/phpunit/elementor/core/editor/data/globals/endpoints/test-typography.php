<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

// TODO: Use autoloader.

use Elementor\Plugin;
use Elementor\Core\Editor\Data;

class Test_Typography extends Base {
	public function get_command() {
		return 'globals/typography';
	}

	public function get_controller_class() {
		return Data\Globals\Controller::class;
	}

	public function test_create() {
		$id = (string) rand();
		$args = [
			'id' => $id,
			'title' => 'whatever',
			'value' => [
				'whatever' => true,
			],
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
