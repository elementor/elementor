<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\WpRest;

use Elementor\Tests\Phpunit\Elementor\Modules\WpRest\Providers\Post_Query as Post_Query_Data_Provider;
use Elementor\Modules\WpRest\Classes\Post_Query;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group wp-rest
 */
class Test_Post_Query extends Elementor_Test_Base {
	use Post_Query_Data_Provider;

	const URL = '/elementor/v1/post';

	public function setUp(): void {
		parent::setUp();

		$this->init();
		$this->act_as_admin();
	}

	public function tearDown(): void {
		$this->clean();

		parent::tearDown();
	}

	public function test_post_query_results() {
		foreach ( $this->data_provider_post_query() as $data ) {
			$this->execute( $data['params'], $data['expected'] );
		}
	}

	public function test_post_query_ignores_unauthorized_keys_conversion_map() {
		// Arrange
		$request = $this->create_request( [
			Post_Query::SEARCH_TERM_KEY => 'Hello',
			Post_Query::KEYS_CONVERSION_MAP_KEY => [
				'ID' => 'id',
				'post_title' => 'label',
				'post_content' => 'body',
				'post_password' => 'password',
			],
		] );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$posts = $response->get_data()['data']['value'];

		// Assert
		$this->assertNotEmpty( $posts );
		$this->assertArrayNotHasKey( 'body', $posts[0] );
		$this->assertArrayNotHasKey( 'password', $posts[0] );
		$this->assertArrayHasKey( 'id', $posts[0] );
		$this->assertArrayHasKey( 'label', $posts[0] );
	}

	public function test_post_query_denies_users_without_edit_posts_capability() {
		// Arrange
		$this->act_as_subscriber();
		$request = $this->create_request( [
			Post_Query::SEARCH_TERM_KEY => 'Hello',
		] );

		// Act
		$response = rest_get_server()->dispatch( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_post_query_excludes_posts_contributor_cannot_read() {
		// Arrange
		$this->act_as( 'contributor' );

		$own_draft_id = $this->factory()->post->create( [
			'post_author' => get_current_user_id(),
			'post_status' => 'draft',
			'post_title' => 'My Smart Draft',
			'post_type' => 'post',
		] );

		$request = $this->create_request( [
			Post_Query::SEARCH_TERM_KEY => 'smart',
			Post_Query::IS_PUBLIC_KEY => false,
			Post_Query::KEYS_CONVERSION_MAP_KEY => [
				'ID' => 'id',
				'post_title' => 'label',
			],
		] );

		// Act
		$response = rest_get_server()->dispatch( $request );
		$posts = $response->get_data()['data']['value'];
		$post_ids = wp_list_pluck( $posts, 'id' );

		// Assert
		$this->assertContains( $own_draft_id, $post_ids );
		$this->assertNotContains( $this->posts[8]->ID, $post_ids );

		wp_delete_post( $own_draft_id, true );
	}

	private function execute( $params, $expected ) {
		// Act
		$response = rest_get_server()->dispatch( $this->create_request( $params ) );
		$posts = $response->get_data()['data']['value'];

		// Assert
		$this->assertEqualSets( $expected, $posts );
	}

	private function create_request( array $params ): \WP_REST_Request {
		$request = new \WP_REST_Request( 'GET', self::URL );
		$request->set_param( Post_Query::EXCLUDED_TYPE_KEY, $params[ Post_Query::EXCLUDED_TYPE_KEY ] ?? null );
		$request->set_param( Post_Query::INCLUDED_TYPE_KEY, $params[ Post_Query::INCLUDED_TYPE_KEY ] ?? null );
		$request->set_param( Post_Query::SEARCH_TERM_KEY, $params[ Post_Query::SEARCH_TERM_KEY ] ?? '' );
		$request->set_param( Post_Query::KEYS_CONVERSION_MAP_KEY, $params[ Post_Query::KEYS_CONVERSION_MAP_KEY ] ?? null );

		if ( isset( $params[ Post_Query::META_QUERY_KEY ] ) ) {
			$request->set_param( Post_Query::META_QUERY_KEY, $params[ Post_Query::META_QUERY_KEY ] );
		}

		if ( isset( $params[ Post_Query::IS_PUBLIC_KEY ] ) ) {
			$request->set_param( Post_Query::IS_PUBLIC_KEY, $params[ Post_Query::IS_PUBLIC_KEY ] );
		}

		if ( isset( $params[ Post_Query::TAX_QUERY_KEY ] ) ) {
			$request->set_param( Post_Query::TAX_QUERY_KEY, $params[ Post_Query::TAX_QUERY_KEY ] );
		}

		if ( isset( $params[ Post_Query::ITEMS_COUNT_KEY ] ) ) {
			$request->set_param( Post_Query::ITEMS_COUNT_KEY, $params[ Post_Query::ITEMS_COUNT_KEY ] );
		}

		$request->set_header( Post_Query::NONCE_KEY, wp_create_nonce( 'wp_rest' ) );

		return $request;
	}
}
