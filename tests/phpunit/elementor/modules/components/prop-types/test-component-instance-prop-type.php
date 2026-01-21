<?php
namespace Elementor\Testing\Modules\Components\PropTypes;

use Elementor\Modules\Components\PropTypes\Component_Instance_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/component-prop-types-test-base.php';

class Test_Component_Instance_Prop_Type extends Component_Prop_Type_Test_Base {

	public function test_validate__passes_with_valid_data() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( 
			[
				'$$type' => 'component-instance',
				'value' => [
					'component_id' => [
						'$$type' => 'number',
						'value' => self::VALID_COMPONENT_ID,
					],
					'overrides' => [
						'$$type' => 'overrides',
						'value' => [
							$this->mocks->get_mock_valid_heading_title_component_override(),
							$this->mocks->get_mock_valid_heading_tag_component_override(),
							$this->mocks->get_mock_valid_image_image_component_override(),
							$this->mocks->get_mock_valid_image_link_component_override(),
						],
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
					'component_id' => [
						'$$type' => 'number',
						'value' => self::VALID_COMPONENT_ID,
					],
				],
			]
		);

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__passes_with_empty_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( 
			[
				'$$type' => 'component-instance',
				'value' => [
					'component_id' => [
						'$$type' => 'number',
						'value' => self::VALID_COMPONENT_ID,
					],
					'overrides' => [
						'$$type' => 'overrides',
						'value' => [],
					],
				],
			]
		);

		// Assert
		$this->assertTrue( $result );
	}

	public function test_validate__fails_with_mismatched_component_id_and_overrides() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->validate( [
			'$$type' => 'component-instance',
			'value' => [
					'component_id' => [
						'$$type' => 'number',
						'value' => 456,
					],
					'overrides' => [
						'$$type' => 'overrides',
						'value' => [
							[
								'$$type' => 'override',
								'value' => [
									'override_key' => 'prop-uuid-1',
									'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
									'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
								],
							],
						],
					],
			],
		] );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_sanitize__filters_out_overrides_with_override_key_not_in_component_overridable_props() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [
					'$$type' => 'number',
					'value' => self::VALID_COMPONENT_ID,
				],
				'overrides' => [
					'$$type' => 'overrides',
					'value' => [
						$this->mocks->get_mock_valid_heading_title_component_override(),
						[
							'$$type' => 'override',
							'value' => [
								'override_key' => 'non-existent-key',
								'override_value' => [ '$$type' => 'string', 'value' => 'Should be removed' ],
								'schema_source' => ['type' => 'component', 'id' => self::VALID_COMPONENT_ID ],
							],
						],
					],
				],
			],
		]);

		// Assert
		$overrides_array = $result['value']['overrides']['value'];
		$this->assertCount( 1, $overrides_array );
		$this->assertEquals( 'prop-uuid-1', $overrides_array[0]['value']['override_key'] );
	}

	public function test_sanitize__handles_component_not_found() {
		// Arrange
		$prop_type = Component_Instance_Prop_Type::make();

		// Act
		$result = $prop_type->sanitize( [
			'$$type' => 'component-instance',
			'value' => [
				'component_id' => [
					'$$type' => 'number',
					'value' => self::NON_EXISTENT_COMPONENT_ID,
				],
				'overrides' => [
					'$$type' => 'overrides',
					'value' => [
						[
							'$$type' => 'override',
							'value' => [
								'override_key' => 'prop-uuid-1',
								'override_value' => [ '$$type' => 'html', 'value' => 'New Title' ],
								'schema_source' => ['type' => 'component', 'id' => self::NON_EXISTENT_COMPONENT_ID ],
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
				'component_id' => [
					'$$type' => 'number',
					'value' => self::NON_EXISTENT_COMPONENT_ID,
				],
				'overrides' => [
					'$$type' => 'overrides',
					'value' => [],
				],
			],
		], $result );
	}
}
