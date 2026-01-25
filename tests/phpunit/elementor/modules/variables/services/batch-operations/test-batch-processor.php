<?php

namespace Elementor\Modules\Variables\Services\Batch_Operations;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\BatchOperationFailed;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_Batch_Processor extends TestCase {

	private $processor;

	protected function setUp(): void {
		parent::setUp();

		$this->processor = new Batch_Processor();
	}

	public function test_apply_operation__create_successfully() {
		// Arrange
		$collection = Variables_Collection::default();
		$operation = [
			'type' => 'create',
			'variable' => [
				'id' => 'temp-123',
				'type' => 'global-color',
				'label' => 'New Color',
				'value' => '#FF0000',
			],
		];

		// Act
		$result = $this->processor->apply_operation( $collection, $operation );

		// Assert
		$this->assertEquals( 'create', $result['type'] );
		$this->assertNotEmpty( $result['id'] );
		$this->assertEquals( 'temp-123', $result['temp_id'] );
		$this->assertEquals( 'global-color', $result['variable']['type'] );
		$this->assertEquals( 'New Color', $result['variable']['label'] );
		$this->assertEquals( '#FF0000', $result['variable']['value'] );
	}

	public function test_apply_operation__update_successfully() {
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

		$operation = [
			'type' => 'update',
			'id' => 'id-1',
			'variable' => [
				'label' => 'Updated Primary',
				'value' => '#00FF00',
			],
		];

		// Act
		$result = $this->processor->apply_operation( $collection, $operation );

		// Assert
		$this->assertEquals( 'update', $result['type'] );
		$this->assertEquals( 'id-1', $result['id'] );
		$this->assertEquals( 'Updated Primary', $result['variable']['label'] );
		$this->assertEquals( '#00FF00', $result['variable']['value'] );
	}

	public function test_apply_operation__delete_successfully() {
		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
				'delete-me' => [
					'type' => 'global-color',
					'label' => 'Delete Me',
					'value' => '#000000',
				],
			],
			'watermark' => 5,
			'version' => 1,
		] );

		$operation = [
			'type' => 'delete',
			'id' => 'delete-me',
		];

		// Act
		$result = $this->processor->apply_operation( $collection, $operation );

		// Assert
		$this->assertEquals( 'delete', $result['type'] );
		$this->assertEquals( 'delete-me', $result['id'] );
		$this->assertTrue( $result['deleted'] );
	}

	public function test_apply_operation__restore_successfully() {
		$this->markTestSkipped( 'Restore is not yet supported in batch processing. Operation type causes conflict with variable type' );

		// Arrange
		$collection = Variables_Collection::hydrate( [
			'data' => [
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

		$operation = [
			'type' => 'restore',
			'id' => 'id-2',
			'label' => 'Restored Color',
		];

		// Act
		$result = $this->processor->apply_operation( $collection, $operation );

		// Assert
		$this->assertEquals( 'restore', $result['type'] );
		$this->assertEquals( 'id-2', $result['id'] );
		$this->assertEquals( 'Restored Color', $result['variable']['label'] );
		$this->assertEquals( '#FFFFFF', $result['variable']['value'] );
		$this->assertArrayNotHasKey( 'deleted_at', $result['variable'] );
	}

	public function test_apply_operation__throws_exception_for_invalid_operation_type() {
		// Arrange
		$collection = Variables_Collection::default();
		$operation = [
			'type' => 'invalid_operation',
		];

		// Assert
		$this->expectException( BatchOperationFailed::class );
		$this->expectExceptionMessage( 'Invalid operation type: invalid_operation' );

		// Act
		$this->processor->apply_operation( $collection, $operation );
	}

	public function test_apply_operation__create_throws_duplicated_label() {
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

		$operation = [
			'type' => 'create',
			'variable' => [
				'type' => 'global-color',
				'label' => 'Primary',
				'value' => '#FF0000',
			],
		];

		// Assert
		$this->expectException( DuplicatedLabel::class );

		// Act
		$this->processor->apply_operation( $collection, $operation );
	}

	public function test_apply_operation__create_throws_variables_limit_reached() {
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

		$operation = [
			'type' => 'create',
			'variable' => [
				'type' => 'global-color',
				'label' => 'New Color',
				'value' => '#FF0000',
			],
		];

		// Assert
		$this->expectException( VariablesLimitReached::class );
		$this->expectExceptionMessage( 'Total variables count limit reached' );

		// Act
		$this->processor->apply_operation( $collection, $operation );
	}

	public function test_apply_operation__update_throws_record_not_found() {
		// Arrange
		$collection = Variables_Collection::default();
		$operation = [
			'type' => 'update',
			'id' => 'non-existent-id',
			'variable' => [
				'label' => 'Updated Label',
			],
		];

		// Assert
		$this->expectException( RecordNotFound::class );

		// Act
		$this->processor->apply_operation( $collection, $operation );
	}

	public function test_operation_id__returns_fallback_for_operation_without_id() {
		// Arrange
		$operation = [
			'type' => 'create',
			'variable' => [
				'type' => 'global-color',
				'label' => 'New Color',
				'value' => '#FF0000',
			],
		];

		// Act
		$result = $this->processor->operation_id( $operation, 5 );

		// Assert
		$this->assertEquals( 'operation_5', $result );
	}

}

