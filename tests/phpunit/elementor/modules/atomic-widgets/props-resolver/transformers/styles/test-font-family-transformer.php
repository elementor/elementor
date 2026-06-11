<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropsResolver\Transformers\Styles;

use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
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

	private function create_context(): Props_Resolver_Context {
		return Props_Resolver_Context::make()->set_prop_type( Font_Family_Prop_Type::make() );
	}

	public function test_transform__wraps_multi_word_font_in_quotes() {
		// Arrange.
		$context = $this->create_context();

		// Act.
		$result = $this->transformer->transform( ' Open Sans ', $context );

		// Assert.
		$this->assertSame( '"Open Sans"', $result );
	}

	public function test_transform__wraps_single_word_font_in_quotes() {
		// Arrange.
		$context = $this->create_context();

		// Act.
		$result = $this->transformer->transform( 'Arial', $context );

		// Assert.
		$this->assertSame( '"Arial"', $result );
	}

	public function test_transform__does_not_quote_css_variables() {
		// Arrange.
		$context = $this->create_context();

		// Act.
		$result = $this->transformer->transform( 'var(--primary-font)', $context );

		// Assert.
		$this->assertSame( 'var(--primary-font)', $result );
	}

	public function test_transform__non_string_returns_as_is() {
		// Arrange.
		$context = $this->create_context();

		// Act.
		$result = $this->transformer->transform( null, $context );

		// Assert.
		$this->assertNull( $result );
	}
}
