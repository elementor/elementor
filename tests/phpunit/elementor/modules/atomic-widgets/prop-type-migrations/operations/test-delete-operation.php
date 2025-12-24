<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations\Operations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Migration_Context;
use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Operations\Delete_Operation;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Delete_Operation extends Elementor_Test_Base {

	/**
	 * @dataProvider execute_data_provider
	 */
	public function test_execute( array $data, string $path, array $expected ) {
		// Arrange.
		$operation = new Delete_Operation();
		$context = Migration_Context::make()->set_element_data( $data );

		// Act.
		$operation->execute( $data, $path, [ 'fn' => 'delete', 'path' => $path ], $context );

		// Assert.
		$this->assertSame( $expected, $data );
	}

	public function execute_data_provider(): array {
		return [
			'delete existing key' => [
				'data' => [ 'settings' => [ 'tag' => 'h3', 'label' => 'test' ] ],
				'path' => 'settings.label',
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
			'delete nested key' => [
				'data' => [
					'settings' => [
						'link' => [
							'value' => [ 'label' => 'Click', 'tag' => 'a' ],
						],
					],
				],
				'path' => 'settings.link.value.label',
				'expected' => [
					'settings' => [
						'link' => [
							'value' => [ 'tag' => 'a' ],
						],
					],
				],
			],
			'delete non-existent key is no-op' => [
				'data' => [ 'settings' => [ 'tag' => 'h3' ] ],
				'path' => 'settings.nonexistent',
				'expected' => [ 'settings' => [ 'tag' => 'h3' ] ],
			],
			'delete entire object' => [
				'data' => [ 'settings' => [ 'link' => [ 'value' => 'test' ] ] ],
				'path' => 'settings.link',
				'expected' => [ 'settings' => [] ],
			],
		];
	}

	public function test_get_name() {
		$this->assertSame( 'delete', Delete_Operation::get_name() );
	}
}
