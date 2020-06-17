<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

// TODO: Use autoloader.

use Elementor\Plugin;
use Elementor\Core\Editor\Data;

class Test_Colors extends Base  {
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
			'color' => 'red',
			'title' => 'whatever',
		];

		// Create
		$this->manager->run_endpoint( $this->get_endpoint( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		$kit = Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$colors = $kit->get_settings( 'custom_colors' );

		$this->assertEquals( $id, $colors[0]['_id'] );
		$this->assertEquals( $args['color'], $colors[0]['color'] );

		return $colors;
	}

	public function test_get() {
		$colors = $this->test_create();

		$rest_result = $this->manager->run_endpoint( $this->get_endpoint( $colors[0]['_id'] ) );

		$this->assertEquals( $rest_result['id'], $colors[0]['_id'] );
	}
}
