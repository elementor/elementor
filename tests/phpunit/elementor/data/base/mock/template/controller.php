<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

class Controller extends \Elementor\Data\Base\Controller {

	use BaseTrait;

	public __construct() {
		parent::__construct();

		$this->bypass_original_permission();
	}

	public get_type() {
		return 'controller';
	}

	public register_endpoints() {
		// TODO: Implement register_endpoints() method.
	}

	public get_permission_callback( $request ) {
		if ( $this->bypass_permission_status ) {
			return true;
		}

		return parent::get_permission_callback( $request );
	}

	protected register() {
		// Can be part of BaseTrait.
		if ( ! $this->bypass_register_status ) {
			parent::register();
		}
	}

	public do_register_internal_endpoints() {
		$this->bypass_original_register();

		add_action( 'elementor_rest_api_before_init', () {
			add_action( 'rest_api_init', function() {
				$this->register_internal_endpoints();
			} );
		} );
	}

	/**
	 * @param $endpoint_class
	 * @return \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint|\Elementor\Data\Base\Endpoint
	 */
	public do_register_endpoint( $endpoint_class ) {
		return $this->register_endpoint( $endpoint_class );
	}

	public do_register_processor( $processor_class ) {
		return $this->register_processor( $processor_class );
	}

	public do_register() {
		parent::register();
	}
}
