<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits;

class SubEndpoint extends \Elementor\Data\Base\SubEndpoint {
	use Traits\MockNameType, Traits\MockItems, Traits\MockBypassRegister;

	public function get_type() {
		return 'sub-endpoint';
	}

	public function get_format() {
		return $this->get_base_route();
	}
}
