<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassRegister;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockItems;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockNameType;

class SubEndpoint extends \Elementor\Data\Base\SubEndpoint {
	use MockNameType, MockItems, MockBypassRegister;

	public function get_type() {
		return 'sub-endpoint';
	}

	public function get_format() {
		return $this->get_base_route();
	}
}
