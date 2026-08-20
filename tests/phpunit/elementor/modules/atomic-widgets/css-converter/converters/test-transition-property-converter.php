<?php

namespace Elementor\Testing\Modules\AtomicWidgets\CssConverter\Converters;

use Elementor\Modules\AtomicWidgets\CssConverter\Conversion_Context;
use Elementor\Modules\AtomicWidgets\CssConverter\Converters\Transition_Property_Converter;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Transition_Property_Converter extends TestCase {
	private Transition_Property_Converter $converter;
	private Conversion_Context $context;

	public function setUp(): void {
		$this->converter = new Transition_Property_Converter();
		$this->context   = new Conversion_Context( [] );
	}

	public function test_convert__all_with_ms_duration() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'all 300ms' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'transition' );
		$this->assertSame( 'transition', $prop['$$type'] );
		$this->assertCount( 1, $prop['value'] );
		$this->assertSame( 'all', $prop['value'][0]['value']['selection']['value']['value']['value'] );
		$this->assertEquals( 300, $prop['value'][0]['value']['size']['value']['size'] );
		$this->assertSame( 'ms', $prop['value'][0]['value']['size']['value']['unit'] );
	}

	public function test_convert__property_with_seconds_duration() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'opacity 0.5s' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'transition' );
		$this->assertSame( 'opacity', $prop['value'][0]['value']['selection']['value']['value']['value'] );
		$this->assertSame( 's', $prop['value'][0]['value']['size']['value']['unit'] );
	}

	public function test_convert__easing_function_is_silently_dropped() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'transform 200ms ease-in-out' ) );

		// Assert: converts successfully despite easing token being unparseable as a time.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'transition' );
		$this->assertSame( 'transform', $prop['value'][0]['value']['selection']['value']['value']['value'] );
		$this->assertEquals( 200, $prop['value'][0]['value']['size']['value']['size'] );
		$this->assertSame( 'ms', $prop['value'][0]['value']['size']['value']['unit'] );
	}

	public function test_convert__multiple_layers_comma_separated() {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( 'opacity 300ms, transform 500ms' ) );

		// Assert.
		$this->assertTrue( $result );
		$prop = $this->context->get_prop( 'transition' );
		$this->assertCount( 2, $prop['value'] );
		$this->assertSame( 'opacity', $prop['value'][0]['value']['selection']['value']['value']['value'] );
		$this->assertSame( 'transform', $prop['value'][1]['value']['selection']['value']['value']['value'] );
	}

	/** @dataProvider declining_provider */
	public function test_convert__declines_unsupported_values( string $value ) {
		// Act.
		$result = $this->converter->convert( $this->context, $this->rule( $value ) );

		// Assert.
		$this->assertFalse( $result );
		$this->assertNull( $this->context->get_prop( 'transition' ) );
	}

	public static function declining_provider(): array {
		return [
			'unsupported property'          => [ 'border-left 300ms' ],
			'no duration'                   => [ 'opacity' ],
			'non-time unit'                 => [ 'opacity 10px' ],
			'one layer unsupported in list' => [ 'opacity 300ms, border-left 200ms' ],
		];
	}

	private function rule( string $value ): array {
		return [ 'property' => 'transition', 'value' => $value, 'declaration' => "transition: $value" ];
	}
}
