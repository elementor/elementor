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
				'path' => [ [ 'key' => 'title', '$$type' => 'string' ] ],
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

	public function test_parse__with_nested_path__succeeds() {
		// Arrange.
		$valid_data = [
			'prop-uuid-1' => [
				'overrideKey' => 'prop-uuid-1',
				'label' => 'Image Attachment ID',
				'elementId' => 'element-123',
				'path' => [ ['key' => 'image', '$$type' => 'image'], ['key' => 'src', '$$type' => 'image-src'], ['key' => 'id', '$$type' => 'image-attachment-id'] ],
				'widgetType' => 'e-image',
				'elType' => 'widget',
				'originValue' => [ '$$type' => 'image-attachment-id', 'value' => 1234 ],
				'groupId' => 'group-uuid-1',
			],
			'prop-uuid-2' => [
				'overrideKey' => 'prop-uuid-2',
				'label' => 'Button text override',
				'elementId' => 'element-123',
				'path' => [
					['key' => 'component_instance', '$$type' => 'component-instance'],
					['key' => 'overrides', '$$type' => 'overrides'],
					['key' => '0', '$$type' => 'override'],
				],
				'widgetType' => 'e-component',
				'elType' => 'widget',
				'originValue' => [
					'$$type' => 'override',
					'value' => [
						'override_key' => '0',
						'override_value' => [
							'$$type' => 'string',
							'value' => 'Click here'
						],
						'schema_source' => [
							'type' => 'component',
							'id' => 123,
						],
					]
				],
				'groupId' => 'group-uuid-1',
			],
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
				'path' => [ ['key' => 'title', '$$type' => 'string'] ],
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
			'duplicate prop path for same element' => [ 
				'data' => [
					'prop-uuid-1' => $this->get_mock_prop_with_changed_fields( [ 
						'overrideKey' => 'prop-uuid-1',
						'elementId' => 'element-123',
						'path' => [ ['key' => 'link', '$$type' => 'link'], ['key' => 'isTargetBlank', '$$type' => 'boolean'] ],
						'originValue' => [ '$$type' => 'boolean', 'value' => true ],
					] ),
					'prop-uuid-2' => $this->get_mock_prop_with_changed_fields( [ 
						'overrideKey' => 'prop-uuid-2',
						'elementId' => 'element-123',
						'path' => [ ['key' => 'link', '$$type' => 'link'], ['key' => 'isTargetBlank', '$$type' => 'boolean'] ],
						'originValue' => [ '$$type' => 'boolean', 'value' => false ],
					] ),
				],
				'expected_error' => 'props: duplicate_path_for_same_element: element-123.link.isTargetBlank',
			],
		];
	}

	private function get_mock_prop_with_changed_fields( array $fields ) {
		$prop = [
			'overrideKey' => 'prop-uuid-1',
			'label' => 'User Name',
			'elementId' => 'element-123',
			'path' => [ ['key' => 'title', '$$type' => 'string'] ],
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
