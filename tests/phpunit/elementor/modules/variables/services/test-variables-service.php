<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Adapters\Prop_Type_Adapter;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use PHPUnit\Framework\TestCase;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Variables_Service extends TestCase {

	private $kit;
	private $repository;
	private $service;

	protected function setUp(): void {
		parent::setUp();

		$this->repository = $this->createMock( Variables_Repository::class );
		$this->service = new Variables_Service( $this->repository, new Batch_Processor() );
	}

	protected function assertArrayContainsArray( array $expected, array $actual ) {
		foreach ( $expected as $key => $value ) {
			$this->assertArrayHasKey( $key, $actual, "Missing key: $key" );
			$this->assertEquals( $value, $actual[$key], "Value mismatch for key: $key" );
		}
	}

	private function mock_collection() {
		return Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-size-var',
					'label' => 'Primary',
					'value' => '100px',
				],
				'id-2' => [
					'type' => 'global-color-var',
					'label' => 'Secondary',
					'value' => '#000000',
				],
			],
			'watermark' => 10,
			'version' => 1,
		] );
	}

	public function test_process_batch_operations__successful() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Primary',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => 'global-color',
					'label' => 'Deleted Variable',
					'value' => '#FFFFFF',
					'deleted_at' => '2024-01-01 10:00:00',
				],
				'delete-me' => [
					'type' => Color_Variable_Prop_Type::get_key(),
					'label' => 'Delete Me',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$data = [
			[
				'type' => 'create',
				'variable' => [
					'id' => 'temp-123',
					'type' => 'global-color',
					'label' => 'New Color',
					'value' => '#FF0000',
				],
			],
			[
				'type' => 'update',
				'id' => 'id-1',
				'variable' => [
					'label' => 'Updated Primary',
					'value' => '#00FF00',
				],
			],
			[
				'type' => 'restore',
				'id' => 'id-2',
				'label' => 'Restored Color',
			],
			[
				'type' => 'delete',
				'id' => 'delete-me',
			],
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 6 );

		// Act
		$result = $this->service->process_batch( $data );
		$operations_results = $result['results'];

		// Assert
		$this->assertTrue( $result['success'] );
		$this->assertEquals( 6, $result['watermark'] );
		$this->assertCount( 4, $result['results'] );

		$create = $operations_results[0];
		$expected_variable = [
			'type' => 'global-color',
			'label' => 'New Color',
			'value' => '#FF0000',
		];

		$this->assertNotEmpty( $create['id'] );
		$this->assertEquals( 'create', $create['type'] );
		$this->assertEquals( 'temp-123', $create['temp_id'] );
		$this->assertArrayContainsArray( $expected_variable, $create['variable'] );

		$update = $operations_results[1];
		$expected_variable = [
			'type' => 'global-color',
			'label' => 'Updated Primary',
			'value' => '#00FF00',
		];
		$this->assertEquals( 'id-1', $update['id'] );
		$this->assertEquals( 'update', $update['type'] );
		$this->assertArrayContainsArray( $expected_variable, $update['variable'] );

		$restore = $operations_results[2];
		$expected_variable = [
			'type' => 'global-color',
			'label' => 'Restored Color',
			'value' => '#FFFFFF',
		];
		$this->assertEquals( 'restore', $restore['type'] );
		$this->assertEquals( 'id-2', $restore['id'] );
		$this->assertArrayContainsArray( $expected_variable, $restore['variable'] );

		$delete = $operations_results[3];
		$expected_variable = [
			'type' => 'global-color',
			'label' => 'Primary',
			'value' => '#000000',
		];
		$this->assertEquals( 'delete', $delete['type'] );
		$this->assertEquals( 'delete-me', $delete['id'] );
		$this->assertTrue( $delete['deleted'] );
	}


	public function test_process_batch__throws_variables_limit_reached() {
		// Arrange
		$variables = [];
		for ( $i = 0; $i < 100; $i++ ) {
			$variables[ "id-{$i}" ] = [
				'type' => 'color',
				'label' => "Label {$i}",
				'value' => '#000',
				'order' => $i,
			];
		}

		$collection = Variables_Collection::hydrate( [
			'data' => $variables,
			'watermark' => 50,
			'version' => 1,
		] );

		$data = [
			[
				'type' => 'create',
				'variable' => [
					'type' => 'global-color',
					'label' => 'New Color',
					'value' => '#FF0000',
				],
			]
		];
		$this->repository->method( 'load' )->willReturn( $collection );

		// Act.
		try {
			$this->service->process_batch( $data );
			$this->fail( 'Expected BatchOperationFailed to be thrown' );
		} catch ( BatchOperationFailed $e ) {
			// Assert.
			$this->assertSame( 'Batch failed', $e->getMessage() );

			$details = $e->getErrorDetails();
			$error = $details['operation_0'];

			$this->assertEquals( 400, $error['status'] );
			$this->assertEquals( 'invalid_variable_limit_reached', $error['code'] );
			$this->assertEquals( 'Total variables count limit reached', $error['message'] );
		}

		$this->assertTrue( true );
	}
	public function test_create__successfully_creates_variable() {
		// Arrange
		$data = [
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
		];

		$this->repository->method( 'load' )->willReturn( Variables_Collection::default() );
		$this->repository->method( 'save' )->willReturn( 0 );

		// Act
		$result = $this->service->create( $data );

		// Assert
		$this->assertIsArray( $result );
		$this->assertNotEmpty( $result['variable']['id'] );
		$this->assertEquals( 'Primary Color', $result['variable']['label'] );
		$this->assertEquals( '#000000', $result['variable']['value'] );
		$this->assertEquals( 'color', $result['variable']['type'] );
		$this->assertEquals( 0, $result['watermark'] );
	}

	public function test_create__custom_size_variable() {
		// Arrange
		$data = [
			'type' => Prop_Type_Adapter::GLOBAL_CUSTOM_SIZE_VARIABLE_KEY,
			'label' => 'custom-size',
			'value' => 'clamp(1rem, 2vw, 3rem)',
		];

		$this->repository->method( 'load' )->willReturn( Variables_Collection::default() );
		$this->repository->method( 'save' )->willReturn( 0 );

		// Act
		$result = $this->service->create( $data );

		// Assert
		$this->assertNotEmpty( $result['variable']['id'] );
		$this->assertEquals( 'custom-size', $result['variable']['label'] );
		$this->assertEquals( 'clamp(1rem, 2vw, 3rem)', $result['variable']['value'] );
		$this->assertEquals( 'global-custom-size-variable', $result['variable']['type'] );
		$this->assertEquals( 0, $result['watermark'] );
	}

	public function test_create__throws_fatal_error_when_save_fails() {
		// Arrange
		$collection = $this->mock_collection();
		$data = [
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 1,
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( false );

		// Assert
		$this->expectException( FatalError::class );
		$this->expectExceptionMessage( 'Failed to create variable' );

		// Act
		$this->service->create( $data );
	}

	public function test_update__successfully_updates_variable() {
		// Arrange
		$collection = $this->mock_collection();
		$data = [
			'label' => 'Updated Color',
			'value' => '#FFFFFF',
			'order' => 10,
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 2 );

		// Act
		$result = $this->service->update( 'id-2', $data );

		// Assert
		$this->assertEquals( 'id-2', $result['variable']['id'] );
		$this->assertEquals( 'Updated Color', $result['variable']['label'] );
		$this->assertEquals( '#FFFFFF', $result['variable']['value'] );
		$this->assertEquals( 10, $result['variable']['order'] );
		$this->assertEquals( 2, $result['watermark'] );
	}

	public function test_update__throws_record_not_found_exception() {
		// Arrange
		$collection = $this->mock_collection();
		$data = [
			'label' => 'Updated Color',
			'value' => '#FFFFFF',
		];

		$this->repository->method( 'load' )->willReturn( $collection );

		// Assert
		$this->expectException( RecordNotFound::class );
		$this->expectExceptionMessage( 'Variable not found' );

		// Act
		$this->service->update( 'non-existent-id', $data );
	}

	public function test_update_throws_fatal_error_when_save_fails() {
		// Arrange
		$collection = $this->mock_collection();
		$data = [
			'label' => 'Updated Color',
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( false );

		// Assert
		$this->expectException( FatalError::class );
		$this->expectExceptionMessage( 'Failed to update variable' );

		// Act
		$this->service->update( 'id-1', $data );
	}

	public function test_delete__successfully_deletes_variable() {
		// Arrange
		$collection = $this->mock_collection();

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 11 );

		// Act
		$result = $this->service->delete( 'id-1' );

		// Assert
		$this->assertEquals( 'id-1', $result['variable']['id'] );
		$this->assertNotNull( $result['variable']['deleted_at'] );
		$this->assertEquals( 11, $result['watermark'] );
	}

	public function test_delete__throws_fatal_error_when_save_fails() {
		// Arrange
		$collection = $this->mock_collection();

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( false );

		// Assert
		$this->expectException( FatalError::class );
		$this->expectExceptionMessage( 'Failed to delete variable' );

		// Act
		$this->service->delete( 'id-1' );
	}

	public function test_restore__successfully_restores_deleted_variable() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Deleted Variable',
					'value' => '#000000',
					'deleted_at' => '2024-01-01 10:00:00',
					'order' => 2,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 6 );

		// Act
		$result = $this->service->restore( 'id-1' );

		// Assert
		$this->assertEquals( 'id-1', $result['variable']['id'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
	}

	public function test_restore__with_overrides() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Deleted Variable',
					'value' => '#000000',
					'deleted_at' => '2024-01-01 10:00:00',
					'order' => 1,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$overrides = [
			'label' => 'Restored Variable',
			'value' => '#FFFFFF',
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 6 );

		// Act
		$result = $this->service->restore( 'id-1', $overrides );

		// Assert
		$this->assertEquals( 'id-1', $result['variable']['id'] );
		$this->assertEquals( 'Restored Variable', $result['variable']['label'] );
		$this->assertEquals( '#FFFFFF', $result['variable']['value'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
		$this->assertEquals( 6, $result['watermark'] );
	}

	public function test_restore__throws_duplicated_label_when_label_exists() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Active Variable',
					'value' => '#000000',
					'order' => 1,
				],
				'id-2' => [
					'type' => 'global-color',
					'label' => 'Deleted Variable',
					'value' => '#FFFFFF',
					'deleted_at' => '2024-01-01 10:00:00',
					'order' => 1,
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$overrides = [
			'label' => 'Active Variable',
		];

		$this->repository->method( 'load' )->willReturn( $collection );

		// Assert
		$this->expectException( DuplicatedLabel::class );

		// Act
		$this->service->restore( 'id-2', $overrides );
	}

	public function test_load__returns_serialized_collection_from_repository() {
		// Arrange
		$expected_collection = $this->mock_collection();
		$this->repository->method( 'load' )->willReturn( $expected_collection );

		// Act
		$result = $this->service->load();

		$expected = [
			'id-1' => [
				'type' => 'global-size-var',
				'label' => 'Primary',
				'value' => '100px',
			],
			'id-2' => [
				'type' => 'global-color-var',
				'label' => 'Secondary',
				'value' => '#000000',
			]
		];

		// Assert
		$this->assertEquals( 10, $result['watermark'] );
		$this->assertEquals( 1, $result['version'] );
		$this->assertEquals( $expected, $result['data'] );
	}

	public function test_load__returns_default_collection_when_empty() {
		// Arrange
		$empty_collection = Variables_Collection::default();
		$this->repository->method( 'load' )->willReturn( $empty_collection );

		// Act
		$result = $this->service->load();

		// Assert
		$this->assertIsArray( $result );
		$this->assertEquals( 0, $result['watermark'] );
		$this->assertEquals( 1, $result['version'] );
		$this->assertEmpty( $result['data'] );
	}

	public function test_get_variables_list__returns_serialized_data() {
		// Arrange
		$collection = $this->mock_collection();
		$this->repository->method( 'load' )->willReturn( $collection );

		// Act
		$result = $this->service->get_variables_list();

		$expected = [
			'id-1' => [
				'type' => 'global-size-var',
				'label' => 'Primary',
				'value' => '100px',
			],
			'id-2' => [
				'type' => 'global-color-var',
				'label' => 'Secondary',
				'value' => '#000000',
			]
		];

		// Assert
		$this->assertEquals( $expected, $result );
	}

	public function test_get_variables_list__returns_empty_array_when_no_variables() {
		// Arrange
		$empty_collection = Variables_Collection::default();
		$this->repository->method( 'load' )->willReturn( $empty_collection );

		// Act
		$result = $this->service->get_variables_list();

		// Assert
		$this->assertIsArray( $result );
		$this->assertEmpty( $result );
	}

	public function test_get_variables_list__includes_deleted_variables() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Active Variable',
					'value' => '#000000',
				],
				'id-2' => [
					'type' => 'global-color',
					'label' => 'Deleted Variable',
					'value' => '#FFFFFF',
					'deleted_at' => '2024-01-01 10:00:00',
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$this->repository->method( 'load' )->willReturn( $collection );

		// Act
		$result = $this->service->get_variables_list();

		// Assert
		$this->assertCount( 2, $result );
		$this->assertArrayHasKey( 'id-1', $result );
		$this->assertArrayHasKey( 'id-2', $result );
		$this->assertArrayNotHasKey( 'deleted_at', $result['id-1'] );
		$this->assertArrayHasKey( 'deleted_at', $result['id-2'] );
	}

}

