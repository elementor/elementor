<?php

namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Settings\Attributes_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Attributes_Transformer extends Elementor_Test_Base {
	public function test_core_attributes_transformer_always_returns_null() {
		// Arrange.
		$transformer = new Attributes_Transformer();
		$value = [
			[ 'key' => 'data-id', 'value' => '123' ],
			[ 'key' => 'role', 'value' => 'button' ],
		];

		// Act.
		$result = $transformer->transform( $value, Props_Resolver_Context::make() );

		// Assert.
		$this->assertNull( $result );
	}
}
