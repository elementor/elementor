<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use PHPUnit\Framework\TestCase;
use Elementor\Modules\Variables\PropTypes\Size_Variable_Prop_Type;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Repository extends TestCase {

	private $kit;
	private $repository;

	protected function setUp(): void {
		parent::setUp();

		$this->kit = $this->createMock( Kit::class );
		$this->repository = new Variables_Repository( $this->kit );
	}

	public function test_load__returns_empty_collection_when_no_data() {
		// Arrange
		$this->kit->method( 'get_json_meta' )->willReturn( null );

		// Act
		$collection = $this->repository->load();

		// Assert
		$this->assertInstanceOf( Variables_Collection::class, $collection );
		$this->assertEmpty( $collection->all() );
		$this->assertEquals( 0, $collection->watermark() );
	}

	public function test_load__returns_hydrated_collection_when_data_exists() {
		// Arrange
		$db_record = [
			'data' => [
				'id-1' => [
					'type' => 'color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 1,
				],
				'id-2' => [
					'type' => 'font',
					'label' => 'Primary Font',
					'value' => 'Roboto',
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		];
		$this->kit->method( 'get_json_meta' )->willReturn( $db_record );

		// Act
		$result = $this->repository->load();

		// Assert
		$this->assertInstanceOf( Variables_Collection::class, $result );
		$this->assertCount( 2, $result->all() );
		$this->assertEquals( 5, $result->watermark() );

		$variable1 = $result->get( 'id-1' );
		$this->assertInstanceOf( Variable::class, $variable1 );
		$this->assertEquals( 'Primary', $variable1->label() );
	}

	public function test_save__increments_watermark_and_returns_it() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 1,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$this->kit->method( 'update_json_meta' )->willReturn( true );

		// Act
		$result = $this->repository->save( $collection );

		// Assert
		$this->assertEquals( 6, $result );
	}

	public function test_save_returns_false_when_update_fails() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'color',
					'label' => 'Primary',
					'value' => '#000000',
					'order' => 1,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Act
		$result = $this->repository->save( $collection );

		// Assert
		$this->assertFalse( $result );
	}

	public function test_save__converts_string_values_to_storage_format_prop_values() {
		// Arrange.
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'e-gv-color' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#ff5733',
					'order' => 1,
				],
				'e-gv-size' => [
					'type' => Size_Variable_Prop_Type::get_key(),
					'label' => 'Padding',
					'value' => '20px',
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$saved_data = null;
		$this->kit->expects( $this->once() )
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
		$result = $this->repository->save( $collection );

		// Assert.
		$this->assertEquals( 6, $result );
		$expected = [
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
				'type' => Size_Variable_Prop_Type::get_key(),
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
		];
		$this->assertEquals( $expected, $saved_data['data'] );
	}

	public function test_load__converts_prop_values_to_strings() {
		// Arrange.
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
					'type' => Size_Variable_Prop_Type::get_key(),
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

		$this->kit->method( 'get_json_meta' )->willReturn( $db_record );

		// Act.
		$collection = $this->repository->load();
		$result = $collection->serialize();

		$expected = [
			'e-gv-color' => [
				'type' => Color_Variable_Prop_Type::get_key(),
				'label' => 'Primary',
				'value' => '#ff5733',
				'order' => 1,
			],
			'e-gv-size' => [
				'type' => Size_Variable_Prop_Type::get_key(),
				'label' => 'Padding',
				'value' => '20px',
				'order' => 2,
			],
		];

		// Assert.
		$this->assertEquals( $expected, $result['data'] );
		$this->assertEquals( 5, $collection->watermark() );
	}

	public function test_full_round_trip__color_variable() {
		// Arrange.
		$original_collection = Variables_Collection::hydrate( [
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
		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturnCallback( function( $key, $data ) use ( &$saved_data ) {
				$saved_data = $data;
				return true;
			} );

		$this->kit->method( 'get_json_meta' )->willReturnCallback( function() use ( &$saved_data ) {
			return $saved_data;
		} );

		// Act.
		$this->repository->save( $original_collection );
		$loaded_collection = $this->repository->load();
		$result = $loaded_collection->serialize();

		// Assert.
		$this->assertEquals( '#3498db', $result['data']['e-gv-primary']['value'] );
		$this->assertEquals( 'Primary Color', $result['data']['e-gv-primary']['label'] );
		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $result['data']['e-gv-primary']['type'] );
	}
}
