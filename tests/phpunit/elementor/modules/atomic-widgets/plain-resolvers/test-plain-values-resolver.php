<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PlainResolvers;

use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolver_Base;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Resolvers_Registry;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Plain_Values_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Identity_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\Number_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PlainResolvers\Resolvers\String_Plain_Resolver;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Plain_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Object_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'test-object';
	}

	protected function define_shape(): array {
		return [
			'name' => String_Prop_Type::make(),
			'count' => Number_Prop_Type::make(),
		];
	}
}

class Test_Array_Prop_Type extends Array_Prop_Type {
	public static function get_key(): string {
		return 'test-array';
	}

	protected function define_item_type(): Prop_Type {
		return String_Prop_Type::make();
	}
}

class Composite_Envelope_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		return [
			'$$type' => 'test-object',
			'value' => [
				'name' => [ '$$type' => 'string', 'value' => 'from-composite' ],
			],
		];
	}
}

class Composite_Null_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		return null;
	}
}

class Test_Url_Like_Plain_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'test-url';
	}

	protected function validate_value( $value ): bool {
		return is_string( $value );
	}

	protected function sanitize_value( $value ) {
		return $value;
	}
}

class Test_Id_Object_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'test-id-object';
	}

	protected function define_shape(): array {
		return [
			'id' => Number_Prop_Type::make(),
			'label' => String_Prop_Type::make(),
		];
	}
}

class Test_Dynamic_Like_Resolver extends Plain_Resolver_Base {
	public function resolve( $plain_value ) {
		if ( ! is_array( $plain_value ) || ! isset( $plain_value['name'] ) ) {
			return null;
		}

		return [
			'$$type' => 'test-dynamic',
			'value' => [ 'name' => $plain_value['name'] ],
		];
	}
}

class Test_Dynamic_Like_Plain_Prop_Type extends Plain_Prop_Type {
	public static function get_key(): string {
		return 'test-dynamic';
	}

	protected function validate_value( $value ): bool {
		return is_array( $value );
	}

	protected function sanitize_value( $value ) {
		return $value;
	}
}

class Test_Plain_Values_Resolver extends TestCase {

	private function make_registry(): Plain_Resolvers_Registry {
		$registry = new Plain_Resolvers_Registry();
		$registry->register_fallback( new Identity_Plain_Resolver() );
		$registry->register( String_Prop_Type::get_key(), new String_Plain_Resolver() );
		$registry->register( Number_Prop_Type::get_key(), new Number_Plain_Resolver() );

		return $registry;
	}

