<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithEndpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint as EndpointTemplate;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {
	public function register_endpoints() {
		$this->register_endpoint( new EndpointTemplate( $this ) );
	}
}
