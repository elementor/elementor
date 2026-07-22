<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Boolean_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Identity_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Size_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Leaf_Resolvers extends TestCase {

	public function test_identity_resolver__returns_value_as_is() {
		$resolver = new Identity_Plain_Resolver();

		$this->assertSame( 'test', $resolver->resolve( 'test' ) );
		$this->assertSame( 123, $resolver->resolve( 123 ) );
		$this->assertSame( [ 'key' => 'value' ], $resolver->resolve( [ 'key' => 'value' ] ) );
	}

	public function test_string_resolver__converts_to_string() {
		$resolver = new String_Plain_Resolver();

		$this->assertSame( 'hello', $resolver->resolve( 'hello' ) );
		$this->assertSame( '123', $resolver->resolve( 123 ) );
		$this->assertSame( '45.67', $resolver->resolve( 45.67 ) );
	}

	public function test_string_resolver__returns_null_for_non_scalar() {
		$resolver = new String_Plain_Resolver();

		$this->assertNull( $resolver->resolve( [ 'array' ] ) );
		$this->assertNull( $resolver->resolve( (object) [ 'object' ] ) );
	}

	public function test_number_resolver_integer__converts_to_integer() {
		$resolver = new Number_Plain_Resolver( false );

		$this->assertSame( 42, $resolver->resolve( 42 ) );
		$this->assertSame( 42, $resolver->resolve( '42' ) );
		$this->assertSame( 42, $resolver->resolve( 42.9 ) );
	}

	public function test_number_resolver_float__converts_to_float() {
		$resolver = new Number_Plain_Resolver( true );

		$this->assertSame( 42.0, $resolver->resolve( 42 ) );
		$this->assertSame( 42.5, $resolver->resolve( '42.5' ) );
		$this->assertSame( 42.9, $resolver->resolve( 42.9 ) );
	}

	public function test_number_resolver__returns_null_for_non_numeric() {
		$resolver = new Number_Plain_Resolver();

		$this->assertNull( $resolver->resolve( 'not a number' ) );
		$this->assertNull( $resolver->resolve( [ 123 ] ) );
	}

	public function test_boolean_resolver__converts_to_boolean() {
		$resolver = new Boolean_Plain_Resolver();

		$this->assertTrue( $resolver->resolve( true ) );
		$this->assertTrue( $resolver->resolve( 1 ) );
		$this->assertTrue( $resolver->resolve( 'yes' ) );
		$this->assertFalse( $resolver->resolve( false ) );
		$this->assertFalse( $resolver->resolve( 0 ) );
		$this->assertFalse( $resolver->resolve( '' ) );
	}

	public function test_size_resolver__parses_number_with_unit() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => 16, 'unit' => 'px' ], $resolver->resolve( '16px' ) );
	}

	public function test_size_resolver__parses_auto() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => null, 'unit' => 'auto' ], $resolver->resolve( 'auto' ) );
	}

	public function test_size_resolver__parses_zero_as_px() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => 0, 'unit' => 'px' ], $resolver->resolve( '0' ) );
	}

	public function test_size_resolver__parses_dynamic_value() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame(
			[ 'size' => 'calc(100% - 20px)', 'unit' => 'custom' ],
			$resolver->resolve( 'calc(100% - 20px)' )
		);
	}

	public function test_size_resolver__declines_unitless_nonzero_by_default() {
		$resolver = new Size_Plain_Resolver( false );

		$this->assertNull( $resolver->resolve( '1.5' ) );
	}

	public function test_size_resolver__allows_unitless_when_configured() {
		$resolver = new Size_Plain_Resolver( true );

		$this->assertSame( [ 'size' => '1.5', 'unit' => 'custom' ], $resolver->resolve( '1.5' ) );
	}

	public function test_size_resolver__returns_null_for_unsupported_unit() {
		$resolver = new Size_Plain_Resolver();

		$this->assertNull( $resolver->resolve( '16xyz' ) );
	}

	public function test_size_resolver__returns_null_for_empty_string() {
		$resolver = new Size_Plain_Resolver();

		$this->assertNull( $resolver->resolve( '' ) );
	}

	public function test_size_resolver__returns_null_for_non_string_non_numeric() {
		$resolver = new Size_Plain_Resolver();

		$this->assertNull( $resolver->resolve( [ '16px' ] ) );
		$this->assertNull( $resolver->resolve( (object) [ 'size' => 16 ] ) );
	}

	public function test_size_resolver__parses_negative_values() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => -10, 'unit' => 'px' ], $resolver->resolve( '-10px' ) );
	}

	public function test_size_resolver__parses_decimal_values() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => 1.5, 'unit' => 'rem' ], $resolver->resolve( '1.5rem' ) );
	}

	public function test_size_resolver__parses_percentage() {
		$resolver = new Size_Plain_Resolver();

		$this->assertSame( [ 'size' => 50, 'unit' => '%' ], $resolver->resolve( '50%' ) );
	}
}
