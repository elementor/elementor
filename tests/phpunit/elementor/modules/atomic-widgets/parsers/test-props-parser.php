<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Array_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Base\Object_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils\Mock_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Props_Parser extends TestCase {

	public function test_sanitize__removes_empty_object_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'empty_object' => $this->create_object_prop_type(),
			'valid_object' => $this->create_object_prop_type(),
		] );

		// Act.
		$result = $parser->sanitize( [
			'empty_object' => [
				'$$type' => 'test-object',
				'value' => [],
			],
			'valid_object' => [
				'$$type' => 'test-object',
				'value' => [
					'name' => [ '$$type' => 'string', 'value' => 'hello' ],
				],
			],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'valid_object' => [
				'$$type' => 'test-object',
				'value' => [
					'name' => [ '$$type' => 'string', 'value' => 'hello' ],
				],
			],
		], $result );
	}

	public function test_sanitize__removes_empty_array_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'empty_array' => $this->create_array_prop_type(),
		] );

		// Act.
		$result = $parser->sanitize( [
			'empty_array' => [
				'$$type' => 'test-array',
				'value' => [],
			],
		] )->unwrap();

		// Assert.
		$this->assertSame( [], $result );
	}

	public function test_sanitize__keeps_plain_props_with_empty_values() {
		// Arrange.
		$parser = Props_Parser::make( [
			'empty_string' => String_Prop_Type::make()->default( '' ),
			'valid_string' => String_Prop_Type::make()->default( '' ),
		] );

		// Act.
		$result = $parser->sanitize( [
			'empty_string' => [ '$$type' => 'string', 'value' => '' ],
			'valid_string' => [ '$$type' => 'string', 'value' => 'hello' ],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'empty_string' => [ '$$type' => 'string', 'value' => '' ],
			'valid_string' => [ '$$type' => 'string', 'value' => 'hello' ],
		], $result );
	}

	public function test_parse__preserves_zero_and_false() {
		// Arrange.
		$parser = Props_Parser::make( [
			'number_prop' => Number_Prop_Type::make()->default( 0 ),
			'boolean_prop' => Boolean_Prop_Type::make()->default( false ),
		] );

		// Act.
		$result = $parser->parse( [
			'number_prop' => [ '$$type' => 'number', 'value' => 0 ],
			'boolean_prop' => [ '$$type' => 'boolean', 'value' => false ],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'number_prop' => [ '$$type' => 'number', 'value' => 0 ],
			'boolean_prop' => [ '$$type' => 'boolean', 'value' => false ],
		], $result );
	}

	public function test_sanitize__keeps_mock_prop_even_when_empty() {
		// Arrange.
		$parser = Props_Parser::make( [
			'empty_prop' => Mock_Prop_Type::make(),
			'valid_prop' => Mock_Prop_Type::make(),
		] );

		// Act.
		$result = $parser->sanitize( [
			'empty_prop' => [ '$$type' => 'mock', 'value' => '' ],
			'valid_prop' => [ '$$type' => 'mock', 'value' => 'saved' ],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'empty_prop' => [ '$$type' => 'mock', 'value' => '' ],
			'valid_prop' => [ '$$type' => 'mock', 'value' => 'saved' ],
		], $result );
	}

	private function create_object_prop_type(): Object_Prop_Type {
		return new class() extends Object_Prop_Type {
			public static function get_key(): string {
				return 'test-object';
			}

			protected function define_shape(): array {
				return [
					'name' => String_Prop_Type::make(),
				];
			}
		};
	}

	private function create_array_prop_type(): Array_Prop_Type {
		return new class() extends Array_Prop_Type {
			public static function get_key(): string {
				return 'test-array';
			}

			protected function define_item_type(): Prop_Type {
				return String_Prop_Type::make();
			}
		};
	}
}
