<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Control_Introspector;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

class Test_V3_Control_Introspector extends TestCase {

	private function controls(): array {
		return [
			'section_style_main-menu' => [ 'type' => 'section', 'tab' => 'style', 'label' => 'Main Menu' ],
			'color_menu_item' => [
				'type' => 'color',
				'tab' => 'style',
				'section' => 'section_style_main-menu',
				'selectors' => [ '{{WRAPPER}} .elementor-item' => 'color: {{VALUE}};' ],
			],
			'color_menu_item_hover' => [
				'type' => 'color',
				'tab' => 'style',
				'section' => 'section_style_main-menu',
				'selectors' => [ '{{WRAPPER}} .elementor-item:hover' => 'color: {{VALUE}};' ],
			],
			'padding_menu_item' => [
				'type' => 'slider',
				'tab' => 'style',
				'section' => 'section_style_main-menu',
				'selectors' => [ '{{WRAPPER}} .elementor-item' => 'padding: {{SIZE}}{{UNIT}};' ],
			],
			'menu_box_padding' => [
				'type' => 'dimensions',
				'tab' => 'style',
				'section' => 'section_style_main-menu',
				'selectors' => [ '{{WRAPPER}}' => 'padding: {{SIZE}}{{UNIT}};' ],
			],
			'style_thin' => [ 'type' => 'section', 'tab' => 'style', 'label' => 'Thin' ],
			'spinner_color' => [
				'type' => 'color',
				'tab' => 'style',
				'section' => 'style_thin',
				'selectors' => [ '{{WRAPPER}} .spinner' => 'color: {{VALUE}};' ],
			],
			'section_layout' => [ 'type' => 'section', 'tab' => 'content', 'label' => 'Layout' ],
			'menu' => [ 'type' => 'select', 'tab' => 'content', 'section' => 'section_layout' ],
			'toggle_align' => [
				'type' => 'choose',
				'tab' => 'content',
				'section' => 'section_layout',
				'selectors' => [ '{{WRAPPER}} .toggle' => 'text-align: {{VALUE}};' ],
			],
			'hr' => [ 'type' => 'divider', 'tab' => 'content', 'section' => 'section_layout' ],
			'_section_style' => [ 'type' => 'section', 'tab' => 'advanced', 'label' => 'Layout' ],
			'_margin' => [
				'type' => 'dimensions',
				'tab' => 'advanced',
				'section' => '_section_style',
				'selectors' => [ '{{WRAPPER}}' => 'margin: {{TOP}}{{UNIT}};' ],
			],
			'_section_transform' => [ 'type' => 'section', 'tab' => 'advanced', 'label' => 'Transform' ],
			'_transform_scale_effect' => [
				'type' => 'slider',
				'tab' => 'advanced',
				'section' => '_section_transform',
				'selectors' => [ '{{WRAPPER}}' => '--e-transform-scale: {{SIZE}};' ],
			],
			'section_custom_css' => [ 'type' => 'section', 'tab' => 'advanced', 'label' => 'Custom CSS' ],
			'custom_css' => [ 'type' => 'code', 'tab' => 'advanced', 'section' => 'section_custom_css' ],
		];
	}

	public function test_inner_elements__derives_alias_from_style_section() {
		// Act.
		$inner_elements = V3_Control_Introspector::inner_elements( $this->controls() );

		// Assert.
		$this->assertSame( [ 'main-menu' ], array_keys( $inner_elements ) );
		$this->assertSame( 'Main Menu', $inner_elements['main-menu']['label'] );
		$this->assertSame( '{{WRAPPER}} .elementor-item', $inner_elements['main-menu']['canonical_selector'] );
	}

	public function test_inner_elements__scopes_only_sub_selector_controls() {
		// Act.
		$inner_elements = V3_Control_Introspector::inner_elements( $this->controls() );

		// Assert.
		$this->assertSame(
			[ 'color_menu_item', 'color_menu_item_hover', 'padding_menu_item' ],
			$inner_elements['main-menu']['setting_keys']
		);
	}

	public function test_inner_elements__skips_sections_below_alias_threshold() {
		// Act.
		$inner_elements = V3_Control_Introspector::inner_elements( $this->controls() );

		// Assert.
		$this->assertArrayNotHasKey( 'thin', $inner_elements );
	}

	public function test_wrapper_setting_keys__collects_bare_wrapper_controls_across_tabs() {
		// Act.
		$setting_keys = V3_Control_Introspector::wrapper_setting_keys( $this->controls() );

		// Assert.
		$this->assertSame( [ 'menu_box_padding', '_margin' ], $setting_keys );
	}

	public function test_wrapper_setting_keys__excludes_transform_and_effects_sections() {
		// Act.
		$setting_keys = V3_Control_Introspector::wrapper_setting_keys( $this->controls() );

		// Assert.
		$this->assertNotContains( '_transform_scale_effect', $setting_keys );
	}

	public function test_non_style_keys__collects_content_tab_settings_only() {
		// Act.
		$non_style_keys = V3_Control_Introspector::non_style_keys( $this->controls() );

		// Assert.
		$this->assertSame( [ 'menu', 'toggle_align' ], $non_style_keys );
	}

	public function test_excluded_advanced_keys__lists_unwritable_advanced_controls() {
		// Act.
		$excluded = V3_Control_Introspector::excluded_advanced_keys( $this->controls() );

		// Assert.
		$this->assertSame( [ '_transform_scale_effect', 'custom_css' ], $excluded );
	}

	public function test_alias_from_section_id__strips_noise_tokens() {
		// Assert.
		$this->assertSame( 'main-menu', V3_Control_Introspector::alias_from_section_id( 'section_style_main-menu' ) );
		$this->assertSame( 'toggle', V3_Control_Introspector::alias_from_section_id( 'style_toggle' ) );
		$this->assertSame( 'header', V3_Control_Introspector::alias_from_section_id( 'header_style' ) );
		$this->assertSame( 'search-field', V3_Control_Introspector::alias_from_section_id( 'section_search_field_style' ) );
	}

	// Per-widget `non_style_keys` correctness is now guarded by `Test_V3_Widget_Parity`,
	// which iterates the parity fixtures. This unit-level test class keeps only tests that
	// exercise the introspector's *behavior*, not its per-widget outputs.
}
