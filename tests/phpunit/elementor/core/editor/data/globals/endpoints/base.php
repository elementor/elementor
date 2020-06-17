<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Data\Globals\Endpoints;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;
use Elementor\Core\Editor\Data;

abstract class Base extends Elementor_Test_Base {

	/**
	 * @var \Elementor\Core\Base\Module|\Elementor\Data\Manager
	 */
	protected $manager;

	public function setUp() {
		parent::setUp();

		$this->manager = Manager::instance();
		$this->manager->kill_server();

		$this->manager->register_controller( $this->get_controller_class() );

		wp_set_current_user( $this->factory()->get_administrator_user()->ID);
	}

	public function get_endpoint( $id = null ) {
		$endpoint = $this->get_command();

		if ( $id ) {
			$endpoint .= '/' . $id;
		}

		return $endpoint;
	}

	/**
	 * @return string
	 */
	abstract public function get_command();

	/**
	 * @return string
	 */
	abstract public function get_controller_class();
}
