<?php

namespace Elementor\Data\Base;

use Elementor\Data\Manager;

abstract class SubController extends Controller {
	/**
	 * @var \Elementor\Data\Base\Controller
	 */
	public $parent_controller;

	/**
	 * SubController constructor.
	 *
	 * $parent_controller is optional, if not passed will use `$this->get_parent_name()`.
	 *
	 * @param null|\Elementor\Data\Base\Controller $parent_controller
	 */
	public function __construct( $parent_controller = null ) {
		$this->parent_controller = $parent_controller;

		if ( ! $this->parent_controller ) {
			$this->parent_controller = Manager::instance()->get_controller( $this->get_parent_name() );
		}

		if ( ! $this->parent_controller ) {
			trigger_error( 'Cannot find parent controller' );
			return;
		}

		if ( $this->parent_controller instanceof SubController ) {
			trigger_error( 'Parent cannot be sub-controller use endpoints/sub-endpoints' );
			return;
		}

		parent::__construct();
	}

	public function get_full_name() {
		return $this->parent_controller->get_name() . '/' . parent::get_full_name();
	}

	public function get_rest_base() {
		$route = $this->get_route();

		if ( $route ) {
			$route = '/' . $route;
		}

		return $this->parent_controller->get_rest_base() . $route . '/' . $this->get_name();
	}

	/**
	 * @return string
	 */
	abstract public function get_route();

	public function get_parent() {
		return $this->parent_controller;
	}

	/**
	 * @return string
	 */
	public function get_parent_name() {
		trigger_error( 'get_parent_name() or passing parent via constructor is required.', E_USER_ERROR );
	}

	protected function register_index_endpoint() {
		$this->register_endpoint( Endpoint\IndexSubController::class );
	}
}
