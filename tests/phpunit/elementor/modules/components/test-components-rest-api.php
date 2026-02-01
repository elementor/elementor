<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;
use Elementor\Testing\Modules\Components\Mocks\Component_Mocks;
use Elementor\Testing\Modules\Components\Mocks\Component_Overrides_Mocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/mocks/component-mocks.php';
require_once __DIR__ . '/mocks/component-overrides-mocks.php';

class Test_Components_Rest_Api extends Elementor_Test_Base {

	private $mock_component_1_content;
	private $mock_component_2_content;

	public function setUp(): void {
		parent::setUp();

		// Load mock component data
		$this->mock_component_1_content = Component_Mocks::get_component_1_data();
		$this->mock_component_2_content = Component_Mocks::get_component_2_data();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server();

		do_action( 'rest_api_init' );

		// Register the component document type
		Plugin::$instance->documents->register_document_type(
			Component_Document::TYPE,
			Component_Document::get_class_full_name()
		);

		// Register post type for components
		register_post_type( Component_Document::TYPE, [
			'label' => Component_Document::get_title(),
			'labels' => Component_Document::get_labels(),
			'public' => false,
			'supports' => Component_Document::get_supported_features(),
		] );
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_components();
	}

	private function clean_up_components() {
		// Clean up created components
		$components = get_posts( [
			'post_type' => Component_Document::TYPE,
			'post_status' => 'any',
			'posts_per_page' => -1,
		] );

		foreach ( $components as $component ) {
			wp_delete_post( $component->ID, true );
		}
	}

