<?php
namespace Elementor\Tests\Phpunit\Includes;

use Elementor\Api;
use ElementorEditorTesting\Elementor_Test_AJAX;
use ElementorEditorTesting\Traits\Auth_Helpers;

class Test_Api extends Elementor_Test_AJAX {
	use Auth_Helpers;

	public function setUp(): void {
		parent::setUp();

		// TODO: HACK - Avoid register reports to make sure the 'tests/phpunit/elementor/schemas/test-usage.php' not fail.
		remove_all_actions( 'admin_init' );
	}

	public function test_ajax_reset_api_data__without_nonce() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_reset_library';

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertNull( $response );
	}

	public function test_ajax_reset_api_data__unauthorized_user() {
		// Arrange
		$this->act_as_editor();

		$action = 'elementor_reset_library';
		$_POST['_nonce'] = wp_create_nonce( $action );

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( false, $response['success'] );
	}

	public function test_ajax_reset_api_data() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_reset_library';
		$_POST['_nonce'] = wp_create_nonce( $action );

		$cleanup = $this->mock_get_info();

		// Act
		$response = $this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( true, $response['success'] );
		$this->assertEquals( 'test-feed', get_option( Api::FEED_OPTION_KEY ) );
		$this->assertEqualSets( [
			'additional-data' => 'test-additional-data',
		], get_transient( Api::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION ) );

		// Cleanup
		$cleanup();
	}

	public function test_ajax_reset_api_data__error_response_caches_last_error() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_reset_library';
		$_POST['_nonce'] = wp_create_nonce( $action );

		$request_count = 0;
		$cleanup = $this->mock_get_info_error( $request_count );

		// Act
		$this->_handleAjaxAndDecode( $action );

		// Assert
		$cached_data = get_transient( Api::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION );
		$this->assertArrayHasKey( 'last_error', $cached_data );
		// gmdate always returns UTC (+00:00)
		$this->assertMatchesRegularExpression( '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+00:00$/', $cached_data['last_error'] );
		$this->assertEquals( 1, $request_count );

		// Act - subsequent calls should use cached data
		Api::get_upgrade_notice();
		Api::get_admin_notice();
		Api::get_promotion_widgets();

		// Assert - no additional HTTP requests
		$this->assertEquals( 1, $request_count );

		// Cleanup
		$cleanup();
	}

	public function test_ajax_reset_api_data__force_update_bypasses_cached_error() {
		// Arrange
		$this->act_as_admin();

		$action = 'elementor_reset_library';
		$_POST['_nonce'] = wp_create_nonce( $action );

		$request_count = 0;
		$cleanup = $this->mock_get_info_error( $request_count );

		// Act - first call caches error
		$this->_handleAjaxAndDecode( $action );

		// Assert
		$this->assertEquals( 1, $request_count );

		// Act - force update should bypass cache
		Api::get_canary_deployment_info( true );

		// Assert - new HTTP request was made
		$this->assertEquals( 2, $request_count );

		// Cleanup
		$cleanup();
	}

	private function mock_get_info() {
		$filter = function() {
			return [
				'headers' => [],
				'response' => [
					'code' => 200,
					'message' => 'OK',
				],
				'cookies' => [],
				'filename' => '',
				'body' => wp_json_encode( [
					'library' => 'test-library',
					'feed' => 'test-feed',
					'additional-data' => 'test-additional-data',
				] ),
			];
		};

		add_filter( 'pre_http_request',  $filter );

		return function() use( $filter ) {
			remove_filter( 'pre_http_request', $filter );
		};
	}

	private function mock_get_info_error( &$request_count ) {
		$filter = function() use ( &$request_count ) {
			$request_count++;

			return [
				'headers' => [],
				'response' => [
					'code' => 500,
					'message' => 'Internal Server Error',
				],
				'cookies' => [],
				'filename' => '',
				'body' => '',
			];
		};

		add_filter( 'pre_http_request', $filter );

		return function() use( $filter ) {
			remove_filter( 'pre_http_request', $filter );
		};
	}
}
