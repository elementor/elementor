<?php
namespace Elementor\Data\Base;

abstract class SubEndpoint extends Endpoint implements Interfaces\EndpointItems {

	/**
	 * @var Endpoint
	 */
	protected $parent_endpoint;

	/**
	 * @var string
	 */
	protected $route = '/';

	public function __construct( $parent_endpoint, $route = '/' ) {
		$this->route = $this->ensure_slashes( $route );
		$this->parent_endpoint = $parent_endpoint;

		parent::__construct( $this->parent_endpoint->controller );
	}

	/**
	 * Ensure start-with and end-with slashes.
	 *
	 * '/' => '/'
	 * 'abc' => '/abc/'
	 * '/abc' => '/abc/'
	 * 'abc/' => '/abc/'
	 * '/abc/' => '/abc/'
	 *
	 * @param string $route
	 *
	 * @return string
	 */
	private function ensure_slashes( $route ) {
		if ( '/' !== $route[0] ) {
			$route = '/' . $route;
		}

		return trailingslashit( $route );
	}

	/**
	 * @return \Elementor\Data\Base\Endpoint[]
	 */
	private function get_ancestors() {
		$ancestors = [];
		$parent = $this;

		do {
			if ( $parent ) {
				$ancestors [] = $parent;
			}

			if ( ! is_callable( [ $parent, 'get_parent' ] ) ) {
				break;
			}

			$parent = $parent->get_parent();
		} while ( $parent );

		return array_reverse( $ancestors );
	}

	/**
	 * Get parent endpoint.
	 *
	 * @return \Elementor\Data\Base\Endpoint|\Elementor\Data\Base\SubEndpoint
	 */
	public function get_parent() {
		return $this->parent_endpoint;
	}

	public function get_base_route() {
		$name = $this->get_name();
		$parent = $this->get_parent();
		$is_parent_sub_endpoint = $parent instanceof self;
		$parent_base = $parent->get_base_route();
		$route = $this->route;

		// Parent sub endpoint
		if ( $is_parent_sub_endpoint ) {
			return $parent_base . $route . $name;
		}

		// Parent sub controller.
		if ( $this->controller instanceof SubController ) {
			return $parent_base . $this->controller->get_route() . '/' . $name;
		}

		// Parent endpoint
		$parent_name = $parent->get_public_name();
		$path = trim( $parent_name . $route . $name, '/' );

		return $this->controller->get_rest_base() . '/' . $path;
	}

	public function get_full_command() {
		return $this->controller->get_full_name() . '/' . $this->get_name_ancestry();
	}

	public function get_name_ancestry() {
		$result = '';
		$ancestors = $this->get_ancestors();

		foreach ( $ancestors as $ancestor ) {
			$result .= $ancestor->get_name() . '/';
		}

		return rtrim( $result, '/' );
	}

}
