<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base;

use Elementor\Data\Manager;
use Elementor\Testing\Elementor_Test_Base;

abstract class Data_Test_Base extends Elementor_Test_Base {
	/**
	 * @var \Elementor\Data\Manager
	 */
	protected $manager;

	public function setUp() {
		parent::setUp();

		$this->set_manager();
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
}
