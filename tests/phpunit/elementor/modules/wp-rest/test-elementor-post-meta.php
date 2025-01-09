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
}
