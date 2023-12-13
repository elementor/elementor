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
		$this->assertEquals( 'test-library', get_option( Api::LIBRARY_OPTION_KEY ) );
		$this->assertEquals( 'test-feed', get_option( Api::FEED_OPTION_KEY ) );
		$this->assertEqualSets( [
			'additional-data' => 'test-additional-data',
		], get_transient( Api::TRANSIENT_KEY_PREFIX . ELEMENTOR_VERSION ) );

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
}
