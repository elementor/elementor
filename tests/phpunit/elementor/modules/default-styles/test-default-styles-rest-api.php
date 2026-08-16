<?php

namespace Elementor\Testing\Modules\DefaultStyles;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\DefaultStyles\Default_Style_Post_Type;
use Elementor\Modules\DefaultStyles\Default_Styles_REST_API;
use Elementor\Modules\DefaultStyles\Default_Styles_Repository;
use Elementor\Modules\DefaultStyles\Default_Styles_Tag_Post_IDs;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Default_Styles_REST_API extends Elementor_Test_Base {
	private Kit $kit;

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		Default_Style_Post_Type::ensure_registered();

		( new Default_Styles_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		$this->reset_default_styles_state();

		parent::tearDown();
	}

	public function test_all__returns_empty_when_no_styles() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( [], $response->get_data()['data'] );
	}

	public function test_all__returns_saved_styles() {
		$this->act_as_admin();

		Default_Styles_Repository::make( $this->kit )->put( 'h1', $this->sample_style_payload() );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );

		$data = json_decode( json_encode( $response->get_data()['data'] ), true );

		$this->assertArrayHasKey( 'h1', $data );
		$this->assertSame( 'h1', $data['h1']['id'] );
		$this->assertSame( 'e-default-h1', $data['h1']['cssName'] );
	}

	public function test_get_one__returns_style() {
		$this->act_as_admin();

		Default_Styles_Repository::make( $this->kit )->put( 'h2', $this->sample_style_payload( 'blue' ) );

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles/h2' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertSame( 'h2', $response->get_data()['data']['id'] );
		$this->assertSame( 'blue', $response->get_data()['data']['variants'][0]['props']['color']['value'] );
	}

	public function test_get_one__returns_not_found_for_missing_tag() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles/h3' );
		$response = rest_do_request( $request );

		$this->assertSame( 404, $response->get_status() );
		$this->assertSame( 'not_found', $response->get_data()['code'] );
	}

	public function test_get_one__returns_invalid_tag_error() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles/script' );
		$response = rest_do_request( $request );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_tag', $response->get_data()['code'] );
	}

	public function test_put__creates_and_updates_style() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/default-styles/h1' );
		$request->set_body_params( [
			'variants' => $this->sample_style_payload()['variants'],
		] );

		$create_response = rest_do_request( $request );

		$this->assertSame( 200, $create_response->get_status() );
		$this->assertSame( 'h1', $create_response->get_data()['data']['id'] );

		$request->set_body_params( [
			'variants' => $this->sample_style_payload( 'green' )['variants'],
		] );

		$update_response = rest_do_request( $request );

		$this->assertSame( 200, $update_response->get_status() );
		$this->assertSame( 'green', $update_response->get_data()['data']['variants'][0]['props']['color']['value'] );
	}

	public function test_put__returns_invalid_tag_error() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/default-styles/script' );
		$request->set_body_params( [
			'variants' => $this->sample_style_payload()['variants'],
		] );

		$response = rest_do_request( $request );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_tag', $response->get_data()['code'] );
	}

	public function test_put__returns_persist_failed_when_create_fails() {
		$this->act_as_admin();

		add_filter(
			'wp_insert_post_empty_content',
			static function ( $maybe_empty, $postarr ) {
				if ( Default_Style_Post_Type::CPT === $postarr['post_type'] ) {
					return true;
				}

				return $maybe_empty;
			},
			10,
			2
		);

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/default-styles/h1' );
		$request->set_body_params( [
			'variants' => $this->sample_style_payload()['variants'],
		] );

		$response = rest_do_request( $request );

		remove_all_filters( 'wp_insert_post_empty_content' );

		$this->assertSame( 500, $response->get_status() );
		$this->assertSame( 'persist_failed', $response->get_data()['code'] );
	}

	public function test_delete__removes_style() {
		$this->act_as_admin();

		Default_Styles_Repository::make( $this->kit )->put( 'p', $this->sample_style_payload() );

		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/default-styles/p' );
		$response = rest_do_request( $request );

		$this->assertSame( 200, $response->get_status() );
		$this->assertTrue( $response->get_data()['data']['deleted'] );
		$this->assertNull( Default_Styles_Repository::make( $this->kit )->get( 'p' ) );
	}

	public function test_delete__returns_invalid_tag_error() {
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'DELETE', '/elementor/v1/default-styles/script' );
		$response = rest_do_request( $request );

		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_tag', $response->get_data()['code'] );
	}

	public function test_all__fails_for_non_admin_user() {
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/default-styles' );
		$response = rest_do_request( $request );

		$this->assertSame( 403, $response->get_status() );
	}

	public function test_put__fails_for_non_logged_in_user() {
		wp_set_current_user( 0 );

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/default-styles/h1' );
		$request->set_body_params( [
			'variants' => $this->sample_style_payload()['variants'],
		] );

		$response = rest_do_request( $request );

		$this->assertSame( 401, $response->get_status() );
	}

	private function sample_style_payload( string $color = 'red' ): array {
		return [
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color,
						],
					],
				],
			],
		];
	}

	private function reset_default_styles_state(): void {
		$this->kit->delete_meta( Default_Styles_Tag_Post_IDs::META_KEY );

		$post_ids = get_posts( [
			'post_type' => Default_Style_Post_Type::CPT,
			'post_status' => 'any',
			'posts_per_page' => -1,
			'fields' => 'ids',
		] );

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}
}
