<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use PHPUnit\Framework\TestCase;
use ReflectionClass;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Batch_Processor extends TestCase {

	private $repository;
	private $service;
	private $processor;

	protected function setUp(): void {
		parent::setUp();

		$this->repository = $this->createMock( Variables_Repository::class );
		$this->service = $this->createMock( Variables_Service::class );
		$this->processor = new BatchProcessor( $this->repository, $this->service );
	}

	protected function assertArrayContainsArray( array $expected, array $actual ) {
		foreach ( $expected as $key => $value ) {
			$this->assertArrayHasKey( $key, $actual, "Missing key: $key" );
			$this->assertEquals( $value, $actual[$key], "Value mismatch for key: $key" );
		}
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
				'id' => 'id-1',
			],
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 6 );

		$this->service->method( 'find_or_fail' )->willReturnCallback( function ( $col, $id ) {
			return $col->get( $id );
		} );

		// Act
		$result = $this->processor->process_batch( $data );
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
		$this->assertEquals( 'id-1', $delete['id'] );
		$this->assertTrue( $delete['deleted'] );
	}

	public function test_process_batch__throws_error_when_operation_fails() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'id-1' => [
					'type' => 'global-color',
					'label' => 'Primary',
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
					'type' => 'global-color',
					'label' => 'Primary',
					'value' => '#FF0000',
				],
			],
		];

		$this->repository->method( 'load' )->willReturn( $collection );

		// Assert
		$this->expectException( BatchOperationFailed::class );

		// Act
		$this->processor->process_batch( $data );
	}

	public function test_process_batch__throws_runtime_exception_when_save_fails() {
		// Arrange
		$collection = Variables_Collection::default();

		$data = [
			[
				'type' => 'create',
				'variable' => [
					'type' => 'global-color',
					'label' => 'New Color',
					'value' => '#FF0000',
				],
			],
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( false );

		// Assert
		$this->expectException( \RuntimeException::class );
		$this->expectExceptionMessage( 'Failed to save after batch.' );

		// Act
		$this->processor->process_batch( $data );
	}

	public function test_op_create__throws_variables_limit_reached() {
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
			$this->processor->process_batch( $data );
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
}

