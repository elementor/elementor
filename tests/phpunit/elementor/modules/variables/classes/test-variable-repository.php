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

/**
 * @gorup Elementor\Modules
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

	public function test_list_of_variables__returns_default_when_empty() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( null );

		// Act.
		$result = $this->repository->load();

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
		$this->kit->method( 'get_json_meta' )->willReturn( [
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
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Act.
		$result = $this->repository->load();

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
			'version' => 1,
		];

		$this->assertEquals( $expected, $result );
	}

	public function test_create_new_variable__when_empty() {
		// Arrange.

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		$this->kit->method( 'get_json_meta' )->willReturn( [] );

		// Act.
		$result = $this->repository->create( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Secondary: Text Color',
			'value' => '#fff328',
		] );

		// Assert.
		$this->assertEquals( 1, $result['watermark'] );

		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $result['variable']['type'] );
		$this->assertEquals( 'Secondary: Text Color', $result['variable']['label'] );
		$this->assertEquals( '#fff328', $result['variable']['value'] );
	}

	public function test_create_new_variable__add_color_variable_to_existing_list() {
		// Arrange.
		$captured_data = [];

		$this->kit->method( 'get_json_meta' )->willReturn( [
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
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function( $meta ) use ( &$captured_data ) {
					$captured_data = $meta['data'];

					return isset( $captured_data )
						&& count( $captured_data ) === 4
						&& $meta['watermark'] === 6;
				} )
			)
			->willReturn( true );

		// Act.
		$newVariable = [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'New Text Color',
			'value' => '#123098',
		];

		$this->repository->create( $newVariable );

		$color_variables = array_filter( $captured_data, fn( $item ) => $item['type'] === Color_Variable_Prop_Type::get_key() );
		$font_variables = array_filter( $captured_data, fn( $item ) => $item['type'] === Font_Variable_Prop_Type::get_key() );

		// Assert.
		$this->assertCount( 3, $color_variables );
		$this->assertCount( 1, $font_variables );
	}

	public function test_create_new_variable__font_variable() {
		// Arrange.
		$captured_data = [];

		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 10,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function( $meta ) use ( &$captured_data ) {
					$captured_data = $meta['data'];

					return isset( $captured_data )
						&& count( $captured_data ) === 2
						&& $meta['watermark'] === 11;
				} )
			)
			->willReturn( true );

		// Act.

		$result = $this->repository->create( [
			'type' => Font_Variable_Prop_Type::get_key(),
			'label' => 'Primary Font',
			'value' => 'Roboto',
		] );

		// Assert.
		$this->assertEquals( 11, $result['watermark'] );

		$this->assertEquals( Font_Variable_Prop_Type::get_key(), $result['variable']['type'] );
		$this->assertEquals( 'Primary Font', $result['variable']['label'] );
		$this->assertEquals( 'Roboto', $result['variable']['value'] );
	}

	public function test_create_new_variable__throws_exception_when_save_fails() {
		// Arrange.
		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Assert.
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Failed to create variable' );

		// Act.
		$this->repository->create( [
			'label' => 'Test',
			'value' => 'test',
			'type' => Color_Variable_Prop_Type::get_key(),
		] );
	}

	public function test_update_variable__with_valid_data() {
		// Arrange.
		$captured_data = [];

		$id = 'e-123';

		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 8,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->update( $id, [
			'label' => 'Text Primary',
			'value' => '#111111',
		] );

		$expected = [
			'id' => $id,
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 9, $result['watermark'] );
	}

	public function test_update_variable__updating_wont_change_its_original_type() {
		// Arrange.
		$id = 'e-123';

		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 8,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method('update_json_meta')
			->willReturn( true );

		// Act.
		$result = $this->repository->update( $id, [
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Font_Variable_Prop_Type::get_key(),
		] );

		$expected = [
			'id' => $id,
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 9, $result['watermark'] );
	}

	public function test_update_variable__throws_exception_when_save_fails() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Assert.
		$this->expectException( Exception::class );
		$this->expectExceptionMessage( 'Failed to update variable' );

		// Act.
		$this->repository->update( 'e-123', [
			'label' => 'Primary',
			'value' => '#111111',
		] );
	}

	public function test_update_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		// Act.
		$this->repository->delete( 'e-4567890' );
	}

	public function test_delete_variable__with_existing_variable() {
		// Arrange.
		$id = 'e-123';

		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				$id => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->delete( $id );

		// Assert.
		$this->assertTrue( $result['variable']['deleted'] );
		$this->assertNotNull( $result['variable']['deleted_at'] );
		$this->assertEquals( 6, $result['watermark'] );
	}

	public function test_delete_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		// Act.
		$this->repository->delete( 'e-4567890' );
	}

	public function test_restore_variable() {
		// Arrange.
		$captured_data = [];

		$id = 'e-123';

		$this->kit->method( 'get_json_meta' )->willReturn( [
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
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method('update_json_meta')
			->willReturn( true );

		// Act.
		$result = $this->repository->restore( $id );

		// Assert.
		$this->assertArrayNotHasKey( 'deleted', $result['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result );
	}

	public function test_restore_variable__throws_exception_when_id_not_found() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
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
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( InvalidArgumentException::class );
		$this->expectExceptionMessage( 'Variable id does not exist' );

		$this->repository->restore( '12345' );
	}

	public function test_watermark__resets_when_reaching_max() {
		// Arrange.
		$captured_watermark = null;

		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Primary',
					'value' => '#000000',
				],
			],
			'watermark' => PHP_INT_MAX,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method('update_json_meta')
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function ( $meta ) use ( &$captured_watermark ) {
					$captured_watermark = $meta['watermark'];

					return true;
				} )
			)
			->willReturn( true );

		// Act.
		$result = $this->repository->update( 'e-123', [
			'label' => 'Tertiary',
			'value' => '#123456',
		] );

		$this->assertEquals( 1, $result['watermark'] );
	}
}
