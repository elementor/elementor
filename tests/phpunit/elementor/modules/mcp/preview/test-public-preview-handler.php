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

		$this->assertSame( 'snapshot', $this->handler->filter_post_metadata( null, $post_id, '_elementor_data', true ) );
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

	private function create_snapshot_post( string $data ): int {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
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
		update_post_meta( $revision_id, '_elementor_data', $revision_data );

		return [ $post_id, $revision_id ];
	}
}
