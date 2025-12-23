<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypeMigrations;

use Elementor\Modules\AtomicWidgets\PropTypeMigrations\Value_Resolver;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Value_Resolver extends Elementor_Test_Base {

	/**
	 * @dataProvider resolve_data_provider
	 */
	public function test_resolve( $current_value, $value_definition, $expected ) {
		// Arrange.
		$resolver = Value_Resolver::make( $current_value );

		// Act.
		$result = $resolver->resolve( $value_definition );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function resolve_data_provider(): array {
		return [
			'plain string' => [
				'current' => 'old',
				'definition' => 'new',
				'expected' => 'new',
			],
			'$$current reference' => [
				'current' => 'current_value',
				'definition' => '$$current',
				'expected' => 'current_value',
			],
			'$$current with number' => [
				'current' => 150,
				'definition' => '$$current',
				'expected' => 150,
			],
			'$$current.field reference' => [
				'current' => [ 'value' => 123, 'type' => 'post' ],
				'definition' => '$$current.value',
				'expected' => 123,
			],
			'$$current.nested.field' => [
				'current' => [ 'deep' => [ 'nested' => 'found' ] ],
				'definition' => '$$current.deep.nested',
				'expected' => 'found',
			],
			'$$current on non-array returns null' => [
				'current' => 'string',
				'definition' => '$$current.field',
				'expected' => null,
			],
			'array with $$current' => [
				'current' => 150,
				'definition' => [ 'size' => '$$current', 'unit' => 'px' ],
				'expected' => [ 'size' => 150, 'unit' => 'px' ],
			],
			'nested array with $$current.field' => [
				'current' => [ 'value' => 123 ],
				'definition' => [
					'$$type' => 'query',
					'value' => [ 'id' => '$$current.value', 'type' => 'post' ],
				],
				'expected' => [
					'$$type' => 'query',
					'value' => [ 'id' => 123, 'type' => 'post' ],
				],
			],
			'non-reference value passes through' => [
				'current' => 'anything',
				'definition' => [ 'static' => 'value' ],
				'expected' => [ 'static' => 'value' ],
			],
		];
	}

	/**
	 * @dataProvider is_reference_data_provider
	 */
	public function test_is_reference( $value, bool $expected ) {
		// Act.
		$result = Value_Resolver::is_reference( $value );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function is_reference_data_provider(): array {
		return [
			'$$current is reference' => [
				'value' => '$$current',
				'expected' => true,
			],
			'$$current.field is reference' => [
				'value' => '$$current.field',
				'expected' => true,
			],
			'array with $$current is reference' => [
				'value' => [ 'size' => '$$current', 'unit' => 'px' ],
				'expected' => true,
			],
			'plain string is not reference' => [
				'value' => 'plain',
				'expected' => false,
			],
			'array without reference' => [
				'value' => [ 'static' => 'value' ],
				'expected' => false,
			],
			'number is not reference' => [
				'value' => 123,
				'expected' => false,
			],
		];
	}
}
