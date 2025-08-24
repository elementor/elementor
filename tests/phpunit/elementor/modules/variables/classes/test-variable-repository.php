<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Repository as Variables_Repository;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Classes\Rest_Api;
use ElementorEditorTesting\Elementor_Test_Base;
use WP_REST_Request;
use Exception;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Repository extends Elementor_Test_Base {
	private $kit;
	private $repository;
	private $rest_api;

	protected function setUp(): void {
		parent::setUp();

		$this->kit = $this->createMock( Kit::class );
		$this->repository = new Variables_Repository( $this->kit );
		$this->rest_api = new Rest_Api( $this->repository );
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

		$captured_data = [];

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function( $meta ) use ( &$captured_data ) {
					$captured_data = $meta['data'];

					return isset( $captured_data )
						&& 4 === count( $captured_data )
						&& 6 === $meta['watermark'];
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

		$color_variables = array_filter( $captured_data, fn($item) => $item['type'] === Color_Variable_Prop_Type::get_key() );
		$font_variables = array_filter( $captured_data, fn($item) => $item['type'] === Font_Variable_Prop_Type::get_key() );

		// Assert.
		$this->assertCount( 3, $color_variables );
		$this->assertCount( 1, $font_variables );
	}

	public function test_create_new_variable__font_variable() {
		// Arrange.
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

		$captured_data = [];

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function( $meta ) use ( &$captured_data ) {
					$captured_data = $meta['data'];

					return isset( $captured_data )
						&& 2 === count( $captured_data )
						&& 11 === $meta['watermark'];
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

	public function test_create_variable__throws_exception_when_has_duplicated_label() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'b',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( DuplicatedLabel::class );
		$this->expectExceptionMessage( 'Variable label already exists' );

		// Act.
		$this->repository->create( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'a',
			'value' => '#111111',
		] );
	}


	public function test_create_new_variable__throws_exception_when_save_fails() {
		// Arrange.
		$this->kit->method( 'update_json_meta' )->willReturn( false );

		// Assert.
		$this->expectException( FatalError::class );
		$this->expectExceptionMessage( 'Failed to create variable' );

		// Act.
		$this->repository->create( [
			'label' => 'Test',
			'value' => 'test',
			'type' => Color_Variable_Prop_Type::get_key(),
		] );
	}

	public function test_create_variable__allows_duplicated_label_used_by_deleted_record() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Deleted Variable',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Active Variable',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->create( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Deleted Variable',
			'value' => '#123456',
		] );

		// Assert.
		$this->assertEquals( Color_Variable_Prop_Type::get_key(), $result['variable']['type'] );
		$this->assertEquals( 'Deleted Variable', $result['variable']['label'] );
		$this->assertEquals( '#123456', $result['variable']['value'] );
		$this->assertEquals( 6, $result['watermark'] );
	}

	public function test_update_variable__with_valid_data() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
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
		$result = $this->repository->update( 'e-123', [
			'label' => 'Text Primary',
			'value' => '#111111',
		] );

		$expected = [
			'id' => 'e-123',
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 9, $result['watermark'] );
	}

	public function test_update_variable__updating_wont_change_its_original_type() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'e-123' => [
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
		$result = $this->repository->update( 'e-123', [
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Font_Variable_Prop_Type::get_key(),
		] );

		$expected = [
			'id' => 'e-123',
			'label' => 'Text Primary',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 9, $result['watermark'] );
	}

	public function test_update_variable__throws_exception_when_has_duplicated_label() {
		//Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'b',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( DuplicatedLabel::class );
		$this->expectExceptionMessage( 'Variable label already exists' );

		// Act.
		$this->repository->update( 'id-1', [
			'label' => 'b',
			'value' => '#111111',
		] );
	}

	public function test_update_variable__allows_duplicate_label_for_same_id() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'b',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->update( 'id-1', [
			'label' => 'a',
			'value' => '#111111',
		] );

		// Assert.
		$expected = [
			'id' => 'id-1',
			'label' => 'a',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
	}

	public function test_update_variable__allows_duplicated_label_used_by_deleted_record() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Deleted Variable',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Active Variable',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->update( 'id-2', [
			'label' => 'Deleted Variable',
			'value' => '#111111',
		] );

		// Assert.
		$expected = [
			'id' => 'id-2',
			'label' => 'Deleted Variable',
			'value' => '#111111',
			'type' => Color_Variable_Prop_Type::get_key(),
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
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
		$this->expectException( FatalError::class );
		$this->expectExceptionMessage( 'Failed to update variable' );

		// Act.
		$this->repository->update( 'e-123', [
			'label' => 'Updated Primary',
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
		$this->expectException( RecordNotFound::class );
		$this->expectExceptionMessage( 'Variable not found' );

		// Act.
		$this->repository->update( 'non-existing-id', [
			'label' => 'Updated Label',
			'value' => '#123456',
		] );
	}

	public function test_delete_variable__with_existing_variable() {
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

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->delete( 'e-123' );

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
		$this->expectException( RecordNotFound::class );
		$this->expectExceptionMessage( 'Variable not found' );

		// Act.
		$this->repository->delete( 'non-existing-id' );
	}

	public function test_restore_variable() {
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

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->restore( 'e-123' );

		// Assert.
		$this->assertArrayNotHasKey( 'deleted', $result['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
	}

	public function test_restore_variable__throws_exception_when_has_duplicated_label() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#ffffff',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		// Assert.
		$this->expectException( DuplicatedLabel::class );
		$this->expectExceptionMessage( 'Variable label already exists' );

		// Act.
		$this->repository->restore( 'id-2' );
	}

	public function test_restore_variable__allows_restoring_deleted_variable_when_no_active_label_conflict() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'a',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'b',
					'value' => '#ffffff',
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->restore( 'id-1' );

		// Assert.
		$expected = [
			'id' => 'id-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'a',
			'value' => '#000000',
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
		$this->assertArrayNotHasKey( 'deleted', $result['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
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
		$this->expectException( RecordNotFound::class );
		$this->expectExceptionMessage( 'Variable not found' );

		$this->repository->restore( 'non-existing-id' );
	}

	public function test_restore_variable__allows_restoring_when_conflict_with_deleted_record() {
		// Arrange.
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'id-1' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Conflicting Label',
					'value' => '#000000',
					'deleted' => true,
					'deleted_at' => 1234567890,
				],
				'id-2' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Conflicting Label',
					'value' => '#ffffff',
					'deleted' => true,
					'deleted_at' => 1234567891,
				],
			],
			'watermark' => 5,
			'version' => Variables_Repository::FORMAT_VERSION_V1,
		] );

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );

		// Act.
		$result = $this->repository->restore( 'id-1' );

		// Assert.
		$expected = [
			'id' => 'id-1',
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => 'Conflicting Label',
			'value' => '#000000',
		];

		$this->assertEquals( $expected, $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
		$this->assertArrayNotHasKey( 'deleted', $result['variable'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
	}

	public function test_watermark__resets_when_reaching_max() {
		// Arrange.
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

		$captured_watermark = null;

		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->with(
				Variables_Repository::VARIABLES_META_KEY,
				$this->callback( function( $meta ) use ( &$captured_watermark ) {
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

	public function test_process_batch__successful_operations() {
		// Arrange
		$this->act_as_admin();
	
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'existing-id' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Existing Color',
					'value' => '#000000',
				],
			],
			'watermark' => 10,
			'version' => \Elementor\Modules\Variables\Storage\Repository::FORMAT_VERSION_V1,
		] );
	
		$this->kit->expects( $this->once() )
			->method( 'update_json_meta' )
			->willReturn( true );
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => 10,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'id' => 'temp-123',
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'New Color',
						'value' => '#FF0000',
					],
				],
				[
					'type' => 'update',
					'id' => 'existing-id',
					'variable' => [
						'label' => 'Updated Color',
						'value' => '#00FF00',
					],
				],
			],
		] );
	
		$response = $this->rest_api->process_batch( $request );
	
		// Assert
		$this->assertEquals( 200, $response->get_status() );
	
		$response_data = $response->get_data();
		$this->assertTrue( $response_data['success'] );
		$this->assertEquals( 11, $response_data['data']['watermark'] );
		$this->assertCount( 2, $response_data['data']['results'] );
	
		$create_result = $response_data['data']['results'][0];
		$this->assertEquals( 'temp-123', $create_result['temp_id'] );
		$this->assertNotEmpty( $create_result['id'] );
		$this->assertEquals( 'New Color', $create_result['variable']['label'] );
	
		$update_result = $response_data['data']['results'][1];
		$this->assertEquals( 'existing-id', $update_result['id'] );
		$this->assertEquals( 'Updated Color', $update_result['variable']['label'] );
	}
	
	public function test_process_batch__watermark_mismatch_error() {
		// Arrange
		$this->act_as_admin();
	
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [],
			'watermark' => 15,
			'version' => \Elementor\Modules\Variables\Storage\Repository::FORMAT_VERSION_V1,
		] );
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => 10,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Test Color',
						'value' => '#FF0000',
					],
				],
			],
		] );
	
		$response = $this->rest_api->process_batch( $request );
	
		// Assert
		$this->assertEquals( 400, $response->get_status() );
	
		$response_data = $response->get_data();
		$this->assertEquals( 'watermark_mismatch', $response_data['code'] );
		$this->assertEquals( 'Data has been modified by another process', $response_data['message'] );
		$this->assertEquals( 400, $response_data['data']['status'] );
	}
	
	public function test_process_batch__batch_operation_failed_error() {
		// Arrange
		$this->act_as_admin();
	
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'existing-id' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Existing Label',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => \Elementor\Modules\Variables\Storage\Repository::FORMAT_VERSION_V1,
		] );
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => 5,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'id' => 'temp-fail',
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Existing Label',
						'value' => '#FF0000',
					],
				],
			],
		] );
	
		$response = $this->rest_api->process_batch( $request );
	
		// Assert
		$this->assertEquals( 400, $response->get_status() );
	
		$response_data = $response->get_data();
		$this->assertFalse( $response_data['success'] );
		$this->assertEquals( 'atomic_operation_failed', $response_data['code'] );
		$this->assertEquals( 'Batch operation failed', $response_data['message'] );
		$this->assertArrayHasKey( 'temp-fail', $response_data['data'] );
		$this->assertEquals( 400, $response_data['data']['temp-fail']['status'] );
		$this->assertStringContainsString( 'already exists', $response_data['data']['temp-fail']['message'] );
	}
	
	public function test_process_batch__validation_invalid_watermark() {
		// Arrange
		$this->act_as_admin();
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => -5,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Test',
						'value' => '#FF0000',
					],
				],
			],
		] );
	
		$validation_result = $this->rest_api->is_valid_watermark( -5 );
	
		// Assert
		$this->assertInstanceOf( \WP_Error::class, $validation_result );
		$this->assertEquals( 'invalid_watermark', $validation_result->get_error_code() );
		$this->assertEquals( 'Watermark must be a non-negative integer', $validation_result->get_error_message() );
	}
	
	public function test_process_batch__validation_empty_operations_array() {
		// Arrange
		$this->act_as_admin();
	
		// Act
		$validation_result = $this->rest_api->is_valid_operations_array( [] );
	
		// Assert
		$this->assertInstanceOf( \WP_Error::class, $validation_result );
		$this->assertEquals( 'invalid_operations_empty', $validation_result->get_error_code() );
		$this->assertEquals( 'Operations array cannot be empty', $validation_result->get_error_message() );
	}
	
	public function test_process_batch__validation_invalid_operation_structure() {
		// Arrange
		$this->act_as_admin();
	
		// Act
		$operations = [
			[
				'variable' => [
					'label' => 'Test',
					'value' => '#FF0000',
				],
			],
		];
	
		$validation_result = $this->rest_api->is_valid_operations_array( $operations );
	
		// Assert
		$this->assertInstanceOf( \WP_Error::class, $validation_result );
		$this->assertEquals( 'invalid_operation_structure', $validation_result->get_error_code() );
		$this->assertStringContainsString( 'Invalid operation structure at index 0', $validation_result->get_error_message() );
	}
	
	public function test_process_batch__validation_invalid_operation_type() {
		// Arrange
		$this->act_as_admin();
	
		// Act
		$operations = [
			[
				'type' => 'invalid_type',
				'variable' => [
					'label' => 'Test',
					'value' => '#FF0000',
				],
			],
		];
	
		$validation_result = $this->rest_api->is_valid_operations_array( $operations );
	
		// Assert
		$this->assertInstanceOf( \WP_Error::class, $validation_result );
		$this->assertEquals( 'invalid_operation_type', $validation_result->get_error_code() );
		$this->assertStringContainsString( 'Invalid operation type at index 0', $validation_result->get_error_message() );
	}
	
	public function test_process_batch__unauthorized_user_access() {
		// Arrange
		$this->act_as( 'subscriber' );
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => 5,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Test',
						'value' => '#FF0000',
					],
				],
			],
		] );
	
		// Assert
		$this->assertFalse( $this->rest_api->enough_permissions_to_perform_rw_action() );
	}
	
	public function test_process_batch__handles_mixed_success_and_failure_operations() {
		// Arrange
		$this->act_as_admin();
	
		$this->kit->method( 'get_json_meta' )->willReturn( [
			'data' => [
				'existing-label' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Conflicting Label',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => \Elementor\Modules\Variables\Storage\Repository::FORMAT_VERSION_V1,
		] );
	
		// Act
		$request = new WP_REST_Request( 'POST', '/elementor/v1/variables/batch' );
		$request->set_body_params( [
			'watermark' => 5,
			'operations' => [
				[
					'type' => 'create',
					'variable' => [
						'id' => 'temp-success',
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Valid Label',
						'value' => '#FF0000',
					],
				],
				[
					'type' => 'create',
					'variable' => [
						'id' => 'temp-fail',
						'type' => Color_Variable_Prop_Type::get_key(),
						'label' => 'Conflicting Label',
						'value' => '#00FF00',
					],
				],
				[
					'type' => 'update',
					'id' => 'non-existent',
					'variable' => [
						'label' => 'Updated',
						'value' => '#0000FF',
					],
				],
			],
		] );
	
		$response = $this->rest_api->process_batch( $request );
	
		// Assert
		$this->assertEquals( 400, $response->get_status() );
	
		$response_data = $response->get_data();
		$this->assertFalse( $response_data['success'] );
		$this->assertEquals( 'atomic_operation_failed', $response_data['code'] );
	
		$this->assertArrayHasKey( 'temp-fail', $response_data['data'] );
		$this->assertArrayHasKey( 'non-existent', $response_data['data'] );
	
		$this->assertEquals( 400, $response_data['data']['temp-fail']['status'] );
		$this->assertEquals( 404, $response_data['data']['non-existent']['status'] );
	}
}
