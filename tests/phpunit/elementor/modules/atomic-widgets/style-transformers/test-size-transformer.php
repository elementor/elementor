<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\Styles\Transformers\Size_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Transformer extends Elementor_Test_Base {

	public function test_transform__join_values() {
		// Arrange.
		$size_transformer = new Size_Transformer();

		// Act.
		$transformed_value = $size_transformer->transform( [
			'unit' => 'px',
			'size' => 16,
		], function( $value ) {
			return $value;
		} );

		// Assert.
		$this->assertSame( '16px', $transformed_value );
	}
}
