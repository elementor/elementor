<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\Elementor_Post_Meta;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Meta extends Elementor_Test_Base {
	protected Elementor_Post_Meta $post_meta;

	protected int $post_id;

	public function setUp(): void {
		parent::setUp();

		$this->post_meta = new Elementor_Post_Meta();
		$this->post_id = $this->factory()->create_and_get_default_post()->ID;

		$document = Plugin::$instance->documents->get( $this->post_id );
		$document->set_is_built_with_elementor( true );

		do_action( 'rest_api_init' );
	}

	public function test_register() {
		// Arrange
		$this->post_meta->register();

		// Act
		$request = new \WP_REST_Request( 'OPTIONS', '/wp/v2/posts' );
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();
		$meta_schema = $data['schema']['properties']['meta']['properties'];

		// Assert
		$this->assertArrayHasKey( '_elementor_edit_mode', $meta_schema );
		$this->assertArrayHasKey( '_elementor_template_type', $meta_schema );
		$this->assertArrayHasKey( '_elementor_data', $meta_schema );
		$this->assertArrayHasKey( '_elementor_page_settings', $meta_schema );
	}

	public function test_check_edit_permission_with_valid_user() {
		// Arrange
		$this->act_as_admin();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_invalid_user() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertFalse( $has_permission );
	}

	public function test_check_edit_permission_with_non_elementor_post() {
		// Arrange
		$this->act_as_admin();
		$non_elementor_post_id = $this->factory()->post->create();

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $non_elementor_post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_elementor_post_and_excluded_user_roles() {
		// Arrange
		$this->act_as_admin();
		update_option( 'elementor_exclude_user_roles', [ 'administrator' ] );

		// Act
		$has_permission = $this->post_meta->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertFalse( $has_permission );
	}

	public function test_meta_should_not_be_registered_for_non_elementor_post_types() {
		// Arrange
		$this->act_as_admin();

		register_post_type( 'non_elementor', [
			'public' => true,
			'show_in_rest' => true,
			'supports' => [ 'title', 'editor', 'custom-fields' ],
		] );

		do_action( 'rest_api_init' );

		// Act
		$request = new \WP_REST_Request( 'OPTIONS', '/wp/v2/non_elementor' );
		$response = rest_get_server()->dispatch( $request );
		$data = $response->get_data();

		// Assert
		$meta_schema = $data['schema']['properties']['meta']['properties'];
		$this->assertArrayNotHasKey( '_elementor_edit_mode', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_template_type', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_data', $meta_schema );
		$this->assertArrayNotHasKey( '_elementor_page_settings', $meta_schema );
	}

	public function test_page_settings_json_object_should_be_saved_as_an_array() {
		// Arrange
		$this->act_as_admin();

		$page_settings = [
			'hide_title' => 'yes',
			'custom_setting' => 'value',
		];

		$object_settings = (object) [
			'meta' => (object) [
				'_elementor_page_settings' => (object) $page_settings,
			],
		];

		$json_string = wp_json_encode( $object_settings );

		// Act
		$request = new \WP_REST_Request( 'POST', '/wp/v2/posts/' . $this->post_id );
		$request->set_body( $json_string );
		$request->set_header( 'content-type', 'application/json' );
		rest_get_server()->dispatch( $request );

		// Assert
		$saved_value = get_post_meta( $this->post_id, '_elementor_page_settings', true );
		$this->assertEquals( $page_settings, $saved_value, 'Saved value should be an array' );
	}

	/**
	 * @see https://github.com/elementor/elementor/issues/30160
	 * Issue caused by WP_REST_Meta_Fields::is_meta_value_same_as_stored_value() function that attempted to
	 * sanitize the meta value as a string by using a default type of 'string' in the schema.
	 */
	public function test_page_settings_should_be_saved_when_meta_value_is_same_as_stored_value() {
		// Arrange
		$this->act_as_admin();

		$page_settings = [
			'hide_title' => 'yes',
			'custom_setting' => 'value',
		];

		update_post_meta( $this->post_id, '_elementor_page_settings', $page_settings );

		// Act
		$request = new \WP_REST_Request( 'POST', '/wp/v2/posts/' . $this->post_id );
		$request->set_param( 'meta', [
			'_elementor_page_settings' => $page_settings,
		] );
		$request->set_header( 'content-type', 'application/json' );
		$data = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 200, $data->get_status(), 'Status should be 200' );
	}
}
