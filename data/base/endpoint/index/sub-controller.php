<?php
namespace Elementor\Data\Base\Endpoint\Index;

use Elementor\Data\Base\Endpoint\Index;

class SubController extends Index {
	/***
	 * @var \Elementor\Data\Base\SubController
	 */
	public $controller;

	public function get_name() {
		return 'index';
	}

	public function get_format() {
		return $this->controller->get_parent()->get_name() . '/{id}/' . $this->controller->get_name() . '/{sub_id}';
	}

	public function get_base_route() {
		$parent_controller = $this->controller->get_parent();
		$parent_controller_name = $parent_controller->get_name();
		$endpoint_public_name = $this->get_name_public();

		return '/' . $parent_controller_name . '/(?P<id>[\w]+)/' . $this->controller->get_name() . rtrim( $endpoint_public_name, '/' );
	}
}
