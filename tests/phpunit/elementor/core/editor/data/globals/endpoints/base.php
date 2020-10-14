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

		$this->set_manager();

		$this->manager->kill_server();

		$this->manager->register_controller( $this->get_controller_class() );

		wp_set_current_user( $this->factory()->get_administrator_user()->ID);
	}

	public function tearDown() {
		parent::tearDown();

		$this->manager->kill_server();
	}

	public function set_manager( $manager = null ) {
		if ( ! $manager ) {
			$manager = Manager::instance();
		}

		$this->manager = $manager;
	}

	public function get_manager() {
		if ( ! $this->manager ) {
			$this->manager = Manager::instance();
		}

		return $this->manager;
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
