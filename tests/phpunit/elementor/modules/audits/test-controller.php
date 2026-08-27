<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Audits;

use Elementor\Modules\Audits\Data\Controller;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Controller extends Elementor_Test_Base {

	private Controller $controller;

	public function setUp(): void {
		parent::setUp();

		$this->controller = new Controller();
	}

	public function test_denied_when_document_id_missing() {
		// Arrange.
		$this->act_as_admin();
		$request = new WP_REST_Request( 'GET' );

		// Assert.
		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_denied_when_document_id_is_zero() {
		// Arrange.
		$this->act_as_admin();
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', 0 );

		// Assert.
		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_denied_for_subscriber() {
		// Arrange.
		$subscriber = $this->act_as_subscriber();
		$post_id = self::factory()->post->create( [ 'post_author' => $subscriber->ID ] );
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', $post_id );

		// Assert.
		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_denied_for_author_editing_another_users_post() {
		// Arrange.
		$other_user_id = self::factory()->user->create( [ 'role' => 'author' ] );
		$post_id = self::factory()->post->create( [ 'post_author' => $other_user_id ] );

		$this->act_as( 'author' );
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', $post_id );

		// Assert.
		$this->assertFalse( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_granted_for_author_editing_own_post() {
		// Arrange.
		$author = $this->act_as( 'author' );
		$post_id = self::factory()->post->create( [ 'post_author' => $author->ID ] );
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', $post_id );

		// Assert.
		$this->assertTrue( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_granted_for_editor_editing_another_users_post() {
		// Arrange.
		$other_user_id = self::factory()->user->create( [ 'role' => 'author' ] );
		$post_id = self::factory()->post->create( [ 'post_author' => $other_user_id ] );

		$this->act_as_editor();
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', $post_id );

		// Assert.
		$this->assertTrue( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_granted_for_admin_editing_any_post() {
		// Arrange.
		$other_user_id = self::factory()->user->create( [ 'role' => 'author' ] );
		$post_id = self::factory()->post->create( [ 'post_author' => $other_user_id ] );

		$this->act_as_admin();
		$request = new WP_REST_Request( 'GET' );
		$request->set_param( 'document_id', $post_id );

		// Assert.
		$this->assertTrue( $this->controller->get_items_permissions_check( $request ) );
	}

	public function test_get_item_permissions_check_delegates_to_get_items_permissions_check() {
		// Arrange.
		$other_user_id = self::factory()->user->create( [ 'role' => 'author' ] );
		$granted_post_id = self::factory()->post->create( [ 'post_author' => $other_user_id ] );

		$this->act_as_admin();
		$granted_request = new WP_REST_Request( 'GET' );
		$granted_request->set_param( 'document_id', $granted_post_id );

		$denied_request = new WP_REST_Request( 'GET' );
		$denied_request->set_param( 'document_id', 0 );

		// Assert.
		$this->assertSame(
			$this->controller->get_items_permissions_check( $granted_request ),
			$this->controller->get_item_permissions_check( $granted_request )
		);
		$this->assertSame(
			$this->controller->get_items_permissions_check( $denied_request ),
			$this->controller->get_item_permissions_check( $denied_request )
		);
	}
}
