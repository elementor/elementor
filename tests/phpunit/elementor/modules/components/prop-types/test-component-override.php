<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Override_Parser;
use Elementor\Modules\Components\Documents\Component_Overridable_Props;
use Elementor\Modules\Components\PropTypes\Override_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Override extends Component_Prop_Type_Test_Base {
	public function test_validate__passes_with_valid_override() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			]
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_when_override_key_not_in_component_props() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'non-existent-key',
				'override_value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			]
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_when_override_value_is_null() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'override_value' => null,
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			]
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function invalid_structure_data_provider() {
		return [
			'non-array value' => [ 'not-an-array' ],
			'missing override_key' => [ [
				'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
				'schema_source' => [ 'type' => 'component', 'id' => $this::VALID_COMPONENT_ID ] 
			] ],
			`missing override_value` => [ [ 
				'value' => [ 'override_key' => 'prop-uuid-1' ],
				'schema_source' => [ 'type' => 'component', 'id' => $this::VALID_COMPONENT_ID ] 
			] ],
			'missing schema_source' => [ [ 
				'override_key' => 'prop-uuid-1',
				'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ] 
			] ],
			'non-string override_key' => [ [ 
				'value' => [ 
					'override_key' => 123, 
					'value' => [ '$$type' => 'html', 'value' => 'New Title' ] 
				], 
			] ],
			`non-array override_value` => [ [ 
					'override_key' => 'prop-uuid-1',
					'value' => 'not-an-array' 
			] ],
			'non-array schema_source' => [ [ 
				'override_key' => 'prop-uuid-1',
				'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
				'schema_source' => 'not-an-array' 
			] ],
		];
	}

	/**
	 * @dataProvider invalid_structure_data_provider
	 */
	public function test_validate__fail_for_invalid_structure( $value ) {
		// Arrange.
		$component_override = Override_Prop_Type::make();

		// Act.
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => $value,
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_when_value_invalid_against_original_prop_type() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				// number is not a valid html value
				'override_value' => [ '$$type' => 'html', 'value' => 123 ],
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			]
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_prop_value_not_matching_component_overridable_props() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->validate( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				// prop-uuid-1 should be an html
				'override_value' => [ '$$type' => 'number', 'value' => 123 ],
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			]
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_valid_override() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		[
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		] = $this->mocks->get_mock_image_image_component_override_to_sanitize();

		// Act
		$result = $component_override->sanitize( [
				'$$type' => 'override',
				'value' => $before_sanitization,
			]
		);

		// Assert
		$this->assertEquals( [
			'$$type' => 'override',
			'value' => $expected_after_sanitization,
		], $result );
	}

	public function test_sanitize__returns_null_when_override_key_not_in_component_props() {
		// Arrange
		$component_override = Override_Prop_Type::make();

		// Act
		$result = $component_override->sanitize( [
			'$$type' => 'override',
			'value' => [
				'override_key' => 'non-existent-key',
				'override_value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
				'schema_source' => ['type' => 'component', 'id' => $this::VALID_COMPONENT_ID ],
			],
		] );

		// Assert
		$this->assertEquals( [ '$$type' => 'override', 'value' => null ], $result );
	}
}
