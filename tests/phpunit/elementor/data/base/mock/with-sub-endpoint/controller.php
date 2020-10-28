<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithSubEndpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	/**
	 * @var \Elementor\Data\Base\Endpoint|\Elementor\Data\Base\Endpoint\Index|Endpoint
	 */
	protected $test_endpoint;

	/**
	 * @var \Elementor\Data\Base\SubEndpoint|SubEndpoint
	 */
	protected $test_sub_endpoint;

	public function register_endpoints() {
		$this->test_endpoint = $this->register_endpoint( new Endpoint( $this ) );
		$this->test_sub_endpoint = $this->test_endpoint->register_sub_endpoint( new SubEndpoint( $this->test_endpoint ) );
	}

	public function get_test_endpoint() {
		return $this->test_endpoint;
	}

	public function get_test_sub_endpoint() {
		return $this->test_sub_endpoint;
	}
}
