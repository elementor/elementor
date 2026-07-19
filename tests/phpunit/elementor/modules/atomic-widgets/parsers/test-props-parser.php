<?php

namespace Elementor\Testing\Modules\AtomicWidgets\Parsers;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Number_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Tests\Phpunit\Elementor\Modules\AtomicWidgets\Utils\Mock_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Props_Parser extends TestCase {

	public function test_sanitize__removes_empty_string_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'empty_string' => Mock_Prop_Type::make(),
			'valid_string' => Mock_Prop_Type::make(),
		] );

		// Act.
		$result = $parser->sanitize( [
			'empty_string' => [ '$$type' => 'mock', 'value' => '' ],
			'valid_string' => [ '$$type' => 'mock', 'value' => 'hello' ],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'valid_string' => [ '$$type' => 'mock', 'value' => 'hello' ],
		], $result );
	}

	public function test_parse__removes_nested_empty_object_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'nested_object' => Mock_Prop_Type::make(),
		] );

		// Act.
		$result = $parser->parse( [
			'nested_object' => [
				'$$type' => 'mock',
				'value' => [
					'a' => null,
					'b' => '',
					'c' => [],
				],
			],
		] )->unwrap();

		// Assert.
		$this->assertSame( [], $result );
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

	public function test_parse__cleans_nested_empty_values_inside_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'nested_object' => Mock_Prop_Type::make(),
		] );

		// Act.
		$result = $parser->parse( [
			'nested_object' => [
				'$$type' => 'mock',
				'value' => [
					'a' => [ 0, false, null, '', 'a' ],
					'b' => [ null, '' ],
					'c' => [ 'd' => null ],
					'e' => [
						[ 'f' => null, 'g' => true ],
						[ 'h' => null, 'i' => '' ],
					],
				],
			],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'nested_object' => [
				'$$type' => 'mock',
				'value' => [
					'a' => [ 0, false, 'a' ],
					'e' => [
						[ 'g' => true ],
					],
				],
			],
		], $result );
	}

	public function test_parse__omits_null_top_level_props_from_validate_and_empty_from_sanitize() {
		// Arrange.
		$parser = Props_Parser::make( [
			'null_prop' => String_Prop_Type::make()->default( '' ),
			'empty_prop' => Mock_Prop_Type::make(),
			'valid_prop' => Mock_Prop_Type::make(),
		] );

		// Act.
		$result = $parser->parse( [
			'empty_prop' => [ '$$type' => 'mock', 'value' => '' ],
			'valid_prop' => [ '$$type' => 'mock', 'value' => 'saved' ],
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'valid_prop' => [ '$$type' => 'mock', 'value' => 'saved' ],
		], $result );
	}
}
