<?php

namespace Elementor\Modules\Variables\Adapters;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Size_Constants;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;
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
		$result = $this->adapter->to_storage( $collection );

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


		$result = $this->adapter->to_storage( $collection );

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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Padding',
					'value' => '249rem',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Width',
					'value' => 'auto',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

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
		$result = $this->adapter->to_storage( $collection );

		// Assert.
		$expected = [
			'e-gv-23erty7' => [
				'type' => 'global-size-variable',
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
					'type' => Size_Variable_Prop_Type::get_key(),
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
					'type' => Size_Variable_Prop_Type::get_key(),
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
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'font-size',
				'value' => '12vh',
			],
			'e-gv-4' => [
				'type' => Size_Variable_Prop_Type::get_key(),
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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Padding',
					'value' => '23px',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

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
			'version' => 1,
		] );

		// Act.
		$this->adapter->to_storage( $collection );

		$result = $collection->serialize();

		// Assert.
		$this->assertEquals( 42, $result['watermark'] );
		$this->assertEquals( 2, $result['version'] );
	}

	public function test_bidirectional_conversion__size_maintains_data_integrity() {
		// Arrange.
		$original_value = '24px';
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-size' => [
					'type' => Size_Variable_Prop_Type::get_key(),
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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Negative Margin',
					'value' => '-10px',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Line Height',
					'value' => '1.5rem',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

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
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Width Percent',
					'value' => '50%',
				],
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );
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

	public function test_to_storage__handles_invalid_edge_case_values_for_all_variable_types() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-color-empty' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Color Empty',
					'value' => '',
				],
				'e-gv-font-empty' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Font Empty',
					'value' => '',
				],
				'e-gv-font-null' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Font Null',
					'value' => null,
				],
				'e-gv-size-empty' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size Empty',
					'value' => '',
				],
				'e-gv-size-null' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size Null',
					'value' => null,
				]
			],
		] );

		// Act.
		$result = $this->adapter->to_storage( $collection );

		$expected = [
			'e-gv-color-empty' => [
				'type' => 'global-color-variable',
				'label' => 'Color Empty',
				'value' => [
					'$$type' => 'color',
					'value' => ''
				]
			],
			'e-gv-font-empty' => [
				'type' => Font_Variable_Prop_Type::get_key(),
				'label' => 'Font Empty',
				'value' => [
					'$$type' => 'string',
					'value' => ''
				],
			],
			'e-gv-font-null' => [
				'type' => Font_Variable_Prop_Type::get_key(),
				'label' => 'Font Null',
				'value' => [
					'$$type' => 'string',
					'value' => null
				],
			],
			'e-gv-size-empty' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size Empty',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => '',
						'unit' => Size_Constants::DEFAULT_UNIT,
					]
				],
			],
			'e-gv-size-null' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size Null',
				'value' => [
					'$$type' => 'size',
					'value' => [
						'size' => '',
						'unit' => Size_Constants::DEFAULT_UNIT,
					]
				],
			]
		];

		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_from_storage__handles_invalid_values_edge_case_values_for_all_variable_types() {
		// Arrange.
		$collection = $this->make_collection( [
			'data' => [
				'e-gv-color-string' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Color String',
					'value' => [
						'$$type' => 'color',
						'value' => '',
					],
				],
				'e-gv-empty-string-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Color Empty',
					'value' => '',
				],
				'e-gv-color-null' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Color Null',
					'value' => [
						'$$type' => 'color',
						'value' => null,
					],
				],
				'e-gv-font-empty' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Font Empty',
					'value' => [
						'$$type' => 'string',
						'value' => '',
					],
				],
				'e-gv-empty-string-size' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size String',
					'value' => [
						'$$type' => 'size',
						'value' => '',
					],
				],
				'e-gv-null-size' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size String',
					'value' => [
						'$$type' => 'size',
						'value' => null,
					],
				],
				'e-gv-null-value' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size String',
					'value' => null,
				],
				'e-gv-size-empty' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size Empty',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => '',
							'unit' => '',
						],
					],
				],
				'e-gv-size-null' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size Null',
					'value' => [
						'$$type' => 'size',
						'value' => [
							'size' => null,
							'unit' => null,
						],
					],
				],
				'e-gv-size-malformed' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Size Malformed',
					'value' => [
						'$$type' => 'size',
						'value' => [],
					],
				]
			],
		] );

		// Act.
		$this->adapter->from_storage( $collection );
		$result = $collection->serialize();

		$expected = [
			'e-gv-color-string' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Color String',
				'value' => '',
			],
			'e-gv-empty-string-color' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Color Empty',
				'value' => '',
			],
			'e-gv-color-null' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Color Null',
				'value' => null,
			],
			'e-gv-font-empty' => [
				'type' => Font_Variable_Prop_Type::get_key(),
				'label' => 'Font Empty',
				'value' => '',
			],
			'e-gv-empty-string-size' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size String',
				'value' => 'px',
			],
			'e-gv-null-size' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size String',
				'value' => 'px',
			],
			'e-gv-null-value' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size String',
				'value' => null,
			],
			'e-gv-size-empty' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size Empty',
				'value' => 'px',
			],
			'e-gv-size-null' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Size Null',
				'value' => 'px',
			],
			'e-gv-size-malformed' => [
				'type' => 'global-size-variable',
				'label' => 'Size Malformed',
				'value' => 'px',
			],
		];

		// Assert.
		$this->assertEquals( $expected, $result['data'] );
	}
}
