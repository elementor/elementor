<?php

use Elementor\Modules\DataFlow\State_Formatter;
use PHPUnit\Framework\TestCase;

/**
 * @group Elementor\Modules
 * @group Elementor\Modules\DataFlow
 */
class Test_State_Formatter extends TestCase {

	/**
	 * @dataProvider format_cases
	 */
	public function test_format( $value, string $format, string $prefix, string $suffix, string $expected ) {
		// Act
		$result = State_Formatter::format( $value, $format, $prefix, $suffix );

		// Assert
		$this->assertSame( $expected, $result );
	}

	public function format_cases(): array {
		return [
			'raw string' => [ 'hello', 'raw', '', '', 'hello' ],
			'raw number' => [ 12.5, 'raw', '', '', '12.5' ],
			'null is empty' => [ null, 'raw', '$', '/mo', '' ],
			'bool true' => [ true, 'raw', '', '', 'true' ],
			'array is json' => [ [ 1, 2 ], 'raw', '', '', '[1,2]' ],
			'number groups thousands' => [ 1234567.891, 'number', '', '', '1,234,567.89' ],
			'number drops trailing zeros' => [ 1200.5, 'number', '', '', '1,200.5' ],
			'number of whole value' => [ 1920, 'number', '', '', '1,920' ],
			'number of non numeric' => [ 'abc', 'number', '', '', 'abc' ],
			'percent' => [ 0.256, 'percent', '', '', '25.6%' ],
			'prefix and suffix' => [ 1920, 'number', '$', ' total', '$1,920 total' ],
			'unknown format falls back to raw' => [ 5, 'weird', '', '', '5' ],
		];
	}
}
