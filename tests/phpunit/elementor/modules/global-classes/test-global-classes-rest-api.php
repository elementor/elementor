<?php
namespace Elementor\Testing\Modules\GlobalClasses;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Modules\GlobalClasses\Database\Migrations\Add_Capabilities;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Global_Classes_Rest_Api extends Elementor_Test_Base {

	private $mock_global_classes = [
		'items' => [
			'g-4-123' => [
				'id' => 'g-4-123',
				'label' => 'pinky',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'pink',
							],
						],
					],
				],
			],
			'g-4-124' => [
				'id' => 'g-4-124',
				'label' => 'bluey',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => 'blue',
							],
						],
					],
				],
			],
		],
		'order' => [ 'g-4-123', 'g-4-124' ],
	];

	/**
	 * @var Kit
	 */
	private $kit;

	public function setUp(): void {
		parent::setUp();

		global $wp_rest_server;

		$wp_rest_server = new \WP_REST_Server();

		$role = get_role( 'administrator' );
		$role->add_cap( Add_Capabilities::UPDATE_CLASS  );

		do_action( 'rest_api_init' );

		$this->kit = Plugin::$instance->kits_manager->get_active_kit();
	}

	public function tearDown(): void {
		parent::tearDown();

		$role = get_role( 'administrator' );
		$role->remove_cap( Add_Capabilities::UPDATE_CLASS );

		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_FRONTEND );
		$this->kit->delete_meta( Global_Classes_Repository::META_KEY_PREVIEW );
	}

	public function test_all__returns_all_global_classes() {
		// Arrange
		$this->act_as_admin();

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( (object) $this->mock_global_classes['items'], $response->get_data()['data'] );
		$this->assertEquals( $this->mock_global_classes['order'], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__returns_all_global_classes__preview_context() {
		// Arrange.
		$this->act_as_admin();

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $this->mock_global_classes );

		// Act.
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$request->set_param( 'context', Global_Classes_Repository::CONTEXT_PREVIEW );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertEquals( (object) $this->mock_global_classes['items'], $response->get_data()['data'] );
		$this->assertEquals( $this->mock_global_classes['order'], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__returns_empty_data_when_no_classes() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( (object) [], $response->get_data()['data'] );
		$this->assertEquals( [], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__fails_when_context_is_invalid() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$request->set_param( 'context', 'invalid-context' );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'context', $response->get_data()['data']['params'] );
	}

	public function test_put__updates_classes() {
		// Arrange.
		$this->act_as_admin();

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$initial = [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1', 'g-2' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_3 = $this->create_global_class( 'g-3', '<b>should-be-sanitized</b>' );

		$updated = [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $class_3,
			],
			'order' => [ 'g-3', 'g-1' ],
			'changes' => [
				'added' => [ 'g-3' ],
				'deleted' => [ 'g-2' ],
				'modified' => [],
			]
		];

		$request->set_body_params( $updated );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $this->create_global_class( 'g-3', 'should-be-sanitized' ),
			],
			'order' => [ 'g-3', 'g-1' ],
		], $classes );
	}

	public function test_put__updates_based_on_changes() {
		// Arrange.
		$this->act_as_admin();

		$unchanged = $this->create_global_class( 'unchanged' );
		$removed = $this->create_global_class( 'removed' );
		$modified = $this->create_global_class( 'modified', 'blue' );
		$not_in_payload = $this->create_global_class( 'not-in-payload' );

		$initial = [
			'items' => [
				'unchanged' => $unchanged,
				'removed' => $removed,
				'modified' => $modified,
				'not-in-payload' => $not_in_payload,
			],
			'order' => [ 'unchanged', 'removed', 'modified', 'not-in-payload' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$new = $this->create_global_class( 'new' );
		$unchanged_removed_in_server = $this->create_global_class( 'unchanged-removed-in-server' );

		$payload = [
			'items' => [
				'unchanged' => $unchanged,
				'modified' => $this->create_global_class( 'modified', 'yellow' ),
				'new' => $new,
				'unchanged-removed-in-server' => $unchanged_removed_in_server,
			],
			'order' => [ 'unchanged-removed-in-server', 'modified', 'unchanged', 'new' ],
			'changes' => [
				'added' => [ 'new' ],
				'deleted' => [ 'removed' ],
				'modified' => [ 'modified' ],
			]
		];

		$request->set_body_params( $payload );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'unchanged' => $unchanged,
				'modified' => $this->create_global_class( 'modified', 'yellow' ),
				'not-in-payload' => $not_in_payload,
				'new' => $new,
			],
			'order' => [ 'not-in-payload', 'modified', 'unchanged', 'new' ],
		], $classes );
	}

	public function test_put__updates_classes__preview() {
		// Arrange.
		$this->act_as_admin();

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$initial = [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1', 'g-2' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_PREVIEW, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_3 = $this->create_global_class( 'g-3', '<b>should-be-sanitized</b>' );

		$params = [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $class_3,
			],
			'order' => [ 'g-3', 'g-1' ],
			'changes' => [
				'added' => [ 'g-3' ],
				'deleted' => [ 'g-2' ],
				'modified' => [],
			],
			'context' => Global_Classes_Repository::CONTEXT_PREVIEW,
		];

		$request->set_body_params( $params );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_PREVIEW );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'g-1' => $class_1,
				'g-3' => $this->create_global_class( 'g-3', 'should-be-sanitized' ),
			],
			'order' => [ 'g-3', 'g-1' ],
		], $classes );
	}

	public function test_put__fails_when_unauthorized() {
		// Arrange.
		$this->act_as_editor();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => [],
			'order' => [],
			'changes' => [
				'added' => [],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_put__fails_when_context_is_invalid() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );
		$request->set_body_params( [
			'items' => [],
			'order' => [],
			'changes' => [
				'added' => [],
				'deleted' => [],
				'modified' => [],
			],
			'context' => 'invalid-context',
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertArrayHasKey( 'context', $response->get_data()['data']['params'] );
	}

	public function test_put__fails_when_missing_required_param() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_missing_callback_param', $response->get_data()['code'] );
		$this->assertSame( [ 'changes', 'items', 'order' ], $response->get_data()['data']['params'] );
	}

	public function test_put__fails_when_params_have_invalid_type() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => 'not-an-object',
			'order' => fn () => null,
			'changes' => [
				'added' => [],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'items', 'order' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_order_or_changes_contains_non_strings() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( [
			'items' => [],
			'order' => [ 'g-1', 123 ],
			'changes' => [
				'added' => [ 'g-1', 123 ],
				'deleted' => [ 'g-2' ],
				'modified' => [ 'g-3' ],
			]
		] );

		$response = rest_do_request( $request );


		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'order', 'changes' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_items_contains_non_objects() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [ $class, 'not-a-class' ],
			'order' => [ 'g-1' ],
			'changes' => [
				'added' => [ 'g-1', 'not-a-class' ],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'rest_invalid_param', $response->get_data()['code'] );
		$this->assertSame( [ 'items' ], array_keys( $response->get_data()['data']['params'] ) );
	}

	public function test_put__fails_when_order_contains_non_existing_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1', 'g-2' ],
			'changes' => [
				'added' => [ 'g-1', 'g-2' ],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_order', $response->get_data()['code'] );
	}

	public function test_put_fails_when_max_items_limit_reached() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$items = [];
		for ( $i = 0; $i < 51; $i++ ) {
			$items[ "g-$i" ] = $this->create_global_class( "g-$i" );
		}

		$request->set_body_params( [
			'items' => $items,
			'order' => array_keys( $items ),
			'changes' => [
				'added' => array_keys( $items ),
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'global_classes_limit_exceeded', $response->get_data()['code'] );
	}

	public function test_put__fails_when_order_is_missing_ids() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1' ],
			'changes' => [
				'added' => [ 'g-1', 'g-2' ],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_order', $response->get_data()['code'] );
	}

	public function test_put__skips_order_duplications() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class = $this->create_global_class( 'g-1' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1', 'g-1' ],
			'changes' => [
				'added' => [ 'g-1' ],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );

		$this->assertSame( [
			'items' => [
				'g-1' => $class,
			],
			'order' => [ 'g-1' ],
		], $classes );
	}

	public function test_put__fails_when_items_has_item_with_wrong_id() {
		// Arrange.
		$this->act_as_admin();

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$request->set_body_params( [
			'items' => [
				'g-1' => $class_1,
				'g-222' => $class_2,
			],
			'order' => [ 'g-1', 'g-222' ],
			'changes' => [
				'added' => [ 'g-1', 'g-222' ],
				'deleted' => [],
				'modified' => [],
			],
		] );

		$response = rest_do_request( $request );

		// Assert.
		$this->assertSame( 400, $response->get_status() );
		$this->assertSame( 'invalid_items', $response->get_data()['code'] );
		$this->assertStringNotContainsString( 'g-1', $response->get_data()['message'] );
		$this->assertStringContainsString( 'g-222', $response->get_data()['message'] );
	}

	public function test_put__does_not_fail_when_data_is_identical() {
		// Arrange.
		$this->act_as_admin();

		$class_1 = $this->create_global_class( 'g-1' );
		$class_2 = $this->create_global_class( 'g-2' );

		$initial = [
			'items' => [
				'g-1' => $class_1,
				'g-2' => $class_2,
			],
			'order' => [ 'g-1', 'g-2' ],
			'changes' => [
				'added' => [ 'g-1', 'g-2' ],
				'deleted' => [],
				'modified' => [],
			],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $initial );

		// Act.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$request->set_body_params( $initial );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( 204, $response->get_status() );
		$this->assertNull( $response->get_data() );
		$this->assertSame( $initial, $classes );
	}

	public function test_get_usage__returns_usage_data() {
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/usage' );
		$response = rest_do_request( $request );
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'data', $response->get_data() );
		$this->assertIsObject( $response->get_data()['data'] );
	}

	public function test_get_usage__with_page_info_true() {
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/usage' );
		$response = rest_do_request( $request );
		$this->assertSame( 200, $response->get_status() );
		$this->assertArrayHasKey( 'data', $response->get_data() );
	}

	public function test_get_usage__fails_without_capabilities() {
		$this->act_as_editor();
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/usage' );
		$response = rest_do_request( $request );
		$this->assertSame( 403, $response->get_status() );
	}

	public function test_register_routes__endpoints_exist() {
		global $wp_rest_server;
		$routes = $wp_rest_server->get_routes();
		$this->assertArrayHasKey( '/elementor/v1/global-classes', $routes );
		$this->assertArrayHasKey( '/elementor/v1/global-classes/usage', $routes );
	}

	private function create_global_class( string $id, ?string $color = null, ?string $label = null ) {
		return [
			'id' => $id,
			'label' => $label ?? $id,
			'type' => 'class',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => $color ?? 'red',
						],
					],
				],
			],
		];
	}


}
