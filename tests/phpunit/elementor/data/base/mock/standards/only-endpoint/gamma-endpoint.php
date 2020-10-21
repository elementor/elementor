<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlyEndpoint;

class GammaEndpoint extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint {
	public function get_name() {
		return 'gamma';
	}

	public function get_format() {
		return 'alpha/{id}/beta/{sub_id}/gamma/{sub_sub_id}';
	}

	public function get_items( $request ) {
		return 'gamma-items';
	}

	public function get_item( $id, $request ) {
		return 'gamma-item';
	}
}
