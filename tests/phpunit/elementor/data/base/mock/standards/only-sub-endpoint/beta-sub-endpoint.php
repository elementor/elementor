<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Standards\OnlySubEndpoint;

class Beta_Sub_Endpoint extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint {
	public function get_name() {
		return 'beta';
	}

	public function get_format() {
		return 'alpha/{id}/beta/{sub_id}';
	}

	public function get_items( $request ) {
		return 'beta-items';
	}

	public function get_item( $id, $request ) {
		return 'beta-item';
	}
}
