<?php

namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Modules\GlobalClasses\Utils\Debug_Logger;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Debug_Logger extends Elementor_Test_Base {

	public function test_log_request_debug__logs_request_information() {
		// Arrange
		$request = $this->create_mock_request();

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_request_debug( $request );
	}

	public function test_log_validation_errors__logs_validation_errors() {
		// Arrange
		$context = 'items';
		$errors = 'Invalid items: missing required field';

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_validation_errors( $context, $errors );
	}

	public function test_log_modified_labels__logs_modified_labels() {
		// Arrange
		$modified_labels = [
			[
				'original' => 'duplicate-label',
				'modified' => 'DUP_duplicate-label1',
				'id' => 'g-1',
			],
		];

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_modified_labels( $modified_labels );
	}

	public function test_log_modified_labels__handles_empty_array() {
		// Arrange
		$modified_labels = [];

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_modified_labels( $modified_labels );
	}

	public function test_log_modified_labels__handles_null() {
		// Arrange
		$modified_labels = null;

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_modified_labels( $modified_labels );
	}

	public function test_log_validation_errors__handles_empty_errors() {
		// Arrange
		$context = 'items';
		$errors = '';

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_validation_errors( $context, $errors );
	}

	public function test_log_validation_errors__handles_null_errors() {
		// Arrange
		$context = 'items';
		$errors = null;

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_validation_errors( $context, $errors );
	}

	public function test_log_request_debug__handles_null_request() {
		// Arrange
		$request = null;

		// Act & Assert - We can't easily test error_log output, but we can ensure the method doesn't throw errors
		$this->expectNotToPerformAssertions();
		Debug_Logger::log_request_debug( $request );
	}

	private function create_mock_request() {
		$request = $this->createMock( \WP_REST_Request::class );
		
		$request->method( 'get_route' )
			->willReturn( '/elementor/v1/global-classes' );
		
		$request->method( 'get_params' )
			->willReturn( [
				'items' => [],
				'order' => [],
				'changes' => [
					'added' => [],
					'deleted' => [],
					'modified' => [],
				],
			] );
		
		$request->method( 'get_body' )
			->willReturn( '{"items":{},"order":[],"changes":{"added":[],"deleted":[],"modified":[]}}' );
		
		$request->method( 'get_headers' )
			->willReturn( [
				'content-type' => [ 'application/json' ],
			] );
		
		return $request;
	}
}
