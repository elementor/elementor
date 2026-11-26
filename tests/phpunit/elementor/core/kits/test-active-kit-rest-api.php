<?php

namespace Elementor\Testing\Core\Kits;

use Elementor\Core\Kits\Active_Kit_Rest_Api;
use Elementor\Core\Kits\Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Active_Kit_Rest_Api extends Elementor_Test_Base {
	const ROUTE = '/elementor/v1/kits/active/settings';

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Active_Kit_Rest_Api() )->register_hooks();

		do_action( 'rest_api_init' );
	}

	public function test_get__rejects_users_that_cannot_edit_theme_options() {
		// Arrange
		$this->act_as_editor_role();

		// Act
		$response = rest_do_request( new \WP_REST_Request( 'GET', self::ROUTE ) );

		// Assert
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_update__rejects_users_that_cannot_edit_theme_options() {
		// Arrange
		$this->act_as_editor_role();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [ 'settings' => [ 'site_name' => 'Nope' ] ] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_update__saves_site_identity_and_get_returns_requested_keys() {
		// Arrange
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [ 'settings' => [ 'site_name' => 'Renamed Site' ] ] );

		// Act
		$update_response = rest_do_request( $request );

		$get_request = new \WP_REST_Request( 'GET', self::ROUTE );
		$get_request->set_param( 'keys', 'site_name' );
		$get_response = rest_do_request( $get_request );

		// Assert
		$this->assertSame( 200, $update_response->get_status() );
		$this->assertSame( 'Renamed Site', get_option( 'blogname' ) );
		$this->assertSame( [ 'site_name' => 'Renamed Site' ], (array) $get_response->get_data()['data'] );
	}

	public function test_update__ignores_kit_id_param_and_updates_active_kit() {
		// Arrange
		$this->act_as_admin();
		$active_kit_id = Plugin::$instance->kits_manager->get_active_id();
		$other_post_id = $this->factory()->post->create();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [
			'kit_id' => $other_post_id,
			'id' => $other_post_id,
			'settings' => [ 'site_name' => 'Active Only' ],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( $active_kit_id, $response->get_data()['meta']['kit_id'] );
		$this->assertEmpty( get_post_meta( $other_post_id, '_elementor_page_settings', true ) );
	}

	public function test_get__returns_404_when_there_is_no_active_kit() {
		// Arrange
		$this->act_as_admin();
		update_option( Manager::OPTION_ACTIVE, 0 );

		// Act
		$response = rest_do_request( new \WP_REST_Request( 'GET', self::ROUTE ) );

		// Assert
		$this->assertSame( 404, $response->get_status() );
	}

	public function test_update__requires_the_highest_capability_among_the_changed_keys() {
		// Arrange
		$this->act_as_theme_options_only_user();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [ 'settings' => [ 'site_name' => 'Nope', 'site_logo' => [ 'id' => 0, 'url' => '' ] ] ] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_update__allows_keys_covered_by_the_kit_capability() {
		// Arrange
		$this->act_as_theme_options_only_user();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [ 'settings' => [ 'site_logo' => [ 'id' => 0, 'url' => '' ] ] ] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );
	}

	public function test_get__reports_which_keys_the_user_can_edit() {
		// Arrange
		$this->act_as_theme_options_only_user();
		$request = new \WP_REST_Request( 'GET', self::ROUTE );
		$request->set_param( 'keys', 'site_name,site_logo' );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );
		$this->assertSame(
			[
				'site_name' => false,
				'site_logo' => true,
			],
			(array) $response->get_data()['meta']['editable']
		);
	}

	public function test_update__rejects_empty_settings() {
		// Arrange
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'PUT', self::ROUTE );
		$request->set_body_params( [ 'settings' => [] ] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 400, $response->get_status() );
	}

	private function act_as_theme_options_only_user() {
		$user_id = $this->factory()->user->create( [ 'role' => 'editor' ] );
		get_user_by( 'id', $user_id )->add_cap( 'edit_theme_options' );
		wp_set_current_user( $user_id );
	}

	private function act_as_editor_role() {
		wp_set_current_user( $this->factory()->user->create( [ 'role' => 'editor' ] ) );
	}
}
