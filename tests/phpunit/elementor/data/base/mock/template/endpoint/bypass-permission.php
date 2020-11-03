<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\Mock_Bypass_Permission;

class Bypass_Permission extends Endpoint {
	use Mock_Bypass_Permission;
}
