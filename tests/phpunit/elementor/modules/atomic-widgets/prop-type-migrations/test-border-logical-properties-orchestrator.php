<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migrations_Orchestrator;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group prop-type-migrations
 */
class Test_Border_Logical_Properties_Orchestrator extends Elementor_Test_Base {

	public static function setUpBeforeClass(): void {
		parent::setUpBeforeClass();
		Migrations_Orchestrator::destroy();
	}

	public function setUp(): void {
		parent::setUp();
		Migrations_Orchestrator::clear_migration_cache();
		Migrations_Orchestrator::destroy();
	}

	public function tearDown(): void {
		Migrations_Orchestrator::destroy();
		parent::tearDown();
	}

	public function test_migrate__global_classes_border_radius_physical_keys_are_converted() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'type' => 'class',
					'label' => 'Rounded',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'border-radius' => [
									'$$type' => 'border-radius',
									'value' => [
										'top-left' => $this->make_size( 10 ),
										'top-right' => $this->make_size( 20 ),
									],
								],
							],
						],
					],
				],
			],
			'order' => [ 'gc_1' ],
		];

		$save_callback_called = false;
		$save_callback = function () use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act
		$orchestrator->migrate( $global_classes_data, 2001, 'test_border_radius_migration', $save_callback );

		// Assert
		$this->assertTrue( $save_callback_called );
		$border_radius = $global_classes_data['items'][0]['variants'][0]['props']['border-radius'];
		$this->assertSame( 'border-radius-v2', $border_radius['$$type'] );
		$this->assertSame( 10, $border_radius['value']['start-start']['value']['size'] );
		$this->assertSame( 20, $border_radius['value']['start-end']['value']['size'] );
		$this->assertArrayNotHasKey( 'top-left', $border_radius['value'] );
	}

	public function test_migrate__global_classes_border_width_physical_keys_are_converted() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'type' => 'class',
					'label' => 'Bordered',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'border-width' => [
									'$$type' => 'border-width',
									'value' => [
										'top' => $this->make_size( 1 ),
										'left' => $this->make_size( 4 ),
									],
								],
							],
						],
					],
				],
			],
			'order' => [ 'gc_1' ],
		];

		$save_callback_called = false;
		$save_callback = function () use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act
		$orchestrator->migrate( $global_classes_data, 2002, 'test_border_width_migration', $save_callback );

		// Assert
		$this->assertTrue( $save_callback_called );
		$border_width = $global_classes_data['items'][0]['variants'][0]['props']['border-width'];
		$this->assertSame( 'border-width-v2', $border_width['$$type'] );
		$this->assertSame( 1, $border_width['value']['block-start']['value']['size'] );
		$this->assertSame( 4, $border_width['value']['inline-start']['value']['size'] );
		$this->assertArrayNotHasKey( 'top', $border_width['value'] );
	}

	public function test_migrate__logical_border_radius_is_unchanged() {
		// Arrange
		$orchestrator = Migrations_Orchestrator::make( dirname( __DIR__, 6 ) . '/migrations/' );
		$global_classes_data = [
			'items' => [
				[
					'id' => 'gc_1',
					'type' => 'class',
					'label' => 'Already Logical',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'border-radius' => [
									'$$type' => 'border-radius-v2',
									'value' => [
										'start-start' => $this->make_size( 5 ),
									],
								],
							],
						],
					],
				],
			],
			'order' => [ 'gc_1' ],
		];

		$save_callback_called = false;
		$save_callback = function () use ( &$save_callback_called ) {
			$save_callback_called = true;
		};

		// Act
		$orchestrator->migrate( $global_classes_data, 2003, 'test_border_radius_noop', $save_callback );

		// Assert
		$this->assertFalse( $save_callback_called );
	}

	private function make_size( int $size ): array {
		return [
			'$$type' => 'size',
			'value' => [
				'size' => $size,
				'unit' => 'px',
			],
		];
	}
}
