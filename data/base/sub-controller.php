<?php

namespace Elementor\Data\Base;

use Elementor\Data\Manager;

abstract class SubController extends Controller {
	/**
	 * @var \Elementor\Data\Base\Controller
	 */
	private $parent_controller;

	public function __construct() {
		$this->parent_controller = Manager::instance()->get_controller( $this->get_parent_name() );

		if ( ! $this->parent_controller ) {
			trigger_error( 'Cannot find parent controller' );
			return;
		}

		parent::__construct();
	}

	public function get_rest_base() {
		return $this->parent_controller->get_rest_base() . '/' . $this->get_route() . '/' . $this->get_name();
	}

	/**
	 * @return string
	 */
	abstract public function get_route();

	/**
	 * @return string
	 */
	abstract public function get_parent_name();
}
