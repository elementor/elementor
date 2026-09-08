<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Map_Compiler extends TestCase {

	private V3_Widget_Map_Compiler $compiler;

	public function setUp(): void {
		parent::setUp();

		$this->compiler = new V3_Widget_Map_Compiler();
	}

	public function test_compile__returns_compiled_map_for_valid_single_target() {
		$result = $this->compiler->compile( $this->single_target_map(), $this->heading_controls() );

		$this->assertFalse( is_wp_error( $result ) );
		$this->assertSame( 'heading', $result['widget_type'] );
		$this->assertSame( 'heading', $result['default_style_target'] );
		$this->assertSame( [ 'color' ], array_keys( $result['style_targets']['heading']['css_properties'] ) );
	}

	public function test_compile__returns_compiled_map_for_valid_multi_target() {
		$result = $this->compiler->compile( $this->multi_target_map(), $this->nav_menu_controls() );

		$this->assertFalse( is_wp_error( $result ) );
		$this->assertSame( [ 'main-menu', 'toggle' ], array_keys( $result['style_targets'] ) );
		$this->assertTrue( $result['style_targets']['toggle']['css_properties']['font-size']['default']['responsive'] );
	}

	public function test_compile__returns_error_when_required_field_missing() {
		$map = $this->single_target_map();
		unset( $map['description'] );

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'elementor_v3_map_invalid', $result->get_error_code() );
		$this->assertSame( 'missing_field', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_catalog_visibility_invalid() {
		$map = $this->single_target_map();
		$map['catalog_visibility'] = 'sometimes';

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'invalid_visibility', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_default_style_target_missing() {
		$map = $this->single_target_map();
		$map['default_style_target'] = 'missing-target';

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'missing_default_style_target', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_style_target_alias_invalid() {
		$map = $this->single_target_map();
		$map['style_targets'] = [
			'Heading Body' => $map['style_targets']['heading'],
		];
		$map['default_style_target'] = 'Heading Body';

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'invalid_alias', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_descriptor_kind_invalid() {
		$map = $this->single_target_map();
		$map['style_targets']['heading']['css_properties']['color']['default'] = [
			'kind' => 'unknown',
			'destinations' => [],
		];

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'invalid_descriptor_kind', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_destination_control_missing() {
		$map = $this->single_target_map();
		$map['style_targets']['heading']['css_properties']['color']['default'] = Style_Control_Target::control( 'missing_color', 'color' );

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'missing_control', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_resolver_incompatible_with_control() {
		$map = $this->single_target_map();
		$map['style_targets']['heading']['css_properties']['color']['default'] = Style_Control_Target::control( 'title', 'color' );

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'incompatible_resolver', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_group_destination_incomplete() {
		$map = $this->single_target_map();
		$map['style_targets']['heading']['css_properties']['font-size'] = [
			'default' => Style_Control_Target::typography( 'typography' ),
		];

		$result = $this->compiler->compile( $map, [
			'title_color' => [ 'type' => 'color' ],
			'typography_typography' => [ 'type' => 'popover_toggle' ],
			'typography_font_family' => [ 'type' => 'font' ],
		] );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'incomplete_group_destination', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_settings_contain_nested_repeater() {
		$map = $this->single_target_map();
		$map['settings']['items'] = [
			'type' => 'repeater',
			'fields' => [
				'nested' => [
					'type' => 'repeater',
					'fields' => [
						'label' => [ 'type' => 'text' ],
					],
				],
			],
		];

		$result = $this->compiler->compile( $map, $this->heading_controls() );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'nested_repeater', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	public function test_compile__returns_error_when_widget_type_mismatch() {
		$map = $this->single_target_map();
		$map['widget_type'] = 'button';

		$result = $this->compiler->compile( $map, $this->heading_controls(), 'heading' );

		$this->assertTrue( is_wp_error( $result ) );
		$this->assertSame( 'widget_type_mismatch', $result->get_error_data( 'elementor_v3_map_invalid' )['reason'] );
	}

	private function single_target_map(): array {
		return [
			'widget_type' => 'heading',
			'description' => 'Heading widget.',
			'catalog_visibility' => 'v4_disabled',
			'settings' => [
				'title' => [ 'type' => 'text' ],
			],
			'default_style_target' => 'heading',
			'style_targets' => [
				'heading' => [
					'label' => 'Heading',
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'title_color', 'color' ),
						],
					],
				],
			],
		];
	}

	private function multi_target_map(): array {
		return [
			'widget_type' => 'nav-menu',
			'description' => 'Navigation menu.',
			'catalog_visibility' => 'always',
			'settings' => [
				'layout' => [ 'type' => 'select' ],
			],
			'default_style_target' => 'main-menu',
			'style_targets' => [
				'main-menu' => [
					'label' => 'Main menu items',
					'css_properties' => [
						'color' => [
							'default' => Style_Control_Target::control( 'color_menu_item', 'color' ),
							'hover' => Style_Control_Target::control( 'color_menu_item_hover', 'color' ),
						],
					],
				],
				'toggle' => [
					'label' => 'Mobile toggle',
					'css_properties' => [
						'font-size' => [
							'default' => Style_Control_Target::control( 'toggle_size', 'dimension', true ),
						],
					],
				],
			],
		];
	}

	private function heading_controls(): array {
		return [
			'title' => [ 'type' => 'text' ],
			'title_color' => [ 'type' => 'color' ],
		];
	}

	private function nav_menu_controls(): array {
		return [
			'layout' => [ 'type' => 'select' ],
			'color_menu_item' => [ 'type' => 'color' ],
			'color_menu_item_hover' => [ 'type' => 'color' ],
			'toggle_size' => [ 'type' => 'slider' ],
		];
	}
}
