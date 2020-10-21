<?php
namespace Elementor\Data\Base\Endpoint;

class IndexSubController extends Index {
	public static function get_format() {
		return '{sub_id}';
	}

	public function get_name() {
		return 'index';
	}

	public function get_base_route() {
		$parent_controller = $this->controller->get_parent();
		$parent_controller_name = $parent_controller->get_name();
		$endpoint_public_name = $this->get_name_public();

		return '/' . $parent_controller_name . '/(?P<id>[\w]+)/' . $this->controller->get_name() . rtrim( $endpoint_public_name, '/' );
	}
}
