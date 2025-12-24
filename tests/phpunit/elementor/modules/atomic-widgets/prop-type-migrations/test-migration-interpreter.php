<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Migration_Interpreter extends Elementor_Test_Base {

	/**
	 * @dataProvider interpret_data_provider
	 */
	public function test_interpret( array $migration, array $data, array $expected ) {
		// Arrange.
		$interpreter = Migration_Interpreter::make();

		// Act.
		$result = $interpreter->interpret( $migration, $data );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function interpret_data_provider(): array {
		return [
			'empty operations returns original data' => [
				'migration' => [ 'operations' => [] ],
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
			'set operation' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.tag', 'value' => 'h1' ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h1' ] ],
			],
			'delete operation' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'delete', 'path' => 'settings.deprecated' ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3', 'deprecated' => 'old' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
			'multiple operations in sequence' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
						],
						[
							'op' => [ 'fn' => 'delete', 'path' => 'settings.link.value.label' ],
						],
					],
				],
				'data' => [
					'settings' => [
						'link' => [
							'value' => [ 'label' => 'Click', 'destination' => 'url' ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [
							'value' => [ 'destination' => 'url', 'tag' => 'a' ],
						],
					],
				],
			],
			'conditional operation passes' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.link.$$type', 'value' => 'link' ],
						],
					],
				],
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [] ],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'tag' => 'a' ] ],
					],
				],
			],
			'conditional operation fails' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.link.$$type', 'value' => 'url' ],
						],
					],
				],
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [] ],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [] ],
					],
				],
			],
			'exists condition' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.processed', 'value' => true ],
							'condition' => [ 'fn' => 'exists', 'path' => 'settings.tag' ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3', 'processed' => true ] ],
			],
			'in condition' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
							'condition' => [ 'fn' => 'in', 'path' => 'settings.tag', 'value' => [ 'h1', 'h2', 'h3' ] ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h2' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h2', 'valid' => true ] ],
			],
			'and condition' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.valid', 'value' => true ],
							'condition' => [
								'fn' => 'and',
								'conditions' => [
									[ 'fn' => 'exists', 'path' => 'settings.tag' ],
									[ 'fn' => 'equals', 'path' => 'settings.type', 'value' => 'heading' ],
								],
							],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3', 'type' => 'heading' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3', 'type' => 'heading', 'valid' => true ] ],
			],
			'or condition' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.isText', 'value' => true ],
							'condition' => [
								'fn' => 'or',
								'conditions' => [
									[ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'string' ],
									[ 'fn' => 'equals', 'path' => 'settings.$$type', 'value' => 'html' ],
								],
							],
						],
					],
				],
				'data' => [ 'settings' => [ '$$type' => 'html' ] ],
				'expected' => [ 'settings' => [ '$$type' => 'html', 'isText' => true ] ],
			],
			'rename key' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.size.value.value', 'key' => 'size' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.size.$$type', 'value' => 'size' ],
						],
					],
				],
				'data' => [
					'settings' => [
						'size' => [
							'$$type' => 'size',
							'value' => [ 'value' => 150, 'unit' => 'px' ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'size' => [
							'$$type' => 'size',
							'value' => [ 'size' => 150, 'unit' => 'px' ],
						],
					],
				],
			],
			'invalid operation function is no-op' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'invalid', 'path' => 'settings.tag', 'value' => 'h1' ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
			'missing path is no-op' => [
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'value' => 'h1' ],
						],
					],
				],
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
		];
	}
}
