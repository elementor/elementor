<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class Controller extends \Elementor\Data\Base\Controller {

	use BaseTrait;

	public function __construct() {
		parent::__construct();

		$this->bypass_original_permission();
	}

	public function get_type() {
		return 'controller';
	}

	public function register_endpoints() {
		// TODO: Implement register_endpoints() method.
	}

	public function get_permission_callback( $request ) {
		if ( $this->bypass_permission_status ) {
			return true;
		}

		return parent::get_permission_callback( $request );
	}

	protected function register() {
		// Can be part of BaseTrait.
		if ( ! $this->bypass_register_status ) {
			parent::register();
		}
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

	public function do_register_processor( $processor_class ) {
		return $this->register_processor( $processor_class );
	}

	public function do_register() {
		parent::register();
	}
}
