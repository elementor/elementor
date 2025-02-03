<?php

namespace Elementor\Testing\Modules\WpRest;

use Elementor\Modules\WpRest\Classes\WP_Post;
use Elementor\Testing\Modules\WpRest\Isolation\Wordpress_Adapter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Elementor_Post_Query extends Elementor_Test_Base {
	const URL = '/elementor/v1/post';

	protected ?WP_Post $post_query;

	public function setUp(): void {
		parent::setUp();

		$this->post_query = new WP_Post( new Wordpress_Adapter() );
		$this->post_query->register();

		do_action( 'rest_api_init' );
	}

	public function tearDown(): void {
		$this->post_query = null;

		parent::tearDown();
	}

	public function test_register() {
		// Arrange
		$params = [];

		// Act
		$request = new \WP_REST_Request( 'GET', self::URL );
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
		$has_permission = $this->post_query->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_invalid_user() {
		// Arrange
		$this->act_as_subscriber();

		// Act
		$has_permission = $this->post_query->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

		// Assert
		$this->assertFalse( $has_permission );
	}

	public function test_check_edit_permission_with_non_elementor_post() {
		// Arrange
		$this->act_as_admin();
		$non_elementor_post_id = $this->factory()->post->create();

		// Act
		$has_permission = $this->post_query->check_edit_permission( true, '_elementor_edit_mode', $non_elementor_post_id );

		// Assert
		$this->assertTrue( $has_permission );
	}

	public function test_check_edit_permission_with_elementor_post_and_excluded_user_roles() {
		// Arrange
		$this->act_as_admin();
		update_option( 'elementor_exclude_user_roles', [ 'administrator' ] );

		// Act
		$has_permission = $this->post_query->check_edit_permission( true, '_elementor_edit_mode', $this->post_id );

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
}
