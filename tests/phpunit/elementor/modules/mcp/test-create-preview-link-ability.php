<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\Mcp\Abilities\Create_Preview_Link_Ability;
use Elementor\Modules\Mcp\Preview\Preview_Token;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Create_Preview_Link_Ability extends Elementor_Test_Base {

	private Create_Preview_Link_Ability $ability;

	public function setUp(): void {
		parent::setUp();

		$this->ability = new Create_Preview_Link_Ability();
	}

	public function test_execute__returns_404_when_post_missing() {
		$this->act_as_admin();

		$result = $this->ability->execute( [ 'post_id' => 999999 ] );

		$this->assertWPError( $result );
		$this->assertSame( 'invalid_post', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_400_when_post_not_built_with_elementor() {
		$this->act_as_admin();
		$post_id = $this->factory()->post->create();

		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		$this->assertWPError( $result );
		$this->assertSame( 'not_elementor_post', $result->get_error_code() );
	}

	public function test_execute__returns_403_when_user_cannot_edit_post() {
		$post_id = $this->create_elementor_post();
		$user_id = $this->factory()->user->create( [ 'role' => 'subscriber' ] );
		wp_set_current_user( $user_id );

		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		$this->assertWPError( $result );
		$this->assertSame( 'rest_cannot_edit', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_execute__returns_url_and_expiry_on_success() {
		$this->act_as_admin();
		$post_id = $this->create_elementor_post();

		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		$this->assertIsArray( $result );
		$this->assertArrayHasKey( 'url', $result );
		$this->assertStringContainsString( Preview_Token::QUERY_ARG . '=', $result['url'] );
		$this->assertArrayHasKey( 'edit_url', $result );
		$this->assertNotEmpty( $result['edit_url'] );
		$this->assertSame( $post_id, $result['post_id'] );
		$this->assertGreaterThan( 0, $result['revision_id'] );
		$this->assertGreaterThan( time(), $result['expires_at_unix'] );
	}

	public function test_execute__revision_meta_contains_elementor_data_snapshot() {
		$this->act_as_admin();
		$post_id = $this->create_elementor_post( [ [ 'id' => 'v1' ] ] );

		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		$revision_data = get_metadata( 'post', $result['revision_id'], '_elementor_data', true );
		$this->assertNotEmpty( $revision_data );
	}

	public function test_execute__token_verifies_and_binds_to_revision() {
		$this->act_as_admin();
		$post_id = $this->create_elementor_post();

		$result = $this->ability->execute( [ 'post_id' => $post_id ] );

		parse_str( wp_parse_url( $result['url'], PHP_URL_QUERY ), $query );
		$claims = Preview_Token::decode( $query[ Preview_Token::QUERY_ARG ], Preview_Token::secret() );

		$this->assertSame( $post_id, $claims['post_id'] );
		$this->assertSame( $result['revision_id'], $claims['revision_id'] );
		$this->assertSame( $result['expires_at_unix'], $claims['expires_at'] );
	}

	public function test_execute__uses_fixed_ttl() {
		$this->act_as_admin();
		$post_id = $this->create_elementor_post();

		$before = time();
		$result = $this->ability->execute( [ 'post_id' => $post_id ] );
		$after = time();

		$this->assert_expires_after_fixed_ttl( $result, $before, $after );
	}

	public function test_execute__ignores_caller_supplied_ttl() {
		$this->act_as_admin();
		$post_id = $this->create_elementor_post();
		$excessive_ttl_minutes = 999999;

		$before = time();
		$result = $this->ability->execute( [ 'post_id' => $post_id, 'ttl_minutes' => $excessive_ttl_minutes ] );
		$after = time();

		$this->assert_expires_after_fixed_ttl( $result, $before, $after );
	}

	private function assert_expires_after_fixed_ttl( array $result, int $before, int $after ): void {
		$ttl_seconds = Create_Preview_Link_Ability::TTL_MINUTES * MINUTE_IN_SECONDS;

		$this->assertGreaterThanOrEqual( $before + $ttl_seconds, $result['expires_at_unix'] );
		$this->assertLessThanOrEqual( $after + $ttl_seconds, $result['expires_at_unix'] );
	}

	private function create_elementor_post( array $elements = [] ): int {
		$post_id = $this->factory()->post->create( [ 'post_status' => 'draft' ] );
		update_post_meta( $post_id, '_elementor_edit_mode', 'builder' );
		update_post_meta( $post_id, '_elementor_data', wp_slash( wp_json_encode( $elements ?: [ [ 'id' => 'seed' ] ] ) ) );

		return $post_id;
	}
}
