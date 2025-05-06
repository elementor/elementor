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

	public function test_empty_list_of_variables__generates_empty_css_entry() {
		add_filter( Variables::FILTER, function ( $variables ) {
			return [];
		} );

		$css_renderer = new CSS_Renderer( new Variables() );

		$this->assertEquals('', $css_renderer->raw_css() );
	}

	public function test_list_of_variables__generates_entries_for_root_pseudo_element() {
		add_filter( Variables::FILTER, function ( $variables ) {
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

		$css_renderer = new CSS_Renderer( new Variables() );

		$this->assertEquals(':root { --a-01:#000; --a-02:6px; }', $css_renderer->raw_css() );
	}
}
