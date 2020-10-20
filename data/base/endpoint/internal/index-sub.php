<?php
namespace Elementor\Data\Base\Endpoint\Internal;

use Elementor\Data\Base\Endpoint\Internal;

class IndexSub extends Internal {
	/**
	 * @var \Elementor\Data\Base\SubController
	 */
	public $controller;

	public static function get_format() {
		return '{sub_id}';
	}

	public function get_name() {
		return 'index';
	}

	public function get_base_route() {
		$parent_controller = $this->controller->get_parent();
		$parent_controller_name = $parent_controller->get_name();
		$endpoint_public_name = $this->get_command_public();

		if ( $endpoint_public_name ) {
			$endpoint_public_name = '/' . $endpoint_public_name;
		}

		return '/' . $parent_controller_name . '/(?P<id>[\w]+)/' . $this->controller->get_name() . $endpoint_public_name;
	}
}
