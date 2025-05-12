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

	public function test_list_of_non_prop_type_variables() {
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
		$this->assertEquals('', $raw_css );
	}

	public function test_list_of_prop_type_variables__generates_entries_for_root_pseudo_element() {
		// Arrange.
		add_filter( Variables::FILTER, function () {
			return [
				Color_Variable_Prop_Type::get_key() => [
					'a-01' => [
						'label' => 'Black',
						'value' => '#000',
					],

					'a-02' => [
						'label' => 'Border Color',
						'value' => '#005678',
					],
				],
				Font_Variable_Prop_Type::get_key() => [
					'gf-045' => [
						'label' => 'Main: Montserrat',
						'value' => 'Montserrat',
					],

					'gr-roboto' => [
						'label' => 'Global Roboto',
						'value' => 'Roboto',
					],
				],
				'non--valid-prop-type' => [
					'label' => 'Arial',
					'value' => 'Arial',
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --a-01:#000; --a-02:#005678; --gf-045:Montserrat; --gr-roboto:Roboto; }', $raw_css );
	}

	public function test_list_of_variables__will_sanitize_the_input() {
		// Arrange,
		add_filter( Variables::FILTER, function () {
			return [
				Color_Variable_Prop_Type::get_key() => [
					'a-01' => [
						'label' => 'XXS injection',
						'value' => '<script type="text/javascript">alert("here");</script>',
					],
					'a-0212' => [
						'label' => 'Valid Color Value',
						'value' => '#005678',
					],
				],
				Font_Variable_Prop_Type::get_key() => [
					'<script>alert("there")</script>' => [
						'label' => 'a-height',
						'value' => '2rem',
					],
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals(':root { --a-0212:#005678; }', $raw_css );
	}
}
