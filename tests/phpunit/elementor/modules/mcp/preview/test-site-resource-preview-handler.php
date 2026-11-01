<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp\Preview;

use Elementor\Modules\Mcp\Preview\Site_Resource_Preview_Handler;
use Elementor\Modules\Mcp\Preview\Site_Resource_Preview_Token;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Site_Resource_Preview_Handler extends Elementor_Test_Base {

	private Site_Resource_Preview_Handler $handler;

	public function setUp(): void {
		parent::setUp();

		$this->handler = new Site_Resource_Preview_Handler();
	}

	public function tearDown(): void {
		unset( $_GET[ Site_Resource_Preview_Token::QUERY_ARG ] );

		parent::tearDown();
	}

	public function test_expired_token__does_not_rewrite_query() {
		$post_id = $this->create_elementor_post();
		$_GET[ Site_Resource_Preview_Token::QUERY_ARG ] = Site_Resource_Preview_Token::encode(
			$post_id,
			time() - 10,
			Site_Resource_Preview_Token::secret()
		);

		$wp = new \WP();
		$this->handler->maybe_activate( $wp );

		$this->assertEmpty( $wp->query_vars['p'] ?? null );
	}

	public function test_valid_token__rewrites_query_and_publishes_post_in_results() {
		$post_id = $this->create_elementor_post();
		$_GET[ Site_Resource_Preview_Token::QUERY_ARG ] = Site_Resource_Preview_Token::encode(
			$post_id,
			time() + 3600,
			Site_Resource_Preview_Token::secret()
		);

		$wp = new \WP();
		$this->handler->maybe_activate( $wp );

		$this->assertSame( $post_id, $wp->query_vars['p'] );

		$post = get_post( $post_id );
		$post->post_status = 'draft';
		$filtered = $this->handler->filter_posts_results( [ $post ] );

		$this->assertSame( 'publish', $filtered[0]->post_status );
	}

	public function test_valid_token__registers_x_frame_options_filter() {
		$post_id = $this->create_elementor_post();
		$_GET[ Site_Resource_Preview_Token::QUERY_ARG ] = Site_Resource_Preview_Token::encode(
			$post_id,
			time() + 3600,
			Site_Resource_Preview_Token::secret()
		);

		$this->handler->maybe_activate( new \WP() );

		$this->assertFalse( apply_filters( 'x_frame_options', 'SAMEORIGIN' ) );
	}

	private function create_elementor_post(): int {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_data', '[]' );

		return $post_id;
	}
}
