<?php

namespace Elementor\Tests\Phpunit\Elementor\Core\Data\Base\Mock\Base;

class Endpoint extends \Elementor\Data\Base\Endpoint {
	public function get_name() {
		static $name = null;

		if ( ! $name ) {
			$name = 'test-endpoint-' . rand_long_str( 5 );
		}

		return $name;
	}

	public function get_items( $request ) {
		return [
			'someKey' => [
				'fakeKey' => 'fakeValue'
			],
		];
	}
}
