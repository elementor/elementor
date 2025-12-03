<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Perspective_Origin_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Functions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Origin_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Transform\Transform_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Transform_Prop_Type extends TestCase {

	public function test_prop_type__shape_returns_all_required_fields() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();

		// Act.
		$shape = $prop_type->get_shape();

		// Assert .
		$this->assertCount( 4, $shape );
		$this->assertArrayHasKey( 'transform-functions', $shape );
		$this->assertArrayHasKey( 'transform-origin', $shape );
		$this->assertArrayHasKey( 'perspective', $shape );
		$this->assertArrayHasKey( 'perspective-origin', $shape );
	}

	public function test_perspective__has_restricted_units() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();

		// Act.
		$perspective = $prop_type->get_shape_field( 'perspective' );
		$settings = $perspective->get_settings();

		// Assert.
		$this->assertArrayHasKey( 'available_units', $settings );
		$this->assertEquals( [ 'px', 'em', 'rem', 'vw', 'vh' ], $settings['available_units'] );
	}

	public function test_validate__transform_value() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();
		$value = [
			'$$type' => 'transform',
			'value' => [
				'transform-functions' => [
					'$$type' => 'transform-functions',
					'value' => [
						[
							'$$type' => 'transform-move',
							'value' => [
								'x' => [
									'$$type' => 'size',
									'value' => [
										'size' => 10,
										'unit' => 'px',
									],
								],
								'y' => [
									'$$type' => 'size',
									'value' => [
										'size' => 20,
										'unit' => 'px',
									],
								],
								'z' => [
									'$$type' => 'size',
									'value' => [
										'size' => 30,
										'unit' => 'px',
									],
								],
							],
						],
						[
							'$$type' => 'transform-rotate',
							'value' => [
								'x' => [
									'$$type' => 'size',
									'value' => [
										'size' => 45,
										'unit' => 'deg',
									],
								],
								'y' => [
									'$$type' => 'size',
									'value' => [
										'size' => 0,
										'unit' => 'deg',
									],
								],
								'z' => [
									'$$type' => 'size',
									'value' => [
										'size' => 0,
										'unit' => 'deg',
									],
								],
							],
						],
					],
				],
				'perspective' => [
					'$$type' => 'size',
					'value' => [
						'size' => 1000,
						'unit' => 'px',
					],
				],
				'perspective-origin' => [
					'$$type' => 'perspective-origin',
					'value' => [
						'x' => [
							'$$type' => 'size',
							'value' => [
								'size' => 50,
								'unit' => '%',
							],
						],
						'y' => [
							'$$type' => 'size',
							'value' => [
								'size' => 50,
								'unit' => '%',
							],
						],
					],
				],
			],
		];

		// Act.
		$result = $prop_type->validate( $value );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_validate__rejects_invalid_transform_function() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();
		$value = [
			'$$type' => 'object',
			'value' => [
				'transform-functions' => [
					'$$type' => 'array',
					'value' => [
						[
							'$$type' => 'invalid-transform-type',
							'value' => [],
						],
					],
				],
			],
		];

		// Act.
		$result = $prop_type->validate( $value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_validate__rejects_invalid_perspective_unit() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();
		$value = [
			'$$type' => 'object',
			'value' => [
				'perspective' => [
					'$$type' => 'size',
					'value' => [
						'size' => 1000,
						'unit' => '%',
					],
				],
			],
		];

		// Act.
		$result = $prop_type->validate( $value );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_initial_values__in_prop_type_schema() {
		// Arrange.
		$prop_type = Transform_Prop_Type::make();
		$test_cases = [
			'transform-move' => [
				'source' => 'transform-functions',
				'fields' => [
					'x' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'px' ]
					],
					'y' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'px' ]
					],
					'z' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'px' ]
					],
				],
			],
			'transform-rotate' => [
				'source' => 'transform-functions',
				'fields' => [
					'x' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'deg' ]
					],
					'y' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'deg' ]
					],
					'z' => [
						'$$type' => 'size',
						'value' => [ 'size' => 0, 'unit' => 'deg' ]
					],
				],
			],
			'transform-origin' => [
				'source' => 'prop-type',
				'fields' => [
					'x' => null,
					'y' => null,
					'z' => null,
				],
			],
			'perspective-origin' => [
				'source' => 'prop-type',
				'fields' => [
					'x' => null,
					'y' => null,
				],
			],
		];

		$transform_functions = $prop_type->get_shape_field( 'transform-functions' );

		// Act & Assert.
		foreach ( $test_cases as $transform_name => $config ) {
			if ( $config['source'] === 'transform-functions' ) {
				$transform = $transform_functions->get_item_type()->get_prop_type( $transform_name );
			} else {
				$transform = $prop_type->get_shape_field( $transform_name );
			}

			foreach ( $config['fields'] as $axis => $expected_value ) {
				$field = $transform->get_shape_field( $axis );

				$this->assertEquals(
					$expected_value,
					$field->get_initial_value(),
					"Failed asserting {$transform_name}.{$axis} has correct initial value"
				);
			}
		}
	}
}

