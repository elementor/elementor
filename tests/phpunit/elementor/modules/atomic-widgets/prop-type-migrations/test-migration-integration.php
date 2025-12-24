<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Migration_Integration extends Elementor_Test_Base {

	public function test_complex_widget_migration() {
		// Arrange - Complex widget data similar to real schema
		$element_data = [
			'id' => 'e8e6b3c',
			'elType' => 'widget',
			'settings' => [
				'classes' => [
					'$$type' => 'classes',
					'value' => [ 'e-e8e6b3c-df3a6c5' ],
				],
				'tag' => [
					'$$type' => 'string',
					'value' => 'h3',
				],
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'query',
							'value' => [
								'id' => [
									'$$type' => 'number',
									'value' => 105,
								],
								'label' => [
									'$$type' => 'string',
									'value' => 'Playwright Test Page #105',
								],
							],
						],
						'isTargetBlank' => [
							'$$type' => 'boolean',
							'value' => true,
						],
					],
				],
			],
			'widgetType' => 'e-heading',
			'styles' => [
				'e-e8e6b3c-df3a6c5' => [
					'id' => 'e-e8e6b3c-df3a6c5',
					'label' => 'local',
					'type' => 'class',
					'variants' => [
						[
							'meta' => [
								'breakpoint' => 'desktop',
								'state' => null,
							],
							'props' => [
								'width' => [
									'$$type' => 'size',
									'value' => [
										'size' => 150,
										'unit' => 'px',
									],
								],
								'color' => [
									'$$type' => 'color',
									'value' => '#bb0a0a',
								],
								'background' => [
									'$$type' => 'background',
									'value' => [
										'color' => [
											'$$type' => 'color',
											'value' => '#8aaccb',
										],
									],
								],
							],
							'custom_css' => null,
						],
					],
				],
			],
		];

		$migration = [
			'id' => 'migration-3.32.0-to-3.33.0',
			'from_version' => '3.32.0',
			'to_version' => '3.33.0',
			'operations' => [
				// Add tag field to link
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.link.$$type', 'value' => 'link' ],
				],
				// Add background-type to background props
				[
					'op' => [ 'fn' => 'set', 'path' => 'styles.*.variants[*].props.background.value.background-type', 'value' => 'classic' ],
					'condition' => [ 'fn' => 'exists', 'path' => 'styles.*.variants[*].props.background' ],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert - Link has tag added
		$this->assertSame( 'a', $result['settings']['link']['value']['tag'] );

		// Assert - Background has background-type added
		$this->assertSame(
			'classic',
			$result['styles']['e-e8e6b3c-df3a6c5']['variants'][0]['props']['background']['value']['background-type']
		);

		// Assert - Original data is preserved
		$this->assertSame( 'e8e6b3c', $result['id'] );
		$this->assertSame( 'h3', $result['settings']['tag']['value'] );
		$this->assertSame( 150, $result['styles']['e-e8e6b3c-df3a6c5']['variants'][0]['props']['width']['value']['size'] );
	}

	public function test_transform_migration_with_current_reference() {
		// Arrange - Element with primitive size values that need wrapping
		$element_data = [
			'styles' => [
				's-abc123' => [
					'variants' => [
						[
							'props' => [
								'width' => [
									'$$type' => 'size',
									'value' => 150,
								],
								'height' => [
									'$$type' => 'size',
									'value' => 100,
								],
								'color' => [
									'$$type' => 'color',
									'value' => '#ff0000',
								],
							],
						],
					],
				],
			],
		];

		$migration = [
			'operations' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'styles.*.variants[*].props.*.value',
						'value' => [ 'size' => '$$current', 'unit' => 'px' ],
					],
					'condition' => [
						'fn' => 'and',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'styles.*.variants[*].props.*.$$type', 'value' => 'size' ],
							[ 'fn' => 'is_primitive', 'path' => 'styles.*.variants[*].props.*.value' ],
						],
					],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert - Size values are wrapped
		$this->assertSame(
			[ 'size' => 150, 'unit' => 'px' ],
			$result['styles']['s-abc123']['variants'][0]['props']['width']['value']
		);
		$this->assertSame(
			[ 'size' => 100, 'unit' => 'px' ],
			$result['styles']['s-abc123']['variants'][0]['props']['height']['value']
		);

		// Assert - Color is unchanged (not a size type)
		$this->assertSame(
			'#ff0000',
			$result['styles']['s-abc123']['variants'][0]['props']['color']['value']
		);
	}

	public function test_link_evolution_migration() {
		// Arrange - Old link format with number destination
		$element_data = [
			'settings' => [
				'link' => [
					'$$type' => 'link',
					'value' => [
						'destination' => [
							'$$type' => 'number',
							'value' => 123,
						],
						'label' => 'Click here',
						'isTargetBlank' => true,
					],
				],
			],
		];

		$migration = [
			'operations' => [
				// Transform number destination to query type
				[
					'op' => [
						'fn' => 'set',
						'path' => 'settings.link.value.destination',
						'value' => [
							'$$type' => 'query',
							'value' => [
								'id' => '$$current.value',
								'type' => 'post',
							],
						],
					],
					'condition' => [
						'fn' => 'equals',
						'path' => 'settings.link.value.destination.$$type',
						'value' => 'number',
					],
				],
				// Delete deprecated label field
				[
					'op' => [ 'fn' => 'delete', 'path' => 'settings.link.value.label' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.link.$$type', 'value' => 'link' ],
				],
				// Add tag field
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.link.$$type', 'value' => 'link' ],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert - Destination transformed
		$this->assertSame( 'query', $result['settings']['link']['value']['destination']['$$type'] );
		$this->assertSame( 123, $result['settings']['link']['value']['destination']['value']['id'] );
		$this->assertSame( 'post', $result['settings']['link']['value']['destination']['value']['type'] );

		// Assert - Label deleted
		$this->assertArrayNotHasKey( 'label', $result['settings']['link']['value'] );

		// Assert - Tag added
		$this->assertSame( 'a', $result['settings']['link']['value']['tag'] );

		// Assert - isTargetBlank preserved
		$this->assertTrue( $result['settings']['link']['value']['isTargetBlank'] );
	}

	public function test_multiple_styles_and_variants_migration() {
		// Arrange - Element with multiple styles and variants
		$element_data = [
			'styles' => [
				'style-1' => [
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => [
								'width' => [ '$$type' => 'size', 'value' => 100 ],
							],
						],
						[
							'meta' => [ 'breakpoint' => 'mobile', 'state' => null ],
							'props' => [
								'width' => [ '$$type' => 'size', 'value' => 50 ],
							],
						],
					],
				],
				'style-2' => [
					'variants' => [
						[
							'meta' => [ 'breakpoint' => 'desktop', 'state' => null ],
							'props' => [
								'height' => [ '$$type' => 'size', 'value' => 200 ],
							],
						],
					],
				],
			],
		];

		$migration = [
			'operations' => [
				[
					'op' => [
						'fn' => 'set',
						'path' => 'styles.*.variants[*].props.*.value',
						'value' => [ 'size' => '$$current', 'unit' => 'px' ],
					],
					'condition' => [
						'fn' => 'and',
						'conditions' => [
							[ 'fn' => 'equals', 'path' => 'styles.*.variants[*].props.*.$$type', 'value' => 'size' ],
							[ 'fn' => 'is_primitive', 'path' => 'styles.*.variants[*].props.*.value' ],
						],
					],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert - All size values wrapped across all styles and variants
		$this->assertSame(
			[ 'size' => 100, 'unit' => 'px' ],
			$result['styles']['style-1']['variants'][0]['props']['width']['value']
		);
		$this->assertSame(
			[ 'size' => 50, 'unit' => 'px' ],
			$result['styles']['style-1']['variants'][1]['props']['width']['value']
		);
		$this->assertSame(
			[ 'size' => 200, 'unit' => 'px' ],
			$result['styles']['style-2']['variants'][0]['props']['height']['value']
		);
	}

	public function test_rename_field_migration() {
		// Arrange - Old format with 'value' field that should be 'size'
		$element_data = [
			'settings' => [
				'dimension' => [
					'$$type' => 'size',
					'value' => [
						'value' => 150,
						'unit' => 'px',
					],
				],
			],
		];

		$migration = [
			'operations' => [
				[
					'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.value', 'key' => 'size' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'size' ],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert - Field renamed from 'value' to 'size'
		$this->assertArrayNotHasKey( 'value', $result['settings']['dimension']['value'] );
		$this->assertSame( 150, $result['settings']['dimension']['value']['size'] );
		$this->assertSame( 'px', $result['settings']['dimension']['value']['unit'] );
	}

	public function test_enum_value_mapping() {
		// Arrange - Old unit values that need mapping
		$element_data = [
			'styles' => [
				's1' => [
					'variants' => [
						[
							'props' => [
								'width' => [
									'$$type' => 'size',
									'value' => [ 'size' => 100, 'unit' => 'pixels' ],
								],
								'height' => [
									'$$type' => 'size',
									'value' => [ 'size' => 50, 'unit' => 'percent' ],
								],
								'margin' => [
									'$$type' => 'size',
									'value' => [ 'size' => 10, 'unit' => 'px' ],
								],
							],
						],
					],
				],
			],
		];

		$migration = [
			'operations' => [
				// Map 'pixels' to 'px'
				[
					'op' => [ 'fn' => 'set', 'path' => 'styles.*.variants[*].props.*.value.unit', 'value' => 'px' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'styles.*.variants[*].props.*.value.unit', 'value' => 'pixels' ],
				],
				// Map 'percent' to '%'
				[
					'op' => [ 'fn' => 'set', 'path' => 'styles.*.variants[*].props.*.value.unit', 'value' => '%' ],
					'condition' => [ 'fn' => 'equals', 'path' => 'styles.*.variants[*].props.*.value.unit', 'value' => 'percent' ],
				],
			],
		];

		$interpreter = Migration_Interpreter::make();

		// Act
		$result = $interpreter->interpret( $migration, $element_data );

		// Assert
		$this->assertSame( 'px', $result['styles']['s1']['variants'][0]['props']['width']['value']['unit'] );
		$this->assertSame( '%', $result['styles']['s1']['variants'][0]['props']['height']['value']['unit'] );
		$this->assertSame( 'px', $result['styles']['s1']['variants'][0]['props']['margin']['value']['unit'] );
	}
}
