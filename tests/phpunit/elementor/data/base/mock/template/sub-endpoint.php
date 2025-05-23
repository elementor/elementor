<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class SubEndpoint extends \Elementor\Data\Base\SubEndpoint {

	/**
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller
	 */
	public $controller;

	use BaseTrait;

	public function get_type() {
		return 'endpoint';
	}

	public function get_items( $request ) {
		$test_data = $this->get_test_data( 'get_items');

		if ( $test_data ) {
			return $test_data;
		}

		return parent::get_items( $request );
	}

	protected function register() {
		// Can be part of BaseTrait.
		if ( ! $this->controller->bypass_register_status ) {
			parent::register();
		}
	}

	public function do_register() {
		parent::register();
	}
}
