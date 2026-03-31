<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Rest_Api_Index extends Elementor_Test_Base {

	private $mock_global_classes = [
		'items' => [
			'g-1' => [
				'id' => 'g-1',
				'label' => 'button-primary',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'blue' ] ],
					],
				],
			],
			'g-2' => [
				'id' => 'g-2',
				'label' => 'card-shadow',
				'type' => 'class',
				'variants' => [
					[
						'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
						'props' => [ 'box-shadow' => [ '$$type' => 'shadow', 'value' => '0 0 10px' ] ],
					],
				],
			],
			'g-3' => [
				'id' => 'g-3',
				'label' => 'heading-lg',
				'type' => 'class',
				'variants' => [],
			],
		],
		'order' => [ 'g-1', 'g-2', 'g-3' ],
	];

	private Kit $kit;

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		parent::tearDown();

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
	}

	public function test_get_index__returns_lightweight_data() {
		// Arrange
		$this->act_as_admin();
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/index' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$meta = $response->get_data()['meta'];

		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $meta['order'] );

		$this->assertArrayHasKey( 'g-1', (array) $data );
		$this->assertArrayHasKey( 'g-2', (array) $data );
		$this->assertArrayHasKey( 'g-3', (array) $data );

		$this->assertSame( 'button-primary', $data->{'g-1'}['label'] );
		$this->assertSame( 'card-shadow', $data->{'g-2'}['label'] );
		$this->assertSame( 'heading-lg', $data->{'g-3'}['label'] );

		$this->assertArrayNotHasKey( 'variants', $data->{'g-1'} );
		$this->assertArrayNotHasKey( 'type', $data->{'g-1'} );
	}

	public function test_get_index__fails_when_not_logged_in() {
		// Arrange
		wp_set_current_user( 0 );
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/index' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 401, $response->get_status() );
	}

	public function test_all_with_ids__returns_only_requested_classes() {
		// Arrange
		$this->act_as_admin();
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$request->set_param( 'ids', 'g-1,g-3' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$meta = $response->get_data()['meta'];

		$this->assertCount( 2, (array) $data );
		$this->assertArrayHasKey( 'g-1', (array) $data );
		$this->assertArrayHasKey( 'g-3', (array) $data );
		$this->assertObjectNotHasProperty( 'g-2', $data );

		$this->assertSame( [ 'g-1', 'g-3' ], $meta['order'] );

		$this->assertArrayHasKey( 'variants', $data->{'g-1'} );
		$this->assertSame( 'button-primary', $data->{'g-1'}['label'] );
	}

	public function test_all_with_ids__returns_empty_for_non_existing_ids() {
		// Arrange
		$this->act_as_admin();
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$request->set_param( 'ids', 'g-nonexistent' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$meta = $response->get_data()['meta'];

		$this->assertCount( 0, (array) $data );
		$this->assertSame( [], $meta['order'] );
	}

	public function test_all_without_ids__returns_all_classes() {
		// Arrange
		$this->act_as_admin();
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$meta = $response->get_data()['meta'];

		$this->assertCount( 3, (array) $data );
		$this->assertSame( [ 'g-1', 'g-2', 'g-3' ], $meta['order'] );
	}
}
