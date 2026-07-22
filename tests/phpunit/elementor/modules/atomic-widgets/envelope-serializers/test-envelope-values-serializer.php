<?php

namespace Elementor\Testing\Modules\AtomicWidgets\EnvelopeSerializers;

use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Serializers_Registry;
use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Envelope_Values_Serializer;
use Elementor\Modules\AtomicWidgets\EnvelopeSerializers\Resolvers\Identity_Envelope_Serializer;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
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

class Test_Envelope_Values_Serializer extends TestCase {

	private function make_serializer(): Envelope_Values_Serializer {
		$registry = new Envelope_Serializers_Registry();
		$registry->register_fallback( new Identity_Envelope_Serializer() );

		return new Envelope_Values_Serializer( $registry );
	}

	public function test_serialize__null_value_returns_null() {
		$serializer = $this->make_serializer();

		$this->assertNull( $serializer->serialize( null, String_Prop_Type::make() ) );
	}

	public function test_serialize__leaf_string_envelope() {
		$serializer = $this->make_serializer();

		$this->assertSame(
			'hello',
			$serializer->serialize(
				[
					'$$type' => 'string',
					'value' => 'hello',
				],
				String_Prop_Type::make()
			)
		);
	}

	public function test_serialize__leaf_number_envelope() {
		$serializer = $this->make_serializer();

		$this->assertSame(
			42,
			$serializer->serialize(
				[
					'$$type' => 'number',
					'value' => 42,
				],
				Number_Prop_Type::make()
			)
		);
	}

	public function test_serialize__object_type_recurses_over_shape() {
		$serializer = $this->make_serializer();

		$this->assertSame(
			[
				'name' => 'test',
				'count' => 5,
			],
			$serializer->serialize(
				[
					'$$type' => 'test-object',
					'value' => [
						'name' => [ '$$type' => 'string', 'value' => 'test' ],
						'count' => [ '$$type' => 'number', 'value' => 5 ],
					],
				],
				Test_Object_Prop_Type::make()
			)
		);
	}

	public function test_serialize__array_type_unwraps_items() {
		$serializer = $this->make_serializer();

		$this->assertSame(
			[ 'a', 'b' ],
			$serializer->serialize(
				[
					'$$type' => 'test-array',
					'value' => [
						[ '$$type' => 'string', 'value' => 'a' ],
						[ '$$type' => 'string', 'value' => 'b' ],
					],
				],
				Test_Array_Prop_Type::make()
			)
		);
	}

	public function test_serialize_map__skips_unknown_keys() {
		$serializer = $this->make_serializer();

		$this->assertSame(
			[
				'title' => 'Hello',
			],
			$serializer->serialize_map(
				[
					'title' => [ '$$type' => 'string', 'value' => 'Hello' ],
					'unknown' => [ '$$type' => 'string', 'value' => 'skip' ],
				],
				[
					'title' => String_Prop_Type::make(),
				]
			)
		);
	}

	public function test_serialize__union_uses_envelope_type_key() {
		$serializer = $this->make_serializer();
		$union = Union_Prop_Type::make()
			->add_prop_type( String_Prop_Type::make() )
			->add_prop_type( Number_Prop_Type::make() );

		$this->assertSame(
			99,
			$serializer->serialize(
				[
					'$$type' => 'number',
					'value' => 99,
				],
				$union
			)
		);
	}
}
