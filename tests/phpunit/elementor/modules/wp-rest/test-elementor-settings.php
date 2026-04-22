<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\Elementor_Settings;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Settings extends Elementor_Test_Base {
	protected Elementor_Settings $settings;

	public function setUp(): void {
		parent::setUp();
		$this->settings = new Elementor_Settings();
	}

	public function test_get_setting_with_valid_key() {
		// Arrange
		$this->act_as_admin();

		do_action( 'rest_api_init' );

		update_option( 'elementor_test_key', 'test_value' );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/settings/elementor_test_key' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertEquals( 'test_value', $data['data']['value'] );
	}

	public function test_get_setting_with_invalid_key() {
		// Arrange
		$this->act_as_admin();
		do_action( 'rest_api_init' );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/settings/invalid_key' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
	}

	public function test_update_setting_with_valid_key() {
		// Arrange
		$this->act_as_admin();
		do_action( 'rest_api_init' );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/settings/elementor_test_key' );
		$request->set_param( 'value', 'new_test_value' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
		$this->assertEquals( 'new_test_value', get_option( 'elementor_test_key' ) );
	}

	public function test_update_setting_as_a_guest() {
		// Arrange
		do_action( 'rest_api_init' );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/settings/elementor_test_key' );
		$request->set_param( 'value', 'new_test_value' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_update_setting_with_invalid_permissions() {
		// Arrange
		$this->act_as_subscriber();
		do_action( 'rest_api_init' );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/settings/elementor_test_key' );
		$request->set_param( 'value', 'new_test_value' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_update_setting_with_same_value() {
		// Arrange
		$this->act_as_admin();
		do_action( 'rest_api_init' );
		update_option( 'elementor_test_key', 'test_value' );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/settings/elementor_test_key' );
		$request->set_param( 'value', 'test_value' );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data();
		$this->assertTrue( $data['success'] );
	}
}
