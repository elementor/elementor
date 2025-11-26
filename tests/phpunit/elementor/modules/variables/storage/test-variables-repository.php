<?php

namespace Elementor\Modules\Variables\Storage;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\Variables\Storage\Entities\Variable;
use PHPUnit\Framework\TestCase;

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
}


