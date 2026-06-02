<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropsResolver\Props_Resolver_Context;
use Elementor\Modules\AtomicWidgets\PropsResolver\Transformers\Styles\Font_Family_Transformer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Font_Family_Transformer extends Elementor_Test_Base {

	private Font_Family_Transformer $transformer;

	public function setUp(): void {
		parent::setUp();

		$this->transformer = new Font_Family_Transformer();
	}

	public function test_transform__wraps_string_in_quotes() {
		// Arrange.
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( 'Open Sans', $context );

		// Assert.
		$this->assertSame( '"Open Sans"', $result );
	}

	public function test_transform__single_word_font() {
		// Arrange.
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( 'Arial', $context );

		// Assert.
		$this->assertSame( '"Arial"', $result );
	}

	public function test_transform__non_string_returns_as_is() {
		// Arrange.
		$context = Props_Resolver_Context::make();

		// Act.
		$result = $this->transformer->transform( null, $context );

		// Assert.
		$this->assertNull( $result );
	}
}
