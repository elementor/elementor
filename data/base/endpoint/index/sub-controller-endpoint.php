<?php
namespace Elementor\Data\Base\Endpoint\Index;

use Elementor\Data\Base\Endpoint\Index;

class SubControllerEndpoint extends Index {
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
		$parent_index_endpoint = $parent_controller->index_endpoint;
		$parent_index_arg_id = $parent_index_endpoint->id_arg_name;
		$endpoint_public_name = $this->get_name_public();

		return '/' . $parent_controller_name . "/(?P<{$parent_index_arg_id}>[\w]+)/" . $this->controller->get_name() . $endpoint_public_name;
	}
}
