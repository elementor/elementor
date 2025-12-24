<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations\Operations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations\Set_Operation;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Set_Operation extends Elementor_Test_Base {

	/**
	 * @dataProvider execute_data_provider
	 */
	public function test_execute( array $data, string $path, array $config, array $expected ) {
		// Arrange.
		$operation = new Set_Operation();
		$context = Migration_Context::make()->set_element_data( $data );

		// Act.
		$operation->execute( $data, $path, $config, $context );

		// Assert.
		$this->assertSame( $expected, $data );
	}

	public function execute_data_provider(): array {
		return [
			'set value at path' => [
				'data' => [ 'settings' => [ 'tag' => 'span' ] ],
				'path' => 'settings.tag',
				'config' => [ 'fn' => 'set', 'path' => 'settings.tag', 'value' => 'a' ],
				'expected' => [ 'settings' => [ 'tag' => 'a' ] ],
			],
			'set creates new key' => [
				'data' => [ 'settings' => [ 'tag' => 'span' ] ],
				'path' => 'settings.newKey',
				'config' => [ 'fn' => 'set', 'path' => 'settings.newKey', 'value' => 'newValue' ],
				'expected' => [ 'settings' => [ 'tag' => 'span', 'newKey' => 'newValue' ] ],
			],
			'rename key only' => [
				'data' => [ 'settings' => [ 'tag' => 'span' ] ],
				'path' => 'settings.tag',
				'config' => [ 'fn' => 'set', 'path' => 'settings.tag', 'key' => 'htmlTag' ],
				'expected' => [ 'settings' => [ 'htmlTag' => 'span' ] ],
			],
			'rename key and set value' => [
				'data' => [ 'settings' => [ 'tag' => 'span' ] ],
				'path' => 'settings.tag',
				'config' => [ 'fn' => 'set', 'path' => 'settings.tag', 'key' => 'htmlTag', 'value' => 'a' ],
				'expected' => [ 'settings' => [ 'htmlTag' => 'a' ] ],
			],
			'set with $$current reference' => [
				'data' => [ 'settings' => [ 'size' => 150 ] ],
				'path' => 'settings.size',
				'config' => [
					'fn' => 'set',
					'path' => 'settings.size',
					'value' => [ 'size' => '$$current', 'unit' => 'px' ],
				],
				'expected' => [ 'settings' => [ 'size' => [ 'size' => 150, 'unit' => 'px' ] ] ],
			],
			'set with $$current.field reference' => [
				'data' => [ 'settings' => [ 'link' => [ '$$type' => 'number', 'value' => 123 ] ] ],
				'path' => 'settings.link',
				'config' => [
					'fn' => 'set',
					'path' => 'settings.link',
					'value' => [
						'$$type' => 'query',
						'value' => [ 'id' => '$$current.value', 'type' => 'post' ],
					],
				],
				'expected' => [
					'settings' => [
						'link' => [
							'$$type' => 'query',
							'value' => [ 'id' => 123, 'type' => 'post' ],
						],
					],
				],
			],
			'set nested value' => [
				'data' => [
					'settings' => [
						'link' => [
							'$$type' => 'link',
							'value' => [ 'destination' => 'url' ],
						],
					],
				],
				'path' => 'settings.link.value.tag',
				'config' => [ 'fn' => 'set', 'path' => 'settings.link.value.tag', 'value' => 'a' ],
				'expected' => [
					'settings' => [
						'link' => [
							'$$type' => 'link',
							'value' => [ 'destination' => 'url', 'tag' => 'a' ],
						],
					],
				],
			],
		];
	}

	public function test_get_name() {
		$this->assertSame( 'set', Set_Operation::get_name() );
	}
}
