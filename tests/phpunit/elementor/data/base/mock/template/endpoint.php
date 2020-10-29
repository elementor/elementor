<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits;

class Endpoint extends \Elementor\Data\Base\Endpoint {

	/**
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller
	 */
	public $controller;

	use Traits\MockNameType, Traits\MockItems, Traits\MockBypassRegister;

	public function get_type() {
		return 'endpoint';
	}

	public function get_format() {
		return trim( $this->get_base_route(), '/' );
	}

	public function get_sub_endpoints() {
		return $this->sub_endpoints;
	}

	public function do_register_route($route = '', $methods = \WP_REST_Server::READABLE, $callback = null, $args = []) {
		return $this->register_route( $route, $methods, $callback, $args );
	}
}
