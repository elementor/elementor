<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Auto_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Scoped_Css_Splitter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Widget_Map_Loader;
use Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Fixtures\V3_Widget_Fixtures;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/fixtures/v3-widget-fixtures.php';

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
		return V3_Style_Mapper_Factory::create( $converter, [ 'desktop', 'tablet', 'mobile' ] );
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

	public function test_round_trip__preserves_color_var_reference() {
		$css = 'color: var(--wc26-gold);';

		$mapped = $this->make_mapper()->apply( $css, 'theme-post-title', $this->heading_config() );
		$this->assertSame( 'var(--wc26-gold)', $mapped['settings_patch']['title_color'] );

		$serialized = ( new V3_Style_Serializer() )->serialize( $mapped['settings_patch'], 'theme-post-title', $this->heading_config() );
		$this->assertStringContainsString( 'color: var(--wc26-gold);', $serialized );

		$remapped = $this->make_mapper()->apply( $serialized, 'theme-post-title', $this->heading_config() );
		$this->assertSame( 'var(--wc26-gold)', $remapped['settings_patch']['title_color'] );
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

	public function test_serialize__nav_menu_emits_alias_scoped_blocks() {
		$config = V3_Widget_Fixtures::widget_config( 'nav-menu' );
		$settings = [
			'color_menu_item' => '#1a3d2b',
			'color_menu_item_hover' => '#4b9b6e',
			'background_color_dropdown_item' => '#f5f7fa',
			'menu_typography_typography' => 'custom',
			'menu_typography_font_size' => [ 'unit' => 'rem', 'size' => 1.125 ],
			'padding_horizontal_menu_item' => [ 'unit' => 'rem', 'size' => 1.0 ],
			'dropdown_border_radius' => [
				'unit' => 'rem',
				'top' => '0.5',
				'right' => '0.5',
				'bottom' => '0.5',
				'left' => '0.5',
			],
			'toggle_size' => [ 'unit' => 'rem', 'size' => 1.5 ],
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'nav-menu', $config );

		$this->assertStringContainsString( 'main-menu {', $css );
		$this->assertStringContainsString( 'main-menu:hover {', $css );
		$this->assertStringContainsString( 'dropdown {', $css );
		$this->assertStringContainsString( 'toggle {', $css );
		$this->assertStringContainsString( 'color: #1a3d2b;', $css );
		$this->assertStringContainsString( 'color: #4b9b6e;', $css );
		$this->assertStringContainsString( 'background-color: #f5f7fa;', $css );
		$this->assertStringContainsString( 'font-size: 1.5rem;', $css );
	}

	public function test_serialize__nav_menu_emits_responsive_alias_block() {
		$config = V3_Widget_Fixtures::widget_config( 'nav-menu' );
		$settings = [
			'menu_typography_typography' => 'custom',
			'menu_typography_font_size' => [ 'unit' => 'rem', 'size' => 1.125 ],
			'menu_typography_font_size_mobile' => [ 'unit' => 'rem', 'size' => 1.0 ],
		];

		$css = ( new V3_Style_Serializer() )->serialize( $settings, 'nav-menu', $config );

		$this->assertStringContainsString( 'main-menu {', $css );
		$this->assertStringContainsString( 'font-size: 1.125rem;', $css );
		$this->assertStringContainsString( '@media(--mobile) { main-menu { font-size: 1rem; } }', $css );
	}

	public function test_round_trip__nav_menu_serializer_mapper_is_idempotent() {
		$config = V3_Widget_Fixtures::widget_config( 'nav-menu' );
		$settings = [
			'color_menu_item' => '#1a3d2b',
			'color_menu_item_hover' => '#4b9b6e',
			'background_color_dropdown_item' => '#f5f7fa',
			'menu_typography_typography' => 'custom',
			'menu_typography_font_size' => [ 'unit' => 'rem', 'size' => 1.125 ],
			'menu_typography_font_size_mobile' => [ 'unit' => 'rem', 'size' => 1.0 ],
			'padding_horizontal_menu_item' => [ 'unit' => 'rem', 'size' => 1.0 ],
			'dropdown_border_radius' => [
				'unit' => 'rem',
				'top' => '0.5',
				'right' => '0.5',
				'bottom' => '0.5',
				'left' => '0.5',
			],
			'toggle_size' => [ 'unit' => 'rem', 'size' => 1.5 ],
		];

		$serializer = new V3_Style_Serializer();
		$serialized = $serializer->serialize( $settings, 'nav-menu', $config );
		$remapped = $this->apply_scoped_css( 'nav-menu', $serialized );
		$twice = $this->apply_scoped_css( 'nav-menu', $serializer->serialize( $remapped, 'nav-menu', $config ) );

		$this->assertEquals( $remapped, $twice );
	}

	/**
	 * @return array<string, mixed>
	 */
	private function apply_scoped_css( string $widget_type, string $css ): array {
		$config = V3_Widget_Fixtures::widget_config( $widget_type );
		$inner_elements = V3_Widget_Map_Loader::get_inner_elements( $widget_type, $config['controls'] );
		$split = V3_Scoped_Css_Splitter::split( $css, array_keys( $inner_elements ) );
		$mapper = $this->make_mapper();
		$settings_patch = [];

		foreach ( $split['scopes'] as $scope_key => $scope_css ) {
			$alias = explode( ':', $scope_key, 2 )[0];
			$result = $mapper->apply(
				V3_Scoped_Css_Splitter::scope_to_mapper_css( $scope_key, $scope_css ),
				$widget_type,
				$config,
				V3_Auto_Mapper::for_scope( $config, $inner_elements[ $alias ] )
			);

			$settings_patch = array_merge( $settings_patch, $result['settings_patch'] );
		}

		return $settings_patch;
	}
}
