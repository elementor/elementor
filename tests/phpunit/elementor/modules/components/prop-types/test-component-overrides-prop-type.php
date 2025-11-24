<?php

namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Overrides_Prop_type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Overrides_Prop_Type extends Component_Prop_Type_Test_Base {
	public function test_validate__passes_with_valid_overrides_array() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overrides',
			'value' => [
				$this->mocks->get_mock_valid_heading_title_component_override(),
				$this->mocks->get_mock_valid_heading_tag_component_override(),
				$this->mocks->get_mock_valid_image_image_component_override(),
				$this->mocks->get_mock_valid_image_link_component_override(),
			]
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_with_empty_array() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overrides',
			'value' => [],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__fails_with_non_array() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overrides',
			'value' => 'not-an-array',
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_invalid_override_in_array() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-overrides',
			'value' => [
				$this->mocks->get_mock_valid_heading_title_component_override(),
				[
					'$$type' => 'component-override',
					'value' => [
						'override_key' => 'prop-uuid-2',
						'value' => [
							'$$type' => 'string',
							'value' => 'invalid-value',
						],
					]
				],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_all_valid_overrides() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		[
			'before_sanitization' => $image_image_override_before_sanitization,
			'expected_after_sanitization' => $image_image_override_expected_after_sanitization,
		] = $this->mocks->get_mock_image_image_component_override_to_sanitize();

		[
			'before_sanitization' => $heading_tag_override_before_sanitization,
			'expected_after_sanitization' => $heading_tag_override_expected_after_sanitization,
		] = $this->mocks->get_mock_heading_tag_component_override_to_sanitize();

		// Act
		$result = $prop_type->sanitize( 
		[
			'$$type' => 'component-overrides',
			'value' => [
				$image_image_override_before_sanitization,
				$heading_tag_override_before_sanitization,
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-overrides',
			'value' => [
				$image_image_override_expected_after_sanitization,
				$heading_tag_override_expected_after_sanitization,
			],
		], $result );
	}

	public function test_sanitize__removes_overrides_with_non_existent_keys() {
		// Arrange
		$component_overridable_props = $this->mocks->get_mock_component_overridable_props();
		$prop_type = Component_Overrides_Prop_type::make()
			->set_component_overridable_props( $component_overridable_props );

		// Act
		$result = $prop_type->sanitize( [
				'$$type' => 'component-overrides',
				'value' => [
					$this->mocks->get_mock_valid_heading_title_component_override(),
					[
						'$$type' => 'component-override',
						'value' => [
							'override_key' => 'non-existent-key',
							'value' => [ '$$type' => 'string', 'value' => 'Should be removed' ],
						]
					],
				],
		] );

		// Assert
		$this->assertCount( 1, $result['value'] );
		$this->assertEquals( 'prop-uuid-1', $result['value'][0]['value']['override_key'] );
	}
}
