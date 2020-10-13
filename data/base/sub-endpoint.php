<?php
namespace Elementor\Data\Base;

// TODO: Add test.

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
		$result = '';
		$parent = $this->get_parent();
		$parent_name = $parent->get_name();

		if ( $parent instanceof Internal && 'index' && $parent_name ) {
			$parent_name = '';
		}

		$name = $this->get_name();

		if ( ! ( $parent instanceof SubEndpoint ) ) {
			if ( $parent_name ) {
				$parent_name = $parent_name . '/';
			}

			$result = $this->controller->get_rest_base() . '/' . $parent_name . $this->route . '/' . $name;
		} else {
			$result = $parent->get_base_route() . '/' . $this->route . '/' . $name;
		}

		return $result;
	}

	public function get_full_command() {
		return $this->controller->get_name() . '/' . $this->get_name_ancestry();
	}

	public function get_name_ancestry() {
		$name = $this->get_name();

		if ( $this->parent_endpoint instanceof SubEndpoint ) {
			$name = $this->parent_endpoint->get_name_ancestry() . '/' . $name;
		} else {
			$name = $this->parent_endpoint->get_name() . '/' . $name;
		}

		return $name;
	}

	public function get_format_ancestry() {
		$format = $this->get_format();

		if ( $this->parent_endpoint instanceof SubEndpoint ) {
			$format = $this->parent_endpoint->get_format_ancestry() . $format;
		} else {
			$parent = $this->get_parent();
			$parent_format = $parent::get_format();

			if ( $parent_format ) {
				$format = $parent_format . '/' . $format;
			}
		}

		return $format;
	}
}
