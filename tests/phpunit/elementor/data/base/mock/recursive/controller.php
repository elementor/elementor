<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Recursive;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Data\Base\Endpoint\Index;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	public function register_endpoints() {
		$this->register_endpoint( new Endpoint( $this ) );
		$this->register_endpoint( new Endpoint( $this ) );
	}

	public function get_items( $request ) {
		return [
			'someKey' => [
				'fakeKey' => 'fakeValue',
			],
		];
	}

	protected function register_index_endpoint() {
		$this->register_endpoint( new Index\Recursive( $this ) );
	}
}
