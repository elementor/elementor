<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Simple;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	public register_endpoints() {
		$this->register_endpoint( Endpoint::class );
	}
}
