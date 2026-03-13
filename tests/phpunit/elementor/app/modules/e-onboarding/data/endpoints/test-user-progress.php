<?php

namespace Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Data\Endpoints;

use Elementor\App\Modules\E_Onboarding\Data\Endpoints\User_Progress;
use Elementor\Plugin;
use Elementor\Tests\Phpunit\Elementor\App\Modules\E_Onboarding\Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_User_Progress extends Test_Base {

	private User_Progress $endpoint;

	public function setUp(): void {
		parent::setUp();

		Plugin::$instance->data_manager_v2->run_server();
		$controller = Plugin::$instance->data_manager_v2->get_controller( 'e-onboarding' );
		$this->endpoint = $controller->endpoints['e-onboarding/user-progress'];
	}

	public function test_get_items_returns_saved_progress() {
		// Arrange
		$this->progress_manager->update_progress( [
			'current_step' => 2,
			'completed_steps' => [ 'building_for', 'site_about' ],
		] );

		$request = new WP_REST_Request( 'GET' );

		// Act
		$result = $this->endpoint->get_items( $request );

		// Assert
		$this->assertSame( 2, $result['data']['current_step'] );
		$this->assertSame( [ 'building_for', 'site_about' ], $result['data']['completed_steps'] );
		$this->assertArrayHasKey( 'had_unexpected_exit', $result['meta'] );
	}

	public function test_update_items_saves_progress() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [
			'current_step' => 3,
			'completed_steps' => [ 'building_for', 'site_about', 'experience_level' ],
			'exit_type' => 'user_exit',
		] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertSame( 'success', $result['data'] );
		$this->assertSame( 3, $result['progress']['current_step'] );
		$this->assertSame( [ 'building_for', 'site_about', 'experience_level' ], $result['progress']['completed_steps'] );
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_update_items_rejects_invalid_types() {
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
	}

	public function test_update_items_rejects_invalid_exit_type() {
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
	}

	public function test_complete_step_action_marks_step_as_completed() {
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
		$this->assertContains( 'building_for', $result['progress']['completed_steps'] );
	}

	public function test_start_action_sets_started_timestamp() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'start' => true ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertNotNull( $result['progress']['started_at'] );
	}

	public function test_complete_action_sets_completed_timestamp() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'complete' => true ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertNotNull( $result['progress']['completed_at'] );
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_user_exit_action_sets_exit_type() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [ 'user_exit' => true ] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertSame( 'user_exit', $result['progress']['exit_type'] );
	}

	public function test_update_always_updates_last_active_timestamp() {
		// Arrange
		$request = new WP_REST_Request( 'POST' );
		$request->set_body( json_encode( [] ) );
		$request->set_header( 'Content-Type', 'application/json' );

		// Act
		$result = $this->endpoint->update_items( $request );

		// Assert
		$this->assertNotNull( $result['progress']['last_active_timestamp'] );
	}
}
