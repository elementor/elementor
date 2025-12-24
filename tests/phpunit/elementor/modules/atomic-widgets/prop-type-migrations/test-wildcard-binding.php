<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Interpreter;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Wildcard_Binding extends Elementor_Test_Base {

	/**
	 * @dataProvider wildcard_binding_data_provider
	 */
	public function test_wildcard_binding_filters_per_item( array $data, array $migration, array $expected ) {
		// Arrange.
		$interpreter = Migration_Interpreter::make();

		// Act.
		$result = $interpreter->interpret( $migration, $data );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function wildcard_binding_data_provider(): array {
		return [
			'only matching items modified' => [
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'tag' => 'span' ] ],
						'text' => [ '$$type' => 'string', 'value' => 'Hello' ],
					],
				],
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.tag', 'value' => 'a' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'tag' => 'a' ] ],
						'text' => [ '$$type' => 'string', 'value' => 'Hello' ],
					],
				],
			],
			'multiple items match condition' => [
				'data' => [
					'settings' => [
						'link1' => [ '$$type' => 'link', 'value' => [ 'tag' => 'span' ] ],
						'link2' => [ '$$type' => 'link', 'value' => [ 'tag' => 'div' ] ],
						'text' => [ '$$type' => 'string', 'value' => 'Hello' ],
					],
				],
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.tag', 'value' => 'a' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'link1' => [ '$$type' => 'link', 'value' => [ 'tag' => 'a' ] ],
						'link2' => [ '$$type' => 'link', 'value' => [ 'tag' => 'a' ] ],
						'text' => [ '$$type' => 'string', 'value' => 'Hello' ],
					],
				],
			],
			'nested wildcards bind correctly' => [
				'data' => [
					'styles' => [
						's1' => [
							'variants' => [
								[ 'props' => [ 'width' => [ '$$type' => 'size', 'value' => 100 ] ] ],
								[ 'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ] ],
							],
						],
					],
				],
				'migration' => [
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
				],
				'expected' => [
					'styles' => [
						's1' => [
							'variants' => [
								[ 'props' => [ 'width' => [ '$$type' => 'size', 'value' => [ 'size' => 100, 'unit' => 'px' ] ] ] ],
								[ 'props' => [ 'color' => [ '$$type' => 'color', 'value' => 'red' ] ] ],
							],
						],
					],
				],
			],
			'operation without condition applies to all matches' => [
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [] ],
						'text' => [ '$$type' => 'string', 'value' => [] ],
					],
				],
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'settings.*.value.processed', 'value' => true ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'processed' => true ] ],
						'text' => [ '$$type' => 'string', 'value' => [ 'processed' => true ] ],
					],
				],
			],
			'delete with wildcard binding' => [
				'data' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'label' => 'Click', 'tag' => 'a' ] ],
						'text' => [ '$$type' => 'string', 'value' => [ 'label' => 'Text', 'content' => 'Hello' ] ],
					],
				],
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'delete', 'path' => 'settings.*.value.label' ],
							'condition' => [ 'fn' => 'equals', 'path' => 'settings.*.$$type', 'value' => 'link' ],
						],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [ '$$type' => 'link', 'value' => [ 'tag' => 'a' ] ],
						'text' => [ '$$type' => 'string', 'value' => [ 'label' => 'Text', 'content' => 'Hello' ] ],
					],
				],
			],
			'array index wildcard binding' => [
				'data' => [
					'elements' => [
						[ 'id' => '1', 'type' => 'widget', 'settings' => [ 'active' => false ] ],
						[ 'id' => '2', 'type' => 'container', 'settings' => [ 'active' => false ] ],
						[ 'id' => '3', 'type' => 'widget', 'settings' => [ 'active' => false ] ],
					],
				],
				'migration' => [
					'operations' => [
						[
							'op' => [ 'fn' => 'set', 'path' => 'elements[*].settings.active', 'value' => true ],
							'condition' => [ 'fn' => 'equals', 'path' => 'elements[*].type', 'value' => 'widget' ],
						],
					],
				],
				'expected' => [
					'elements' => [
						[ 'id' => '1', 'type' => 'widget', 'settings' => [ 'active' => true ] ],
						[ 'id' => '2', 'type' => 'container', 'settings' => [ 'active' => false ] ],
						[ 'id' => '3', 'type' => 'widget', 'settings' => [ 'active' => true ] ],
					],
				],
			],
		];
	}
}
