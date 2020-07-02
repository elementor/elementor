<?php

namespace Elementor\Testing\Modules\Screenshots;

use Elementor\Modules\Screenshots\Module;
use Elementor\Testing\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Proxy_Action extends Elementor_Test_Base {
	/**
	 * @var Module
	 */
	private $module;

	public function setUp() {
		parent::setUp();

		$this->module = new Module();

		// Mocking the http layer of WP.
		add_filter('pre_http_request', function () {
			return [
				'headers' => new \Requests_Utility_CaseInsensitiveDictionary([
					'content-type' => 'text/css'
				]),
				'body' => 'This is a try',
			];
		});
	}

	public function test_proxy_should_return_valid_headers_and_content(  ) {
		$_GET['nonce'] = wp_create_nonce('screenshot_proxy');
		$_GET['href'] = 'https://example.com';

		$this->module->screenshot_proxy();

		$this->expectOutputString('This is a try');
	}

	public function test_cannot_get_content_with_invalid_nonce(  ) {
		$action = 'invalid_nonce_action';

		$_GET['nonce'] = wp_create_nonce($action);
		$_GET['href'] = 'https://example.com';

		$this->module->screenshot_proxy();

		$this->expectOutputString('');
	}


}
