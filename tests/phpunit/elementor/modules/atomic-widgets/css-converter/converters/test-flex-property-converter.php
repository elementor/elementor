<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Flex_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Flex_Property_Converter extends TestCase {
	private Flex_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Flex_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	public function test_convert__none_keyword_maps_to_0_1_auto() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'none' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 0, 1, 'auto', 'custom' );
	}

	public function test_convert__auto_keyword_maps_to_1_1_auto() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'auto' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 1, 1, 'auto', 'custom' );
	}

	public function test_convert__single_number_sets_grow_with_defaults() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '2' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 2.0, 1.0, 0, 'px' );
	}

	public function test_convert__two_tokens_grow_and_basis() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '1 100px' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 1.0, 1.0, 100.0, 'px' );
	}

	public function test_convert__three_tokens_grow_shrink_basis() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '2 3 50%' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 2.0, 3.0, 50.0, '%' );
	}

	public function test_convert__three_tokens_with_auto_basis() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( '1 0 auto' ) );

		// Assert.
		$this->assertTrue( $result );
		$this->assertFlex( 1.0, 0.0, 'auto', 'custom' );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_unsupported_values( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'flex' ) );
	}

	public static function declining_provider(): array {
		return [
			'non-numeric grow'       => [ 'foo 1 100px' ],
			'non-numeric shrink'     => [ '1 foo 100px' ],
			'invalid basis'          => [ '1 1 banana' ],
			'four tokens'            => [ '1 2 3 4' ],
		];
	}

	private function assertFlex( $grow, $shrink, $basis_size, string $basis_unit ): void {
		$prop = $this->context->get_prop( 'flex' );
		$this->assertSame( 'flex', $prop['$$type'] );
		$this->assertEquals( $grow, $prop['value']['flexGrow']['value'] );
		$this->assertEquals( $shrink, $prop['value']['flexShrink']['value'] );
		$this->assertEquals( $basis_size, $prop['value']['flexBasis']['value']['size'] );
		$this->assertSame( $basis_unit, $prop['value']['flexBasis']['value']['unit'] );
	}

	private function rule( string $value ): array {
		return [ 'property' => 'flex', 'value' => $value ];
	}
}
