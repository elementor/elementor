<?php

namespace Elementor\Tests\Phpunit\Modules\Mcp;

use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Ability;
use Elementor\Modules\Mcp\Abilities\Manage_Variable_Guide_Ability;
use Elementor\Modules\Mcp\Abilities\Read_Resource_Ability;
use Elementor\Modules\Mcp\RestApi\Mcp_Proxy_REST_API;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Proxy_REST_API extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		( new Mcp_Proxy_REST_API() )->register_hooks();

		do_action( 'rest_api_init' );
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
}
