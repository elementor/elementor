<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Testing\Modules\Components\Mocks\Component_Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/mocks/component-mocks.php';
require_once __DIR__ . '/mocks/mock-pro-license-api.php';

/**
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
class Test_Components_License_Authorization extends Elementor_Test_Base {

	private $mock_component_1_content;

	public function setUp(): void {
		parent::setUp();

		require_once __DIR__ . '/mocks/component-mocks.php';
		require_once __DIR__ . '/mocks/mock-pro-license-api.php';

		$this->mock_component_1_content = Component_Mocks::get_component_1_data();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );

		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	public function tearDown(): void {
		parent::tearDown();

		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}

	private function create_test_component( string $title, array $elements, string $status = 'publish' ): int {
		$this->act_as_admin();
		\Mock_Pro_License_API::set_license_state( active: true );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => $status,
			'items' => [
				[
					'uid' => wp_generate_uuid4(),
					'title' => $title,
					'elements' => $elements,
				],
			],
		] );

		$response = rest_do_request( $request );
		$data = $response->get_data();

		return $data['data'][0]['id'];
	}

	public function test_create_component__blocked_for_core_tier() {
		// Arrange
		$this->act_as_admin();
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => '100',
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'create', $response->get_data()['data']['meta']['action'] );
		$this->assertEquals( 'core', $response->get_data()['data']['meta']['tier'] );
	}

	public function test_create_validate__blocked_for_core_tier() {
		// Arrange
		$this->act_as_admin();
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid',
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'create', $response->get_data()['data']['meta']['action'] );
	}

	public function test_update_statuses__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Draft Component', $this->mock_component_1_content, 'draft' );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $component_id ] );
		$request->set_param( 'status', 'publish' );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'publish', $response->get_data()['data']['meta']['action'] );
	}

	public function test_archive__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/archive' );
		$request->set_param( 'componentIds', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'delete', $response->get_data()['data']['meta']['action'] );
	}

	public function test_update_titles__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Original Title', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/update-titles' );
		$request->set_param( 'components', [
			[ 'componentId' => $component_id, 'title' => 'New Title' ],
		] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'rename', $response->get_data()['data']['meta']['action'] );
	}

	public function test_lock__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/lock' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'lock', $response->get_data()['data']['meta']['action'] );
	}

	public function test_unlock__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/unlock' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'unlock', $response->get_data()['data']['meta']['action'] );
	}

	public function test_lock_status__blocked_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/lock-status' );
		$request->set_param( 'componentId', (string) $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'insufficient_permissions', $response->get_data()['code'] );
		$this->assertEquals( 'lock_status', $response->get_data()['data']['meta']['action'] );
	}

	public function test_get_components__allowed_for_core_tier() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_styles__allowed_for_core_tier() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_get_overridable_props__allowed_for_core_tier() {
		// Arrange
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );
		\Mock_Pro_License_API::set_license_state( active: false );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
	}
}
