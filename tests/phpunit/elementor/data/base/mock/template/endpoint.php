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
		return '';
	}

	public function get_sub_endpoints() {
		return $this->sub_endpoints;
	}
}
