<?php
namespace Elementor\Data\Base;

use Elementor\Data\Manager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Endpoint extends Base_Route {
	/**
	 * Current parent.
	 *
	 * @var \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint
	 */
	protected $parent;

	/**
	 * Loaded sub endpoint(s).
	 *
	 * @var \Elementor\Data\Base\Endpoint[]
	 */
	protected $sub_endpoints = [];

	/**
	 * Endpoint constructor.
	 *
	 * @param \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint $parent
	 * @param string $route
	 */
	public function __construct( $parent, $route = '/' ) {
		$controller = $parent;
		$this->parent = $parent;

		// In case, its behave like sub-endpoint.
		if ( ! ( $parent instanceof Controller ) ) {
			$controller = $parent->get_controller();
		}

		parent::__construct( $controller, $route );
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

	/**
	 * Get endpoint name.
	 *
	 * @return string
	 */
	abstract public function get_name();

	/**
	 *
	 * Get endpoint format.
	 * The formats that generated using this function, will be used only be `Data\Manager::run()`.
	 *
	 * @return string
	 */
	abstract public function get_format();

	/**
	 * Get controller.
	 *
	 * @return \Elementor\Data\Base\Controller
	 */
	public function get_controller() {
		return $this->controller;
	}

	/**
	 * Get current parent.
	 *
	 * @return \Elementor\Data\Base\Controller|\Elementor\Data\Base\Endpoint
	 */
	public function get_parent() {
		return $this->parent;
	}

	/**
	 * Get public name.
	 *
	 * @return string
	 */
	public function get_public_name() {
		return $this->get_name();
	}

	/**
	 * Get full command name ( including index ).
	 *
	 * @return string
	 */
	public function get_full_command() {
		$parent = $this->get_parent();

		if ( $parent instanceof Controller ) {
			return $this->controller->get_full_name() . '/' . $this->get_name();
		}

		return $this->get_name_ancestry();
	}

	/**
	 * Get name ancestry format, example: 'alpha/beta/delta'.
	 *
	 * @return string
	 */
	public function get_name_ancestry() {
		$ancestors = $this->get_ancestors();
		$ancestors_names = [];

		foreach ( $ancestors as $ancestor ) {
			$ancestors_names [] = $ancestor->get_name();
		}

		return implode( '/', $ancestors_names );
	}

	/**
	 * Register sub endpoint.
	 *
	 * @param \Elementor\Data\Base\Endpoint $endpoint
	 *
	 * @return \Elementor\Data\Base\Endpoint
	 */
	public function register_sub_endpoint( Endpoint $endpoint ) {
		$command = $endpoint->get_full_command();
		$format = $endpoint->get_format();

		$this->sub_endpoints[ $command ] = $endpoint;

		Manager::instance()->register_endpoint_format( $command, $format );

		return $endpoint;
	}
}
