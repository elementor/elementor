<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class Endpoint extends \Elementor\Data\Base\Endpoint {

	/**
	 * @var \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller
	 */
	public $controller;

	use BaseTrait;

	public get_type() {
		return 'endpoint';
	}

	public get_items( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::get_items( $request );
	}

	public get_item( $id, $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::get_item( $id, $request );
	}

	public create_items( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::create_items( $request );
	}

	public create_item( $id, $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::create_item( $id, $request );
	}

	public update_item( $id, $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::update_item( $id, $request );
	}

	public update_items( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::update_items( $request );
	}

	public delete_item( $id, $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::delete_item( $id, $request );
	}

	public delete_items( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::delete_items( $request );
	}

	protected register() {
		// Can be part of BaseTrait.
		if ( ! $this->controller->bypass_register_status ) {
			parent::register();
		}
	}

	public do_register() {
		parent::register();
	}

	public do_register_sub_endpoint( $route, $endpoint_class ) {
		return parent::register_sub_endpoint( $route, $endpoint_class );
	}
}
