<?php

namespace Elementor\Modules\Variables\Adapters;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Variables_Collection;
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

		$this->adapter = new PropType_Adapter();
	}

	private function make_collection( array $overrides = [] ): Variables_Collection {

		$defaults = [
			'data' => [],
			'watermark' => 1,
			'version' => 1,
		];

		return Variables_Collection::hydrate( array_replace_recursive( $defaults, $overrides ) );
	}

	private function parse_size_value( $value ) {

		$value = trim( strtolower( $value ) );

		if ( $value === 'auto' ) {
			return [
				'size' => '',
				'unit' => 'auto',
			];
		}

		if ( preg_match( '/^(-?\d*\.?\d+)([a-z%]+)$/i', trim( $value ), $matches ) ) {
			return [
				'size' => $matches[1] + 0,
				'unit' => strtolower( $matches[2] ),
			];
		}

		return $value;
	}

	public function test_to_storage__converts_color_string_to_color_prop_type_value() {
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

	public function test_to_storage__converts_font_string_to_string_prop_type_value() {
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

	public function test_to_storage__converts_size_string_to_size_prop_type_value() {
		// Arrange.
		$size_variable_key = 'size-variable';

		add_filter( 'elementor/variables/value-schema', function( $schema ) use( $size_variable_key ) {


			$schema[ 'size-variable' ] = Size_Prop_Type::class,
//				Variable_Schema_Entry::make(
//				Union_Prop_Type::make()->add_prop_type( Size_Prop_Type::make() ),
//				Size_Prop_Type::class
//			)->normalize_value( fn( $value ) => $this->parse_size_value( $value ) );

			return $schema;
		} );

		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => $size_variable_key,
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
				'type' => 'size-variable',
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

	public function test_to_storage__converts_size_auto_string_to_size_prop_type_value() {
		$size_variable_key = 'auto-size-variable';

		// Arrange.
		add_filter( 'elementor/variables/value-schema', function( $schema ) use( $size_variable_key ) {
			$schema[ $size_variable_key ] = Variable_Schema_Entry::make(
				Union_Prop_Type::make()->add_prop_type( Size_Prop_Type::make() ),
				Size_Prop_Type::class
			)->normalize_value( fn( $value ) => $this->parse_size_value( $value ) );

			return $schema;
		} );

		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => $size_variable_key,
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
				'type' => 'auto-size-variable',
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

	public function test_to_storage__converts_custom_size_string_to_size_prop_type_value() {
		// Arrange.
		$custom_variable_prop_type = new class extends String_Prop_Type  {
			public static function get_key(): string {
				return 'global-custom-size-variable';
			}
		};

		add_filter( 'elementor/variables/value-schema', function( $schema ) use( $custom_variable_prop_type ) {
			$schema[ $custom_variable_prop_type::get_key() ] = Variable_Schema_Entry::make( Size_Prop_Type::class,

			)->normalize_value( fn( $value ) => [
				'size' => $value,
				'unit' => 'custom',
			] );

			return $schema;
		} );

		$collection = $this->make_collection( [
			'data' => [
				'e-gv-23erty7' => [
					'type' => $custom_variable_prop_type::get_key(),
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
}























//
//<!--
//color -> <-
//test from_storage converts color_prop_type value to string
//
//font -> <-
//
//test from_storage converts font_prop_type_value to string
//
//size -> <-
//
//test from_storage converts size_prop_type_value to string
//test dimension
//test custom
//test auto
//	 -->
//
//<!--each variable has a type wc tells us how to convert-->
//
//<!--edge cases-->
//<!--
//test_to_storage__handles_null_value
//test_from_storage__handles_null_value
//test_to_storage__throws_exception_for_unknown_prop_type
//test_from_storage__throws_exception_for_unknown_variable_type
//
//test_to_storage__validates_prop_type_structure
//test_to_storage__validates_prop_type_has_value
//** test_collection_to_storage__converts_all_variables_in_collection
//** test_collection_from_storage__converts_all_variables_from_storage
//test_collection_to_storage__preserves_watermark_and_version
//test_collection_from_storage__preserves_watermark_and_version
//
//test_collection_to_storage__handles_empty_collection
//test_collection_from_storage__handles_empty_collection
//
//test_bidirectional_conversion__color_maintains_data_integrity
//test_bidirectional_conversion__size_maintains_data_integrity
//-->
//
//<!--Integration Tests-->
//<!--
//test_repository_save__converts_prop_values_to_storage_format
//test_repository_load__converts_storage_format_to_prop_values
//
//test_full_round_trip__color_variable
//test_full_round_trip__multiple_variable_types
//test_conversion_performance__large_collection
// complex background is it complex
