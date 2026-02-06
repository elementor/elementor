<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Progress;
use Elementor\App\Modules\E_Onboarding\Storage\Repository;
use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Progress extends Test_Base {

	private User_Progress $endpoint;

	public function setUp(): void {
		parent::setUp();

		$controller = $this->createMock( \Elementor\Data\V2\Base\Controller::class );
		$this->endpoint = new User_Progress( $controller );
	}

	public function test_get_name_returns_user_progress() {
		// Assert
		$this->assertSame( 'user-progress', $this->endpoint->get_name() );
	}

	public function test_get_format_returns_e_onboarding() {
		// Assert
		$this->assertSame( 'e-onboarding', $this->endpoint->get_format() );
	}

	public function test_get_items_returns_progress_data() {
		// Arrange
		$this->repository->update_progress( [
			'current_step' => 2,
			'completed_steps' => [ 'building_for', 'site_about' ],
		] );

		$request = new WP_REST_Request( 'GET' );

		// Act
		$result = $this->endpoint->get_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'data', $result );
		$this->assertArrayHasKey( 'meta', $result );
		$this->assertSame( 2, $result['data']['current_step'] );
		$this->assertSame( [ 'building_for', 'site_about' ], $result['data']['completed_steps'] );
	}

	public function test_get_items_returns_had_unexpected_exit_meta() {
		// Arrange
		$this->repository->update_progress( [
			'current_step' => 2,
		] );

		$request = new WP_REST_Request( 'GET' );

		// Act
		$result = $this->endpoint->get_items( $request );

		// Assert
		$this->assertArrayHasKey( 'had_unexpected_exit', $result['meta'] );
	}

	public function test_update_items_updates_current_step() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'current_step' => 3,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'success', $result['data'] );
		$this->assertSame( 3, $result['progress']['current_step'] );
	}

	public function test_update_items_validates_current_step() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'current_step' => 'invalid',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_current_step', $result->get_error_code() );
	}

	public function test_update_items_updates_completed_steps() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'completed_steps' => [ 'building_for', 'site_about', 'experience_level' ],
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( [ 'building_for', 'site_about', 'experience_level' ], $result['progress']['completed_steps'] );
	}

	public function test_update_items_validates_completed_steps() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'completed_steps' => 'not_an_array',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_completed_steps', $result->get_error_code() );
	}

	public function test_update_items_updates_exit_type() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'exit_type' => 'user_exit',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_update_items_validates_exit_type() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'exit_type' => 'invalid_type',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'invalid_exit_type', $result->get_error_code() );
	}

	public function test_update_items_handles_complete_step() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'complete_step' => 'building_for',
			'total_steps' => 5,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertContains( 'building_for', $result['progress']['completed_steps'] );
	}

	public function test_update_items_handles_start() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'start' => true,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNotNull( $result['progress']['started_at'] );
	}

	public function test_update_items_handles_complete() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'complete' => true,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNotNull( $result['progress']['completed_at'] );
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_update_items_handles_user_exit() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'user_exit' => true,
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_update_items_with_empty_params_returns_success() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( 'success', $result['data'] );
	}

	public function test_update_items_always_updates_last_active_timestamp() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNotNull( $result['progress']['last_active_timestamp'] );
	}
}
