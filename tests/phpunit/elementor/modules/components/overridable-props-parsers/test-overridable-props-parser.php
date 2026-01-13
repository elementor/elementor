<?php
namespace Elementor\Testing\Modules\Components;

use Elementor\Modules\Components\OverridableProps\Overridable_Props_Parser;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Overridable_Props_Parser extends Elementor_Test_Base {

	private Overridable_Props_Parser $parser;

	public function setUp(): void {
		parent::setUp();

		$this->parser = Overridable_Props_Parser::make();
	}

	public function test_parse__with_valid_data__succeeds() {
		// Arrange.
		$valid_data = [
			'prop-uuid-1' => [
				'overrideKey' => 'prop-uuid-1',
				'label' => 'User Name',
				'elementId' => 'element-123',
				'propKey' => 'title',
				'widgetType' => 'e-heading',
				'elType' => 'widget',
				'originValue' => [ '$$type' => 'html', 'value' => 'Original text' ],
				'groupId' => 'group-uuid-1',
			]
		];

		// Act.
		$result = $this->parser->parse( $valid_data );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_parse__with_origin_prop_fields__succeeds() {
		// Arrange.
		$valid_data = [
			'prop-uuid-1' => [
				'overrideKey' => 'prop-uuid-1',
				'label' => 'User Name',
				'elementId' => 'element-123',
				'propKey' => 'override',
				'widgetType' => 'e-component',
				'elType' => 'widget',
				'originValue' => [ '$$type' => 'html', 'value' => 'Original text' ],
				'groupId' => 'group-uuid-1',
				'originPropFields' => [
					'elType' => 'widget',
					'widgetType' => 'e-heading',
					'propKey' => 'title',
				],
			]
		];

		// Act.
		$result = $this->parser->parse( $valid_data );

		// Assert.
		$this->assertTrue( $result->is_valid() );
	}

	public function test_parser__sanitizes_strings() {
		// Arrange.
		$data_to_sanitize = [
			'prop-uuid-1' => [
				'overrideKey' => 'prop-uuid-1',
				'label' => '<script>alert("xss")</script>User Name',
				'elementId' => 'element-123',
				'propKey' => 'title',
				'widgetType' => 'e-heading',
				'elType' => 'widget',
				'originValue' => [
					'$$type' => 'html',
					'value' => '<strong>Original text</strong><script>alert("xss")</script>',
				],
				'groupId' => 'group-uuid-1',
			],
		];

		// Act.
		$result = $this->parser->parse( $data_to_sanitize );

		// Assert.
		$this->assertTrue( $result->is_valid() );

		$sanitized = $result->unwrap();
		$this->assertEquals( 'User Name', $sanitized['prop-uuid-1']['label'] );
		$this->assertEquals( '<strong>Original text</strong>alert("xss")', $sanitized['prop-uuid-1']['originValue']['value'] );
	}

	public function test_parser__sanitizes_origin_value_by_origin_prop_fields() {
		// Arrange.
		$data_to_sanitize = [
			'prop-uuid-1' => [
				'overrideKey' => 'prop-uuid-1',
				'label' => 'User Name',
				'elementId' => 'element-123',
				'propKey' => 'override',
				'widgetType' => 'e-component',
				'elType' => 'widget',
				'originValue' => [ '$$type' => 'string', 'value' => '<script>alert("xss")</script>Click here' ],
				'originPropFields' => [
					'elType' => 'widget',
					'widgetType' => 'e-button',
					'propKey' => 'text',
				],
				'groupId' => 'group-uuid-1',
			],
		];

		// Act.
		$result = $this->parser->parse( $data_to_sanitize );

		// Assert.
		$sanitized = $result->unwrap();
		$this->assertEquals( [ '$$type' => 'string', 'value' => 'Click here' ], $sanitized['prop-uuid-1']['originValue'] );
	}

	/**
	 * @dataProvider invalid_single_prop_data_provider
	 */
	public function test_parse__fails_for_invalid_single_prop( $data, $expected_error ) {
		// Arrange & Act.
		$result = $this->parser->parse( [ 'prop-uuid-1' => $data ] );

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
			'invalid_origin_value' => [ 
				'data' => $this->get_mock_prop_with_changed_fields( [ 'originValue' => "not a valid prop value" ] ),
				'expected_error' => 'props.prop-uuid-1.originValue: invalid',
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
		$result = $this->parser->parse( $data );

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

	private function get_mock_prop_with_changed_fields( array $fields ) {
		$prop = [
			'overrideKey' => 'prop-uuid-1',
			'label' => 'User Name',
			'elementId' => 'element-123',
			'propKey' => 'title',
			'widgetType' => 'e-heading',
			'elType' => 'widget',
			'originValue' => [ '$$type' => 'html', 'value' => 'Original text' ],
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
}
