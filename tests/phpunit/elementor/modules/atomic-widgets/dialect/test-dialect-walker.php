<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Dialect;

use Elementor\Modules\AtomicWidgets\Dialect\Adapter_Context;
use Elementor\Modules\AtomicWidgets\Dialect\Base_Dialect_Adapter;
use Elementor\Modules\AtomicWidgets\Dialect\Dialect_Utils;
use Elementor\Modules\AtomicWidgets\Dialect\Dialect_Walker;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Union_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Stub_Schema_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ): array {
		return [
			'$$key' => $ctx->prop_type::get_key(),
			'kind' => $ctx->prop_type->get_type(),
			'children' => $ctx->children,
		];
	}
}

class Omit_Schema_Adapter extends Base_Dialect_Adapter {
	public static function to_schema( Adapter_Context $ctx ) {
		return Dialect_Utils::omit();
	}
}

class Stub_Object_Prop_Type extends Object_Prop_Type {
	public static function get_key(): string {
		return 'stub-object';
	}

	protected function define_shape(): array {
		return [];
	}
}

class Test_Dialect_Walker extends TestCase {
	const DIALECT = 'test';

	public function test_to_schema_walks_object_children_bottom_up() {
		// Arrange
		$omit_child = String_Prop_Type::make()->with_dialect( self::DIALECT, Omit_Schema_Adapter::class );
		$noop_child = Number_Prop_Type::make();
		$stub_child = String_Prop_Type::make()->with_dialect( self::DIALECT, Stub_Schema_Adapter::class );

		$union_member_object = Stub_Object_Prop_Type::make()
			->set_shape( [ 'nested' => String_Prop_Type::make()->with_dialect( self::DIALECT, Stub_Schema_Adapter::class ) ] )
			->with_dialect( self::DIALECT, Stub_Schema_Adapter::class );

		$union_member_primitive = Number_Prop_Type::make()->with_dialect( self::DIALECT, Stub_Schema_Adapter::class );

		$union_child = Union_Prop_Type::make()
			->add_prop_type( $union_member_object )
			->add_prop_type( $union_member_primitive )
			->with_dialect( self::DIALECT, Stub_Schema_Adapter::class );

		$root = Stub_Object_Prop_Type::make()
			->set_shape( [
				'omit'      => $omit_child,
				'noop'      => $noop_child,
				'primitive' => $stub_child,
				'union'     => $union_child,
			] )
			->with_dialect( self::DIALECT, Stub_Schema_Adapter::class );

		// Act
		$result = Dialect_Walker::to_schema( $root, self::DIALECT );

		// Assert
		$this->assertArrayNotHasKey( 'omit', $result['children'] );

		$this->assertSame( [], $result['children']['noop'] );

		$this->assertSame( [
			'$$key'    => 'string',
			'kind'     => 'string',
			'children' => [],
		], $result['children']['primitive'] );

		$this->assertSame( [
			'$$key'    => 'union',
			'kind'     => 'union',
			'children' => [
				[
					'$$key'    => 'stub-object',
					'kind'     => 'object',
					'children' => [
						'nested' => [
							'$$key'    => 'string',
							'kind'     => 'string',
							'children' => [],
						],
					],
				],
				[
					'$$key'    => 'number',
					'kind'     => 'number',
					'children' => [],
				],
			],
		], $result['children']['union'] );
	}
}
