<?php

namespace Elementor\Modules\Variables\Services;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use Elementor\Modules\Variables\Storage\Exceptions\DuplicatedLabel;
use Elementor\Modules\Variables\Storage\Exceptions\FatalError;
use Elementor\Modules\Variables\Storage\Exceptions\RecordNotFound;
use Elementor\Modules\Variables\Storage\Exceptions\VariablesLimitReached;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use PHPUnit\Framework\TestCase;

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

		$this->kit = $this->createMock( Kit::class );
		$this->repository = $this->createMock( Variables_Repository::class );
		$this->service = new Variables_Service( $this->repository );
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

	public function test_create__successfully_creates_variable() {
		// Arrange
		$data = [
			'type' => 'color',
			'label' => 'Primary Color',
			'value' => '#000000',
			'order' => 1,
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
}

