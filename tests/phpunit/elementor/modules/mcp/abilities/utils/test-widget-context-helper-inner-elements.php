<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Utils;

use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Widget_Context_Helper_Inner_Elements extends TestCase {

	public function test_build_widget_schema__includes_inner_elements_for_nav_menu() {
		// Arrange.
		$config = [
			'controls' => [
				'menu' => [ 'type' => 'select' ],
				'color_menu_item' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-item' => 'color: {{VALUE}};',
					],
				],
				'color_dropdown_item' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .sub-menu .elementor-item' => 'color: {{VALUE}};',
					],
				],
				'toggle_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-menu-toggle' => 'color: {{VALUE}};',
					],
				],
			],
		];

		// Act.
		$schema = Widget_Context_Helper::build_widget_schema( 'nav-menu', $config );

		// Assert.
		$this->assertIsArray( $schema );
		$this->assertArrayHasKey( 'inner_elements', $schema );
		$this->assertArrayHasKey( 'main-menu', $schema['inner_elements'] );
		$this->assertArrayHasKey( 'dropdown', $schema['inner_elements'] );
		$this->assertArrayHasKey( 'toggle', $schema['inner_elements'] );
		$this->assertContains( 'color', $schema['inner_elements']['main-menu']['accepted_css_properties'] );
	}

	public function test_build_widget_schema__omits_inner_elements_for_widgets_without_declaration() {
		// Arrange.
		$config = [
			'controls' => [
				'title' => [ 'type' => 'text' ],
				'title_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}}' => 'color: {{VALUE}};',
					],
				],
			],
		];

		// Act.
		$schema = Widget_Context_Helper::build_widget_schema( 'theme-post-title', $config );

		// Assert.
		$this->assertIsArray( $schema );
		$this->assertArrayNotHasKey( 'inner_elements', $schema );
	}
}
