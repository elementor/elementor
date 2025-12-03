<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\OverridableProps\Component_Overridable_Props_Parser;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Component_Overridable_Props_Parser extends Elementor_Test_Base {

	private Component_Overridable_Props_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = Component_Overridable_Props_Parser::make();
	}

	public function test_parse__with_valid_data__succeeds() {
		// Arrange.
		$valid_data = [
			'props' => [
				'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [] ),
			],
			'groups' => $this->get_mock_groups(),
		];

		// Act.
		$result = $this->parser->parse( $valid_data );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_parse__with_empty_data__succeeds() {
		// Arrange.
		$empty_data = [ 'props' => [], 'groups' => [] ];

		// Act.
		$result = $this->parser->parse( $empty_data );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_parser__sanitizes_strings() {
		// Arrange.
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
						'$$type' => 'html',
						'value' => '<strong>Original text</strong><script>alert("xss")</script>',
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

		// Act.
		$result = $this->parser->parse( $data_to_sanitize );

		// Assert.
		$this->assertTrue( $result->is_valid() );

		$sanitized = $result->unwrap();
		$this->assertEquals( 'User Name', $sanitized['props']['prop-uuid-1']['label'] );
		$this->assertEquals( '<strong>Original text</strong>alert("xss")', $sanitized['props']['prop-uuid-1']['originalValue']['value'] );
		$this->assertEquals( 'User Info', $sanitized['groups']['items']['group-uuid-1']['label'] );
	}

	/**
	 * @dataProvider invalid_overridable_props_data_provider
	 */
	public function test_parse__fails_for_invalid_data( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( $data );

		// Assert.
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
	public function test_parse__fails_for_invalid_single_prop( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( [
			'props' => [ 'prop-uuid-1' => $data ],
			'groups' => $this->get_mock_groups(),
		] );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_single_prop_data_provider() {
		return [
			'non-array prop' => [ 
				'data' => 'not-an-array',
				'expected_error' => 'props.prop-uuid-1: invalid_structure',
			],
			'missing_field' => [
				'data' => $this->get_mock_prop_with_changed_fields( [ 'overrideKey' => null ] ),
				'expected_error' => 'props.prop-uuid-1.overrideKey: missing_field',
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
	}

	/**
	 * @dataProvider invalid_props_data_provider
	 */
	public function test_parse__fails_for_invalid_props( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( [
			'props' => $data,
			'groups' => $this->get_mock_groups(),
		] );

		// Assert.
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
	public function test_parse__fails_for_invalid_groups( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( [
			'props' => $this->get_mock_props(),
			'groups' => $data,
		] );

		// Assert.
		$this->assertFalse( $result->is_valid() );
		$this->assertEquals( $expected_error, $result->errors()->to_string() );
	}

	public function invalid_groups_data_provider() {
		return [
			// Single group
			'single group missing field' => [ 
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
	public function test_parse__fails_for_mismatching_props_and_groups( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( $data );

		// Assert.
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
					],
					'groups' => [
						'items' => [
							'group-uuid-1' => [ 
								'id' => 'group-uuid-1',
								'label' => 'User Info',
								'props' => []
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
			'originalValue' => [ '$$type' => 'html', 'value' => 'Original text' ],
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
