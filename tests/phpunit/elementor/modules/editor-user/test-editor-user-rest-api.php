<?php

namespace Elementor\Testing\Modules\EditorUser;

use Elementor\User;
use ElementorEditorTesting\Elementor_Test_Base;

if (!defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

class Test_Editor_User_Rest_Api extends Elementor_Test_Base {
	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );
	}

	public function test_get() {
		// Arrange.
		$this->act_as_editor();

		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/editor-user' );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ 'introductions' => [ 'intro1' => true, 'intro2' => false ] ], $response->get_data()['data'] );
	}

	public function test_get__unauthorized() {
		// Arrange.
		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/editor-user' );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_patch() {
		// Arrange.
		$this->act_as_editor();
		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );


		$request = new \WP_REST_Request( 'PATCH', '/elementor/v1/editor-user' );
		$request->set_body_params( [ 'introductions' => [ 'intro1' => false, 'intro3' => true ] ] );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ 'introductions' => [ 'intro1' => true, 'intro2' => false, 'intro3' => true ] ], $response->get_data()['data'] );
	}

	public function test_patch__with_empty_data() {
		// Arrange.
		$this->act_as_editor();
		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );

		$request = new \WP_REST_Request( 'PATCH', '/elementor/v1/editor-user' );
		$request->set_body_params( [] );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ 'introductions' => [ 'intro1' => true, 'intro2' => false ] ], $response->get_data()['data'] );
	}

	public function test_patch__unauthorized() {
		// Arrange.
		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );

		$request = new \WP_REST_Request( 'PATCH', '/elementor/v1/editor-user' );
		$request->set_body_params( [ 'introductions' => [ 'intro1' => false, 'intro3' => true ] ] );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 401, $response->get_status() );
	}

	public function test_patch__sanitize_data() {
		// Arrange.
		$this->act_as_editor();
		update_user_meta( get_current_user_id(), User::INTRODUCTION_KEY, [ 'intro1' => true, 'intro2' => false ] );

		$request = new \WP_REST_Request( 'PATCH', '/elementor/v1/editor-user' );
		$request->set_body_params( [ 'introductions' => [ 'intro1' => 'not-bool', 'intro3' => true ] ] );

		// Act.
		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ 'introductions' => [ 'intro1' => true, 'intro2' => false, 'intro3' => true ] ], $response->get_data()['data'] );
	}
}
