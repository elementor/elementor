<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Auto_Mapper extends TestCase {

	private function nav_menu_config(): array {
		return [
			'controls' => [
				'color_menu_item' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-item' => 'color: {{VALUE}};',
					],
				],
				'color_menu_item_hover' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-item:hover' => 'color: {{VALUE}};',
					],
				],
				'color_menu_item_active' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-item.elementor-item-active' => 'color: {{VALUE}};',
					],
				],
				'color_dropdown_item' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .sub-menu .elementor-item' => 'color: {{VALUE}};',
					],
				],
				'color_dropdown_item_active' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .sub-menu .elementor-item-active' => 'color: {{VALUE}};',
					],
				],
				'toggle_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-menu-toggle' => 'color: {{VALUE}};',
					],
				],
				'padding_horizontal_menu_item' => [
					'type' => 'slider',
					'selectors' => [
						'{{WRAPPER}} .elementor-item' => 'padding-left: {{SIZE}}{{UNIT}};',
					],
				],
				'padding_horizontal_menu_item_tablet' => [ 'type' => 'slider' ],
				'padding_horizontal_menu_item_mobile' => [ 'type' => 'slider' ],
				'menu_typography_typography' => [ 'type' => 'typography' ],
				'menu_typography_font_size' => [ 'type' => 'slider' ],
			],
		];
	}

	public function test_for_scope__maps_color_control_from_selectors() {
		// Arrange.
		$inner_element = [
			'label' => 'Main menu items',
			'control_pattern' => '/(menu_item|menu_typography|pointer|animation_)/',
		];

		// Act.
		$mapping = V3_Auto_Mapper::for_scope( $this->nav_menu_config(), $inner_element );

		// Assert.
		$this->assertSame( 'color_menu_item', $mapping['generic_index']['color']['setting'] );
	}

	public function test_for_scope__detects_hover_and_active_from_control_names() {
		// Arrange.
		$inner_element = [
			'label' => 'Main menu items',
			'control_pattern' => '/(menu_item|menu_typography|pointer|animation_)/',
		];

		// Act.
		$mapping = V3_Auto_Mapper::for_scope( $this->nav_menu_config(), $inner_element );

		// Assert.
		$this->assertSame( 'color_menu_item_hover', $mapping['generic_index']['color@hover']['setting'] );
		$this->assertSame( 'color_menu_item_active', $mapping['generic_index']['color@active']['setting'] );
	}

	public function test_for_scope__isolates_inner_elements_by_regex() {
		// Arrange.
		$dropdown = [
			'label' => 'Dropdown',
			'control_pattern' => '/dropdown/',
		];
		$toggle = [
			'label' => 'Toggle',
			'control_pattern' => '/^toggle_/',
		];

		// Act.
		$dropdown_mapping = V3_Auto_Mapper::for_scope( $this->nav_menu_config(), $dropdown );
		$toggle_mapping = V3_Auto_Mapper::for_scope( $this->nav_menu_config(), $toggle );

		// Assert.
		$this->assertSame( 'color_dropdown_item', $dropdown_mapping['generic_index']['color']['setting'] );
		$this->assertSame( 'toggle_color', $toggle_mapping['generic_index']['color']['setting'] );
	}

	public function test_for_scope__escape_hatch_overrides_derived_map() {
		// Arrange.
		$inner_element = [
			'label' => 'Main menu items',
			'control_pattern' => '/(menu_item|menu_typography|pointer|animation_)/',
			'style_overrides' => [
				'color' => [
					'setting' => 'custom_color_override',
					'resolver' => 'color',
				],
			],
		];

		// Act.
		$mapping = V3_Auto_Mapper::for_scope( $this->nav_menu_config(), $inner_element );

		// Assert.
		$this->assertSame( 'custom_color_override', $mapping['overrides']['color']['setting'] );
	}

	public function test_accepted_css_properties__strips_state_suffixes() {
		// Arrange.
		$inner_element = [
			'label' => 'Main menu items',
			'control_pattern' => '/(menu_item|menu_typography|pointer|animation_)/',
		];

		// Act.
		$properties = V3_Auto_Mapper::accepted_css_properties( $this->nav_menu_config(), $inner_element );

		// Assert.
		$this->assertContains( 'color', $properties );
		$this->assertContains( 'padding-left', $properties );
		$this->assertNotContains( 'color@hover', $properties );
	}
}
