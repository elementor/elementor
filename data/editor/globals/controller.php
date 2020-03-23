<?php
namespace Elementor\Data\Editor\Globals;

use Elementor\Data\Base\Controller as Controller_Base;

class Controller extends Controller_Base {
	public function get_name() {
		return 'globals';
	}

	public function register_endpoints() {
		$this->register_endpoint( Endpoints\Colors::class );
		$this->register_endpoint( Endpoints\Test::class );
	}
}
