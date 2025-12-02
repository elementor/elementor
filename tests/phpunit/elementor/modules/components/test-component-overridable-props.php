<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\Documents\Component as Component_Document;
use Elementor\Modules\Components\Documents\Component_Overridable_Props_Parser;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Overridable_Props extends Elementor_Test_Base {
	private $test_component_id;

	public function setUp(): void {
		parent::setUp();

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

		$this->test_component_id = $this->create_test_component();
	}

	public function tearDown(): void {
		parent::tearDown();
		$this->clean_up_component();
	}

	private function create_test_component(): int {
		$post_id = wp_insert_post( [
			'post_type' => Component_Document::TYPE,
			'post_title' => 'Test Component',
			'post_status' => 'publish',
		] );

		return $post_id;
	}

	private function clean_up_component() {
		if ( $this->test_component_id && get_post( $this->test_component_id ) ) {
			wp_delete_post( $this->test_component_id, true );
		}
	}

	public function test_set_overridable_props__with_valid_data__succeeds() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$valid_data = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => 'User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elType' => 'widget',
					'originalValue' => [
						'$$type' => 'string',
						'value' => 'Original text',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => 'User Info',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $valid_data );

		$this->assertTrue( $result->is_valid() );
	}

	public function test_set_overridable_props__with_empty_data__succeeds() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$empty_data = [
			'props' => [],
			'groups' => [],
		];

		$result = $component->set_overridable_props( $empty_data );

		$this->assertTrue( $result->is_valid() );
	}

	public function test_parser__sanitizes_strings() {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$data_to_sanitize = [
			'props' => [
				'prop-uuid-1' => [
					'overrideKey' => 'prop-uuid-1',
					'label' => '<script>alert("xss")</script>User Name',
					'elementId' => 'element-123',
					'propKey' => 'title',
					'widgetType' => 'e-heading',
					'elType' => 'widget',
					'originalValue' => [
						'$$type' => 'string',
						'value' => '<strong>Original text</strong>',
					],
					'groupId' => 'group-uuid-1',
				],
			],
			'groups' => [
				'items' => [
					'group-uuid-1' => [
						'id' => 'group-uuid-1',
						'label' => '<b>User Info</b>',
						'props' => [ 'prop-uuid-1' ],
					],
				],
				'order' => [ 'group-uuid-1' ],
			],
		];

		$result = $component->set_overridable_props( $data_to_sanitize );

		$this->assertTrue( $result->is_valid() );

		$sanitized = $result->unwrap();
		$this->assertEquals( 'User Name', $sanitized['props']['prop-uuid-1']['label'] );
		$this->assertEquals( 'Original text', $sanitized['props']['prop-uuid-1']['originalValue']['value'] );
		$this->assertEquals( 'User Info', $sanitized['groups']['items']['group-uuid-1']['label'] );
	}


	/**
	 * @dataProvider invalid_overridable_props_data_provider
	 */
	public function test_set_overridable_props__fails_for_invalid_data( $data, $expected_error ) {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$result = $component->set_overridable_props( $data );

		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_overridable_props_data_provider() {
		return [
			'non-array value' => [ 
				'data' => 'not-an-array',
				'expected_error' => 'component_overridable_props: invalid_structure',
			],
			'missing_props' => [ 
				'data' => [ 'groups' => [] ],
				'expected_error' => 'props: missing',
			],
			'missing_groups' => [ 
				'data' => [ 'props' => [] ],
				'expected_error' => 'groups: missing',
			],
			'non-array props' => [ 
				'data' => [ 'props' => 'not-an-array', 'groups' => [] ],
				'expected_error' => 'props: invalid_structure',
			],
			'non-array groups' => [ 
				'data' => [ 'props' => [], 'groups' => 'not-an-array' ],
				'expected_error' => 'groups: invalid_structure',
			],
			'missing groups items' => [ 
				'data' => [ 'props' => [], 'groups' => [ 'order' => [ 'group-uuid-1' ] ] ],
				'expected_error' => 'groups.items: missing',
			],
			'missing groups order' => [ 
				'data' => [ 'props' => [], 'groups' => [ 'items' => [ 'group-uuid-1' => [ 'id' => 'group-uuid-1', 'label' => 'Test Group Label', 'props' => [ 'prop-uuid-1' ] ] ] ] ],
				'expected_error' => 'groups.order: missing',
			],
			'non-array groups order' => [ 
				'data' => [ 'props' => [], 'groups' => [ 'items' => [], 'order' => 'not-an-array' ] ],
				'expected_error' => 'groups.order: invalid_structure',
			],
			'non-array groups items' => [ 
				'data' => [ 'props' => [], 'groups' => [ 'items' => 'not-an-array', 'order' => [] ] ],
				'expected_error' => 'groups.items: invalid_structure',
			],
		];
	}

	/**
	 * @dataProvider invalid_single_prop_data_provider
	 */
	public function test_set_overridable_props__fails_for_invalid_single_prop( $data, $expected_error ) {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$result = $component->set_overridable_props( [
			'props' => [ 'prop-uuid-1' => $data ],
			'groups' => $this->get_mock_groups(),
		] );

		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_single_prop_data_provider() {
		$cases = [
			'non-array prop' => [ 
				'data' => 'not-an-array',
				'expected_error' => 'props.prop-uuid-1: invalid_structure',
			],
			'invalid_original_value' => [ 
				'data' => $this->get_mock_prop_with_changed_fields( [ 'originalValue' => "not a valid prop value" ] ),
				'expected_error' => 'props.prop-uuid-1.originalValue: invalid',
			],
			'mismatching_override_key' => [ 
				'data' => $this->get_mock_prop_with_changed_fields( [ 'overrideKey' => 'different-uuid' ] ),
				'expected_error' => 'props.prop-uuid-1: mismatching_override_key',
			],
		];

		$required_fields = [
			'overrideKey',
			'label',
			'elementId',
			'propKey',
			'widgetType',
			'elType',
			'originalValue',
			'groupId',
		];

		foreach ( $required_fields as $field ) {
			$cases[ 'missing_' . $field ] = [ 
				'data' => $this->get_mock_prop_with_changed_fields( [ $field => null ] ),
				'expected_error' => 'props.prop-uuid-1.' . $field . ': missing_field',
			];
		}

		return $cases;
	}

	/**
	 * @dataProvider invalid_props_data_provider
	 */
	public function test_set_overridable_props__fails_for_invalid_props( $data, $expected_error ) {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$result = $component->set_overridable_props( [
			'props' => $data,
			'groups' => $this->get_mock_groups(),
		] );

		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_props_data_provider() {
		return [
			'duplicate prop keys for same element' => [ 
				'data' => [
					'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [ 
						'overrideKey' => 'prop-uuid-1',
						'elementId' => 'element-123',
						'propKey' => 'title',
					] ),
					'prop-uuid-2' => $this->get_mock_prop_with_changed_fields( [ 
						'overrideKey' => 'prop-uuid-2',
						'elementId' => 'element-123',
						'propKey' => 'title',
					] ),
				],
				'expected_error' => 'props: duplicate_prop_keys_for_same_element: element-123.title',
			],
		];
	}

	/**
	 * @dataProvider invalid_groups_data_provider
	 */
	public function test_set_overridable_props__fails_for_invalid_groups( $data, $expected_error ) {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$result = $component->set_overridable_props( [
			'props' => $this->get_mock_props(),
			'groups' => $data,
		] );

		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_groups_data_provider() {
		return [
			// Single group
			'single group missing id' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.id: missing',
			],
			'single group missing label' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.label: missing',
			],
			'single group missing props' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.props: missing',
			],
			'single group non-array props' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => 'not-an-array',
						],
					],
					'order' => ['group-uuid-1'],
				],
				'expected_error' => 'groups.items.group-uuid-1.props: invalid_structure',
			],
			// Groups items
			'duplicate group labels' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
						'group-uuid-2' => [
							'id' => 'group-uuid-2',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-2' ],
						],
					],
					'order' => [ 'group-uuid-1', 'group-uuid-2' ],
				],
				'expected_error' => 'groups.items: duplicate_labels: User Info',
			],
			'mismatching group id' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'different-uuid',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => [ 'group-uuid-1' ],
				],
				'expected_error' => 'groups.items.group-uuid-1.id: mismatching_value',
			],
			// Groups order
			'a group is missing in groups order' => [ 
				'data' => [
					'items' => [
						'group-uuid-1' => [
							'id' => 'group-uuid-1',
							'label' => 'User Info',
							'props' => [ 'prop-uuid-1' ],
						],
					],
					'order' => [],
				],
				'expected_error' => 'groups.order.group-uuid-1: missing',
			],
			'a group appears in groups order but not in groups items' => [ 
				'data' => [
					'items' => [],
					'order' => [ 'group-uuid-1' ],
				],
				'expected_error' => 'groups.order.group-uuid-1: excess',
			],
		];
	}

	/**
	 * @dataProvider mismatching_props_and_groups_data_provider
	 */
	public function test_set_overridable_props__fails_for_mismatching_props_and_groups( $data, $expected_error ) {
		$component = Plugin::$instance->documents->get( $this->test_component_id );

		$result = $component->set_overridable_props( $data );

		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	
	public function mismatching_props_and_groups_data_provider() {
		return [
			'a prop is not found in the group it is assigned to' => [ 
				'data' => [
					'props' => [
						'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [
							'groupId' => 'group-uuid-1'
						] ),
						'prop-uuid-2' => $this->get_mock_prop_with_changed_fields( [
							'overrideKey' => 'prop-uuid-2',
							'groupId' => 'group-uuid-1',
							'elementId' => 'element-456',
						] ),
					],
					'groups' => [
						'items' => [
							'group-uuid-1' => [ 
								'id' => 'group-uuid-1',
								'label' => 'User Info',
								'props' => [ 'prop-uuid-1' ]
							],
							'group-uuid-2' => [ 
								'id' => 'group-uuid-2',
								'label' => 'General Info',
								'props' => [ 'prop-uuid-2' ]
							],
						],
						'order' => [ 'group-uuid-1', 'group-uuid-2' ],
					],
				],
				'expected_error' => 'props.prop-uuid-2.groupId: mismatching_value_with_groups.items.props',
			],
			'a prop is assigned to a group that does not exist in groups items' => [ 
				'data' => [
					'props' => [
						'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [
							'groupId' => 'group-uuid-3'
						] ),
					],
					'groups' => [
						'items' => [
							'group-uuid-1' => [ 
								'id' => 'group-uuid-1',
								'label' => 'User Info',
								'props' => [ 'prop-uuid-1' ]
							],
						],
						'order' => [ 'group-uuid-1' ],
					],
				],
				'expected_error' => 'props.prop-uuid-1.groupId: mismatching_value_with_groups.items.props',
			],
			'duplicate prop labels within a group' => [ 
				'data' => [
					'props' => [
						'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [
							'groupId' => 'group-uuid-1',
							'label' => 'Test Label',
						] ),
						'prop-uuid-2' => $this->get_mock_prop_with_changed_fields( [
							'overrideKey' => 'prop-uuid-2',
							'groupId' => 'group-uuid-1',
							'label' => 'Test Label',
							'elementId' => 'element-456',
						] ),
					],
					'groups' => [
						'items' => [
							'group-uuid-1' => [ 
								'id' => 'group-uuid-1',
								'label' => 'Test Group Label',
								'props' => [ 'prop-uuid-1', 'prop-uuid-2' ]
							],
						],
						'order' => [ 'group-uuid-1' ],
					],
				],
				'expected_error' => 'groups.items.group-uuid-1.props: duplicate_labels: Test Label',
			],
		];
	}

	private function get_mock_prop_with_changed_fields( array $fields ) {
		$prop = [
			'overrideKey' => 'prop-uuid-1',
			'label' => 'User Name',
			'elementId' => 'element-123',
			'propKey' => 'title',
			'widgetType' => 'e-heading',
			'elType' => 'widget',
			'originalValue' => [ '$$type' => 'string', 'value' => 'Original text' ],
			'groupId' => 'group-uuid-1' 
		];

		foreach ( $fields as $field => $value ) {
			if ( $value !== null ) {
				$prop[ $field ] = $value;
			} else {
				unset( $prop[ $field ] );
			}
		}

		return $prop;
	}

	private function get_mock_groups() {
		return [
			'items' => [
				'group-uuid-1' => [
					'id' => 'group-uuid-1',
					'label' => 'User Info',
					'props' => [ 'prop-uuid-1' ],
				],
			],
			'order' => [ 'group-uuid-1' ],
		];
	}

	private function get_mock_props() {
		return [
			'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [] ),
			'prop-uuid-2' => $this->get_mock_prop_with_changed_fields( [ 'overrideKey' => 'prop-uuid-2', 'elementId' => 'element-456', ] ),
		];
	}
}

