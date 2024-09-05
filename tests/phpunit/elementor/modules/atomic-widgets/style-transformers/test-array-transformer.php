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
}
