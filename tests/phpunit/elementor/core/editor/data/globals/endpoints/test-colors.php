<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Manager;
use Elementor\Plugin;
use Elementor\Testing\Elementor_Test_Base;


class Test_Colors extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Base\Module|\Elementor\Data\Manager
	 */
	private $manager;

	public function get_command( $id = null ) {
		$command = 'globals/colors';

		if ( $id ) {
			$command .= '?id=' . $id;
		}
		return $command;
	}

	public function setUp() {
		$this->manager = Manager::instance();
		wp_set_current_user( $this->factory()->get_administrator_user()->ID );
	}

	public function test_create() {
		$id = (string) rand( 5, 7 );
		$args = [
			'id' => $id,
			'value' => 'red',
			'title' => 'whatever',
		];

		$result = $this->manager->run( $this->get_command( $id ), $args, \WP_REST_Server::CREATABLE );

		// Bug: kit does not updated after save.
		Plugin::$instance->documents->get( Plugin::$instance->kits_manager->get_active_id(), false );

		$this->assertEquals( $args, $result );

		return $result;
	}

	public function test_get() {
		$create_result = $this->test_create();
		$get_result = $this->manager->run( $this->get_command( $create_result['id'] ) );

		$this->assertEquals( $create_result, $get_result );
	}
}
