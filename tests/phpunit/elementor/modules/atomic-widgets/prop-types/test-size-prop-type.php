<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Size_Prop_Type extends Elementor_Test_Base {
	public function test_sanitize() {
		// Arrange.
		$prop_type = Size_Prop_Type::make();

		// Act.
		$input = [
			'$$type' => 'size',
			'value' => [
				'size' => 10.55,
				'unit' => 'px',
			],
		];
		$result = $prop_type->sanitize( $input );

		// Assert.
		$expected = [
			'$$type' => 'size',
			'value' => [
				'size' => 10.55,
				'unit' => 'px',
			],
		];
		$this->assertSame( $expected, $result );
	}
}
