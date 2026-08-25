<?php

namespace Elementor\Testing\Modules\AtomicWidgets\PropTypes;

use Elementor\Modules\AtomicWidgets\PropTypes\Font_Family_Prop_Type;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Font_Family_Prop_Type extends Elementor_Test_Base {

	private Font_Family_Prop_Type $prop_type;

	public function setUp(): void {
		parent::setUp();

		$this->prop_type = Font_Family_Prop_Type::make();
	}

	public function test_get_enqueue_font_family__returns_trimmed_stored_value() {
		$this->assertSame( 'Open Sans', $this->prop_type->get_enqueue_font_family( ' Open Sans ' ) );
	}

	public function test_get_enqueue_font_family__strips_surrounding_quotes() {
		$this->assertSame( 'Open Sans', $this->prop_type->get_enqueue_font_family( '"Open Sans"' ) );
	}

	public function test_get_enqueue_font_family__uses_first_family_from_stack() {
		$this->assertSame( 'Inter', $this->prop_type->get_enqueue_font_family( 'Inter, "Helvetica Neue", Arial, sans-serif' ) );
	}

	public function test_sanitize__reduces_fallback_stack_to_first_family() {
		$sanitized = $this->prop_type->sanitize( [
			'$$type' => 'font-family',
			'value' => '"Playfair Display", Georgia, serif',
		] );

		$this->assertSame( 'Playfair Display', $sanitized['value'] );
	}

	public function test_sanitize__preserves_css_var_with_fallback() {
		$sanitized = $this->prop_type->sanitize( [
			'$$type' => 'font-family',
			'value' => 'var(--font-heading, Inter)',
		] );

		$this->assertSame( 'var(--font-heading, Inter)', $sanitized['value'] );
	}
}
