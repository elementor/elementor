<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExportCustomization;

use Elementor\Modules\GlobalClasses\Global_Classes_Order;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners\Export as Export_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Export_Runner extends Elementor_Test_Base {

	public function setUp(): void {
		parent::setUp();

		$kit = Plugin::$instance->kits_manager->get_active_kit();

		if ( $kit ) {
			clean_post_cache( $kit->get_id() );
			Global_Classes_Order::make( $kit )->set_order( [] );
		}
	}

	public function test_export() {
		// Arrange.
		$items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Test',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'color' => [
								'$$type' => 'color',
								'value' => '<script>alert(1)</script>',
							],
							'padding' => [
								'$$type' => 'size',
								'value' => [
									'size' => 10,
									'unit' => 'px',
								],
							],
						],
					],
				],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'test-2',
				'variants' => [],
			],
		];

		$order = [ 'g-123', 'g-456', 123, null, 'g-123' ];

		Global_Classes_Repository::make()->put( $items, $order );

		// Act.
		$result = ( new Export_Runner() )->export( [] );

		// Assert.
		$expected_g_123 = [
			'id' => 'g-123',
			'type' => 'class',
			'label' => 'Test',
			'variants' => [
				[
					'meta' => [
						'breakpoint' => 'desktop',
						'state' => null,
					],
					'props' => [
						'color' => [
							'$$type' => 'color',
							'value' => '',
						],
						'padding' => [
							'$$type' => 'size',
							'value' => [
								'size' => 10,
								'unit' => 'px',
							],
						],
					],
					'custom_css' => null,
				],
			],
		];

		$expected_g_456 = [
			'id' => 'g-456',
			'type' => 'class',
			'label' => 'test-2',
			'variants' => [],
		];

		$expected_order = [
			[ 'id' => 'g-123', 'label' => 'Test' ],
			[ 'id' => 'g-456', 'label' => 'test-2' ],
		];

		$this->assertSame( [], $result['manifest'] );
		$this->assertCount( 3, $result['files'] );

		$files_by_path = $this->index_files_by_path( $result['files'] );

		$this->assertEqualsCanonicalizing(
			[
				'global-classes/g-123.json',
				'global-classes/g-456.json',
				'global-classes/order.json',
			],
			array_keys( $files_by_path )
		);

		$this->assertEquals( $expected_g_123, json_decode( $files_by_path['global-classes/g-123.json'], true ) );
		$this->assertEquals( $expected_g_456, json_decode( $files_by_path['global-classes/g-456.json'], true ) );
		$this->assertEquals( $expected_order, json_decode( $files_by_path['global-classes/order.json'], true ) );
	}

	public function test_export__invalid_style_is_dropped() {
		// Arrange.
		$items = [
			'g-valid' => [
				'id' => 'g-valid',
				'type' => 'class',
				'label' => 'Valid',
				'variants' => [],
			],
			'g-invalid' => [
				'id' => 'g-invalid',
				'label' => 'invalid-export-style',
				'type' => '__not_a_valid_style_type__',
				'variants' => [],
			],
		];

		$order = [ 'g-valid', 'g-invalid' ];

		Global_Classes_Repository::make()->put( $items, $order );

		// Act.
		$result = ( new Export_Runner() )->export( [] );

		// Assert.
		$files_by_path = $this->index_files_by_path( $result['files'] );

		$this->assertArrayHasKey( 'global-classes/g-valid.json', $files_by_path );
		$this->assertArrayNotHasKey( 'global-classes/g-invalid.json', $files_by_path );

		$this->assertEquals(
			[ [ 'id' => 'g-valid', 'label' => 'Valid' ] ],
			json_decode( $files_by_path['global-classes/order.json'], true )
		);
	}

	public function test_export__no_classes() {
		// Arrange.
		Global_Classes_Repository::make()->put( [], [] );

		// Act.
		$result = ( new Export_Runner() )->export( [] );

		// Assert.
		$this->assertSame( [
			'manifest' => [],
			'files' => [],
		], $result );
	}

	private function index_files_by_path( array $files ): array {
		$indexed = [];

		foreach ( $files as $file ) {
			$indexed[ $file['path'] ] = $file['data'];
		}

		return $indexed;
	}
}
