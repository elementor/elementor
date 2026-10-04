<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Control_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Group_Style_Targets extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_apply__border_shorthand_writes_group_settings() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'border: 2px dashed #ff0000;', self::WIDGET_TYPE, [] );

		// Assert.
		$patch = $result['settings_patch'];
		$this->assertSame( 'dashed', $patch['dropdown_border_border'] );
		$this->assertSame( '#ff0000', $patch['dropdown_border_color'] );
		$this->assertSame( '2', $patch['dropdown_border_width']['top'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__border_shorthand_without_width_and_color_keeps_style_only() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'border: dotted;', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [ 'dropdown_border_border' => 'dotted' ], $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__border_width_longhand_is_responsive() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( '@media(--tablet) { border-width: 3px; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( '3', $result['settings_patch']['dropdown_border_width_tablet']['top'] );
	}

	public function test_apply__box_shadow_writes_shape_and_toggle() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'box-shadow: 0 4px 8px rgba(0,0,0,0.2);', self::WIDGET_TYPE, [] );

		// Assert.
		$patch = $result['settings_patch'];
		$this->assertSame( 'yes', $patch['dropdown_box_shadow_type'] );
		$this->assertSame( 'rgba(0,0,0,0.2)', $patch['dropdown_box_shadow']['color'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__border_radius_writes_sides_on_dimensions_control() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'border-radius: 4px 8px;', self::WIDGET_TYPE, [] );

		// Assert.
		$radius = $result['settings_patch']['border_radius_dropdown'];
		$this->assertSame( '4', $radius['top'] );
		$this->assertSame( '8', $radius['right'] );
	}

	public function test_apply__choice_maps_css_value_through_selectors_dictionary() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'main-menu { justify-content: flex-end; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [ 'menu_align' => 'end' ], $result['settings_patch'] );
	}

	public function test_apply__choice_warns_and_drops_unknown_css_value() {
		// Arrange.
		$this->install_registry();

		// Act.
		$result = $this->mapper()->apply( 'main-menu { justify-content: space-evenly; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'justify-content', $result['warnings'][0] );
	}

	public function test_serialize__reads_back_group_settings_without_duplicate_shorthand() {
		// Arrange.
		$this->install_registry();
		$settings = [
			'dropdown_border_border' => 'solid',
			'dropdown_border_color' => '#000000',
			'dropdown_border_width' => $this->sides( '1' ),
			'dropdown_box_shadow_type' => 'yes',
			'dropdown_box_shadow' => [
				'horizontal' => 0,
				'vertical' => 4,
				'blur' => 8,
				'spread' => 0,
				'color' => 'rgba(0,0,0,0.2)',
			],
			'menu_align' => 'center',
		];

		// Act.
		$css = ( new V3_Style_Serializer() )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertStringContainsString( 'border-style: solid;', $css );
		$this->assertStringContainsString( 'border-color: #000000;', $css );
		$this->assertStringContainsString( 'border-width: 1px;', $css );
		$this->assertStringContainsString( 'box-shadow: 0px 4px 8px 0px rgba(0,0,0,0.2);', $css );
		$this->assertStringContainsString( 'main-menu { justify-content: center; }', $css );
		$this->assertStringNotContainsString( 'border: ', $css );
	}

	public function test_compile__rejects_choice_on_declaration_valued_dictionary() {
		// Arrange.
		$map = $this->map();
		$map['style_targets']['toggle']['css_properties']['margin'] = [ 'default' => Style_Control_Target::choice( 'toggle_align' ) ];

		// Act.
		$result = ( new V3_Widget_Map_Compiler() )->compile( $map, $this->controls(), self::WIDGET_TYPE );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'incompatible_choice_values', $result->get_error_message() );
	}

	public function test_compile__rejects_explicit_choice_values_outside_control_options() {
		// Arrange.
		$map = $this->map();
		$map['style_targets']['main-menu']['css_properties']['justify-content'] = [
			'default' => Style_Control_Target::choice( 'menu_align', false, [ 'stretch' => 'stretch' ] ),
		];

		// Act.
		$result = ( new V3_Widget_Map_Compiler() )->compile( $map, $this->controls(), self::WIDGET_TYPE );

		// Assert.
		$this->assertInstanceOf( \WP_Error::class, $result );
		$this->assertSame( 'incompatible_choice_values', $result->get_error_message() );
	}

	private function install_registry(): void {
		$controls = $this->controls();

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $this->map() ]
		) );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function map(): array {
		return [
			'widget_type' => self::WIDGET_TYPE,
			'description' => 'Navigation menu.',
			'settings' => [],
			'default_style_target' => 'dropdown',
			'style_targets' => [
				'main-menu' => [
					'css_properties' => [
						'justify-content' => [ 'default' => Style_Control_Target::choice( 'menu_align' ) ],
					],
				],
				'dropdown' => [
					'css_properties' => Style_Control_Target::border_group( 'dropdown_border' ) + [
						'box-shadow' => [ 'default' => Style_Control_Target::box_shadow( 'dropdown' ) ],
						'border-radius' => [ 'default' => Style_Control_Target::control( 'border_radius_dropdown', 'sides' ) ],
					],
				],
				'toggle' => [
					'css_properties' => [],
				],
			],
		];
	}

	private function controls(): array {
		return [
			'menu_align' => [
				'type' => 'choose',
				'options' => [
					'start' => [ 'title' => 'Start' ],
					'center' => [ 'title' => 'Center' ],
					'end' => [ 'title' => 'End' ],
				],
				'selectors_dictionary' => [
					'start' => 'flex-start',
					'center' => 'center',
					'end' => 'flex-end',
				],
			],
			'toggle_align' => [
				'type' => 'choose',
				'options' => [
					'left' => [ 'title' => 'Left' ],
					'right' => [ 'title' => 'Right' ],
				],
				'selectors_dictionary' => [
					'left' => 'margin-right: auto',
					'right' => 'margin-left: auto',
				],
			],
			'dropdown_border_border' => [
				'type' => 'select',
				'options' => [
					'' => 'Default',
					'none' => 'None',
					'solid' => 'Solid',
					'double' => 'Double',
					'dotted' => 'Dotted',
					'dashed' => 'Dashed',
					'groove' => 'Groove',
				],
			],
			'dropdown_border_width' => [
				'type' => 'dimensions',
				'is_responsive' => true,
			],
			'dropdown_border_color' => [ 'type' => 'color' ],
			'dropdown_box_shadow_type' => [ 'type' => 'popover_toggle' ],
			'dropdown_box_shadow' => [ 'type' => 'box_shadow' ],
			'border_radius_dropdown' => [ 'type' => 'dimensions' ],
		];
	}

	private function sides( string $size ): array {
		return [
			'top' => $size,
			'right' => $size,
			'bottom' => $size,
			'left' => $size,
			'unit' => 'px',
			'isLinked' => true,
		];
	}
}
