<?php
namespace Elementor\Data\V2\Base\Endpoint\Index;

use Elementor\Data\V2\Base\Endpoint\Index;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
/**
 * Class SubIndexEndpoint is default `Index\Endpoint` of `SubController`,
 * it was created to handle base_route and format for sub index endpoint.
 * In case `SubController` were used and the default method of `SubController::register_index_endpoint` ain't overridden.
 * this class will give support to have such routes, eg: 'alpha/{id}/beta/{sub_id}' without using additional endpoints.
 */
final class Sub_Index_Endpoint extends Index {
	/***
	 * @var \Elementor\Data\V2\Base\Sub_Controller
	 */
	public $controller;

	public function get_format() {
		return $this->controller->get_parent()->get_name() . '/{id}/' . $this->controller->get_name() . '/{sub_id}';
	}

	public function get_base_route() {
		$parent_controller = $this->controller->get_parent();
		$parent_index_endpoint = $parent_controller->index_endpoint;

		return untrailingslashit('/' . implode( '/', [
			$parent_controller->get_name(),
			"(?P<{$parent_index_endpoint->id_arg_name}>[\w]+)",
			$this->controller->get_name(),
			$this->get_public_name(),
		] ) );
	}
}
