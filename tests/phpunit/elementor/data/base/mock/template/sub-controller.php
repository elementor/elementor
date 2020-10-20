<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassPermission;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassRegister;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockNameType;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockTestData;

class SubController extends \Elementor\Data\Base\SubController {
	use MockNameType, MockBypassPermission, MockTestData, MockBypassRegister;

	/**
	 * @var string
	 */
	private $test_route;

	public function __construct( $parent_controller = null, $test_route = '' ) {
		$this->test_route = $test_route;
		parent::__construct( $parent_controller );
		$this->bypass_original_permission();
	}

	function get_type() {
		return 'sub-controller';
	}

	public function get_route() {
		return $this->test_route;
	}

	public function register_endpoints() {
		// TODO: Implement register_endpoints() method.
	}

	public function get_items( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::get_items( $request );
	}

	public function get_item( $request ) {
		$test_data = $this->get_test_data( __FUNCTION__ );

		if ( $test_data ) {
			return $test_data;
		}

		return parent::get_item( $request );
	}

	public function do_register_internal_endpoints() {
		$this->bypass_original_register();

		add_action( 'elementor_rest_api_before_init', function () {
			add_action( 'rest_api_init', function() {
				$this->register_internal_endpoints();
			} );
		} );
	}

	/**
	 * @param $endpoint_class
	 * @return \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint|\Elementor\Data\Base\Endpoint
	 */
	public function do_register_endpoint( $endpoint_class ) {
		return $this->register_endpoint( $endpoint_class );
	}

	public function get_endpoint_internal_index() {
		return reset( $this->endpoints_internal );
	}
}
