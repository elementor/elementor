<?php

namespace Elementor\Modules\Variables\Classes;

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
		$this->assertEquals(':root { --a-01:#000; --a-02:6px; }', $raw_css );
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
				],
			];
		} );

		// Act.
		$raw_css = $this->css_renderer()->raw_css();

		// Assert.
		$this->assertEquals('', $raw_css );
	}
}
