<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Plugin;
use Elementor\Core\Editor\Data;

class Test_Colors extends Base {
	public function get_command() {
		return 'globals/colors';
	}

	public function get_controller_class() {
		return Data\Globals\Controller::class;
	}

	public function test_create() {
		$id = (string) rand();
		$args = [
			'id' => $id,
			'title' => 'whatever',
			'value' => 'red',
		];

		// Create
		$this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$colors = $kit->get_settings( 'custom_colors' );

		$this->assertEquals( $id, $colors[0]['_id'] );
		$this->assertEquals( $args['value'], $colors[0]['color'] );

		return $colors;
	}

	public function test_get() {
		$colors = $this->test_create();

		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( $colors[0]['_id'] ) );

		$this->assertEquals( $rest_result['id'], $colors[0]['_id'] );
	}

	public function test_get_item_that_does_not_exists() {
		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( 'fake_id' ) );

		$this->assertEquals( 'global_not_found', $rest_result['code'] );
		$this->assertEquals( 404, $rest_result['data']['status'] );
	}
}
