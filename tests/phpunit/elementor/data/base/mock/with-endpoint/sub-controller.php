<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithEndpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint as EndpointTemplate;

class SubController extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubController {
	public function register_endpoints() {
		$this->register_endpoint( EndpointTemplate::class );
	}
}
