<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Read_Resource_Ability;
use Elementor\Modules\Mcp\Module;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use Elementor\Modules\Mcp\Utils\Editor_Session_Guard;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Proxy_REST_API extends Elementor_Test_Base {

	const TEST_POST_ID         = 999;
	const EDIT_LOCK_META_KEY   = '_edit_lock';
	const UNSAVED_TRANSIENT_KEY = '_elementor_editor_unsaved_999';

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Proxy_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );

		add_filter( 'elementor/mcp/pre_execute_guard', [ new Module(), 'check_mutation_guard' ], 10, 2 );
	}

	public function tearDown(): void {
		delete_post_meta( self::TEST_POST_ID, self::EDIT_LOCK_META_KEY );
		delete_transient( self::UNSAVED_TRANSIENT_KEY );

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
		// Arrange
		$this->act_as_admin();
		update_post_meta( self::TEST_POST_ID, self::EDIT_LOCK_META_KEY, '1' );
		Editor_Session_Guard::set_editor_unsaved( self::TEST_POST_ID );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => self::TEST_POST_ID ] );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'elementor_editor_unsaved_changes', $result->get_error_code() );
		$this->assertSame( 409, $result->get_error_data()['status'] );
	}

	public function test_mutation_guard__returns_null_when_lock_exists_but_no_unsaved() {
		// Arrange
		update_post_meta( self::TEST_POST_ID, self::EDIT_LOCK_META_KEY, '1' );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => self::TEST_POST_ID ] );

		// Assert
		$this->assertNull( $result );
	}

	public function test_mutation_guard__returns_null_when_no_lock() {
		// Arrange
		$this->act_as_admin();
		Editor_Session_Guard::set_editor_unsaved( self::TEST_POST_ID );

		// Act
		$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => self::TEST_POST_ID ] );

		// Assert
		$this->assertNull( $result );
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
			$result = apply_filters( 'elementor/mcp/pre_execute_guard', null, [ 'post_id' => self::TEST_POST_ID ] );

			$this->assertNull( $result, "Call $i should not be blocked" );

			Editor_Session_Guard::set_mcp_mutation( self::TEST_POST_ID );
		}

		$this->assertGreaterThan( 0, Editor_Session_Guard::get_mcp_mutation_time( self::TEST_POST_ID ) );
	}

	public function test_mutation_guard__does_not_clear_signal_owned_by_different_user() {
		// Arrange
		$user_a_id = 11;
		$user_b_id = 22;

		wp_set_current_user( $user_a_id );
		Editor_Session_Guard::set_editor_unsaved( self::TEST_POST_ID );

		wp_set_current_user( $user_b_id );

		// Act
		Editor_Session_Guard::clear_editor_unsaved( self::TEST_POST_ID );

		// Assert
		$this->assertSame( $user_a_id, (int) get_transient( self::UNSAVED_TRANSIENT_KEY ) );
	}
}
