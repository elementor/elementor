<?php
namespace Elementor\Data\Editor\Globals\Endpoints;

use Elementor\Data\Base\Endpoint;

class Colors extends Endpoint {
	public function get_name() {
		return 'colors';
	}

	protected function get_items( $request ) {
		return [
			'color1' => 'red',
			'color2' => 'green',
			'color3' => 'blue',
		];
	}
}
