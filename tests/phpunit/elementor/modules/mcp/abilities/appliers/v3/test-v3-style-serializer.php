<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Style_Serializer extends TestCase {

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
					'selectors' => [ '{{WRAPPER}}' => 'text-align: {{VALUE}};' ],
				],
				'blend_mode' => [
					'type' => 'select',
					'selectors' => [ '{{WRAPPER}} .elementor-heading-title' => 'mix-blend-mode: {{VALUE}};' ],
				],
				'typography_typography' => [ 'type' => 'typography' ],
				'typography_font_size' => [ 'type' => 'slider' ],
				'typography_font_size_tablet' => [ 'type' => 'slider' ],
				'typography_font_weight' => [ 'type' => 'select' ],
				'typography_text_transform' => [ 'type' => 'select' ],
				'typography_letter_spacing' => [ 'type' => 'slider' ],
			],
		];
	}

	private function make_mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );
		return new V3_Style_Mapper( $converter, [ 'desktop', 'tablet', 'mobile' ] );
	}

	public function test_serialize__emits_color_and_typography_declarations() {
		$settings = [
			'title_color' => '#ff3355',
			'typography_typography' => 'custom',
			'typography_font_size' => [ 'unit' => 'px', 'size' => 42 ],
			'typography_text_transform' => 'uppercase',
			'typography_letter_spacing' => [ 'unit' => 'px', 'size' => 2 ],
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringContainsString( 'color: #ff3355;', $css );
		$this->assertStringContainsString( 'font-size: 42px;', $css );
		$this->assertStringContainsString( 'text-transform: uppercase;', $css );
		$this->assertStringContainsString( 'letter-spacing: 2px;', $css );
	}

	public function test_serialize__emits_hover_state() {
		$settings = [
			'title_color' => '#111',
			'title_hover_color' => '#c00',
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringContainsString( 'color: #111;', $css );
		$this->assertStringContainsString( '&:hover { color: #c00; }', $css );
	}

	public function test_serialize__emits_responsive_breakpoint_block() {
		$settings = [
			'typography_typography' => 'custom',
			'typography_font_size' => [ 'unit' => 'px', 'size' => 42 ],
			'typography_font_size_tablet' => [ 'unit' => 'px', 'size' => 32 ],
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringContainsString( 'font-size: 42px;', $css );
		$this->assertStringContainsString( '@media(--tablet) { font-size: 32px; }', $css );
	}

	public function test_serialize__skips_empty_and_unset_settings() {
		$settings = [
			'title_color' => '',
			'align' => 'center',
			'typography_font_size' => [ 'unit' => 'px', 'size' => '' ],
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringNotContainsString( 'color:', $css );
		$this->assertStringNotContainsString( 'font-size:', $css );
		$this->assertStringContainsString( 'text-align: center;', $css );
	}

	public function test_round_trip__mapper_serializer_mapper_is_idempotent() {
		$css = 'color: #ff3355; font-size: 42px; text-transform: uppercase; letter-spacing: 2px; &:hover { color: #c00; } @media(--tablet) { font-size: 32px; }';

		$mapped = $this->make_mapper()->apply( $css, 'theme-post-title', $this->heading_config() );
		$serialized = ( new V3_Style_Serializer() )->serialize( $mapped['settings_patch'], 'theme-post-title', $this->heading_config() );
		$remapped = $this->make_mapper()->apply( $serialized, 'theme-post-title', $this->heading_config() );

		$this->assertEquals( $mapped['settings_patch'], $remapped['settings_patch'] );
	}

	public function test_serialize__ignores_style_settings_not_in_registry_or_index() {
		$settings = [
			'title_color' => '#ff0000',
			'random_unknown_key' => 'foo',
			'title' => 'Hello',
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringContainsString( 'color: #ff0000;', $css );
		$this->assertStringNotContainsString( 'random_unknown_key', $css );
		$this->assertStringNotContainsString( 'Hello', $css );
	}

	public function test_serialize__appends_unwrapped_custom_css() {
		$settings = [
			'title_color' => '#ff0000',
			'custom_css' => 'selector { filter: blur(2px); }',
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'theme-post-title', $this->heading_config() );

		$this->assertStringContainsString( 'color: #ff0000;', $css );
		$this->assertStringContainsString( 'filter: blur(2px);', $css );
		$this->assertStringNotContainsString( 'selector', $css );
	}
}
