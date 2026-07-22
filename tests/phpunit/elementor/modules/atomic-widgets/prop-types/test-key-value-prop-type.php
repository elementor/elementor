<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Parsers\Props_Parser;
use Elementor\Modules\AtomicWidgets\PropTypes\Key_Value_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Key_Value_Prop_Type extends TestCase {

	public function test_should_persist__false_when_both_key_and_value_are_empty() {
		// Arrange.
		$prop_type = Key_Value_Prop_Type::make();

		// Act.
		$result = $prop_type->should_persist( Key_Value_Prop_Type::generate( [
			'key' => String_Prop_Type::generate( '' ),
			'value' => String_Prop_Type::generate( '' ),
		] ) );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_should_persist__true_when_key_is_set() {
		// Arrange.
		$prop_type = Key_Value_Prop_Type::make();

		// Act.
		$result = $prop_type->should_persist( Key_Value_Prop_Type::generate( [
			'key' => String_Prop_Type::generate( 'data-id' ),
			'value' => String_Prop_Type::generate( '' ),
		] ) );

		// Assert.
		$this->assertTrue( $result );
	}

	public function test_should_persist__false_when_only_value_is_set() {
		// Arrange.
		$prop_type = Key_Value_Prop_Type::make();

		// Act.
		$result = $prop_type->should_persist( Key_Value_Prop_Type::generate( [
			'key' => String_Prop_Type::generate( '' ),
			'value' => String_Prop_Type::generate( 'example' ),
		] ) );

		// Assert.
		$this->assertFalse( $result );
	}

	public function test_sanitize__removes_empty_key_value_prop() {
		// Arrange.
		$parser = Props_Parser::make( [
			'attribute' => Key_Value_Prop_Type::make(),
			'label' => String_Prop_Type::make()->default( '' ),
		] );

		// Act.
		$result = $parser->sanitize( [
			'attribute' => Key_Value_Prop_Type::generate( [
				'key' => String_Prop_Type::generate( '' ),
				'value' => String_Prop_Type::generate( '' ),
			] ),
			'label' => String_Prop_Type::generate( 'Visible' ),
		] )->unwrap();

		// Assert.
		$this->assertSame( [
			'label' => String_Prop_Type::generate( 'Visible' ),
		], $result );
	}
}
