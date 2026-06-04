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
	private $saved_blogname;
	private $saved_blogdescription;
	private $saved_custom_logo;
	private $saved_site_icon;

	public function setUp(): void {
		parent::setUp();

		$this->saved_blogname = get_option( 'blogname' );
		$this->saved_blogdescription = get_option( 'blogdescription' );
		$this->saved_custom_logo = get_theme_mod( 'custom_logo' );
		$this->saved_site_icon = get_option( 'site_icon' );

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
		update_option( 'blogname', $this->saved_blogname );
		update_option( 'blogdescription', $this->saved_blogdescription );

		if ( $this->saved_custom_logo ) {
			set_theme_mod( 'custom_logo', $this->saved_custom_logo );
		} else {
			remove_theme_mod( 'custom_logo' );
		}

		update_option( 'site_icon', $this->saved_site_icon );

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

	public function test_image_sizes_includes_alt_from_attachment_meta() {
		// Arrange.
		update_post_meta( $this->attachment_id, '_wp_attachment_image_alt', 'Sample alt text' );
		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );
		$request->set_param( 'attachment_ids', [ $this->attachment_id ] );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertArrayHasKey( 'alt', $response['image_sizes'][ $this->attachment_id ] );
		$this->assertSame( 'Sample alt text', $response['image_sizes'][ $this->attachment_id ]['alt'] );
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

	public function test_site_identity_all_set_when_configured() {
		// Arrange.
		update_option( 'blogname', 'My Studio' );
		update_option( 'blogdescription', 'We build things.' );
		set_theme_mod( 'custom_logo', $this->attachment_id );
		update_option( 'site_icon', $this->attachment_id );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertTrue( $response['site_identity']['site_name_set'] );
		$this->assertTrue( $response['site_identity']['site_description_set'] );
		$this->assertTrue( $response['site_identity']['site_logo_set'] );
		$this->assertTrue( $response['site_identity']['site_favicon_set'] );
	}

	public function test_site_identity_name_fails_for_default_wordpress() {
		// Arrange.
		update_option( 'blogname', 'WordPress' );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertFalse( $response['site_identity']['site_name_set'] );
	}

	public function test_site_identity_description_fails_for_default_tagline() {
		// Arrange.
		update_option( 'blogdescription', 'Just another WordPress site' );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertFalse( $response['site_identity']['site_description_set'] );
	}

	public function test_site_identity_logo_false_without_custom_logo() {
		// Arrange.
		remove_theme_mod( 'custom_logo' );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertFalse( $response['site_identity']['site_logo_set'] );
	}

	public function test_site_identity_favicon_false_without_site_icon() {
		// Arrange.
		update_option( 'site_icon', 0 );

		$request = new \WP_REST_Request( 'GET', '' );
		$request->set_param( 'document_id', $this->post_id );

		// Act.
		$response = ( new Page_Context( $this->build_controller() ) )->get_items( $request );

		// Assert.
		$this->assertFalse( $response['site_identity']['site_favicon_set'] );
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