	public function test_get_components__returns_empty_array_when_no_components() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [], $response->get_data()['data'] );
	}

	public function test_get_components__returns_all_components() {
		// Arrange
		$this->act_as_admin();
		$component_1_id = $this->create_test_component( 'Test Component 1', $this->mock_component_1_content );
		$component_2_id = $this->create_test_component( 'Test Component 2', $this->mock_component_2_content );
		$component_3_id = $this->create_test_component( 'Test Component 3', $this->mock_component_2_content, 'draft' );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];

		$this->assertCount( 3, $data );
		$this->assertArrayContainsObjects(
			[
				[
					'id' => $component_1_id,
					'name' => 'Test Component 1',
				],
				[
					'id' => $component_2_id,
					'name' => 'Test Component 2',
				],
				[
					'id' => $component_3_id,
					'name' => 'Test Component 3',
				],
			],
			$data,
			'Should return all components'
		);
	}

	public function test_get_styles__returns_empty_array_when_no_components() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [], $response->get_data()['data'] );
	}

	public function test_get_styles__returns_extracted_styles() {
		// Arrange
		$this->act_as_admin();
		$component_1_id = $this->create_test_component( 'Test Component 1', $this->mock_component_1_content );
		$component_2_id = $this->create_test_component( 'Test Component 2', $this->mock_component_2_content );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/styles' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];



		// // Check styles for component 1
		$expected_styles_1 = Component_Mocks::get_component_1_expected_styles();

		$this->assertArrayHasKey( $component_1_id, $data, 'Component 1 should have styles in response' );
		$this->assertNotEmpty( $data[ $component_1_id ], 'Component 1 styles should not be empty' );

		$extracted_styles_1 = $data[ $component_1_id ];

		$this->assertArrayContainsObjects(
			array_values( $expected_styles_1 ),
			array_values( $extracted_styles_1 ),
			'Component 1 extracted styles should contain all expected styles'
		);

		// Check styles for component 2
		$expected_styles_2 = Component_Mocks::get_component_2_expected_styles();
		$extracted_styles_2 = $data[ $component_2_id ];

		$this->assertArrayContainsObjects(
			array_values( $expected_styles_2 ),
			array_values( $extracted_styles_2 ),
			'Component 2 extracted styles should contain all expected styles'
		);
	}

	public function post_create_components_data_provider() {
		return [
			'Successfully created with status publish' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '100',
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						],
						[
							'uid' => '200',
							'title' => 'New Test Component 2',
							'elements' => Component_Mocks::get_component_2_data(),
						],
					]
				],
				'expected' => [
					'100' => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'publish',
					],
					'200' => [
						'title' => 'New Test Component 2',
						'content' => Component_Mocks::get_component_2_data(),
						'status' => 'publish',
					]
				]
			],
			'Successfully created with status draft' => [
				'input' => [
					'status' => 'draft',
					'items' => [
						[
							'uid' => '100',
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					'100' => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'draft',
					]
				]
			],
			'Successfully created with status autosave' => [
				'input' => [
					'status' => 'autosave',
					'items' => [
						[
							'uid' => '100',
							'title' => 'New Test Component 1',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					'100' => [
						'title' => 'New Test Component 1',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'draft',
					]
				]
			],
			'Sanitize the title' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '100',
							'title' => '  <script>alert(1)</script>Sanitized Component ',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					]
				],
				'expected' => [
					'100' => [
						'title' => 'Sanitized Component',
						'content' => Component_Mocks::get_component_1_data(),
						'status' => 'publish',
					]
				]
			],
		];
	}

	/**
	 * @dataProvider post_create_components_data_provider
	 */
	public function test_post_create_components( $input, $expected ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( $input );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status() );

		$data = (array) $response->get_data()['data'];

		$this->assertCount( count( $expected ), $data );

		foreach ( $data as $key => $value ) {
			$document = Plugin::$instance->documents->get( $value );
			$current_expected = $expected[ $key ];

			$this->assertEquals( Component_Document::TYPE, $document->get_type() );
			$this->assertEquals( $current_expected['title'], $document->get_post()->post_title );
			$this->assertEquals( $current_expected['content'], $document->get_elements_data() );
			$this->assertEquals( $current_expected['status'], $document->get_post()->post_status );
		}
	}

	public function test_post_create_component__fails_when_unauthorized() {
		// Arrange
		$this->act_as_editor();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => '100',
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				]
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}


	public function post_create_components_fails_data_provider() {
		return [
			'Missing title' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '100',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "title is a required property of items[0]." ],
				],
			],
			'Title too short' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => 'A',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] must be at least 2 characters long." ],
				],
			],
			'Title too long' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => str_repeat( 'A', 201 ),
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] must be at most 200 characters long." ],
				],
			],
			'Title is invalid' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => [ 'not', 'a', 'string' ],
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][title] is not of type string." ],
				],
			],
			'Missing elements' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => 'Test Component',
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "elements is a required property of items[0]." ],
				],
			],
			'Elements not an array of object' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => 'Test Component',
							'elements' => 'not-an-array',
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][elements][0] is not of type object." ],
				],
			],
			'Elements is invalid' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => '1',
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_invalid_component_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 422,
					'code' => 'settings_validation_failed',
				],
			],
			'UID is missing' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "uid is a required property of items[0]." ],
				],
			],
			'UID not a string' => [
				'input' => [
					'status' => 'publish',
					'items' => [
						[
							'uid' => 456,
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'items' => "items[0][uid] is not of type string." ],
				],
			],
			'Status is missing' => [
				'input' => [
					'items' => [
						[
							'uid' => '1',
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_missing_callback_param',
					'errors' => [ 'status' ],
				],
			],
			'Status invalid value' => [
				'input' => [
					'status' => 'invalid-status',
					'items' => [
						[
							'uid' => '1',
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						]
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
					'errors' => [ 'status' => "status is not one of publish, draft, and autosave." ],
				],
			],
		];
	}

	/**
	 * @dataProvider post_create_components_fails_data_provider
	 */
	public function test_post_create_components__fails( $input, $expected ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( $input );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( $expected['status_code'], $response->get_status() );
		$this->assertEquals( $expected['code'], $response->get_data()['code'] );

		if ( isset( $expected['errors'] ) ) {
			$this->assertEquals( $expected['errors'], $response->get_data()['data']['params'] );
		}
	}

	public function test_post_create_component__fails_when_name_is_duplicated() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => '1',
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				]
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status() );
		$this->assertEquals( 'components_validation_failed', $response->get_data()['code'] );
		$this->assertEquals( 'Validation failed: Component title &#039;Test Component&#039; is duplicated.', $response->get_data()['message'] );
	}

	public function test_post_create_component__fails_when_uid_is_duplicated() {
		// Arrange
		$this->create_test_component( 'Test Component', $this->mock_component_1_content );
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => '1',
					'title' => 'Test Component 1',
					'elements' => $this->mock_component_1_content,
				],
				[
					'uid' => '1',
					'title' => 'Test Component 2',
					'elements' => $this->mock_component_1_content,
				]
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status() );
		$this->assertEquals( 'components_validation_failed', $response->get_data()['code'] );
		$this->assertEquals( 'Validation failed: Component uid &#039;1&#039; is duplicated.', $response->get_data()['message'] );
	}

	public function test_post_create_component__successfully_creates_with_valid_overridable_props() {
		// Arrange
		$this->act_as_admin();
		$this->clean_up_components();
		
		// Use simplified valid overridable props structure
		$overridable_props = [
			'props' => [],
			'groups' => [
				'items' => [],
				'order' => [],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-with-overrides',
					'title' => 'Component With Overridable Props',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$data = (array) $response->get_data()['data'];
		$this->assertCount( 1, $data );

		$component_id = $data['test-uid-with-overrides'];
		$document = Plugin::$instance->documents->get( $component_id );

		$this->assertEquals( Component_Document::TYPE, $document->get_type() );
		$this->assertEquals( 'Component With Overridable Props', $document->get_post()->post_title );

		$saved_overridable_props = $document->get_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY );
		
		// Empty overridable_props (empty arrays) should be saved
		$this->assertNotEmpty( $saved_overridable_props );
		$decoded_props = json_decode( $saved_overridable_props, true );
		$this->assertEquals( $overridable_props, $decoded_props );
	}

	public function test_post_create_component__successfully_creates_with_null_origin_value() {
		// Arrange
		$this->act_as_admin();
		
		// originValue can be null (valid case - means use the default from schema)
		$overridable_props = [
			'props' => [
				'prop-1' => [
					'overrideKey' => 'prop-1',
					'label' => 'Test Prop',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => null,
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Group 1',
						'props' => [ 'prop-1' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-null-origin',
					'title' => 'Component With Null Origin Value',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$data = (array) $response->get_data()['data'];
		
		$component_id = $data['test-uid-null-origin'];
		$document = Plugin::$instance->documents->get( $component_id );
		
		$this->assertEquals( Component_Document::TYPE, $document->get_type() );
	}

	public function test_post_create_component__successfully_creates_with_valid_prop_values() {
		// Arrange
		$this->act_as_admin();
		$this->clean_up_components();
		
		// Use actual valid PropValue structures from the mock component
		$overridable_props = [
			'props' => [
				'prop-button-text' => [
					'overrideKey' => 'prop-button-text',
					'label' => 'Button Text',
					'elementId' => 'component-1-button-id',
					'elType' => 'widget',
					'widgetType' => 'e-button',
					'propKey' => 'text',
					'originValue' => [
						'$$type' => 'html',
						'value' => 'Component 2 Button',
					],
					'groupId' => 'group-1',
				],
				'prop-button-link' => [
					'overrideKey' => 'prop-button-link',
					'label' => 'Button Link',
					'elementId' => 'component-1-button-id',
					'elType' => 'widget',
					'widgetType' => 'e-button',
					'propKey' => 'link',
					'originValue' => [
						'$$type' => 'link',
						'value' => [
							'destination' => [
								'$$type' => 'url',
								'value' => '#inner-link',
							],
							'label' => [
								'$$type' => 'string',
								'value' => '',
							],
						],
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Button Props',
						'props' => [ 'prop-button-text', 'prop-button-link' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-valid-props',
					'title' => 'Component With Valid PropValues',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 201, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$data = (array) $response->get_data()['data'];
		$this->assertCount( 1, $data );

		$component_id = $data['test-uid-valid-props'];
		$document = Plugin::$instance->documents->get( $component_id );

		$this->assertEquals( Component_Document::TYPE, $document->get_type() );
		$this->assertEquals( 'Component With Valid PropValues', $document->get_post()->post_title );

		$saved_overridable_props = $document->get_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY );
		$this->assertNotEmpty( $saved_overridable_props );
		
		$decoded_props = json_decode( $saved_overridable_props, true );
		
		// Verify the prop values were saved correctly
		$this->assertArrayHasKey( 'props', $decoded_props );
		$this->assertArrayHasKey( 'prop-button-text', $decoded_props['props'] );
		$this->assertArrayHasKey( 'prop-button-link', $decoded_props['props'] );
		
		// Verify the originValue structures are intact
		$this->assertEquals( 'html', $decoded_props['props']['prop-button-text']['originValue']['$$type'] );
		$this->assertEquals( 'Component 2 Button', $decoded_props['props']['prop-button-text']['originValue']['value'] );
		
		$this->assertEquals( 'link', $decoded_props['props']['prop-button-link']['originValue']['$$type'] );
		$this->assertEquals( '#inner-link', $decoded_props['props']['prop-button-link']['originValue']['value']['destination']['value'] );
	}

	public function test_post_validate_components__successfully_validates_with_valid_prop_values() {
		// Arrange
		$this->act_as_admin();
		
		// Use actual valid PropValue structures
		$overridable_props = [
			'props' => [
				'prop-button-text' => [
					'overrideKey' => 'prop-button-text',
					'label' => 'Button Text',
					'elementId' => 'component-1-button-id',
					'elType' => 'widget',
					'widgetType' => 'e-button',
					'propKey' => 'text',
					'originValue' => [
						'$$type' => 'html',
						'value' => 'Test Button Text',
					],
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Button Props',
						'props' => [ 'prop-button-text' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-validate',
					'title' => 'Validate Component With Valid Props',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert - validate endpoint returns 200 on success
		$this->assertEquals( 200, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
	}

	public function test_post_create_component__fails_with_invalid_overridable_props() {
		// Arrange
		$this->act_as_admin();
		
		// Missing required 'groups' field will cause validation to fail
		$invalid_overridable_props = [
			'props' => [
				'prop-1' => [
					'overrideKey' => 'prop-1',
					'label' => 'Invalid Prop',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'test',
					],
					'groupId' => 'group-1',
				],
			],
			// Missing 'groups' field - will cause validation error
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-invalid-overrides',
					'title' => 'Component With Invalid Overrides',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $invalid_overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$this->assertStringContainsString( 'validation', strtolower( $response->get_data()['code'] ) );
	}

	public function test_post_create_component__fails_with_invalid_origin_value_type() {
		// Arrange
		$this->act_as_admin();

		// originValue with wrong type structure will cause prop type validation to fail
		$invalid_overridable_props = [
			'props' => [
				'prop-1' => [
					'overrideKey' => 'prop-1',
					'label' => 'Test Prop',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					// Wrong type structure - should be a proper PropValue with $$type
					'originValue' => 'plain string instead of PropValue structure',
					'groupId' => 'group-1',
				],
			],
			'groups' => [
				'items' => [
					'group-1' => [
						'id' => 'group-1',
						'label' => 'Group 1',
						'props' => [ 'prop-1' ],
					],
				],
				'order' => [ 'group-1' ],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-invalid-origin-value',
					'title' => 'Component With Invalid Origin Value Type',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $invalid_overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$this->assertStringContainsString( 'validation', strtolower( $response->get_data()['code'] ) );
		$this->assertStringContainsString( 'originvalue', strtolower( $response->get_data()['message'] ) );
	}

	public function test_register_routes__endpoints_exist() {
		// Arrange
		global $wp_rest_server;
		$routes = $wp_rest_server->get_routes();

		// Assert
		$this->assertArrayHasKey( '/elementor/v1/components', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/styles', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/lock-status', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/lock', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/unlock', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/overridable-props', $routes );
		$this->assertArrayHasKey( '/elementor/v1/components/create-validate', $routes );

		// Check GET method for components
		$components_route = $routes['/elementor/v1/components'];
		$get_methods = array_filter( $components_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $get_methods );

		// Check POST method for components
		$post_methods = array_filter( $components_route, fn( $route ) => in_array( 'POST', $route['methods'] ) );
		$this->assertNotEmpty( $post_methods );

		// Check GET method for styles
		$styles_route = $routes['/elementor/v1/components/styles'];
		$styles_get_methods = array_filter( $styles_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $styles_get_methods );

		// Check GET method for lock-status
		$lock_status_route = $routes['/elementor/v1/components/lock-status'];
		$lock_status_get_methods = array_filter( $lock_status_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $lock_status_get_methods );

		// Check POST method for lock
		$lock_route = $routes['/elementor/v1/components/lock'];
		$lock_post_methods = array_filter( $lock_route, fn( $route ) => in_array( 'POST', $route['methods'] ) );
		$this->assertNotEmpty( $lock_post_methods );

		// Check POST method for unlock
		$unlock_route = $routes['/elementor/v1/components/unlock'];
		$unlock_post_methods = array_filter( $unlock_route, fn( $route ) => in_array( 'POST', $route['methods'] ) );
		$this->assertNotEmpty( $unlock_post_methods );

		// Check GET method for overridable-props
		$get_overridable_route = $routes['/elementor/v1/components/overridable-props'];
		$get_overridable_methods = array_filter( $get_overridable_route, fn( $route ) => in_array( 'GET', $route['methods'] ) );
		$this->assertNotEmpty( $get_overridable_methods );

		// Check POST method for validate
		$validate_route = $routes['/elementor/v1/components/create-validate'];
		$validate_post_methods = array_filter( $validate_route, fn( $route ) => in_array( 'POST', $route['methods'] ) );
		$this->assertNotEmpty( $validate_post_methods );
	}

	public function authentication_test_data_provider() {
		return [
			'GET components' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components',
			],
			'GET styles' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/styles',
			],
			'GET lock-status' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/lock-status',
				'params' => [ 'componentId' => '123' ],
			],
			'POST lock' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/lock',
				'params' => [ 'componentId' => 123 ],
			],
			'POST unlock' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/unlock',
				'params' => [ 'componentId' => 123 ],
			],
			'GET overridable-props' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/overridable-props',
				'params' => [ 'componentId' => 123 ],
			],
			'POST validate' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/create-validate',
				'params' => [
					'items' => [
						[
							'uid' => 'test-uid',
							'title' => 'Test',
							'elements' => [],
						],
					],
				],
			],
		];
	}

	/**
	 * @dataProvider authentication_test_data_provider
	 */
	public function test_endpoints__fail_when_unauthenticated( $method, $endpoint, $params = [] ) {
		// Act - no authentication
		$request = new \WP_REST_Request( $method, $endpoint );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 401, $response->get_status() );
	}

	public function permission_test_data_provider() {
		return [
			'GET lock-status' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/lock-status',
				'params' => [ 'componentId' => '123' ],
			],
			'POST lock' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/lock',
				'params' => [ 'componentId' => 123 ],
			],
			'POST unlock' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/unlock',
				'params' => [ 'componentId' => 123 ],
			],
			'GET overridable-props' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/overridable-props',
				'params' => [ 'componentId' => 123 ],
			],
		];
	}

	/**
	 * @dataProvider permission_test_data_provider
	 */
	public function test_endpoints__fail_when_insufficient_permissions( $method, $endpoint, $params = [] ) {
		// Arrange - create a user without edit_posts capability
		$user_id = wp_create_user( 'testuser', 'password', 'test@example.com' );
		$user = new \WP_User( $user_id );
		$user->remove_cap( 'edit_posts' );
		wp_set_current_user( $user_id );

		// Act
		$request = new \WP_REST_Request( $method, $endpoint );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function parameter_validation_test_data_provider() {
		return [
			'GET lock-status missing componentId' => [
				'method' => 'GET',
				'endpoint' => '/elementor/v1/components/lock-status',
				'params' => [],
				'expected_status' => 400,
				'expected_code' => 'rest_missing_callback_param',
			],
			'POST lock missing componentId' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/lock',
				'params' => [],
				'expected_status' => 400,
				'expected_code' => 'rest_missing_callback_param',
			],
			'POST unlock missing componentId' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/unlock',
				'params' => [],
				'expected_status' => 400,
				'expected_code' => 'rest_missing_callback_param',
			],
			'POST lock invalid componentId type' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/lock',
				'params' => [ 'componentId' => 'not-a-number' ],
				'expected_status' => 400,
				'expected_code' => 'rest_invalid_param',
			],
			'POST unlock invalid componentId type' => [
				'method' => 'POST',
				'endpoint' => '/elementor/v1/components/unlock',
				'params' => [ 'componentId' => 'not-a-number' ],
				'expected_status' => 400,
				'expected_code' => 'rest_invalid_param',
			],
		];
	}

	/**
	 * @dataProvider parameter_validation_test_data_provider
	 */
	public function test_endpoints__fail_when_parameters_invalid( $method, $endpoint, $params, $expected_status, $expected_code ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( $method, $endpoint );
		foreach ( $params as $key => $value ) {
			$request->set_param( $key, $value );
		}
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( $expected_status, $response->get_status() );
		$this->assertEquals( $expected_code, $response->get_data()['code'] );
	}

	// Lock functionality tests
	public function test_get_lock_status__returns_unlocked_when_not_locked() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/lock-status' );
		$request->set_param( 'componentId', (string) $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertTrue( $data['is_current_user_allow_to_edit'], 'User should be allowed to edit unlocked component' );
		$this->assertEquals( '', $data['locked_by'], 'Component should not be locked' );
	}

	public function test_get_lock_status__returns_locked_when_locked_by_other_user() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );

		// Lock component with first user
		$lock_manager = \Elementor\Modules\Components\Component_Lock_Manager::get_instance();
		$lock_manager->lock( $component_id );

		// Switch to different user
		$admin_user_2 = $this->factory()->create_and_get_administrator_user()->ID;
		wp_set_current_user( $admin_user_2 );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/lock-status' );
		$request->set_param( 'componentId', (string) $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertFalse( $data['is_current_user_allow_to_edit'], 'User should not be allowed to edit component locked by another user' );
		$this->assertNotNull( $data['locked_by'], 'Should show who locked the component' );
	}

	public function test_get_lock_status__returns_allowed_when_locked_by_current_user() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );

		// Lock component with current user
		$lock_manager = \Elementor\Modules\Components\Component_Lock_Manager::get_instance();
		$lock_manager->lock( $component_id );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/lock-status' );
		$request->set_param( 'componentId', (string) $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertTrue( $data['is_current_user_allow_to_edit'], 'User should be allowed to edit component they locked' );
		$this->assertNotNull( $data['locked_by'], 'Should show who locked the component' );
	}

	// Lock endpoint tests
	public function test_post_lock_component__successfully_locks_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/lock' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertTrue( $data['locked'], 'Component should be locked' );

		// Verify component is actually locked
		$lock_manager = \Elementor\Modules\Components\Component_Lock_Manager::get_instance();
		$lock_data = $lock_manager->get_lock_data( $component_id );
		$this->assertNotNull( $lock_data['locked_by'], 'Component should be locked by current user' );
		$this->assertEquals( get_current_user_id(), $lock_data['locked_by'], 'Component should be locked by current user' );
	}




	// Unlock endpoint tests
	public function test_post_unlock_component__successfully_unlocks_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Test Component', $this->mock_component_1_content );

		// Lock component first
		$lock_manager = \Elementor\Modules\Components\Component_Lock_Manager::get_instance();
		$lock_manager->lock( $component_id );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/unlock' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertTrue( $data['unlocked'], 'Component should be unlocked' );

		// Verify component is actually unlocked
		$lock_manager = \Elementor\Modules\Components\Component_Lock_Manager::get_instance();
		$lock_data = $lock_manager->get_lock_data( $component_id );
		$this->assertNull( $lock_data['locked_by'], 'Component should be unlocked' );
	}

	public function test_update_statuses() {
		$this->act_as_admin();

		$draft_id = $this->create_test_component( 'Draft Component', [], 'draft' );
		$draft_id_2 = $this->create_test_component( 'Draft 2 Component', [], 'draft' );
		$publish_id = $this->create_test_component( 'Publish Component', [] );

		$page_id = Plugin::$instance->documents->create(
			'wp-page',
			[ 'post_title' => 'Page', 'post_status' => 'draft' ]
		)->get_main_id();

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $draft_id, $draft_id_2, $publish_id, $page_id ] );
		$request->set_param( 'status', 'publish' );

		$response = rest_do_request( $request );

		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $draft_id, $draft_id_2, $publish_id ], $response->get_data()['data']['success'] );
		$this->assertEquals( [ $page_id ], $response->get_data()['data']['failed'], 'Non-component documents should be in failed array' );

		foreach ( [ $draft_id, $draft_id_2, $publish_id ] as $id ) {
			$doc = Plugin::$instance->documents->get( $id );

			$this->assertEquals( 'publish', $doc->get_post()->post_status );
		}

		$page = Plugin::$instance->documents->get( $page_id );

		$this->assertEquals( 'draft', $page->get_post()->post_status );
	}

	public function test_update_statuses__only_admins_can_update_statuses() {
		$this->act_as_editor();

		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'status', 'publish' );
		$request->set_param( 'ids', [] );

		$response = rest_do_request( $request );

		$this->assertEquals( 403, $response->get_status() );
		$this->assertEquals( 'rest_forbidden', $response->get_data()['code'] );
	}

	public function test_get_overridable_props__returns_props_for_existing_component() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component With Overrides', $this->mock_component_1_content );

		$mocks = new Component_Overrides_Mocks();
		$overridable_props = $mocks->get_mock_component_overridable_props();

		update_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, json_encode( $overridable_props ) );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertEquals( $overridable_props, $data );
	}

	public function test_get_overridable_props__returns_null_when_no_overridable_props() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component Without Overrides', $this->mock_component_1_content );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertNull( $response->get_data()['data'] );
	}

	public function test_get_overridable_props__fails_without_component_id() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 400, $response->get_status() );
		$this->assertEquals( 'rest_missing_callback_param', $response->get_data()['code'] );
	}

	public function test_get_overridable_props__fails_for_non_existing_component() {
		// Arrange
		$this->act_as_admin();
		$non_existing_component_id = 999999;

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $non_existing_component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 404, $response->get_status() );
		$this->assertEquals( 'component_not_found', $response->get_data()['code'] );
	}

	public function test_get_overridable_props__succeeds_for_editor() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component For Editor', $this->mock_component_1_content );

		$mocks = new Component_Overrides_Mocks();
		$overridable_props = $mocks->get_mock_component_overridable_props();
		update_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, json_encode( $overridable_props ) );

		$this->act_as_editor();

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$data = $response->get_data()['data'];
		$this->assertEquals( $overridable_props, $data );
	}

	public function test_post_validate_components__passes_with_valid_data() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Valid Test Component',
					'elements' => $this->mock_component_1_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status(), 'Response body: ' . json_encode( $response->get_data() ) );
	}

	public function test_post_validate_components__passes_with_valid_overridable_props() {
		// Arrange
		$this->act_as_admin();
		
		// Use simplified valid overridable props structure
		$overridable_props = [
			'props' => [],
			'groups' => [
				'items' => [],
				'order' => [],
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Component With Overrides',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
	}

	public function test_post_validate_components__fails_when_unauthorized() {
		// Arrange
		$this->act_as_editor();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Test Component',
					'elements' => $this->mock_component_1_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 403, $response->get_status() );
	}

	public function test_post_validate_components__fails_when_title_is_duplicated() {
		// Arrange
		$this->create_test_component( 'Duplicate Title', $this->mock_component_1_content );
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Duplicate Title',
					'elements' => $this->mock_component_1_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status() );
		$this->assertEquals( 'components_validation_failed', $response->get_data()['code'] );
		$this->assertStringContainsString( 'Duplicate Title', $response->get_data()['message'] );
		$this->assertStringContainsString( 'is duplicated', $response->get_data()['message'] );
	}

	public function test_post_validate_components__fails_when_uid_is_duplicated() {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'duplicate-uid',
					'title' => 'First Component',
					'elements' => $this->mock_component_1_content,
				],
				[
					'uid' => 'duplicate-uid',
					'title' => 'Second Component',
					'elements' => $this->mock_component_2_content,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status() );
		$this->assertEquals( 'components_validation_failed', $response->get_data()['code'] );
		$this->assertStringContainsString( 'duplicate-uid', $response->get_data()['message'] );
		$this->assertStringContainsString( 'is duplicated', $response->get_data()['message'] );
	}

	public function post_validate_components_fails_data_provider() {
		return [
			'Missing title' => [
				'input' => [
					'items' => [
						[
							'uid' => 'test-uid',
							'elements' => Component_Mocks::get_component_1_data(),
						],
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
				],
			],
			'Title too short' => [
				'input' => [
					'items' => [
						[
							'uid' => 'test-uid',
							'title' => 'A',
							'elements' => Component_Mocks::get_component_1_data(),
						],
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
				],
			],
			'Title too long' => [
				'input' => [
					'items' => [
						[
							'uid' => 'test-uid',
							'title' => str_repeat( 'A', 201 ),
							'elements' => Component_Mocks::get_component_1_data(),
						],
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
				],
			],
			'Missing elements' => [
				'input' => [
					'items' => [
						[
							'uid' => 'test-uid',
							'title' => 'Test Component',
						],
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
				],
			],
			'Missing UID' => [
				'input' => [
					'items' => [
						[
							'title' => 'Test Component',
							'elements' => Component_Mocks::get_component_1_data(),
						],
					],
				],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_invalid_param',
				],
			],
			'Missing items' => [
				'input' => [],
				'expected' => [
					'status_code' => 400,
					'code' => 'rest_missing_callback_param',
				],
			],
		];
	}

	/**
	 * @dataProvider post_validate_components_fails_data_provider
	 */
	public function test_post_validate_components__fails_with_invalid_data( $input, $expected ) {
		// Arrange
		$this->act_as_admin();

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( $input );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( $expected['status_code'], $response->get_status() );
		$this->assertEquals( $expected['code'], $response->get_data()['code'] );
	}

	public function test_post_validate_components__fails_with_invalid_overridable_props() {
		// Arrange
		$this->act_as_admin();
		
		// Missing required 'groups' field will cause validation to fail
		$invalid_overridable_props = [
			'props' => [
				'prop-1' => [
					'overrideKey' => 'prop-1',
					'label' => 'Invalid Prop',
					'elementId' => 'element-123',
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
					'originValue' => [
						'$$type' => 'string',
						'value' => 'test',
					],
					'groupId' => 'group-1',
				],
			],
			// Missing 'groups' field - will cause validation error
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$request->set_body_params( [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Component With Invalid Overrides',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $invalid_overridable_props,
					],
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status(), 'Response body: ' . json_encode( $response->get_data() ) );
		$this->assertStringContainsString( 'validation', strtolower( $response->get_data()['code'] ) );
	}

	public function test_post_validate_components__validates_same_as_create() {
		// Arrange
		$this->act_as_admin();
		
		// Use simplified valid overridable props structure
		$overridable_props = [
			'props' => [],
			'groups' => [
				'items' => [],
				'order' => [],
			],
		];

		$valid_data = [
			'items' => [
				[
					'uid' => 'test-uid-1',
					'title' => 'Test Component For Validation',
					'elements' => $this->mock_component_1_content,
					'settings' => [
						'overridable_props' => $overridable_props,
					],
				],
			],
		];

		// Act - Validate endpoint
		$validate_request = new \WP_REST_Request( 'POST', '/elementor/v1/components/create-validate' );
		$validate_request->set_body_params( $valid_data );
		$validate_response = rest_do_request( $validate_request );

		// Act - Create endpoint
		$create_request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$create_request->set_body_params( array_merge( $valid_data, [ 'status' => 'draft' ] ) );
		$create_response = rest_do_request( $create_request );

		// Assert - Both should succeed
		$this->assertEquals( 200, $validate_response->get_status(), 'Validate endpoint should return 200. Response: ' . json_encode( $validate_response->get_data() ) );
		$this->assertEquals( 201, $create_response->get_status(), 'Create endpoint should return 201. Response: ' . json_encode( $create_response->get_data() ) );
	}

	public function test_post_create_component__returns_validation_error_for_nested_element_with_invalid_settings() {
		// Arrange
		$this->act_as_admin();

		$component_with_invalid_nested_element = [
			[
				'id' => 'wrapper-element-id',
				'elType' => 'e-div-block',
				'settings' => [],
				'elements' => [
					[
						'id' => 'nested-button-id',
						'elType' => 'widget',
						'widgetType' => 'e-button',
						'settings' => [
							'text' => [
								'$$type' => 'html',
								'value' => 'Button Text',
							],
							'link' => [
								'$$type' => 'link',
								'value' => 'invalid-link-structure-should-be-object',
							],
						],
						'elements' => [],
						'styles' => [],
						'editor_settings' => [],
						'version' => '0.0',
					],
				],
				'isInner' => false,
				'styles' => [],
				'editor_settings' => [],
				'version' => '0.0',
			],
		];

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components' );
		$request->set_body_params( [
			'status' => 'publish',
			'items' => [
				[
					'uid' => 'test-uid-nested-invalid',
					'title' => 'Component With Invalid Nested Element',
					'elements' => $component_with_invalid_nested_element,
				],
			],
		] );

		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 422, $response->get_status(), 'Response: ' . json_encode( $response->get_data() ) );
		$this->assertEquals( 'settings_validation_failed', $response->get_data()['code'] );
		$this->assertStringContainsString( 'test-uid-nested-invalid', $response->get_data()['message'] );
	}

	public function test_get_overridable_props__returns_autosave_version_when_exists() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component With Autosave', $this->mock_component_1_content );

		$mocks = new Component_Overrides_Mocks();
		$published_props = [ 'props' => [], 'groups' => [ 'items' => [], 'order' => [] ] ];
		$autosave_props = $mocks->get_mock_component_overridable_props();

		update_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, json_encode( $published_props ) );

		$document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $document->get_autosave( get_current_user_id(), true );
		$autosave_id = $autosave->get_post()->ID;

		// Workaround - set autosave timestamp to future so it's detected as newer than published (required for autosave detection).
		global $wpdb;
		$future_time = gmdate( 'Y-m-d H:i:s', strtotime( '+1 day' ) );
		$wpdb->update( $wpdb->posts, [ 'post_modified_gmt' => $future_time ], [ 'ID' => $autosave_id ] );

		update_metadata( 'post', $autosave_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, json_encode( $autosave_props ) );

		// Act
		$request = new \WP_REST_Request( 'GET', '/elementor/v1/components/overridable-props' );
		$request->set_param( 'componentId', $component_id );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$data = $response->get_data()['data'];
		$this->assertEquals( $autosave_props, $data );
	}

	// =====================================================
	// Tests for draft/autosave vs published handling
	// =====================================================

	public function test_update_statuses__preserves_overridable_props_from_autosave() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component With Props', $this->mock_component_1_content );

		$mocks = new Component_Overrides_Mocks();
		$published_props = [ 'props' => [], 'groups' => [ 'items' => [], 'order' => [] ] ];
		$autosave_props = $mocks->get_mock_component_overridable_props();

		update_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, wp_json_encode( $published_props ) );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $document->get_autosave( get_current_user_id(), true );
		$autosave_id = $autosave->get_post()->ID;

		update_metadata( 'post', $autosave_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, wp_json_encode( $autosave_props ) );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['success'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$saved_props = $main_document->get_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY );

		$this->assertEquals( $autosave_props, $saved_props, 'Published component should have overridable props from autosave' );
	}

	public function test_update_statuses__preserves_title_from_autosave() {
		// Arrange
		$this->act_as_admin();
		$original_title = 'Original Title';
		$autosave_title = 'Updated Title From Autosave';
		$component_id = $this->create_test_component( $original_title, $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $document->get_autosave( get_current_user_id(), true );
		$autosave_id = $autosave->get_post()->ID;

		wp_update_post( [ 'ID' => $autosave_id, 'post_title' => $autosave_title ] );
		$autosave->refresh_post();

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( $autosave_title, $main_document->get_post()->post_title, 'Published component should have title from autosave' );
	}

	public function test_update_statuses__preserves_elements_from_autosave() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component', $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $document->get_autosave( get_current_user_id(), true );

		$autosave_elements = $this->mock_component_2_content;
		$autosave->save( [ 'elements' => $autosave_elements ] );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$saved_elements = $main_document->get_elements_data();

		$this->assertEquals( $autosave_elements, $saved_elements, 'Published component should have elements from autosave' );
	}

	public function test_update_statuses__publishes_main_document_when_no_autosave() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Draft Component', $this->mock_component_1_content, 'draft' );

		$mocks = new Component_Overrides_Mocks();
		$main_props = $mocks->get_mock_component_overridable_props();
		update_post_meta( $component_id, Component_Document::OVERRIDABLE_PROPS_META_KEY, wp_json_encode( $main_props ) );

		// Act
		$request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$request->set_param( 'ids', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['success'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( 'publish', $main_document->get_post()->post_status );
		$this->assertEquals( $main_props, $main_document->get_json_meta( Component_Document::OVERRIDABLE_PROPS_META_KEY ) );
	}

	// ============================
	// Tests for archive endpoint
	// ============================

	public function test_archive__with_publish_status_updates_main_document() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component To Archive', $this->mock_component_1_content );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/archive' );
		$request->set_param( 'componentIds', [ $component_id ] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['successIds'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		/** @var Component_Document $main_document */
		$this->assertTrue( $main_document->get_is_archived(), 'Main document should be archived' );
	}

	public function test_archive__with_autosave_status_and_no_existing_autosave_creates_autosave_and_updates_it_to_be_archived() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component To Archive', $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/archive' );
		$request->set_param( 'componentIds', [ $component_id ] );
		$request->set_param( 'status', 'autosave' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['successIds'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		/** @var Component_Document $main_document */
		$this->assertFalse( $main_document->get_is_archived(), 'Main document should NOT be archived' );

		$autosave = $main_document->get_autosave( get_current_user_id() );
		/** @var Component_Document $autosave */
		$this->assertNotFalse( $autosave, 'Autosave should exist' );
		$this->assertTrue( $autosave->get_is_archived(), 'Autosave should be archived' );
	}

	public function test_archive__with_autosave_status_updating_existing_autosave() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component To Archive', $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$existing_autosave = $main_document->get_autosave( get_current_user_id(), true );
		$existing_autosave_id = $existing_autosave->get_post()->ID;

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/archive' );
		$request->set_param( 'componentIds', [ $component_id ] );
		$request->set_param( 'status', 'autosave' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		/** @var Component_Document $main_document */
		$this->assertFalse( $main_document->get_is_archived(), 'Main document should NOT be archived' );

		$autosave = $main_document->get_autosave( get_current_user_id() );
		$this->assertNotFalse( $autosave, 'Autosave should exist' );
		$this->assertEquals( $existing_autosave_id, $autosave->get_post()->ID, 'Should use existing autosave' );
		/** @var Component_Document $autosave */
		$this->assertTrue( $autosave->get_is_archived(), 'Autosave should be archived' );
	}

	// =================================
	// Tests for update-titles endpoint
	// =================================
	public function test_update_titles__with_publish_status_updates_main_document() {
		// Arrange
		$this->act_as_admin();
		$original_title = 'Original Title';
		$new_title = 'New Title';
		$component_id = $this->create_test_component( $original_title, $this->mock_component_1_content );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/update-titles' );
		$request->set_param( 'components', [
			[ 'componentId' => $component_id, 'title' => $new_title ],
		] );
		$request->set_param( 'status', 'publish' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['successIds'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( $new_title, $main_document->get_post()->post_title, 'Main document title should be updated' );
	}

	public function test_update_titles__with_autosave_status_and_no_existing_autosave_creates_autosave_and_updates_it() {
		// Arrange
		$this->act_as_admin();
		$original_title = 'Original Title';
		$new_title = 'New Title In Autosave';
		$component_id = $this->create_test_component( $original_title, $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/update-titles' );
		$request->set_param( 'components', [
			[ 'componentId' => $component_id, 'title' => $new_title ],
		] );
		$request->set_param( 'status', 'autosave' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );
		$this->assertEquals( [ $component_id ], $response->get_data()['data']['successIds'] );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( $original_title, $main_document->get_post()->post_title, 'Main document title should NOT be changed' );

		$autosave = $main_document->get_autosave( get_current_user_id() );
		$this->assertNotFalse( $autosave, 'Autosave should exist' );
		$this->assertEquals( $new_title, $autosave->get_post()->post_title, 'Autosave title should be updated' );
	}

	public function test_update_titles__with_autosave_status_updates_existing_autosave() {
		// Arrange
		$this->act_as_admin();
		$original_title = 'Original Title';
		$new_title = 'New Title In Autosave';
		$component_id = $this->create_test_component( $original_title, $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$existing_autosave = $main_document->get_autosave( get_current_user_id(), true );
		$existing_autosave_id = $existing_autosave->get_post()->ID;

		// Act
		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/update-titles' );
		$request->set_param( 'components', [
			[ 'componentId' => $component_id, 'title' => $new_title ],
		] );
		$request->set_param( 'status', 'autosave' );
		$response = rest_do_request( $request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( $original_title, $main_document->get_post()->post_title, 'Main document title should NOT be changed' );

		$autosave = $main_document->get_autosave( get_current_user_id() );
		$this->assertNotFalse( $autosave, 'Autosave should exist' );
		$this->assertEquals( $existing_autosave_id, $autosave->get_post()->ID, 'Should use existing autosave' );
		$this->assertEquals( $new_title, $autosave->get_post()->post_title, 'Autosave title should be updated' );
	}

	public function test_integration_update_titles_and_update_statuses__autosave_title_is_published_on_update_statuses() {
		// Arrange
		$this->act_as_admin();
		$original_title = 'Original Title';
		$autosave_title = 'Title Changed In Autosave';
		$component_id = $this->create_test_component( $original_title, $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/update-titles' );
		$request->set_param( 'components', [
			[ 'componentId' => $component_id, 'title' => $autosave_title ],
		] );
		$request->set_param( 'status', 'autosave' );
		$update_response = rest_do_request( $request );
		$this->assertEquals( 200, $update_response->get_status(), 'Update titles request should succeed' );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $main_document->get_autosave( get_current_user_id() );
		$this->assertNotFalse( $autosave, 'Autosave should have been created by update-titles request' );

		// Act
		$publish_request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$publish_request->set_param( 'ids', [ $component_id ] );
		$publish_request->set_param( 'status', 'publish' );
		$response = rest_do_request( $publish_request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$this->assertEquals( $autosave_title, $main_document->get_post()->post_title, 'Published component should have title from autosave' );
	}

	public function test_integration_archive_and_update_statuses__autosave_is_published_on_update_statuses() {
		// Arrange
		$this->act_as_admin();
		$component_id = $this->create_test_component( 'Component', $this->mock_component_1_content );

		$this->set_main_doc_as_older_than_autosave( $component_id );

		$request = new \WP_REST_Request( 'POST', '/elementor/v1/components/archive' );
		$request->set_param( 'componentIds', [ $component_id ] );
		$request->set_param( 'status', 'autosave' );
		$archive_response = rest_do_request( $request );
		$this->assertEquals( 200, $archive_response->get_status(), 'Archive request should succeed' );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		$autosave = $main_document->get_autosave( get_current_user_id() );
		$this->assertNotFalse( $autosave, 'Autosave should have been created by archive request' );

		// Act
		$publish_request = new \WP_REST_Request( 'PUT', '/elementor/v1/components/status' );
		$publish_request->set_param( 'ids', [ $component_id ] );
		$publish_request->set_param( 'status', 'publish' );
		$response = rest_do_request( $publish_request );

		// Assert
		$this->assertEquals( 200, $response->get_status() );

		$main_document = Plugin::$instance->documents->get( $component_id, false );
		/** @var Component_Document $main_document */
		$this->assertTrue( $main_document->get_is_archived(), 'Published component should be archived' );
	}

	// Helpers
	private function create_test_component( string $name, array $content, string $status = 'publish' ): int {
		$this->act_as_admin();
		$document = Plugin::$instance->documents->create(
			Component_Document::get_type(),
			[
				'post_title' => $name,
				'post_status' => $status,
			]
		);

		$document->save( [
			'elements' => $content,
		] );

		return $document->get_main_id();
	}
	private function assertArrayContainsObjects( array $expected_objects, array $actual_array, string $message = '' ): void {
		foreach ( $expected_objects as $expected_object ) {
			$found = false;
			foreach ( $actual_array as $actual_item ) {
				if ( $this->objectsMatch( $expected_object, $actual_item ) ) {
					$found = true;
					break;
				}
			}
			$this->assertTrue( $found, $message ?: "Expected object not found in array: " . json_encode( $expected_object ) );
		}
	}

	private function objectsMatch( $expected, $actual ): bool {
		// If both are arrays, compare recursively
		if ( is_array( $expected ) && is_array( $actual ) ) {
			return $this->arraysMatch( $expected, $actual );
		}

		// For scalar values, use strict comparison
		return $expected === $actual;
	}
	private function arraysMatch( array $expected, array $actual ): bool {
		// Check if all expected keys exist and values match
		foreach ( $expected as $key => $expected_value ) {
			if ( ! array_key_exists( $key, $actual ) ) {
				return false;
			}

			if ( ! $this->objectsMatch( $expected_value, $actual[$key] ) ) {
				return false;
			}
		}

		return true;
	}

	private function set_main_doc_as_older_than_autosave( int $main_doc_id ): void {
		global $wpdb;
		$past_time = gmdate( 'Y-m-d H:i:s', strtotime( '-1 day' ) );
		$wpdb->update( $wpdb->posts, [ 'post_modified_gmt' => $past_time ], [ 'ID' => $main_doc_id ] );
		clean_post_cache( $main_doc_id );
	}
}
