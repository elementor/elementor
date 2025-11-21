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

		$this->repository->method( 'load' )->willReturn( Variables_Collection::empty_variables() );
		$this->repository->method( 'next_id' )->willReturn( 'id-123' );
		$this->repository->method( 'save' )->willReturn( 0 );

		// Act
		$result = $this->service->create( $data );

		// Assert
		$this->assertIsArray( $result );
		$this->assertEquals( 'id-123', $result['variable']['id'] );
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
		$this->repository->method( 'next_id' )->willReturn( 'id-123' );
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
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 2 );

		// Act
		$result = $this->service->update( 'id-2', $data );

		// Assert
		$this->assertEquals( 'id-2', $result['variable']['id'] );
		$this->assertEquals( 'Updated Color', $result['variable']['label'] );
		$this->assertEquals( '#FFFFFF', $result['variable']['value'] );
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

	public function test_update_updates_order() {
		// Arrange
		$collection = $this->mock_collection();
		$data = [
			'order' => 10,
		];

		$this->repository->method( 'load' )->willReturn( $collection );
		$this->repository->method( 'save' )->willReturn( 2 );

		// Act
		$result = $this->service->update( 'id-2', $data );

		// Assert
		$this->assertEquals( 10, $result['variable']['order'] );
	}
}

