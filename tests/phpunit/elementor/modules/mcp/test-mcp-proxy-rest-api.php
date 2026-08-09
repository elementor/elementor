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
if ( class_exists( 'WP_UnitTestCase', false ) ) :
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
} // end class Test_Mcp_Proxy_REST_API
endif; // end if ( class_exists( 'WP_UnitTestCase', false ) )

class Fake_Permissive_Ability extends \Elementor\Modules\Mcp\Abilities\Abstract_Ability {
	protected function get_ability_id(): string {
		return 'elementor/fake-permissive';
	}

	protected function get_definition(): \Elementor\Modules\Mcp\Abilities\Ability_Definition {
		return new \Elementor\Modules\Mcp\Abilities\Ability_Definition(
			'Fake Permissive',
			'A fake ability that always allows.',
			'elementor',
			[ 'type' => 'object' ],
			[],
			fn() => true,
			[ 'type' => 'object', 'properties' => [] ]
		);
	}

	public function execute( $input = [] ) {
		return [];
	}
}

class Fake_Forbidden_Ability extends \Elementor\Modules\Mcp\Abilities\Abstract_Ability {
	protected function get_ability_id(): string {
		return 'elementor/fake-forbidden';
	}

	protected function get_definition(): \Elementor\Modules\Mcp\Abilities\Ability_Definition {
		return new \Elementor\Modules\Mcp\Abilities\Ability_Definition(
			'Fake Forbidden',
			'A fake ability that always denies.',
			'elementor',
			[ 'type' => 'object' ],
			[],
			fn() => false,
			[]
		);
	}

	public function execute( $input = [] ) {
		return [];
	}
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_Mcp_Proxy_REST_API_Unit extends \PHPUnit\Framework\TestCase {

	private function make_api(): Mcp_Proxy_REST_API {
		return new Mcp_Proxy_REST_API();
	}

	private function inject_tool( Mcp_Proxy_REST_API $api, string $name, callable $factory ): void {
		$ref = new \ReflectionProperty( $api, 'tools' );
		$ref->setAccessible( true );
		$tools          = $ref->getValue( $api );
		$tools[ $name ] = $factory;
		$ref->setValue( $api, $tools );
	}

	private function call_handle_schema( Mcp_Proxy_REST_API $api, \WP_REST_Request $request ) {
		$ref = new \ReflectionMethod( $api, 'handle_schema' );
		$ref->setAccessible( true );
		return $ref->invoke( $api, $request );
	}

	private function call_validate_get_params( Mcp_Proxy_REST_API $api, \WP_REST_Request $request ) {
		$ref = new \ReflectionMethod( $api, 'validate_get_params' );
		$ref->setAccessible( true );
		return $ref->invoke( $api, $request );
	}

	private function make_request( array $params = [] ): \WP_REST_Request {
		$request = new \WP_REST_Request();
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		return $request;
	}

	public function test_handle_schema__returns_200_with_schema_for_known_tool() {
		// Arrange
		$api = $this->make_api();
		$this->inject_tool( $api, 'test-tool', fn() => new Fake_Permissive_Ability() );
		$request = $this->make_request( [ 'schema' => 'test-tool' ] );

		// Act
		$response = $this->call_handle_schema( $api, $request );

		// Assert
		$data = $response->get_data();
		$this->assertSame( \WP_Http::OK, $response->get_status() );
		$this->assertArrayHasKey( 'inputSchema', $data['data'] );
		$this->assertArrayHasKey( 'outputSchema', $data['data'] );
		$this->assertArrayHasKey( 'description', $data['data'] );
	}

	public function test_handle_schema__returns_404_for_unknown_tool() {
		// Arrange
		$api     = $this->make_api();
		$request = $this->make_request( [ 'schema' => 'non-existent-tool' ] );

		// Act
		$result = $this->call_handle_schema( $api, $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'unknown_tool', $result->get_error_code() );
		$this->assertSame( \WP_Http::NOT_FOUND, $result->get_error_data( 'unknown_tool' )['status'] );
	}

	public function test_handle_schema__returns_403_when_ability_denies_permission() {
		// Arrange
		$api = $this->make_api();
		$this->inject_tool( $api, 'restricted-tool', fn() => new Fake_Forbidden_Ability() );
		$request = $this->make_request( [ 'schema' => 'restricted-tool' ] );

		// Act
		$result = $this->call_handle_schema( $api, $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( \WP_Http::FORBIDDEN, $result->get_error_data( 'rest_forbidden' )['status'] );
	}

	public function test_validate_get_params__returns_wp_error_when_neither_schema_nor_uri() {
		// Arrange
		$api     = $this->make_api();
		$request = $this->make_request();

		// Act
		$result = $this->call_validate_get_params( $api, $request );

		// Assert
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'missing_param', $result->get_error_code() );
		$this->assertSame( \WP_Http::BAD_REQUEST, $result->get_error_data( 'missing_param' )['status'] );
	}
}
