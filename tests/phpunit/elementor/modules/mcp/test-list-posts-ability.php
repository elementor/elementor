<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\List_Posts_Ability;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_List_Posts_Ability extends Elementor_Test_Base {

	private List_Posts_Ability $ability;
	private array $created_post_ids = [];

	public function setUp(): void {
		parent::setUp();
		$this->ability = new List_Posts_Ability();
	}

	public function tearDown(): void {
		foreach ( $this->created_post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}
		$this->created_post_ids = [];
		parent::tearDown();
	}

	public function test_execute__returns_403_for_subscriber() {
		// Arrange
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_posts_for_editor() {
		// Arrange
		$this->act_as_editor();
		$this->create_post( 'Test Post', 'post', 'publish' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'posts', $result );
		$this->assertArrayHasKey( 'total', $result );
		$this->assertArrayHasKey( 'page', $result );
		$this->assertArrayHasKey( 'per_page', $result );
	}

	public function test_execute__returns_both_posts_and_pages() {
		// Arrange
		$this->act_as_admin();
		$this->create_post( 'A Post', 'post', 'publish' );
		$this->create_post( 'A Page', 'page', 'publish' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'post', $post_types );
		$this->assertContains( 'page', $post_types );
	}

	public function test_execute__filters_by_post_type_post() {
		// Arrange
		$this->act_as_admin();
		$this->create_post( 'A Post', 'post', 'publish' );
		$this->create_post( 'A Page', 'page', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'post' ] );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'post', $post_types );
		$this->assertNotContains( 'page', $post_types );
	}

	public function test_execute__filters_by_post_type_page() {
		// Arrange
		$this->act_as_admin();
		$this->create_post( 'A Post', 'post', 'publish' );
		$this->create_post( 'A Page', 'page', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'page' ] );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'page', $post_types );
		$this->assertNotContains( 'post', $post_types );
	}

	public function test_execute__filters_by_post_type_all() {
		// Arrange
		$this->act_as_admin();
		$this->create_post( 'A Post', 'post', 'publish' );
		$this->create_post( 'A Page', 'page', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'all' ] );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'post', $post_types );
		$this->assertContains( 'page', $post_types );
	}

	public function test_execute__filters_by_post_type_product() {
		// Arrange
		$this->act_as_admin();
		register_post_type( 'product', [
			'public' => true,
			'label' => 'Product',
		] );
		$this->create_post( 'A Product', 'product', 'publish' );
		$this->create_post( 'A Post', 'post', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'product' ] );

		// Cleanup
		unregister_post_type( 'product' );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'product', $post_types );
		$this->assertNotContains( 'post', $post_types );
	}

	public function test_execute__all_includes_product_when_registered() {
		// Arrange
		$this->act_as_admin();
		register_post_type( 'product', [
			'public' => true,
			'label' => 'Product',
		] );
		$this->create_post( 'A Product', 'product', 'publish' );
		$this->create_post( 'A Post', 'post', 'publish' );
		$this->create_post( 'A Page', 'page', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'all' ] );

		// Cleanup
		unregister_post_type( 'product' );

		// Assert
		$post_types = array_column( $result['posts'], 'post_type' );
		$this->assertContains( 'post', $post_types );
		$this->assertContains( 'page', $post_types );
		$this->assertContains( 'product', $post_types );
	}

	public function test_execute__returns_400_for_unsupported_post_type() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'attachment' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_type', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_product_not_registered() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'post_type' => 'product' ] );

		// Assert
		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post_type', $result->get_error_code() );
	}

	public function test_execute__returns_only_published_posts() {
		// Arrange
		$this->act_as_admin();
		$published_id = $this->create_post( 'Published Post', 'post', 'publish' );
		$this->create_post( 'Draft Post', 'post', 'draft' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$ids = array_column( $result['posts'], 'id' );
		$this->assertContains( $published_id, $ids );
		$this->assertCount( 1, array_filter( $ids, fn( $id ) => in_array( $id, $this->created_post_ids, true ) ) );
	}

	public function test_execute__per_page_is_clamped_to_maximum() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'per_page' => 9999 ] );

		// Assert
		$this->assertSame( List_Posts_Ability::MAX_PER_PAGE, $result['per_page'] );
	}

	public function test_execute__default_per_page_is_10() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertSame( 10, $result['per_page'] );
	}

	public function test_execute__paginates_and_reports_total() {
		// Arrange
		$this->act_as_admin();
		for ( $i = 0; $i < 3; $i++ ) {
			$this->create_post( "Post {$i}", 'post', 'publish' );
		}

		// Act
		$first_page = $this->ability->execute( [ 'per_page' => 2, 'page' => 1 ] );
		$second_page = $this->ability->execute( [ 'per_page' => 2, 'page' => 2 ] );

		// Assert
		$this->assertGreaterThanOrEqual( 3, $first_page['total'] );
		$this->assertCount( 2, $first_page['posts'] );
		$this->assertSame( 1, $first_page['page'] );
		$this->assertSame( 2, $second_page['page'] );
		$this->assertNotEmpty( $second_page['posts'] );
	}

	public function test_execute__search_matches_by_title() {
		// Arrange
		$this->act_as_admin();
		$needle_id = $this->create_post( 'FindMeUniqueTitle', 'post', 'publish' );
		$this->create_post( 'UnrelatedTitle', 'post', 'publish' );

		// Act
		$result = $this->ability->execute( [ 'search' => 'FindMeUniqueTitle' ] );

		// Assert
		$ids = array_column( $result['posts'], 'id' );
		$this->assertContains( $needle_id, $ids );
	}

	public function test_execute__ordered_by_date_descending() {
		// Arrange
		$this->act_as_admin();
		$old_post_id = $this->create_post( 'Old Post', 'post', 'publish', '2020-01-01 00:00:00' );
		$new_post_id = $this->create_post( 'New Post', 'post', 'publish', '2025-01-01 00:00:00' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$ids = array_column( $result['posts'], 'id' );
		$old_pos = array_search( $old_post_id, $ids, true );
		$new_pos = array_search( $new_post_id, $ids, true );
		$this->assertLessThan( $old_pos, $new_pos );
	}

	public function test_execute__empty_result_includes_hint() {
		// Arrange
		$this->act_as_admin();

		// Act
		$result = $this->ability->execute( [ 'search' => 'nonexistent-needle-' . wp_generate_password( 12, false ) ] );

		// Assert
		$this->assertSame( 0, $result['total'] );
		$this->assertArrayHasKey( 'llm_instructions', $result );
		$this->assertNotEmpty( $result['llm_instructions'] );
	}

	public function test_execute__post_includes_author_info() {
		// Arrange
		$this->act_as_admin();
		$this->create_post( 'Test Post', 'post', 'publish' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$this->assertNotEmpty( $result['posts'] );
		$post = $result['posts'][0];
		$this->assertArrayHasKey( 'author', $post );
		$this->assertArrayHasKey( 'id', $post['author'] );
		$this->assertArrayHasKey( 'name', $post['author'] );
	}

	public function test_execute__post_includes_url() {
		// Arrange
		$this->act_as_admin();
		$post_id = $this->create_post( 'Test Post', 'post', 'publish' );

		// Act
		$result = $this->ability->execute( [] );

		// Assert
		$posts_by_id = array_column( $result['posts'], null, 'id' );
		$this->assertArrayHasKey( $post_id, $posts_by_id );
		$this->assertNotEmpty( $posts_by_id[ $post_id ]['url'] );
	}

	private function create_post( string $title, string $post_type = 'post', string $status = 'publish', ?string $date = null ): int {
		$post_data = [
			'post_title' => $title,
			'post_type' => $post_type,
			'post_status' => $status,
		];

		if ( $date ) {
			$post_data['post_date'] = $date;
			$post_data['post_date_gmt'] = $date;
		}

		$post_id = $this->factory()->post->create( $post_data );

		$this->created_post_ids[] = $post_id;

		return $post_id;
	}
}
