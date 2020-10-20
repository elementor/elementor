<?php
namespace Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\WithSubEndpoint;

use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Endpoint;
use Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\SubEndpoint;

class Controller extends \Elementor\Tests\Phpunit\Elementor\Data\Base\Mock\Template\Controller {

	/**
	 * @var \Elementor\Data\Base\Endpoint|\Elementor\Data\Base\Endpoint\Internal|Endpoint|false
	 */
	protected $test_endpoint;

	/**
	 * @var \Elementor\Data\Base\SubEndpoint|SubEndpoint|false
	 */
	protected $test_sub_endpoint;

	public function register_endpoints() { // do same in with endpoint
		$this->test_endpoint = $this->register_endpoint( Endpoint::class );
		$this->test_sub_endpoint = $this->test_endpoint->register_sub_endpoint( '',SubEndpoint::class );
	}

	public function get_test_endpoint() {
		return $this->test_endpoint;
	}

	public function get_test_sub_endpoint() {
		return $this->test_sub_endpoint;
	}
}
