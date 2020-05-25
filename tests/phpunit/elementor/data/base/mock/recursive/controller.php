<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	public function register_endpoints() {
		$this->register_endpoint( Endpoint::class );
		$this->register_endpoint( Endpoint::class );
	}

	public function get_items( $request ) {
		return [
			'someKey' => [
				'fakeKey' => 'fakeValue',
			],
		];
	}

	protected function register_internal_endpoints() {
		$this->register_endpoint( Internal_Endpoint::class );
	}
}
