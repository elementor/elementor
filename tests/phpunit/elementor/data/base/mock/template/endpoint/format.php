<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockNameType;

class Format extends \Elementor\Data\Base\Endpoint {
	use MockNameType;

	/**
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller
	 */
	protected $controller;

	public function get_type() {
		return 'endpoint';
	}

	public static function get_format() {
		return '{arg_id}';
	}

	protected function register() {
		// Can be part of BaseTrait.
		if ( ! $this->controller->bypass_register_status ) {
			parent::register();
		}
	}
}
