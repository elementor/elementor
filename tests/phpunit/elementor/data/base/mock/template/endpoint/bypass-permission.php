<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassPermission;

class BypassPermission extends Endpoint {
	use MockBypassPermission;
}
