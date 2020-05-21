<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Data\Base\Mock\Recursive;

use Elementor\Tests\Phpunit\Elementor\Core\Data\Base\Mock\Base;

class Controller extends \Elementor\Data\Base\Controller {

	public function get_name() {
		return 'test-controller';
	}

	public function register_endpoints() {
		$this->register_endpoint( Base\Endpoint::class );
		$this->register_endpoint( Base\Endpoint::class );
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Internal_Endpoint::class );
	}

	public function permission_callback( $request ) {
		return true; // Bypass.
	}
}
