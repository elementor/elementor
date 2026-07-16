<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Common\Modules\EventsManager;

use Elementor\Core\Common\Modules\EventsManager\Wp_Http_Consumer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Wp_Http_Consumer extends Elementor_Test_Base {

	public function test_persist_sends_non_blocking_request_with_encoded_batch() {
		// Arrange
		$batch = [ [ 'event' => 'test_event', 'properties' => [ 'token' => 'abc' ] ] ];
		$captured_request = null;

		add_filter( 'pre_http_request', function ( $preempt, $parsed_args, $url ) use ( &$captured_request ) {
			$captured_request = [
				'url' => $url,
				'args' => $parsed_args,
			];

			return [
				'response' => [ 'code' => 200 ],
				'body' => '1',
			];
		}, 10, 3 );

		$consumer = new Wp_Http_Consumer( [
			'host' => 'events.example.com',
			'endpoint' => '/track',
			'use_ssl' => true,
		] );

		// Act
		$result = $consumer->persist( $batch );

		// Assert
		$this->assertTrue( $result );
		$this->assertEquals( 'https://events.example.com/track', $captured_request['url'] );
		$this->assertFalse( $captured_request['args']['blocking'] );
		$this->assertEquals( base64_encode( wp_json_encode( $batch ) ), $captured_request['args']['body']['data'] );
	}

	public function test_persist_returns_true_for_empty_batch_without_sending_request() {
		// Arrange
		$request_sent = false;

		add_filter( 'pre_http_request', function ( $preempt ) use ( &$request_sent ) {
			$request_sent = true;

			return $preempt;
		} );

		$consumer = new Wp_Http_Consumer( [
			'host' => 'events.example.com',
			'endpoint' => '/track',
		] );

		// Act
		$result = $consumer->persist( [] );

		// Assert
		$this->assertTrue( $result );
		$this->assertFalse( $request_sent );
	}

	public function test_persist_returns_false_when_request_fails() {
		// Arrange
		add_filter( 'pre_http_request', function () {
			return new \WP_Error( 'http_request_failed', 'Could not resolve host' );
		} );

		$consumer = new Wp_Http_Consumer( [
			'host' => 'events.example.com',
			'endpoint' => '/track',
		] );

		// Act
		$result = $consumer->persist( [ [ 'event' => 'test_event' ] ] );

		// Assert
		$this->assertFalse( $result );
	}
}
