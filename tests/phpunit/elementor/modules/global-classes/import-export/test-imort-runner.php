<?php

namespace Elementor\Testing\Modules\GlobalClasses\ImportExport;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\GlobalClasses\ImportExport\Import_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class ç extends Elementor_Test_Base {

	public function test_import() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'extracted_directory_path' => __DIR__ . '/mocks/valid',
		], [] );

		// Assert.
		$sanitized_items = [
			'g-123' => [
				'id' => 'g-123',
				'type' => 'class',
				'label' => 'Test1',
				'variants' => [
					[
						'meta' => [
							'breakpoint' => 'desktop',
							'state' => null,
						],
						'props' => [
							'background' => [
								'$$type' => 'background',
								'value' => [
									'color' => [
										'$$type' => 'color',
										'value' => '',
									],
								],
							],
							'display' => [
								'$$type' => 'string',
								'value' => 'block',
							],
						],
					],
				],
			],
			'g-456' => [
				'id' => 'g-456',
				'type' => 'class',
				'label' => 'Test2',
				"variants" => [],
			],
		];

		$sanitized_order = [ 'g-123', 'g-456' ];

		$sanitized_global_classes = [
			'items' => $sanitized_items,
			'order' => $sanitized_order,
		];

		$this->assertSame( $sanitized_global_classes, $result );
		$this->assertSame( $sanitized_global_classes, Global_Classes_Repository::make()->all()->get() );
	}

	public function test_import__invalid_style() {
		// Act.
		$result = ( new Import_Runner() )->import( [
			'extracted_directory_path' => __DIR__ . '/mocks/invalid',
		], [] );

		// Assert.
		$saved_global_classes = Plugin::$instance->kits_manager->get_active_kit()->get_json_meta( Global_Classes_Repository::META_KEY_FRONTEND );

		$this->assertSame( [], $result );
		$this->assertSame( [], $saved_global_classes );
	}
}
