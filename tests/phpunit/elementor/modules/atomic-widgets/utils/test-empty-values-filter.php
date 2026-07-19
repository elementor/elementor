<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Utils;

use Elementor\Modules\AtomicWidgets\Utils\Empty_Values_Filter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Empty_Values_Filter extends TestCase {

	/**
	 * @dataProvider filter_empty_values_provider
	 */
	public function test_filter( $value, $expected ) {
		// Act.
		$result = Empty_Values_Filter::filter( $value );

		// Assert.
		$this->assertSame( $expected, $result );
	}

	public function filter_empty_values_provider(): array {
		return [
			'empty string' => [ '', null ],
			'null' => [ null, null ],
			'object with only empty values' => [
				[
					'a' => null,
					'b' => '',
				],
				null,
			],
			'array with only empty values' => [
				[ null, '', null ],
				null,
			],
			'nested object with only empty values' => [
				[
					'a' => [
						'b' => null,
					],
					'c' => null,
				],
				null,
			],
			'nested array with only empty values' => [
				[ [ null ], [ null, '' ], null, '', null ],
				null,
			],
			'array of objects with only empty values' => [
				[
					[ 'a' => null ],
					[ 'b' => null, 'c' => '' ],
				],
				null,
			],
			'deeply nested empty object' => [
				[
					'a' => [
						'b' => [
							[ 'c' => null ],
							[ 'd' => null, 'e' => '' ],
						],
					],
				],
				null,
			],
			'empty transformable prop' => [
				[
					'$$type' => 'test-type',
					'value' => [
						'a' => [
							'b' => [
								[ 'c' => null ],
								[ 'd' => null, 'e' => '' ],
							],
						],
					],
				],
				null,
			],
			'non-empty string' => [ 'a', 'a' ],
			'zero is preserved' => [ 0, 0 ],
			'false is preserved' => [ false, false ],
			'object with mixed empty and meaningful values' => [
				[
					'a' => 0,
					'b' => false,
					'c' => null,
					'd' => null,
					'e' => '',
					'f' => 'a',
				],
				[
					'a' => 0,
					'b' => false,
					'f' => 'a',
				],
			],
			'array with mixed empty and meaningful values' => [
				[
					0,
					false,
					null,
					null,
					'',
					'a',
					[ 'a' => null ],
					[ 'b' => null, 'c' => true ],
				],
				[
					0,
					false,
					'a',
					[ 'c' => true ],
				],
			],
			'nested structure cleanup' => [
				[
					'a' => [ 0, false, null, null, '', 'a' ],
					'b' => [ null, null, '' ],
					'c' => [ 'd' => null ],
					'e' => [
						[ 'f' => null, 'g' => true ],
						[ 'h' => null, 'i' => '' ],
					],
				],
				[
					'a' => [ 0, false, 'a' ],
					'e' => [
						[ 'g' => true ],
					],
				],
			],
			'transformable prop with nested cleanup' => [
				[
					'$$type' => 'test-type',
					'value' => [
						'a' => [ 0, false, null, null, '', 'a' ],
						'b' => [ null, null, '' ],
						'c' => [ 'd' => null ],
						'e' => [
							[ 'f' => null, 'g' => true ],
							[ 'h' => null, 'i' => '' ],
						],
					],
				],
				[
					'$$type' => 'test-type',
					'value' => [
						'a' => [ 0, false, 'a' ],
						'e' => [
							[ 'g' => true ],
						],
					],
				],
			],
		];
	}
}
