<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use PHPUnit\Framework\TestCase;
use InvalidArgumentException;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Variables_Repository extends TestCase {
	private $kit;
	private $repository;

	protected function setUp(): void {
		parent::setUp();

		$this->kit = $this->createMock( Kit::class );
		$this->repository = new Variables_Repository( $this->kit );
	}

	public function test_list_of_variables__returns_default_when_empty() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( null );

		// Act.
		$result = $this->repository->all();

		$expected = [
			'data' => [],
			'watermark' => 0,
			'version' => 1,
		];

		// Assert.
		$this->assertEquals( $expected, $result );
	}

	public function test_list_of_variables__returns_existing_data() {
		// Arrange.
		$data = [
			'data' => [
				'e-123' => [
					'label' => 'Primary',
					'value' => '#000000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'e-498' => [
					'label' => 'Primary',
					'value' => '#000000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'e-456' => [
					'label' => 'Primary Font',
					'value' => 'Robotto',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			],
			'watermark' => 5,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $data );

		// Act.
		$result = $this->repository->all();

		// Assert.
		$expected = [
			'data' => [
				'e-123' => [
					'label' => 'Primary',
					'value' => '#000000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'e-498' => [
					'label' => 'Primary',
					'value' => '#000000',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'e-456' => [
					'label' => 'Primary Font',
					'value' => 'Robotto',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			],
			'watermark' => 5,
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_create_new_variable__when_empty() {
		// Arrange.
		$captured_data = null;

		$this->kit->expects( $this->once() )
		          ->method('update_json_meta')
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function ( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return isset( $captured_data ) && count( $captured_data ) === 1 && $meta['watermark'] === 1;
			          })
		          )
		          ->willReturn( '571234' );

		$this->kit->method( 'get_json_meta' )->willReturn( [] );

		// Act.
		$newVariable = [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Secondary: Text Color',
			'value' => '#fff328',
		];

		$id = $this->repository->create( $newVariable );

		$variable = $captured_data[ $id ];

		// Assert.
		$this->assertEquals( 'Secondary: Text Color', $variable['label'] );
		$this->assertEquals( '#fff328', $variable['value'] );
		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $variable['type'] );
	}

	public function test_create_new_variable__add_variable_to_existing_list() {
		// Arrange.
		$captured_data = null;
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
				'e-456' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Secondary',
					'value' => '#ffffff',
				],
				'e-789' => [
					'type' => Font_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		$this->kit->expects( $this->once() )
		          ->method( 'update_json_meta' )
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return isset( $captured_data ) && count( $captured_data ) === 4 && $meta['watermark'] === 6;
			          } )
		          )
		          ->willReturn( true );

		// Act.
		$newVariable = [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'New Text Color',
			'value' => '#123098',
		];
		$id = $this->repository->create( $newVariable );

		$color_variables = array_filter( $captured_data, fn( $item ) => $item['type'] === Color_Variable_Prop_Type::get_key() );
		$font_variables = array_filter( $captured_data, fn( $item ) => $item['type'] === Font_Variable_Prop_Type::get_key() );

		// Assert.
		$this->assertCount( 3, $color_variables );
		$this->assertCount( 1, $font_variables );
	}

	public function test_create_new_variable__font_variable() {
		// Arrange.
		$captured_data = null;
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 10,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );
		$this->kit->expects( $this->once() )
		          ->method( 'update_json_meta' )
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return isset( $captured_data ) && count( $captured_data ) === 2 && $meta['watermark'] === 11;
			          })
		          )
		          ->willReturn(true);

		// Act.
		$newVariable = [
			'type' => Font_Variable_Prop_Type::get_key(),
			'label' => 'Primary Font',
			'value' => 'Roboto',
		];
		$id = $this->repository->create( $newVariable );

		$font_variable = $captured_data[$id];

		// Assert.
		$this->assertEquals( 'Primary Font', $font_variable['label'] );
		$this->assertEquals( 'Roboto', $font_variable['value'] );
		$this->assertEquals( Font_Variable_Prop_Type::get_key(), $font_variable['type'] );
	}

	public function test_create_new_variable__throws_exception_when_save_fails() {
		// Arrange.
		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Assert.
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Failed to create variable' );

		$newVariable = [
			'label' => 'Test',
			'value' => 'test',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		// Act.
		$this->repository->create( $newVariable, Color_Variable_Prop_Type::get_key() );
	}

	public function test_update_variable__with_valid_data() {
		// Arrange.
		$captured_data = null;
		$id = 'e-123';
		$existingData = [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 8,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );
		$this->kit->expects( $this->once() )
		          ->method( 'update_json_meta' )
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return $meta['watermark'] === 9;
			          })
		          )
		          ->willReturn(true);

		// Act.
		$updatedVariable = [
			'label' => 'Text Primary',
			'value' => '#111111',
		];
		$this->repository->update( $updatedVariable, $id );

		$color_variable = $captured_data[ $id ];

		$expected = array_merge( $updatedVariable, [
			'type' => Color_Variable_Prop_Type::get_key(),
		] );

		$this->assertEquals( $expected, $color_variable );
	}

	public function test_update_variable__updating_wont_change_its_original_type() {
		// Arrange.
		$captured_data = null;
		$id = 'e-123';
		$existingData = [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 8,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		$this->kit->expects( $this->once() )
		          ->method('update_json_meta')
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function ( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return true;
			          } )
		          )
		          ->willReturn(true);
		// Act.
		$updatedVariable = [
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Font_Variable_Prop_Type::get_key(),
		];

		$expected = [
			'label' => $updatedVariable['label'],
			'value' => $updatedVariable['value'],
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->repository->update( $updatedVariable, $id );

		$this->assertEquals( $expected, $captured_data[ $id ] );
	}

	public function test_update_variable__throws_exception_when_save_fails() {
		// Arrange.
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );
		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Assert.
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Failed to update variable' );

		// Act.
		$updatedVariable = [
			'label' => 'Primary',
			'value' => '#111111',
		];

		$this->repository->update( $updatedVariable, 'e-123' );
	}

	public function test_update_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		// Act.
		$this->repository->delete( 'e-4567890' );
	}

	public function test_delete_variable__with_existing_variable() {
		// Arrange.
		$captured_data = null;
		$id = 'e-123';
		$existingData = [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );
		$this->kit->expects( $this->once() )
		          ->method( 'update_json_meta' )
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return true;
			          })
		          )
		          ->willReturn( true );

		// Act.
		$this->repository->delete( $id );

		$variable = $captured_data[$id];

		// Assert.
		$this->assertTrue( $variable['deleted'] );
		$this->assertNotNull( $variable['deleted_at'] );
	}

	public function test_delete_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		// Act.
		$this->repository->delete( 'e-4567890' );
	}

	public function test_restore_variable() {
		// Arrange.
		$captured_data = null;
		$id = 'e-123';
		$existingData = [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );
		$this->kit->expects( $this->once() )
		          ->method('update_json_meta')
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function ( $meta ) use ( &$captured_data ) {
				          $captured_data = $meta['data'];

				          return true;
			          } )
		          )
		          ->willReturn(true);

		// Act.
		$this->repository->restore( $id );

		// Assert.
		$this->assertArrayNotHasKey( 'deleted', $captured_data[$id] );
		$this->assertArrayNotHasKey( 'deleted_at', $captured_data[$id] );
	}

	public function test_restore_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
			],
			'watermark' => 5,
			'version' => 1,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		$this->repository->restore( '12345' );
	}

	public function test_watermark__resets_when_reaching_max() {
		// Arrange.
		$captured_watermark = null;
		$existingData = [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => PHP_INT_MAX,
		];

		$this->kit->method( 'get_json_meta' )->willReturn( $existingData );

		$this->kit->expects( $this->once() )
		          ->method('update_json_meta')
		          ->with(
			          Variables_Repository::VARIABLES_META_KEY,
			          $this->callback( function ( $meta ) use ( &$captured_watermark ) {
				          $captured_watermark = $meta['watermark'];

				          return true;
			          } )
		          )
		          ->willReturn(true);

		$updatedVariable = [
			'label' => 'Tertiary',
			'value' => '#123456',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		// Act.
		$this->repository->update( $updatedVariable, 'e-123' );

		$this->assertEquals( 1, $captured_watermark );
	}
}
