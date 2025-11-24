<?php
namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Instance_Prop_Type extends Component_Prop_Type_Test_Base {

	public function test_validate__passes_with_valid_id_and_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( 
			[
				'$$type' => 'component-instance',
				'value' => [
					'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
					'overrides' => [
						'$$type' => 'component-overrides',
						'value' => [
							$this->mocks->get_mock_valid_heading_title_component_override(),
							$this->mocks->get_mock_valid_heading_tag_component_override(),
							$this->mocks->get_mock_valid_image_image_component_override(),
							$this->mocks->get_mock_valid_image_link_component_override(),
						]
					],
				],
			]
		);

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_with_component_id_only() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( 
			[
				'$$type' => 'component-instance',
				'value' => [
					'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
				],
			]
		);

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_with_component_id_and_empty_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-instance',
			'value' => [
					'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
					'overrides' => [
						'$$type' => 'component-overrides',
						'value' => [],
					],
			],
		] );

		// Assert
		$this->assertTrue( $result );
	}

	public function invalid_structure_data_provider() {
		return [
			'non-array value' => [ 'not-an-array' ],
			'missing_component_id' => [ [
				'overrides' => [ '$$type' => 'component-overrides', 'value' => [] ],
			] ],
			'non-number component_id' => [[ 
				'component_id' => [ '$$type' => 'number', 'value' => 'not-a-number' ],
				'overrides' => [ '$$type' => 'component-overrides', 'value' => [] ],
			]],
			'non-array overrides' => [ [ 
				'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
				'overrides' => 'not-an-array' 
			]],
		];
	}

		/**
	 * @dataProvider invalid_structure_data_provider
	 */
	public function test_validate__fail_for_invalid_structure( $value ) {
		// Arrange.
		$prop_type = Component_Instance_Prop_Type::make();

		// Act.
		$result = $prop_type->validate( [
			'$$type' => 'component-instance',
			'value' => $value,
		] );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__fails_with_invalid_override_in_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-instance',
			'value' => [ 
				'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
				'overrides' => [ 
					'$$type' => 'component-overrides',
					'value' => [ [ $this->mocks->get_mock_invalid_override() ] ],
				],
			]
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__sanitizes_component_id_and_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		[
			'before_sanitization' => $heading_tag_override_before_sanitization,
			'expected_after_sanitization' => $heading_tag_override_expected_after_sanitization,
		] = $this->mocks->get_mock_heading_tag_component_override_to_sanitize();

		// Act
		$result = $prop_type->sanitize( 
			[
				'$$type' => 'component-instance',
				'value' => [
					'component_id' => [ '$$type' => 'number', 'value' => '123' ],
					'overrides' => [
						'$$type' => 'component-overrides',
						'value' => [
							$heading_tag_override_before_sanitization
						],
					],
				],
			]
		);

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
				'overrides' => [
					'$$type' => 'component-overrides',
					'value' => [
						$heading_tag_override_expected_after_sanitization
					],
				],
			],
		], $result );
	}

	public function test_sanitize__removes_overrides_when_empty() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [ '$$type' => 'number', 'value' => self::VALID_COMPONENT_ID ],
				'overrides' => [
					'$$type' => 'component-overrides',
					'value' => [
						[
							'override_key' => 'non-existent-key',
							'value' => [ '$$type' => 'string', 'value' => 'Should be removed' ],
						],
					],
				],
			],
		]);

		// Assert
		$this->assertArrayNotHasKey( 'overrides', $result );
	}

	public function test_sanitize__handles_component_not_found() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [ '$$type' => 'number', 'value' => self::NON_EXISTENT_COMPONENT_ID ],
				'overrides' => [
					'$$type' => 'component-overrides',
					'value' => [
						[
							'$$type' => 'component-override',
							'value' => [
								'override_key' => 'prop-uuid-1',
								'value' => [ '$$type' => 'html', 'value' => 'New Title' ],
							],
						],
					],
				],
			],
		] );

		// Assert
		$this->assertEquals( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [ '$$type' => 'number', 'value' => self::NON_EXISTENT_COMPONENT_ID ],
			],
		], $result );
	}
}

