<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Style_Mapper extends TestCase {

	private function make_mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );

		return new V3_Style_Mapper( $converter, [ 'desktop', 'tablet', 'mobile' ] );
	}

	private function heading_config(): array {
		return [
			'controls' => [
				'title_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-heading-title' => 'color: {{VALUE}};',
					],
				],
				'title_hover_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}} .elementor-heading-title:hover' => 'color: {{VALUE}};',
					],
				],
				'align' => [
					'type' => 'choose',
					'selectors' => [
						'{{WRAPPER}}' => 'text-align: {{VALUE}};',
					],
				],
				'typography_typography' => [ 'type' => 'typography' ],
				'typography_font_size' => [ 'type' => 'slider' ],
				'typography_font_size_tablet' => [ 'type' => 'slider' ],
				'typography_font_weight' => [ 'type' => 'select' ],
			],
		];
	}

	public function test_apply__maps_color_via_override() {
		// Arrange.
		$mapper = $this->make_mapper();

		// Act.
		$result = $mapper->apply( 'color: #111111;', 'theme-post-title', $this->heading_config() );

		// Assert.
		$this->assertSame( '#111111', $result['settings_patch']['title_color'] );
		$this->assertSame( '', $result['unmapped_css'] );
	}

	public function test_apply__maps_typography_group_and_forces_custom_toggle() {
		// Arrange.
		$mapper = $this->make_mapper();

		// Act.
		$result = $mapper->apply(
			'font-size: 2rem; font-weight: 700;',
			'theme-post-title',
			$this->heading_config()
		);

		// Assert.
		$this->assertSame( 'custom', $result['settings_patch']['typography_typography'] );
		$this->assertSame( [ 'unit' => 'rem', 'size' => 2.0 ], $result['settings_patch']['typography_font_size'] );
		$this->assertSame( '700', $result['settings_patch']['typography_font_weight'] );
		$this->assertSame( '', $result['unmapped_css'] );
	}

	public function test_apply__maps_hover_color_via_override() {
		// Arrange.
		$mapper = $this->make_mapper();

		// Act.
		$result = $mapper->apply( '&:hover { color: blue; }', 'theme-post-title', $this->heading_config() );

		// Assert.
		$this->assertSame( 'blue', $result['settings_patch']['title_hover_color'] );
		$this->assertSame( '', $result['unmapped_css'] );
	}

	public function test_apply__maps_padding_shorthand_via_override_on_featured_image() {
		// Arrange.
		$mapper = $this->make_mapper();
		$config = [
			'controls' => [
				'image_border_radius' => [ 'type' => 'dimensions' ],
				'image_border_border' => [ 'type' => 'select' ],
				'image_border_width' => [ 'type' => 'dimensions' ],
				'image_border_color' => [ 'type' => 'color' ],
			],
		];

		// Act.
		$result = $mapper->apply( 'border-radius: 8px;', 'theme-post-featured-image', $config );

		// Assert.
		$this->assertArrayHasKey( 'image_border_radius', $result['settings_patch'] );
		$this->assertSame( '8', $result['settings_patch']['image_border_radius']['top'] );
		$this->assertTrue( $result['settings_patch']['image_border_radius']['isLinked'] );
	}

	public function test_apply__unmapped_property_falls_back_to_unmapped_css() {
		// Arrange.
		$mapper = $this->make_mapper();

		// Act.
		$result = $mapper->apply(
			'color: red; filter: blur(4px);',
			'theme-post-title',
			$this->heading_config()
		);

		// Assert.
		$this->assertSame( 'red', $result['settings_patch']['title_color'] );
		$this->assertStringContainsString( 'filter: blur(4px);', $result['unmapped_css'] );
	}

	public function test_apply__tablet_breakpoint_writes_responsive_suffix_when_control_exists() {
		// Arrange.
		$mapper = $this->make_mapper();

		// Act.
		$result = $mapper->apply(
			'@media(--tablet) { font-size: 1.25rem; }',
			'theme-post-title',
			$this->heading_config()
		);

		// Assert.
		$this->assertSame( 'custom', $result['settings_patch']['typography_typography'] );
		$this->assertArrayHasKey( 'typography_font_size_tablet', $result['settings_patch'] );
		$this->assertSame( [ 'unit' => 'rem', 'size' => 1.25 ], $result['settings_patch']['typography_font_size_tablet'] );
	}

	public function test_apply__generic_selector_reverse_for_unique_match() {
		// Arrange — text-align is in heading overrides too; use a widget without that override
		// and a unique selector-backed control not covered by overrides.
		$mapper = $this->make_mapper();
		$config = [
			'controls' => [
				'text_color' => [
					'type' => 'color',
					'selectors' => [
						'{{WRAPPER}}' => 'color: {{VALUE}};',
					],
				],
				'extra_gap' => [
					'type' => 'slider',
					'selectors' => [
						'{{WRAPPER}}' => 'gap: {{SIZE}}{{UNIT}};',
					],
				],
			],
		];

		// Act — theme-post-content has color override to text_color; gap is generic-only.
		$result = $mapper->apply( 'gap: 12px;', 'theme-post-content', $config );

		// Assert.
		$this->assertSame( [ 'unit' => 'px', 'size' => 12.0 ], $result['settings_patch']['extra_gap'] );
	}

	public function test_apply__empty_css_returns_empty_patch() {
		$mapper = $this->make_mapper();
		$result = $mapper->apply( '   ', 'theme-post-title', $this->heading_config() );

		$this->assertSame( [], $result['settings_patch'] );
		$this->assertSame( '', $result['unmapped_css'] );
	}
}
