<?php
namespace Elementor\Data\Base;

use Elementor\Data\Base\Endpoint\Index\SubIndexEndpoint;
use Elementor\Data\Manager;

abstract class SubController extends Controller {
	/**
	 * @var \Elementor\Data\Base\Controller
	 */
	public $parent_controller;

	public function __construct() {
		$parent_controller_name = $this->get_parent_name();

		if ( $parent_controller_name ) {
			$this->parent_controller = Manager::instance()->get_controller( $parent_controller_name );
		}

		if ( ! $this->parent_controller ) {
			trigger_error( "Cannot find parent controller: '$parent_controller_name'" );
			return;
		}

		parent::__construct();
	}

	public function get_full_name() {
		return $this->parent_controller->get_name() . '/' . parent::get_full_name();
	}

	public function get_rest_base() {
		$route = $this->get_route();

		return $this->parent_controller->get_rest_base() . $route . '/' . $this->get_name();
	}

	/**
	 * Get parent controller name.
	 *
	 * @return string
	 */
	abstract public function get_parent_name();

	/**
	 * @return string
	 */
	abstract public function get_route();

	public function get_parent() {
		return $this->parent_controller;
	}

	protected function register_index_endpoint() {
		$this->register_endpoint( new SubIndexEndpoint( $this ), [
			'index' => true,
		] );
	}
}
