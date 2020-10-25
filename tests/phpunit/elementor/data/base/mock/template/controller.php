<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassPermission;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockBypassRegister;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Traits\MockNameType;

class Controller extends \Elementor\Data\Base\Controller {

	use MockNameType, MockBypassPermission, MockBypassRegister;

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

	public function do_register_index_endpoint() {
		$this->bypass_original_register();

		add_action( 'elementor_rest_api_before_init', function () {
			add_action( 'rest_api_init', function() {
				$this->register_index_endpoint();
			} );
		} );
	}

	/**
	 * @param $endpoint
	 * @return \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint|\Elementor\Data\Base\Endpoint
	 */
	public function do_register_endpoint( $endpoint ) {
		return $this->register_endpoint( $endpoint );
	}

	public function do_register_processor( $processor_class ) {
		return $this->register_processor( $processor_class );
	}

	/**
	 * @return \Elementor\Data\Base\Endpoint\Index|\Elementor\Data\Base\Endpoint\Index\Recursive|null
	 */
	public function get_endpoint_index() {
		return $this->index_endpoint;
	}
}
