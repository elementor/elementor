<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Core\Base\Document;
use Elementor\Core\Documents_Manager;
use Elementor\Modules\Mcp\Preview\Preview_Token;
use Elementor\Modules\Mcp\Preview\Public_Preview_Handler;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Public_Preview_Handler extends Elementor_Test_Base {

	private Public_Preview_Handler $handler;
	private $original_screen;

	public function setUp(): void {
		parent::setUp();

		$this->handler = new Public_Preview_Handler();
		$this->original_screen = $GLOBALS['current_screen'] ?? null;
	}

	public function tearDown(): void {
		unset( $_GET[ Preview_Token::QUERY_ARG ] );
		remove_all_filters( Documents_Manager::FRONTEND_DOCUMENT_ID_FILTER );
		remove_all_filters( 'get_post_metadata' );
		delete_option( 'elementor_element_cache_ttl' );
		$GLOBALS['current_screen'] = $this->original_screen;

		parent::tearDown();
	}

	public function test_no_token__does_nothing() {
		$post_id = $this->create_snapshot_post( 'live' );
		$wp = new \WP();

		$this->handler->maybe_activate( $wp );

		$this->assertSame( $post_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
	}

	public function test_invalid_token__does_nothing() {
		$post_id = $this->create_snapshot_post( 'live' );
		$_GET[ Preview_Token::QUERY_ARG ] = 'garbage.token';

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( $post_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
	}

	public function test_expired_token__does_nothing() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() - 10, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( $post_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
	}

	public function test_missing_post__does_nothing() {
		$non_existent_post_id = 999999;
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $non_existent_post_id,
			'post_status' => 'inherit',
		] );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $non_existent_post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( $non_existent_post_id, Plugin::$instance->documents->get_frontend_document_id( $non_existent_post_id ) );
	}

	public function test_non_elementor_post__does_nothing() {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $post_id,
			'post_status' => 'inherit',
		] );
		update_metadata( 'post', $revision_id, '_elementor_data', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( $post_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
	}

	public function test_revision_parent_mismatch__does_nothing() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$other_post_id = $this->factory()->post->create();
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $other_post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );

		$this->handler->maybe_activate( new \WP() );

		$this->assertSame( $other_post_id, Plugin::$instance->documents->get_frontend_document_id( $other_post_id ) );
	}

	public function test_valid_token__renders_the_revision_for_the_parent_post_only() {
		// Arrange.
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$other_id = $this->factory()->post->create();
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );

		// Act.
		$this->handler->maybe_activate( new \WP() );

		// Assert.
		$this->assertSame( $revision_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
		$this->assertSame( $other_id, Plugin::$instance->documents->get_frontend_document_id( $other_id ) );
	}

	public function test_valid_token__rewrites_query_vars() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );

		$wp = new \WP();
		$this->handler->maybe_activate( $wp );

		$this->assertSame( $post_id, $wp->query_vars['p'] );
		$this->assertContains( 'draft', $wp->query_vars['post_status'] );
	}

	public function test_valid_token__query_vars_filter_can_replace_the_main_query() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );
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

	public function test_valid_token__announces_activation_before_the_query_is_rewritten() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );
		$calls = [];
		$on_activated = function ( ...$args ) use ( &$calls ) {
			$calls[] = [ 'activated', $args[0]->ID, count( $args ) ];
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

		$this->assertSame( [ [ 'activated', $post_id, 1 ], [ 'query_vars' ] ], $calls );
	}

	public function test_valid_token__keeps_rendering_the_revision_when_main_query_is_replaced() {
		[ $post_id, $revision_id ] = $this->create_post_and_revision( 'live', 'snapshot' );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );
		$filter = fn() => [ 'page_id' => 42 ];
		add_filter( 'elementor/mcp/preview/query_vars', $filter );

		$this->handler->maybe_activate( new \WP() );
		remove_filter( 'elementor/mcp/preview/query_vars', $filter );

		$this->assertSame( $revision_id, Plugin::$instance->documents->get_frontend_document_id( $post_id ) );
	}

	public function test_valid_token__render_does_not_touch_live_element_cache() {
		// Arrange.
		// Force a front-end screen context: the element cache is only written when `is_admin()`
		// is false, and this suite's bootstrap otherwise leaves `current_screen` as 'dashboard'.
		set_current_screen( 'front' );
		update_option( 'elementor_element_cache_ttl', '24' );
		$post_id = $this->factory()->documents->publish_and_get()->get_main_id();
		$revision_id = $this->factory()->post->create( [
			'post_type' => 'revision',
			'post_parent' => $post_id,
			'post_status' => 'inherit',
		] );
		Plugin::$instance->db->copy_elementor_meta( $post_id, $revision_id );
		$_GET[ Preview_Token::QUERY_ARG ] = Preview_Token::encode( $post_id, $revision_id, time() + HOUR_IN_SECONDS, Preview_Token::secret() );
		$this->handler->maybe_activate( new \WP() );

		// Act.
		Plugin::$instance->frontend->get_builder_content( $post_id );

		// Assert.
		$this->assertFalse( metadata_exists( 'post', $post_id, Document::CACHE_META_KEY ) );
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
