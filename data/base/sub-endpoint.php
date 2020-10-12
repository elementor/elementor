<?php
namespace Elementor\Data\Base;

// TODO: Add test.

abstract class SubEndpoint extends Endpoint {

	/**
	 * @var Endpoint
	 */
	protected $parent_endpoint;

	/**
	 * @var string
	 */
	protected $route = '';

	public function __construct( $route, $parent_endpoint ) {
		$this->parent_endpoint = $parent_endpoint;

		$this->route = $route;

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
		return $this->controller->get_rest_base() . '/' . $this->route . '/' . $this->get_name();
	}

	public function get_name_ancestry( $skip_first = true ) {
		if ( $skip_first ) {
			return '';
		}

		$name = $this->parent_endpoint->get_name();

		// TODO: Instance of IndexEndpoint ...
		if ( 'index' === $name ) {
			$name = $this->parent_endpoint->controller->get_name();
		}

		if ( $this->parent_endpoint instanceof SubEndpoint ) {
			$name = $this->parent_endpoint->get_name_ancestry( false ) . '/' . $name;
		}

		return $name;
	}
}
