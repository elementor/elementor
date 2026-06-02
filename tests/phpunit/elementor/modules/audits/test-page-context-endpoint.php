<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Data\Endpoints\Page_Context;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Page_Context_Endpoint extends TestCase {

	private $post_id;
	private $attachment_id;
	private $admin_user_id;

	public function setUp(): void {
		parent::setUp();

		$this->admin_user_id = $this->factory()->user->create( [ 'role' => 'administrator' ] );
		wp_set_current_user( $this->admin_user_id );

		$this->post_id = $this->factory()->post->create( [
			'post_title' => 'Hello',
			'post_excerpt' => 'World',
		] );

		$this->attachment_id = $this->factory()->attachment->create_upload_object(
			__DIR__ . '/fixtures/sample.jpg',
			$this->post_id
		);
	}

	public function tearDown(): void {
		wp_delete_post( $this->post_id, true );
		wp_delete_attachment( $this->attachment_id, true );
		wp_delete_user( $this->admin_user_id );
		parent::tearDown();
	}

	private function factory() {
		return new \WP_UnitTest_Factory();
	}

	public function test_returns_post_title_and_excerpt() {
		// Arrange.
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertSame( 'Hello', $response['post_title'] );
		$this->assertSame( 'World', $response['post_excerpt'] );
	}

	public function test_returns_null_excerpt_when_empty() {
		// Arrange.
		wp_update_post( [
			'ID' => $this->post_id,
			'post_excerpt' => '',
		] );
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertNull( $response['post_excerpt'] );
	}

	public function test_image_sizes_limited_to_passed_attachment_ids() {
		// Arrange.
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );
		$request->set_param( 'attachment_ids', [ $this->attachment_id ] );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertArrayHasKey( $this->attachment_id, $response['image_sizes'] );
		$this->assertArrayHasKey( 'filesize_bytes', $response['image_sizes'][ $this->attachment_id ] );
	}

	public function test_image_sizes_empty_when_no_attachment_ids_passed() {
		// Arrange.
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertSame( [], $response['image_sizes'] );
	}

	public function test_privacy_policy_url_is_null_when_not_configured() {
		// Arrange.
		update_option( 'wp_page_for_privacy_policy', 0 );
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertNull( $response['privacy_policy_url'] );
	}

	public function test_privacy_policy_url_is_returned_when_published_page_is_set() {
		// Arrange.
		$privacy_page_id = $this->factory()->post->create( [
			'post_title'  => 'Privacy Policy',
			'post_status' => 'publish',
			'post_type'   => 'page',
		] );
		update_option( 'wp_page_for_privacy_policy', $privacy_page_id );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertNotNull( $response['privacy_policy_url'] );
		$this->assertStringContainsString( get_permalink( $privacy_page_id ), $response['privacy_policy_url'] );

		// Cleanup.
		wp_delete_post( $privacy_page_id, true );
		update_option( 'wp_page_for_privacy_policy', 0 );
	}

	public function test_privacy_settings_url_always_points_to_options_privacy_page() {
		// Arrange.
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertArrayHasKey( 'privacy_settings_url', $response );
		$this->assertStringContainsString( 'options-privacy.php', $response['privacy_settings_url'] );
	}

	private function build_controller() {
		return new \Elementor\Modules\Audits\Data\Controller();
	}
}
