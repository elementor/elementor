<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Read_Resource_Ability;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Modules\Mcp\Utils\Editor_Sync_State;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Proxy_REST_API extends Elementor_Test_Base {

	private int $test_post_id;

	public function setUp(): void {
		parent::setUp();

		$this->test_post_id = self::factory()->post->create( [ 'post_status' => 'draft' ] );

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Proxy_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );

		add_filter( 'elementor/mcp/pre_execute_guard', [ new Editor_Sync_State(), 'check_mutation_guard' ], 10, 2 );
	}

	public function tearDown(): void {
		delete_post_meta( $this->test_post_id, '_edit_lock' );
		delete_transient( "_elementor_editor_unsaved_{$this->test_post_id}" );

		parent::tearDown();
	}

	public function test_post__rejects_manage_global_variable_for_editor() {
		// Arrange
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-global-variable',
			'input' => [
				'operations' => [
					[
						'action' => 'create',
						'type' => Manage_Variable_Ability::TYPE_COLOR,
						'label' => 'brand-primary',
						'value' => '#000000',
					],
				],
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_post__allows_manage_global_variable_permission_for_admin() {
		// Arrange
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-global-variable',
			'input' => [],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert — permission passed; empty input fails validation, not auth
		$this->assertNotSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'invalid_input', $response->get_data()['code'] );
	}

	public function test_post__rejects_manage_classes_for_editor() {
		// Arrange
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-classes',
			'input' => [
				'operations' => [
					[
						'action' => 'delete',
						'id' => 'g-abc1234',
					],
				],
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_post__rejects_manage_site_parts_without_theme_builder_capability() {
		// Arrange — contributor can edit posts, which is not enough for Theme Builder.
		wp_set_current_user( self::factory()->user->create( [ 'role' => 'contributor' ] ) );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-site-parts',
			'input' => [
				'operations' => [
					[
						'action' => 'create',
						'type' => 'footer',
					],
				],
			],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_post__allows_manage_site_parts_permission_for_editor() {
		// Arrange — editor matches the Theme Builder menu capability.
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-site-parts',
			'input' => [],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert — permission passed. Empty input fails validation, or the core discovery payload is returned.
		$this->assertNotSame( \WP_Http::FORBIDDEN, $response->get_status() );
	}

	public function test_post__proxy_stays_available_when_site_mcp_is_disabled() {
		// Arrange
		update_option( 'elementor_mcp_enabled', false );
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'find-icons',
			'input' => [],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert — WebMCP keeps the proxy when the public MCP server is off.
		$this->assertNotSame( \WP_Http::NOT_FOUND, $response->get_status() );

		delete_option( 'elementor_mcp_enabled' );
	}

	public function test_post__allows_manage_classes_permission_for_admin() {
		// Arrange
		$role = get_role( 'administrator' );
		$role->add_cap( Add_Capabilities::UPDATE_CLASS );
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/mcp-proxy' );
		$request->set_body_params( [
			'tool' => 'manage-classes',
			'input' => [],
		] );

		// Act
		$response = rest_do_request( $request );

		// Assert — permission passed; empty input fails validation, not auth
		$this->assertNotSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'invalid_input', $response->get_data()['code'] );
	}

	public function test_get__rejects_manage_global_variable_guide_for_editor() {
		// Arrange
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/mcp-proxy' );
		$request->set_param( 'uri', Manage_Variable_Guide_Ability::URI );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::FORBIDDEN, $response->get_status() );
		$this->assertSame( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_get__allows_manage_global_variable_guide_for_admin() {
		// Arrange
		$this->act_as_admin();

		$request = new \WP_REST_Request( 'GET', '/elementor/v1/mcp-proxy' );
		$request->set_param( 'uri', Manage_Variable_Guide_Ability::URI );

		// Act
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( \WP_Http::OK, $response->get_status() );
	}

	public function test_read_resource__rejects_manage_global_variable_guide_for_editor() {
		// Arrange
		$this->act_as_editor();
		$ability = new Read_Resource_Ability();

		// Act
		$result = $ability->execute( [
			'uri' => Manage_Variable_Guide_Ability::URI,
		] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data()['status'] );
	}

	public function test_read_resource__allows_manage_global_variable_guide_for_admin() {
		// Arrange
		$this->act_as_admin();
		$ability = new Read_Resource_Ability();

		// Act
		$result = $ability->execute( [
			'uri' => Manage_Variable_Guide_Ability::URI,
		] );

		// Assert
		$this->assertIsArray( $result );
		$this->assertSame( Manage_Variable_Guide_Ability::URI, $result['uri'] );
		$this->assertNotEmpty( $result['content'] );
	}

	public function test_mutation_guard__returns_409_when_lock_and_unsaved_exist() {
		// Arrange - lock must be owned by a different user than the MCP caller
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );
		wp_set_post_lock( $this->test_post_id );
		Editor_Sync_State::set_editor_unsaved( $this->test_post_id );

		$this->act_as_admin();

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_editor_unsaved_changes', $result->get_error_code() );
		$this->assertSame( 409, $result->get_error_data()['status'] );
	}

	public function test_mutation_guard__returns_null_when_lock_exists_but_no_unsaved() {
		// Arrange - lock owned by another user, but no unsaved signal
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );
		wp_set_post_lock( $this->test_post_id );

		$this->act_as_admin();

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_null_when_no_lock() {
		// Arrange
		$this->act_as_admin();
		Editor_Sync_State::set_editor_unsaved( $this->test_post_id );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_409_when_same_user_editor_has_unsaved_changes() {
		// Arrange
		$this->act_as_admin();
		wp_set_post_lock( $this->test_post_id );
		Editor_Sync_State::set_editor_unsaved( $this->test_post_id );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_editor_unsaved_changes', $result->get_error_code() );
		$this->assertSame( \WP_Http::CONFLICT, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'elementor/get-page-structure', $result->get_error_message() );
	}

	public function test_mutation_guard__returns_null_when_same_user_editor_is_clean() {
		// Arrange
		$this->act_as_admin();
		wp_set_post_lock( $this->test_post_id );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_null_when_same_user_editor_is_clean_on_published_page() {
		// Arrange
		$this->act_as_admin();
		$post_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		wp_set_post_lock( $post_id );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $post_id ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_null_when_lock_is_stale() {
		// Arrange
		$this->act_as_admin();
		$stale_time = time() - Editor_Sync_State::POST_LOCK_WINDOW - 1;
		update_post_meta( $this->test_post_id, '_edit_lock', $stale_time . ':' . get_current_user_id() );
		Editor_Sync_State::set_editor_unsaved( $this->test_post_id );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_409_naming_other_user_editor_on_published_page() {
		// Arrange
		$post_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor', 'display_name' => 'Dana Editor' ] );
		wp_set_current_user( $editor_user_id );
		wp_set_post_lock( $post_id );

		$this->act_as_admin();

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $post_id ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_editor_open_by_other_user', $result->get_error_code() );
		$this->assertSame( \WP_Http::CONFLICT, $result->get_error_data()['status'] );
		$this->assertStringContainsString( 'Dana Editor', $result->get_error_message() );
	}

	public function test_mutation_guard__returns_409_for_other_user_editor_with_unsaved_changes_on_published_page() {
		// Arrange
		$post_id = self::factory()->post->create( [ 'post_status' => 'publish' ] );
		$editor_user_id = self::factory()->user->create( [ 'role' => 'editor' ] );
		wp_set_current_user( $editor_user_id );
		wp_set_post_lock( $post_id );
		Editor_Sync_State::set_editor_unsaved( $post_id );

		$this->act_as_admin();

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $post_id ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_editor_open_by_other_user', $result->get_error_code() );
	}

	public function test_mutation_guard__returns_null_when_post_id_absent() {
		// Arrange — nothing

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_sequential_mcp_calls_all_succeed_on_clean_editor_session() {
		// Arrange.
		$this->act_as_admin();
		$call_count = 3;

		// Act + Assert — no lock, no unsaved signal: all calls pass the guard.
		for ( $i = 0; $i < $call_count; $i++ ) {
			$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => $this->test_post_id ] );

			$this->assertNull( $result, "Call $i should not be blocked" );

			Editor_Sync_State::set_mcp_mutation( $this->test_post_id );
		}

		$this->assertGreaterThan( 0, Editor_Sync_State::get_mcp_mutation_time( $this->test_post_id ) );
	}

	public function test_mutation_guard__does_not_clear_signal_owned_by_different_user() {
		// Arrange
		$user_a_id = $this->factory->user->create( [ 'role' => 'administrator' ] );
		$user_b_id = $this->factory->user->create( [ 'role' => 'administrator' ] );

		wp_set_current_user( $user_a_id );
		Editor_Sync_State::set_editor_unsaved( $this->test_post_id );

		wp_set_current_user( $user_b_id );

		// Act
		Editor_Sync_State::clear_editor_unsaved( $this->test_post_id );

		// Assert
		$this->assertSame( $user_a_id, (int) get_transient( "_elementor_editor_unsaved_{$this->test_post_id}" ) );
	}
}
