<?php
namespace Elementor\Data\Base;

use Elementor\Data\Base\Endpoint\Internal;

abstract class SubEndpoint extends Endpoint {

	/**
	 * @var Endpoint
	 */
	protected $parent_endpoint;

	/**
	 * @var string
	 */
	protected $route = '';

	public function __construct( $parent_endpoint, $route = '' ) {
		$this->route = $route;
		$this->parent_endpoint = $parent_endpoint;

		parent::__construct( $this->parent_endpoint->controller );
	}

	/**
	 * Get parent route.
	 *
	 * @return \Elementor\Data\Base\Endpoint|\Elementor\Data\Base\SubEndpoint
	 */
	public function get_parent() {
		return $this->parent_endpoint;
	}

	public function get_base_route() {
		$name = $this->get_name();
		$parent = $this->get_parent();
		$is_parent_sub_endpoint = $parent instanceof SubEndpoint;

		$route = $this->route;

		if ( $route ) {
			$route .= '/';
		}

		// Parent sub endpoint
		if ( $is_parent_sub_endpoint ) {
			return $parent->get_base_route() . '/' . $route . $name;
		}

		// Parent internal sub internal endpoint.
		if ( $this->controller instanceof SubController && $parent instanceof Internal\IndexSub ) {
			$route = $this->controller->get_route();

			if ( $route ) {
				$route .= '/';
			}

			return $parent->get_base_route() . '/' . $route . $name;
		}

		$parent_name = $parent->get_command_public();

		if ( $parent_name ) {
			$parent_name = $parent_name . '/';
		}

		// Parent endpoint
		return $this->controller->get_rest_base() . '/' . $parent_name . $route . $name;
	}

	public function get_full_command() {
		if ( $this->controller instanceof SubController ) {
			return $this->controller->get_parent()->get_name() . '/' . $this->controller->get_name() . '/' . $this->get_name_ancestry();
		}

		return $this->controller->get_name() . '/' . $this->get_name_ancestry();
	}

	public function get_name_ancestry() {
		$name = $this->get_name();

		if ( $this->parent_endpoint instanceof SubEndpoint ) {
			$name = $this->parent_endpoint->get_name_ancestry() . '/' . $name;
		} else if ( ! $this->parent_endpoint instanceof Internal ) {
			$name = $this->parent_endpoint->get_name() . '/' . $name;
		}

		return $name;
	}
}
