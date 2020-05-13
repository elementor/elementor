<?php

namespace Elementor\Data\Base;

abstract class SubEndpoint extends Endpoint {
	protected $parent_endpoint;
	protected $parent_route = '';

	public function __construct( $parent_route, $parent_endpoint ) {
		$this->parent_endpoint = $parent_endpoint;
		$this->parent_route = $parent_route;

		parent::__construct( $this->parent_endpoint->controller );
	}

	protected function get_base_route() {
		$controller_name = $this->parent_endpoint->controller->get_name();

		return $controller_name . '/' . $this->parent_route . $this->get_name();
	}
}
