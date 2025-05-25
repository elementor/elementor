<?php

namespace Elementor\Modules\Variables\Classes;

use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\PropTypes\Font_Variable_Prop_Type;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * @gorup Elementor\Modules
 * @group Elementor\Modules\Variables
 */
class Test_CSS_Renderer extends TestCase {
	public function setUp(): void {
		parent::setUp();
	}

	private function css_renderer() {
		return new CSS_Renderer(
			new Variables()
		);
	}

	public function test_empty_list_of_variables__generates_empty_css_entry() {
		// Arrange.
		add_filter( Variables::FILTER, function () {
			return [];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals('', $raw_css );
	}
	// check for special symbols in the label !@#$%^&*()+~<>/""[]{}\|
	public function test_list_of_font_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		add_filter( Variables::FILTER, function () {
			return [
				'gf-045' => [
					'label' => 'Main: Montserrat',
					'value' => 'Montserrat',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
				'gr-roboto' => [
					'label' => 'Global Roboto',
					'value' => 'Roboto',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --main-montserrat:Montserrat; --global-roboto:Roboto; }', $raw_css );
	}

	public function test_list_of_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		add_filter( Variables::FILTER, function () {
			return [
				'a-01' => [
					'label' => 'Black',
					'value' => '#000',
				],
				'a-02' => [
					'label' => 'Border Width',
					'value' => '6px',
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --black:#000; --border-width:6px; }', $raw_css );
	}

	public function test_list_of_variables__will_sanitize_the_input() {
		// Arrange,
		add_filter( Variables::FILTER, function () {
			return [
				'a-01' => [
					'label' => 'a-width',
					'value' => '<script type="text/javascript">alert("here");</script>',
				],
				'<script>alert("there")</script>' => [
					'label' => 'a-height',
					'value' => '2rem',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'a-01' => [
					'label' => 'Font 1',
					'value' => '<style>color: red;</style>',
					'type' => Color_Variable_Prop_Type::get_key(),
				],
				'<script>alert("font here")</script>' => [
					'label' => 'Font 3',
					'value' => '2rem',
					'type' => Font_Variable_Prop_Type::get_key(),
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals('', $raw_css );
	}
}
