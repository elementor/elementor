<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Override_Prop_type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Override_Prop_Type extends Component_Prop_Type_Test_Base {
	public function test_validate__passes_with_valid_override() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'html', 'value' => 'New Title' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_when_override_key_not_in_component_props() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'non-existent-key',
				'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__fails_with_invalid_structure() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [	
				'override_key' => 'prop-uuid-1',
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_value() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( 'not-an-array' );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_string_override_key() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 123,
				'value' => [ '$$type' => 'string', 'value' => 'New Title' ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_non_array_override_value() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'override_key' => 'prop-uuid-1',
			'value' => 'not-an-array',
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_invalid_value() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'html', 'value' => 123 ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_prop_value_not_matching_component_overridable_props() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );


		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'prop-uuid-1',
				'value' => [ '$$type' => 'number', 'value' => 123 ],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_valid_override() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		[
			'before_sanitization' => $before_sanitization,
			'expected_after_sanitization' => $expected_after_sanitization,
		] = $this->mocks->get_mock_image_image_component_override_to_sanitize();

		// Act
		$result = $prop_type->sanitize( $before_sanitization );

		// Assert
		$this->assertEquals( $expected_after_sanitization, $result );
	}

	public function test_sanitize__returns_null_when_override_key_not_in_component_props() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();;
		$prop_type = Component_Override_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-override',
			'value' => [
				'override_key' => 'non-existent-key',
				'value' => [ '$$type' => 'string', 'value' => 'Some Value' ],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-override',
			'value' => null,
		], $result );
	}
}
