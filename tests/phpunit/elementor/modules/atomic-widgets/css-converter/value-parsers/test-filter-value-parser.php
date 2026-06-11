<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\ValueParsers;

use Elementor\Modules\AtomicWidgets\CssConverter\ValueParsers\Filter_Value_Parser;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Filter_Value_Parser extends TestCase {

	public function test_parse__single_blur_emits_one_css_filter_func() {
		// Act.
		$result = Filter_Value_Parser::parse( 'blur(5px)' );

		// Assert.
		$this->assertSame( [ $this->single_func( 'blur', 'blur', 5, 'px' ) ], $result );
	}

	public function test_parse__maps_each_function_name_to_its_arg_group() {
		// Act.
		$result = Filter_Value_Parser::parse( 'brightness(150%) grayscale(50%) hue-rotate(90deg)' );

		// Assert.
		$this->assertSame(
			[
				$this->single_func( 'brightness', 'intensity', 150, '%' ),
				$this->single_func( 'grayscale', 'color-tone', 50, '%' ),
				$this->single_func( 'hue-rotate', 'hue-rotate', 90, 'deg' ),
			],
			$result
		);
	}

	public function test_parse__drop_shadow_with_all_parts() {
		// Act.
		$result = Filter_Value_Parser::parse( 'drop-shadow(2px 4px 6px rgba(0, 0, 0, .5))' );

		// Assert.
		$this->assertSame(
			[ $this->drop_shadow( [ 2, 'px' ], [ 4, 'px' ], [ 6, 'px' ], 'rgba(0, 0, 0, .5)' ) ],
			$result
		);
	}

	public function test_parse__drop_shadow_without_blur_uses_default_blur() {
		// Act.
		$result = Filter_Value_Parser::parse( 'drop-shadow(2px 4px black)' );

		// Assert: blur falls back to the schema default (10px).
		$this->assertSame(
			[ $this->drop_shadow( [ 2, 'px' ], [ 4, 'px' ], [ 10, 'px' ], 'black' ) ],
			$result
		);
	}

	public function test_parse__drop_shadow_offsets_only_uses_default_blur_and_color() {
		// Act.
		$result = Filter_Value_Parser::parse( 'drop-shadow(2px 4px)' );

		// Assert.
		$this->assertSame(
			[ $this->drop_shadow( [ 2, 'px' ], [ 4, 'px' ], [ 10, 'px' ], 'rgba(0, 0, 0, 1)' ) ],
			$result
		);
	}

	/**
	 * @dataProvider declined_values
	 */
	public function test_parse__declines_unrepresentable_value( string $value ) {
		// Act & Assert.
		$this->assertNull( Filter_Value_Parser::parse( $value ) );
	}

	public function declined_values(): array {
		return [
			'unsupported function' => [ 'opacity(50%)' ],
			'unitless intensity' => [ 'brightness(1.5)' ],
			'one bad function among good' => [ 'blur(5px) opacity(50%)' ],
			'missing parens' => [ 'blur 5px' ],
			'unbalanced parens' => [ 'blur(5px' ],
			'drop-shadow too few sizes' => [ 'drop-shadow(2px)' ],
			'drop-shadow too many sizes' => [ 'drop-shadow(1px 2px 3px 4px)' ],
			'drop-shadow two colors' => [ 'drop-shadow(2px 4px black white)' ],
			'keyword none' => [ 'none' ],
			'empty' => [ '   ' ],
		];
	}

	private function single_func( string $name, string $group, $size, string $unit ): array {
		return [
			'$$type' => 'css-filter-func',
			'value' => [
				'func' => [ '$$type' => 'string', 'value' => $name ],
				'args' => [
					'$$type' => $group,
					'value' => [ 'size' => [ '$$type' => 'size', 'value' => [ 'size' => $size, 'unit' => $unit ] ] ],
				],
			],
		];
	}

	private function drop_shadow( array $x, array $y, array $blur, string $color ): array {
		return [
			'$$type' => 'css-filter-func',
			'value' => [
				'func' => [ '$$type' => 'string', 'value' => 'drop-shadow' ],
				'args' => [
					'$$type' => 'drop-shadow',
					'value' => [
						'xAxis' => $this->size( $x[0], $x[1] ),
						'yAxis' => $this->size( $y[0], $y[1] ),
						'blur' => $this->size( $blur[0], $blur[1] ),
						'color' => [ '$$type' => 'color', 'value' => $color ],
					],
				],
			],
		];
	}

	private function size( $size, string $unit ): array {
		return [ '$$type' => 'size', 'value' => [ 'size' => $size, 'unit' => $unit ] ];
	}
}
