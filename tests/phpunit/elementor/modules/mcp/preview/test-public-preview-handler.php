<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Modules\Mcp\Preview\Preview_Token;
use Elementor\Modules\Mcp\Preview\Public_Preview_Handler;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Public_Preview_Handler extends Elementor_Test_Base {

	private Public_Preview_Handler $handler;

	public function setUp(): void {
		parent::setUp();

		$this->handler = new Public_Preview_Handler();
	}

	public function tearDown(): void {
		unset( $_GET[ Preview_Token::QUERY_ARG ] );

		parent::tearDown();
	}

	public function test_no_token__does_nothing() {
		$post_id = $this->create_snapshot_post( 'live' );
		$wp = new \WP();

		$this->handler->maybe_activate( $wp );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	public function test_invalid_token__does_nothing() {
		$post_id = $this->create_snapshot_post( 'live' );
		$_GET[ Preview_Token::QUERY_ARG ] = 'garbage.token';

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	public function test_expired_token__does_nothing() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() - 10, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	public function test_missing_post__does_nothing() {
		$non_existent_post_id = 999999;
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $non_existent_post_id,
			'post_status' => 'inherit',
		] );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $non_existent_post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $non_existent_post_id, '_elementor_data', true ) );
	}

	public function test_non_elementor_post__does_nothing() {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $post_id,
			'post_status' => 'inherit',
		] );
		update_metadata( 'post', $revision_id, '_elementor_data', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	public function test_revision_parent_mismatch__does_nothing() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$other_post_id = $this->factory()->post->create();
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $other_post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $other_post_id, '_elementor_data', true ) );
	}

	public function test_valid_token__returns_revision_meta_for_parent_post() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( [ 'snapshot' ], $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	public function test_valid_token__falls_through_when_revision_has_no_value_for_key() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_elementor_css', true ) );
	}

	public function test_valid_token__ignores_other_post_ids() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$other_id = $this->factory()->post->create();

		$this->assertNull( $this->handler->filter_post_metadata( null, $other_id, '_elementor_data', true ) );
	}

	public function test_valid_token__does_not_override_unrelated_meta_keys() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertNull( $this->handler->filter_post_metadata( null, $post_id, '_thumbnail_id', true ) );
	}

	public function test_valid_token__rewrites_query_vars() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );

		$wp = new \WP();
		$this->handler->maybe_activate( $wp );

		$this->assertSame( $post_id, $wp->query_vars['p'] );
		$this->assertContains( 'draft', $wp->query_vars['post_status'] );
	}

	public function test_valid_token__query_vars_filter_can_replace_the_main_query() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );
		$received = [];
		$filter = function ( $query_vars, $post ) use ( &$received ) {
			$received = [ $query_vars, $post ];

			return [ 'page_id' => 42 ];
		};
		add_filter( 'elementor/mcp/preview/query_vars', $filter, 10, 2 );

		$wp = new \WP();
		$this->handler->maybe_activate( $wp );
		remove_filter( 'elementor/mcp/preview/query_vars', $filter, 10 );

		$this->assertSame( [ 'page_id' => 42 ], $wp->query_vars );
		$this->assertSame( $post_id, $received[0]['p'] );
		$this->assertSame( $post_id, $received[1]->ID );
	}

	public function test_valid_token__announces_activation_with_fixtures_before_the_query_is_rewritten() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$fixtures = [ 'product_id' => 9 ];
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret(), $fixtures );
		$calls = [];
		$on_activated = function ( $post, $received_fixtures ) use ( &$calls ) {
			$calls[] = [ 'activated', $post->ID, $received_fixtures ];
		};
		$on_query_vars = function ( $query_vars ) use ( &$calls ) {
			$calls[] = [ 'query_vars' ];

			return $query_vars;
		};
		add_action( 'elementor/mcp/preview/activated', $on_activated, 10, 2 );
		add_filter( 'elementor/mcp/preview/query_vars', $on_query_vars );

		$this->handler->maybe_activate( new \WP() );
		remove_action( 'elementor/mcp/preview/activated', $on_activated, 10 );
		remove_filter( 'elementor/mcp/preview/query_vars', $on_query_vars );

		$this->assertSame( [ [ 'activated', $post_id, $fixtures ], [ 'query_vars' ] ], $calls );
	}

	public function test_valid_token__previewed_document_keeps_revision_meta_when_main_query_is_replaced() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + 3600, Preview_Token::secret() );
		$filter = fn() => [ 'page_id' => 42 ];
		add_filter( 'elementor/mcp/preview/query_vars', $filter );

		$this->handler->maybe_activate( new \WP() );
		remove_filter( 'elementor/mcp/preview/query_vars', $filter );

		$this->assertSame( [ 'snapshot' ], $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
	}

	private function create_snapshot_post( string $data ): int {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_data', $data );

		return $post_id;
	}

	private function create_post_and_revision( string $live_data, string $revision_data ): array {
		$post_id = $this->create_snapshot_post( $live_data );
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $post_id,
			'post_status' => 'inherit',
		] );
		update_metadata( 'post', $revision_id, '_elementor_data', $revision_data );

		return [ $post_id, $revision_id ];
	}
}
