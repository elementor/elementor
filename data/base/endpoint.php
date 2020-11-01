<?php
namespace Elementor\Data\Base;

use Elementor\Data\Manager;

abstract class Endpoint extends EndpointRoute implements Interfaces\Endpoint {
	/**
	 * Current parent.
	 *
	 * @var \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint
	 */
	protected $parent;

	/**
	 * Current route, effect only in case the endpoint behave like sub-endpoint.
	 *
	 * @var string
	 */
	protected $route;

	/**
	 * Loaded sub endpoint(s).
	 *
	 * @var \Elementor\Data\Base\Endpoint[]
	 */
	protected $sub_endpoints = [];

	/**
	 * Endpoint constructor.
	 *
	 * run `$this->>register()`.
	 *
	 * @param \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint $parent
	 * @param string $route
	 */
	public function __construct( $parent, $route = '/' ) {
		$this->parent = $parent;

		// In case, its behave like sub-endpoint.
		if ( ! ( $parent instanceof Controller ) ) {
			$this->route = $this->ensure_slashes( $route );
			$this->controller = $parent->get_controller();
		} else {
			$this->controller = $parent;
		}

		$this->register();
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
	 * Get ancestors.
	 *
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

	abstract public function get_name();

	abstract public function get_format();

	public function get_controller() {
		return $this->controller;
	}

	public function get_parent() {
		return $this->parent;
	}

	public function get_public_name() {
		return $this->get_name();
	}

	public function get_full_command() {
		$parent = $this->get_parent();

		if ( $parent instanceof Controller ) {
			return $this->controller->get_full_name() . '/' . $this->get_name();
		}

		return $this->get_name_ancestry();
	}

	public function get_name_ancestry() {
		$ancestors = $this->get_ancestors();
		$ancestors_names = [];

		foreach ( $ancestors as $ancestor ) {
			$ancestors_names [] = $ancestor->get_name();
		}

		return implode( '/', $ancestors_names );
	}

	public function register_sub_endpoint( Endpoint $endpoint ) {
		$endpoint = new Endpoint\Proxy( $endpoint );

		$command = $endpoint->get_full_command();
		$format = $endpoint->get_format();

		$this->sub_endpoints[ $command ] = $endpoint;

		Manager::instance()->register_endpoint_format( $command, $format );

		return $endpoint;
	}
}
