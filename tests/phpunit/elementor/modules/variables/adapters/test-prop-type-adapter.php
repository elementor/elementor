<?php

namespace Elementor\Modules\Variables\Adapters;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Modules\Variables\Variables_Schema\Variable_Schema_Entry;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Prop_Type_Adapter extends TestCase {
	private $adapter;

	protected function setUp(): void {
		parent::setUp();

		$this->adapter = new Prop_Type_Adapter();
	}

	private function make_collection( array $overrides = [] ): Variables_Collection {

		$defaults = [
			'data' => [],
			'watermark' => 1,
			'version' => 1,
		];

		return Variables_Collection::hydrate( array_replace_recursive( $defaults, $overrides ) );
	}

	public function test_to_storage__converts_color_string_to_color_prop_value() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#53552b',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [
					'$$type' => 'color',
					'value' => '#53552b',
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__converts_font_string_to_string_prop_value() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Main',
					'value' => 'Roboto',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-font-variable',
				'label' => 'Main',
				'value' => [
					'$$type' => 'string',
					'value' => 'Roboto',
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__converts_size_string_to_size_prop_value() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Padding',
					'value' => '249rem',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-size-variable',
				'label' => 'Padding',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => 249,
						'unit' => 'rem',
					],
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__converts_size_auto_string_to_size_prop_value() {
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Width',
					'value' => 'auto',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-size-variable',
				'label' => 'Width',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => '',
						'unit' => 'auto',
					],
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__converts_custom_size_string_to_size_prop_value() {
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'height',
					'value' => 'calc((10px * 5) + (20px * 3))',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-custom-size-variable',
				'label' => 'height',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => 'calc((10px * 5) + (20px * 3))',
						'unit' => 'custom',
					],
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_from_storage__converts_prop_values_to_string() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#53552b',
					],
				],
				'e-gv-2' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Main',
					'value' => [
						'$$type' => 'string',
						'value' => 'Roboto',
					],
				],
				'e-gv-3' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'font-size',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => 12,
							'unit' => 'vh',
						],
					],
				],
				'e-gv-4' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'max-height',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => '',
							'unit' => 'auto',
						],
					],
				],
			],
		] );

		// Act.
		$this->adapter->from_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-1' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Primary',
				'value' => '#53552b',
			],
			'e-gv-2' => [
				'type' => Font_Variable_Prop_Type::get_key(),
				'label' => 'Main',
				'value' => 'Roboto',
			],
			'e-gv-3' => [
				'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
				'label' => 'font-size',
				'value' => '12vh',
			],
			'e-gv-4' => [
				'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
				'label' => 'max-height',
				'value' => 'auto',
			],
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_from_storage__converts_custom_size_prop_type_value_to_string() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'margin',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => 'calc((10px * 5) + (20px * 3))',
							'unit' => 'custom',
						],
					],
				],
			],
		] );

		// Act.
		$this->adapter->from_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23' => [
				'type' => 'global-custom-size-variable',
				'label' => 'margin',
				'value' => 'calc((10px * 5) + (20px * 3))',
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__skips_already_converted_array_values() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#53552b',
					],
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => [
					'$$type' => 'color',
					'value' => '#53552b',
				],
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_from_storage__skips_non_array_values() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#53552b',
				],
			],
		] );

		// Act.
		$this->adapter->from_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-color-variable',
				'label' => 'Primary',
				'value' => '#53552b',
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__converts_all_variables_in_collection() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-color1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#53552b',
				],
				'e-gv-font1' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Main',
					'value' => 'Roboto',
				],
				'e-gv-size1' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Padding',
					'value' => '23px',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		$expected_color = [
			'$$type' => 'color',
			'value' => '#53552b',
		];
		$expected_font = [
			'$$type' => 'string',
			'value' => 'Roboto',
		];
		$expected_size = [
			'$$type' => 'size',
			'value' => [
				'size' => 23,
				'unit' => 'px',
			],
		];

		// Assert.
		$this->assertEquals( $expected_color, $result['data']['e-gv-color1']['value'] );
		$this->assertEquals( $expected_font, $result['data']['e-gv-font1']['value'] );
		$this->assertEquals( $expected_size, $result['data']['e-gv-size1']['value'] );
	}

	public function test_to_storage__preserves_watermark_and_version() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#53552b',
				],
			],
			'watermark' => 42,
			'version' => 5,
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$this->assertEquals( 42, $result['watermark'] );
		$this->assertEquals( 5, $result['version'] );
	}

	public function test_bidirectional_conversion__size_maintains_data_integrity() {
		// Arrange.
		$original_value = '24px';
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Test Size',
					'value' => $original_value,
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );
		$this->adapter->from_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$this->assertEquals( $original_value, $result['data']['e-gv-size']['value'] );
	}

	public function test_to_storage__handles_negative_size_values() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Negative Margin',
					'value' => '-10px',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$expected = [
			'e-gv-size' => [
				'type' => 'global-size-variable',
				'label' => 'Negative Margin',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => -10,
						'unit' => 'px',
					],
				]
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_to_storage__handles_decimal_size_values() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Line Height',
					'value' => '1.5rem',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 1.5,
				'unit' => 'rem',
			],
		];

		// Assert.
		$this->assertEquals( $expected, $result['data']['e-gv-size']['value'] );
	}

	public function test_to_storage__handles_percentage_values() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Width Percent',
					'value' => '50%',
				],
			],
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();
		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 50,
				'unit' => '%',
			],
		];
		// Assert.
		$this->assertEquals( $expected, $result['data']['e-gv-size']['value'] );
	}

	public function test_repository_save__converts_prop_values_to_storage_format() {
		// Arrange.
		$kit = $this->createMock( Kit::class );
		$repository = new Variables_Repository( $kit );

		$collection = $this->make_collection( [
			'data' => [
				'e-gv-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#ff5733',
					'order' => 1,
				],
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Padding',
					'value' => '20px',
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$saved_data = null;
		$kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				$this->equalTo( '_elementor_global_variables' ),
				$this->callback( function( $data ) use ( &$saved_data ) {
					$saved_data = $data;
					return true;
				} )
			)
			->willReturn( true );

		// Act.
		$result = $repository->save( $collection );

		// Assert.
		$this->assertEquals( 6, $result );
		$this->assertIsArray( $saved_data );
		$this->assertArrayHasKey( 'data', $saved_data );

		$this->assertEquals( 'color', $saved_data['data']['e-gv-color']['value']['$$type'] );
		$this->assertEquals( '#ff5733', $saved_data['data']['e-gv-color']['value']['value'] );

		$this->assertEquals( 'size', $saved_data['data']['e-gv-size']['value']['$$type'] );
		$this->assertEquals( 20, $saved_data['data']['e-gv-size']['value']['value']['size'] );
		$this->assertEquals( 'px', $saved_data['data']['e-gv-size']['value']['value']['unit'] );
	}

	public function test_repository_load__converts_storage_format_to_prop_values() {
		// Arrange.
		$kit = $this->createMock( Kit::class );
		$repository = new Variables_Repository( $kit );

		$db_record = [
			'data' => [
				'e-gv-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => [
						'$$type' => 'color',
						'value' => '#ff5733',
					],
					'order' => 1,
				],
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Padding',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => 20,
							'unit' => 'px',
						],
					],
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$kit->method( 'get_json_meta' )->willReturn( $db_record );

		// Act.
		$collection = $repository->load();
		$result = $collection->serialize();

		// Assert.
		$this->assertEquals( '#ff5733', $result['data']['e-gv-color']['value'] );
		$this->assertEquals( '20px', $result['data']['e-gv-size']['value'] );
		$this->assertEquals( 5, $collection->watermark() );
	}

	public function test_full_round_trip__color_variable() {
		// Arrange.
		$kit = $this->createMock( Kit::class );
		$repository = new Variables_Repository( $kit );

		$original_collection = $this->make_collection( [
			'data' => [
				'e-gv-primary' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary Color',
					'value' => '#3498db',
					'order' => 1,
				],
			],
			'watermark' => 0,
			'version' => 1,
		] );

		$saved_data = null;
		$kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturnCallback( function( $key, $data ) use ( &$saved_data ) {
				$saved_data = $data;
				return true;
			} );

		$kit->method( 'get_json_meta' )->willReturnCallback( function() use ( &$saved_data ) {
			return $saved_data;
		} );

		// Act.
		$repository->save( $original_collection );
		$loaded_collection = $repository->load();
		$result = $loaded_collection->serialize();

		// Assert.
		$this->assertEquals( '#3498db', $result['data']['e-gv-primary']['value'] );
		$this->assertEquals( 'Primary Color', $result['data']['e-gv-primary']['label'] );
		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $result['data']['e-gv-primary']['type'] );
	}

	public function test_full_round_trip__multiple_variable_types() {
		// Arrange.
		$kit = $this->createMock( Kit::class );
		$repository = new Variables_Repository( $kit );

		$original_collection = $this->make_collection( [
			'data' => [
				'e-gv-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#e74c3c',
					'order' => 1,
				],
				'e-gv-font' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Main Font',
					'value' => 'Open Sans',
					'order' => 2,
				],
				'e-gv-size' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Spacing',
					'value' => '16px',
					'order' => 3,
				],
				'e-gv-auto' => [
					'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
					'label' => 'Width',
					'value' => 'auto',
					'order' => 4,
				],
				'e-gv-custom' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'Custom Calc',
					'value' => 'calc(100% - 32px)',
					'order' => 5,
				],
			],
			'watermark' => 0,
			'version' => 1,
		] );

		$saved_data = null;
		$kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturnCallback( function( $key, $data ) use ( &$saved_data ) {
				$saved_data = $data;
				return true;
			} );

		$kit->method( 'get_json_meta' )->willReturnCallback( function() use ( &$saved_data ) {
			return $saved_data;
		} );

		// Act.
		$repository->save( $original_collection );
		$loaded_collection = $repository->load();
		$result = $loaded_collection->serialize();

		// Assert.
		$this->assertEquals( '#e74c3c', $result['data']['e-gv-color']['value'] );
		$this->assertEquals( 'Open Sans', $result['data']['e-gv-font']['value'] );
		$this->assertEquals( '16px', $result['data']['e-gv-size']['value'] );
		$this->assertEquals( 'auto', $result['data']['e-gv-auto']['value'] );
		$this->assertEquals( 'calc(100% - 32px)', $result['data']['e-gv-custom']['value'] );
	}

	public function test_conversion_performance__large_collection() {
		// Arrange.
		$data = [];
		for ( $i = 1; $i <= 50; $i++ ) {
			$data["e-gv-color-{$i}"] = [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => "Color {$i}",
				'value' => sprintf( '#%06x', mt_rand( 0, 0xFFFFFF ) ),
				'order' => $i,
			];
		}

		for ( $i = 1; $i <= 50; $i++ ) {
			$data["e-gv-size-{$i}"] = [
				'type' => Prop_Type_Adapter::GLOBAL_SIZE_VARIABLE_KEY,
				'label' => "Size {$i}",
				'value' => ( $i * 2 ) . 'px',
				'order' => $i + 50,
			];
		}

		$collection = $this->make_collection( [
			'data' => $data,
			'watermark' => 0,
			'version' => 1,
		] );

		$start_time = microtime( true );

		// Act.
		$this->adapter->to_storage( $collection );
		$this->adapter->from_storage( $collection );

		$end_time = microtime( true );
		$execution_time = $end_time - $start_time;

		$result = $collection->serialize();

		// Assert.
		$this->assertLessThan( 0.1, $execution_time, 'Conversion should complete within 100ms' );
		$this->assertCount( 100, $result['data'] );
		$this->assertEquals( sprintf( '#%06x', mt_rand( 0, 0xFFFFFF ) ), $result['data']['e-gv-color-1']['value'] );
	}

	public function test_repository_integration__preserves_data_integrity_with_special_characters() {
		// Arrange.
		$kit = $this->createMock( Kit::class );
		$repository = new Variables_Repository( $kit );

		$original_collection = $this->make_collection( [
			'data' => [
				'e-gv-custom' => [
					'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
					'label' => 'Complex Calc',
					'value' => 'calc((100vw - 20px) * 0.5 + (10px / 2))',
					'order' => 1,
				],
			],
			'watermark' => 0,
			'version' => 1,
		] );

		$saved_data = null;
		$kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturnCallback( function( $key, $data ) use ( &$saved_data ) {
				$saved_data = $data;
				return true;
			} );

		$kit->method( 'get_json_meta' )->willReturnCallback( function() use ( &$saved_data ) {
			return $saved_data;
		} );

		// Act.
		$repository->save( $original_collection );
		$loaded_collection = $repository->load();
		$result = $loaded_collection->serialize();

		// Assert.
		$this->assertEquals( 'calc((100vw - 20px) * 0.5 + (10px / 2))', $result['data']['e-gv-custom']['value'] );
	}
}

