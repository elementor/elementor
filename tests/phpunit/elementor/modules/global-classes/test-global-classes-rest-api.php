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

	public function test_put__fails_when_max_items_limit_reached() {
		// Arrange.
		$this->act_as_admin();

		// Act - send 50 items.
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$items = [];
		for ( $i = 0; $i < 50; $i++ ) {
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

		// Assert - should succeed.
		$this->assertSame( 204, $response->get_status() );

		// Act - send the 51st item.
		$items[ "g-50" ] = $this->create_global_class( "g-50" );

		$request->set_body_params( [
			'items' => $items,
			'order' => array_keys( $items ),
			'changes' => [
				'added' => [ 'g-50' ],
				'deleted' => [],
				'modified' => [],
			]
		] );

		$response = rest_do_request( $request );

		// Assert - should fail.
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

	public function test_put__resolves_duplicate_labels() {
		// Arrange.
		$this->act_as_admin();

		$existing_class = $this->create_global_class( 'existing', 'blue', 'MyClass' );

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => [ 'existing' ],
		];

		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $initial );

		// Act - Try to add a new class with the same label (duplicate)
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/global-classes' );

		$new_class = $this->create_global_class( 'new', 'red', 'MyClass' );

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'new' => $new_class,
			],
			'order' => [ 'existing', 'new' ],
			'changes' => [
				'added' => [ 'new' ],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params( $payload );

		$response = rest_do_request( $request );

		// Assert.
		$classes = $this->kit->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		// Should return 200 with content when duplicates are resolved
		$this->assertSame( 200, $response->get_status() );
		$this->assertNotNull( $response->get_data() );

		// Check that the duplicate label was resolved
		$response_data = $response->get_data();
		
		// The response data is nested under 'data' key
		$this->assertArrayHasKey( 'data', $response_data );
		$this->assertArrayHasKey( 'code', $response_data['data'] );
		$this->assertSame( 'DUPLICATED_LABEL', $response_data['data']['code'] );

		// Check that the new class has a modified label
		$this->assertArrayHasKey( 'new', $classes['items'] );
		$this->assertStringStartsWith( 'DUP_', $classes['items']['new']['label'] );
		$this->assertNotSame( 'MyClass', $classes['items']['new']['label'] );

		// Check that the existing class label was not changed
		$this->assertSame( 'MyClass', $classes['items']['existing']['label'] );
	}

	public function test_put__resolves_duplicate_labels_when_adding_multiple_classes() {
		// Arrange.
		$this->act_as_admin();

		$existing_class = $this->create_global_class('existing', 'blue', 'MyClass');

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Try to add a new class with the same label (duplicate)
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$new_class = $this->create_global_class('new', 'red', 'MyClass');

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'new' => $new_class,
			],
			'order' => ['existing', 'new'],
			'changes' => [
				'added' => ['new'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);

		$response = rest_do_request($request);

		// Assert.
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 200 with content when duplicates are resolved
		$this->assertSame(200, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that the duplicate label was resolved
		$response_data = $response->get_data();

		// The response data is nested under 'data' key
		$this->assertArrayHasKey('data', $response_data);
		$this->assertArrayHasKey('code', $response_data['data']);
		$this->assertSame('DUPLICATED_LABEL', $response_data['data']['code']);

		// Check that the new class has a modified label
		$this->assertArrayHasKey('new', $classes['items']);
		$this->assertStringStartsWith('DUP_', $classes['items']['new']['label']);
		$this->assertNotSame('MyClass', $classes['items']['new']['label']);

		// Check that the existing class label was not changed
		$this->assertSame('MyClass', $classes['items']['existing']['label']);
	}

	public function test_put__handles_duplicates_with_existing_dup_prefix() {
		// Arrange
		$this->act_as_admin();

		$existing_class = $this->create_global_class('existing', 'blue', 'DUP_MyClass');

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Try to add a new class with the same label that already has DUP_ prefix
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$new_class = $this->create_global_class('new', 'red', 'DUP_MyClass');

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'new' => $new_class,
			],
			'order' => ['existing', 'new'],
			'changes' => [
				'added' => ['new'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 200 with content when duplicates are resolved
		$this->assertSame(200, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that the duplicate label was resolved
		$response_data = $response->get_data();
		$this->assertArrayHasKey('data', $response_data);
		$this->assertArrayHasKey('code', $response_data['data']);
		$this->assertSame('DUPLICATED_LABEL', $response_data['data']['code']);

		// Check that the new class has a modified label with counter
		$this->assertArrayHasKey('new', $classes['items']);
		$this->assertStringStartsWith('DUP_', $classes['items']['new']['label']);
		$this->assertNotSame('DUP_MyClass', $classes['items']['new']['label']);
		$this->assertMatchesRegularExpression('/\d+$/', $classes['items']['new']['label'], 'Label should end with a number counter');

		// Check that the existing class label was not changed
		$this->assertSame('DUP_MyClass', $classes['items']['existing']['label']);
	}

	public function test_put__resolves_duplicates_with_very_long_labels() {
		// Arrange
		$this->act_as_admin();

		$very_long_label = str_repeat('A', 100); // 100 characters
		$existing_class = $this->create_global_class('existing', 'blue', $very_long_label);

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Try to add a new class with the same very long label
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$new_class = $this->create_global_class('new', 'red', $very_long_label);

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'new' => $new_class,
			],
			'order' => ['existing', 'new'],
			'changes' => [
				'added' => ['new'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 400 when labels are too long (validation error)
		$this->assertSame(400, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that the validation error is returned
		$response_data = $response->get_data();
		$this->assertArrayHasKey('code', $response_data);
		$this->assertSame('invalid_items', $response_data['code']);
	}

	public function test_put__handles_duplicates_after_label_modification() {
		// Arrange
		$this->act_as_admin();

		$existing_class = $this->create_global_class('existing', 'blue', 'MyClass');

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - First modify the existing class label
		$modified_class = $this->create_global_class('existing', 'blue', 'NewClass');
		$first_payload = [
			'items' => [
				'existing' => $modified_class,
			],
			'order' => ['existing'],
			'changes' => [
				'added' => [],
				'deleted' => [],
				'modified' => ['existing'],
			]
		];

		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');
		$request->set_body_params($first_payload);
		rest_do_request($request);

		// Now try to add a new class with the original label
		$new_class = $this->create_global_class('new', 'red', 'MyClass');
		$second_payload = [
			'items' => [
				'existing' => $modified_class,
				'new' => $new_class,
			],
			'order' => ['existing', 'new'],
			'changes' => [
				'added' => ['new'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');
		$request->set_body_params($second_payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 204 when no duplicates are found (no content)
		$this->assertSame(204, $response->get_status());
		$this->assertNull($response->get_data());

		// Check that both classes exist with their original labels
		$this->assertArrayHasKey('new', $classes['items']);
		$this->assertArrayHasKey('existing', $classes['items']);
		$this->assertSame('MyClass', $classes['items']['new']['label']);
		$this->assertSame('NewClass', $classes['items']['existing']['label']);
	}

	public function test_put__resolves_duplicates_in_bulk_operations() {
		// Arrange
		$this->act_as_admin();

		$existing_class = $this->create_global_class('existing', 'blue', 'MyClass');

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Add multiple classes where some have duplicate labels
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$duplicate_class_1 = $this->create_global_class('duplicate1', 'red', 'MyClass');
		$duplicate_class_2 = $this->create_global_class('duplicate2', 'green', 'MyClass');
		$unique_class_1 = $this->create_global_class('unique1', 'yellow', 'UniqueClass1');
		$unique_class_2 = $this->create_global_class('unique2', 'purple', 'UniqueClass2');

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'duplicate1' => $duplicate_class_1,
				'duplicate2' => $duplicate_class_2,
				'unique1' => $unique_class_1,
				'unique2' => $unique_class_2,
			],
			'order' => ['existing', 'duplicate1', 'duplicate2', 'unique1', 'unique2'],
			'changes' => [
				'added' => ['duplicate1', 'duplicate2', 'unique1', 'unique2'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 200 with content when duplicates are resolved
		$this->assertSame(200, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that duplicate labels were resolved
		$response_data = $response->get_data();
		$this->assertArrayHasKey('data', $response_data);
		$this->assertArrayHasKey('code', $response_data['data']);
		$this->assertSame('DUPLICATED_LABEL', $response_data['data']['code']);

		// Check that all duplicate classes have modified labels
		$this->assertStringStartsWith('DUP_', $classes['items']['duplicate1']['label']);
		$this->assertStringStartsWith('DUP_', $classes['items']['duplicate2']['label']);
		$this->assertNotSame('MyClass', $classes['items']['duplicate1']['label']);
		$this->assertNotSame('MyClass', $classes['items']['duplicate2']['label']);

		// Check that unique class labels were not changed
		$this->assertSame('UniqueClass1', $classes['items']['unique1']['label']);
		$this->assertSame('UniqueClass2', $classes['items']['unique2']['label']);

		// Check that existing class label was not changed
		$this->assertSame('MyClass', $classes['items']['existing']['label']);
	}

	public function test_put__handles_mixed_duplicates_and_unique_labels() {
		// Arrange
		$this->act_as_admin();

		$existing_class = $this->create_global_class('existing', 'blue', 'MyClass');

		$initial = [
			'items' => [
				'existing' => $existing_class,
			],
			'order' => ['existing'],
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Add classes where some labels are duplicates and others are unique
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$duplicate_class = $this->create_global_class('duplicate', 'red', 'MyClass');
		$unique_class_1 = $this->create_global_class('unique1', 'green', 'UniqueClass1');
		$unique_class_2 = $this->create_global_class('unique2', 'yellow', 'UniqueClass2');

		$payload = [
			'items' => [
				'existing' => $existing_class,
				'duplicate' => $duplicate_class,
				'unique1' => $unique_class_1,
				'unique2' => $unique_class_2,
			],
			'order' => ['existing', 'duplicate', 'unique1', 'unique2'],
			'changes' => [
				'added' => ['duplicate', 'unique1', 'unique2'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 200 with content when duplicates are resolved
		$this->assertSame(200, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that only duplicate labels were modified
		$response_data = $response->get_data();
		$this->assertArrayHasKey('data', $response_data);
		$this->assertArrayHasKey('code', $response_data['data']);
		$this->assertSame('DUPLICATED_LABEL', $response_data['data']['code']);

		// Check that duplicate class has modified label
		$this->assertStringStartsWith('DUP_', $classes['items']['duplicate']['label']);
		$this->assertNotSame('MyClass', $classes['items']['duplicate']['label']);

		// Check that unique class labels were not changed
		$this->assertSame('UniqueClass1', $classes['items']['unique1']['label']);
		$this->assertSame('UniqueClass2', $classes['items']['unique2']['label']);

		// Check that existing class label was not changed
		$this->assertSame('MyClass', $classes['items']['existing']['label']);
	}


	public function test_put__duplicate_resolution_with_maximum_classes() {
		// Arrange
		$this->act_as_admin();

		// Create 49 classes (just under the 50 limit)
		$items = [];
		$order = [];
		for ($i = 0; $i < 49; $i++) {
			$id = "g-{$i}";
			$items[$id] = $this->create_global_class($id, 'blue', "Class{$i}");
			$order[] = $id;
		}

		$initial = [
			'items' => $items,
			'order' => $order,
		];

		$this->kit->update_json_meta(Global_Classes_Repository::META_KEY_FRONTEND, $initial);

		// Act - Try to add a class with a duplicate label
		$request = new \WP_REST_Request('PUT', '/elementor/v1/global-classes');

		$duplicate_class = $this->create_global_class('duplicate', 'red', 'Class0'); // Duplicate of first class

		$payload = [
			'items' => array_merge($items, ['duplicate' => $duplicate_class]),
			'order' => array_merge($order, ['duplicate']),
			'changes' => [
				'added' => ['duplicate'],
				'deleted' => [],
				'modified' => [],
			]
		];

		$request->set_body_params($payload);
		$response = rest_do_request($request);

		// Assert
		$classes = $this->kit->get_json_meta(Global_Classes_Repository::META_KEY_FRONTEND);

		// Should return 200 with content when duplicates are resolved
		$this->assertSame(200, $response->get_status());
		$this->assertNotNull($response->get_data());

		// Check that the duplicate label was resolved
		$response_data = $response->get_data();
		$this->assertArrayHasKey('data', $response_data);
		$this->assertArrayHasKey('code', $response_data['data']);
		$this->assertSame('DUPLICATED_LABEL', $response_data['data']['code']);

		// Check that the total count is exactly 50 (49 original + 1 new)
		$this->assertCount(50, $classes['items']);

		// Check that the duplicate class has a modified label
		$this->assertArrayHasKey('duplicate', $classes['items']);
		$this->assertStringStartsWith('DUP_', $classes['items']['duplicate']['label']);
		$this->assertNotSame('Class0', $classes['items']['duplicate']['label']);

		// Check that the original class label was not changed
		$this->assertSame('Class0', $classes['items']['g-0']['label']);
	}

	public function test_get_usage__returns_usage_data() {
		$this->act_as_admin();
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes/usage' );
		$response = rest_do_request( $request );
		$this->assertSame(200, $response->get_status() );
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

	public function test_all__succeeds_for_logged_in_user() {
		// Arrange
		$this->act_as_editor();
		
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( (object) $this->mock_global_classes['items'], $response->get_data()['data'] );
		$this->assertEquals( $this->mock_global_classes['order'], $response->get_data()['meta']['order'] );
		$this->assertEquals( 200, $response->get_status() );
	}

	public function test_all__fails_for_non_logged_in_user() {
		// Arrange
		wp_set_current_user( 0 ); 
		
		$this->kit->update_json_meta( Global_Classes_Repository::META_KEY_FRONTEND, $this->mock_global_classes );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/global-classes' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertSame( 401, $response->get_status() );
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
					'custom_css' => null,
				],
			],
		];
	}


}
