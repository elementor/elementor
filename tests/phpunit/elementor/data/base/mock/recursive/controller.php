<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	public register_endpoints() {
		$this->register_endpoint( Endpoint::class );
		$this->register_endpoint( Endpoint::class );
	}

	public get_items( $request ) {
		return [
			'someKey' => [
				'fakeKey' => 'fakeValue',
			],
		];
	}

	protected register_internal_endpoints() {
		$this->register_endpoint( Internal_Endpoint::class );
	}
}