	public function test_resolve__null_value_returns_null() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertNull( $resolver->resolve( null, String_Prop_Type::make() ) );
	}

	public function test_resolve__leaf_string_type() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'hello',
			],
			$resolver->resolve( 'hello', String_Prop_Type::make() )
		);
	}

	public function test_resolve__leaf_number_type() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertSame(
			[
				'$$type' => 'number',
				'value' => 42,
			],
			$resolver->resolve( 42, Number_Prop_Type::make() )
		);
	}

	public function test_resolve__object_type_recurses_over_shape() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );
		$prop_type = Test_Object_Prop_Type::make();

		$this->assertSame(
			[
				'$$type' => 'test-object',
				'value' => [
					'name' => [ '$$type' => 'string', 'value' => 'test' ],
					'count' => [ '$$type' => 'number', 'value' => 5 ],
				],
			],
			$resolver->resolve(
				[
					'name' => 'test',
					'count' => 5,
				],
				$prop_type
			)
		);
	}

	public function test_resolve__object_type_skips_missing_keys() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );
		$prop_type = Test_Object_Prop_Type::make();

		$this->assertSame(
			[
				'$$type' => 'test-object',
				'value' => [
					'name' => [ '$$type' => 'string', 'value' => 'test' ],
				],
			],
			$resolver->resolve( [ 'name' => 'test' ], $prop_type )
		);
	}

	public function test_resolve__object_type_returns_null_for_non_array() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertNull( $resolver->resolve( 'not an array', Test_Object_Prop_Type::make() ) );
	}

	public function test_resolve__array_type_maps_items() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );
		$prop_type = Test_Array_Prop_Type::make();

		$this->assertSame(
			[
				'$$type' => 'test-array',
				'value' => [
					[ '$$type' => 'string', 'value' => 'one' ],
					[ '$$type' => 'string', 'value' => 'two' ],
					[ '$$type' => 'string', 'value' => 'three' ],
				],
			],
			$resolver->resolve( [ 'one', 'two', 'three' ], $prop_type )
		);
	}

	public function test_resolve__array_type_returns_null_for_non_array() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertNull( $resolver->resolve( 'not an array', Test_Array_Prop_Type::make() ) );
	}

	public function test_resolve__union_type_detects_string_variant() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );
		$prop_type = Union_Prop_Type::make()
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make() );

		$this->assertSame(
			[
				'$$type' => 'string',
				'value' => 'hello',
			],
			$resolver->resolve( 'hello', $prop_type )
		);
	}

	public function test_resolve__union_type_detects_number_variant() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );
		$prop_type = Union_Prop_Type::make()
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make() );

		$this->assertSame(
			[
				'$$type' => 'number',
				'value' => 42,
			],
			$resolver->resolve( 42, $prop_type )
		);
	}

	public function test_resolve__composite_resolver_on_object_short_circuits_shape_recursion() {
		$registry = $this->make_registry();
		$registry->register( Test_Object_Prop_Type::get_key(), new Composite_Envelope_Resolver() );
		$resolver = new Plain_Values_Resolver( $registry );

		$this->assertSame(
			[
				'$$type' => 'test-object',
				'value' => [
					'name' => [ '$$type' => 'string', 'value' => 'from-composite' ],
				],
			],
			$resolver->resolve( [ 'name' => 'ignored' ], Test_Object_Prop_Type::make() )
		);
	}

	public function test_resolve__composite_resolver_returning_null_yields_null() {
		$registry = $this->make_registry();
		$registry->register( Test_Object_Prop_Type::get_key(), new Composite_Null_Resolver() );
		$resolver = new Plain_Values_Resolver( $registry );

		$this->assertNull( $resolver->resolve( [ 'name' => 'test' ], Test_Object_Prop_Type::make() ) );
	}

	public function test_resolve__returns_null_when_resolver_not_found() {
		$empty_registry = new Plain_Resolvers_Registry();
		$resolver = new Plain_Values_Resolver( $empty_registry );

		$this->assertNull( $resolver->resolve( 'test', String_Prop_Type::make() ) );
	}

	public function test_resolve__object_returns_null_when_input_shares_no_shape_keys() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertNull(
			$resolver->resolve(
				[ 'settings' => [], 'group' => 'post' ],
				Test_Object_Prop_Type::make()
			)
		);
	}

	public function test_resolve__union_falls_through_to_dynamic_when_object_shape_has_no_matching_keys() {
		$registry = $this->make_registry();
		$registry->register( Test_Dynamic_Like_Plain_Prop_Type::get_key(), new Test_Dynamic_Like_Resolver() );
		$resolver = new Plain_Values_Resolver( $registry );

		$prop_type = Union_Prop_Type::make()
			->add_prop_type( Test_Id_Object_Prop_Type::make() )
			->add_prop_type( Test_Dynamic_Like_Plain_Prop_Type::make() );

		$this->assertSame(
			[
				'$$type' => 'test-dynamic',
				'value' => [ 'name' => 'my-tag' ],
			],
			$resolver->resolve( [ 'name' => 'my-tag' ], $prop_type )
		);
	}

	public function test_resolve__union_declines_plain_prop_type_variant_when_input_is_non_scalar() {
		$registry = $this->make_registry();
		$registry->register( Test_Dynamic_Like_Plain_Prop_Type::get_key(), new Test_Dynamic_Like_Resolver() );
		$resolver = new Plain_Values_Resolver( $registry );

		$prop_type = Union_Prop_Type::make()
			->add_prop_type( Test_Url_Like_Plain_Prop_Type::make() )
			->add_prop_type( Test_Dynamic_Like_Plain_Prop_Type::make() );

		$this->assertSame(
			[
				'$$type' => 'test-dynamic',
				'value' => [ 'name' => 'my-tag' ],
			],
			$resolver->resolve( [ 'name' => 'my-tag' ], $prop_type )
		);
	}

	public function test_resolve__unregistered_plain_prop_type_accepts_scalar_via_fallback() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertSame(
			[ '$$type' => 'test-url', 'value' => 'https://example.com' ],
			$resolver->resolve( 'https://example.com', Test_Url_Like_Plain_Prop_Type::make() )
		);
	}

	public function test_resolve__unregistered_plain_prop_type_rejects_non_scalar() {
		$resolver = new Plain_Values_Resolver( $this->make_registry() );

		$this->assertNull(
			$resolver->resolve(
				[ 'name' => 'my-tag' ],
				Test_Url_Like_Plain_Prop_Type::make()
			)
		);
	}
}
