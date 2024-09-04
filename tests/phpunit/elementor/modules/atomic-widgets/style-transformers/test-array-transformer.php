<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Styles\Transformers\Array_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Array_Transformer extends Elementor_Test_Base {

	public function test_transform__join_values() {
		// Arrange.
		$array_transformer = new Array_Transformer();

		// Act.
		$transformed_value = $array_transformer->transform( [
			'array' => [ 'a', 'b' ],
		], function( $value ) {
			return $value;
		} );

		// Assert.
		$this->assertSame( 'a b', $transformed_value );

		// Act.
		$transformed_value = $array_transformer->transform( [
			'array' => [ 'a', 'b' ],
			'delimiter' => ',',
		], function( $value ) {
			return $value;
		} );

		// Assert.
		$this->assertSame( 'a,b', $transformed_value );
	}

	public function test_transform__missing_array_attribute() {
		// Arrange.
		$array_transform = new Array_Transformer();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Invalid array or delimited' );

		// Act.
		$transformed_value = $array_transform->transform( [
			'delimiter' => '.',
		], function ( $value ) {
			return $value;
		} );

		// Assert.
		$this->assertEquals( false, isset( $transformed_value ) );
	}

	public function test_transform__invalid_delimiter() {
		// Arrange.
		$array_transform = new Array_Transformer();

		// Expect.
		$this->expectException( \Exception::class );
		$this->expectExceptionMessage( 'Invalid array or delimited' );

		// Act.
		$transformed_value = $array_transform->transform( [
			'array' => [ 'a', 'b' ],
			'delimiter' => [ '.' ],
		], function ( $value ) {
			return $value;
		} );

		// Assert.
		$this->assertEquals( false, isset( $transformed_value ) );
	}
}
