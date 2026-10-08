<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Custom_Css_Fallback;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Nav_Menu_Map extends TestCase {

	const WIDGET_TYPE = 'nav-menu';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const CSS_FOR_EVERY_TARGET = 'font-size: 18px; color: #111111; padding-inline-start: 12px; padding-inline-end: 12px; gap: 20px;'
		. ' &:hover { color: #222222; } main-menu:current { color: #333333; }'
		. ' pointer:hover { background-color: #444444; } pointer { border-width: 3px; }'
		. ' divider { border-style: dashed; border-color: #555555; }'
		. ' dropdown { background-color: #ffffff; border: 1px solid #dddddd; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }'
		. ' dropdown:hover { color: #666666; } dropdown-divider { border-style: solid; } toggle { font-size: 24px; }'
		. ' @media(--mobile) { dropdown { padding-block-start: 6px; padding-block-end: 6px; } }';

	const ROUND_TRIP_EXAMPLE_CSS = 'font-size: 18px; color: #111111; padding-inline-start: 12px; padding-inline-end: 12px;'
		. ' &:hover { color: #222222; } &:current { color: #333333; } dropdown { background-color: #ffffff; }'
		. ' wrapper { position: absolute; inset-inline-end: 20px; z-index: 9; }'
		. ' @media(--mobile) { dropdown { padding-block-start: 6px; padding-block-end: 6px; } wrapper { width: 150px; } }';

	const UNSTORABLE_CSS = 'font-weight: 650; color: #111111; dropdown { box-shadow: 0 1rem 2rem #000000; }'
		. ' @media(--mobile) { toggle { letter-spacing: 1px; } }';

	const MEDIA_QUERIES = [
		'tablet' => '(max-width: 1024px)',
		'mobile' => '(max-width: 767px)',
	];

	private V3_Widget_Map_Registry $registry;

	public function setUp(): void {
		parent::setUp();

		$controls = $this->controls();

		$this->registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $this->map() ],
			static fn() => true
		);

		V3_Widget_Map_Registry::set_instance( $this->registry );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_get_map__compiles_every_entry_against_the_nav_menu_controls() {
		// Act.
		$map = $this->registry->get_map( self::WIDGET_TYPE );

		// Assert.
		$this->assertSame( [], $this->registry->get_diagnostics( self::WIDGET_TYPE ) );
		$this->assertSame(
			[ 'main-menu', 'pointer', 'divider', 'dropdown', 'dropdown-divider', 'toggle', 'wrapper' ],
			array_keys( $map->get_targets() )
		);
		$this->assertSame( [ 'default', 'hover', 'current' ], $map->get_targets()['main-menu']->get_states() );
	}

	public function test_get_llm_contract__lists_the_site_menus_as_menu_values() {
		// Act.
		$contract = $this->registry->get_llm_contract( self::WIDGET_TYPE );

		// Assert.
		$this->assertSame( [ 'main-menu' ], $contract['properties']['menu']['enum'] );
	}

	public function test_apply__writes_every_target_without_warnings() {
		// Act.
		$result = $this->mapper()->apply( self::CSS_FOR_EVERY_TARGET, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['warnings'] );
		$this->assertEqualsCanonicalizing(
			[
				'menu_typography_font_size',
				'menu_typography_typography',
				'color_menu_item',
				'padding_horizontal_menu_item',
				'menu_space_between',
				'color_menu_item_hover',
				'color_menu_item_active',
				'pointer_color_menu_item_hover',
				'pointer_width',
				'nav_menu_divider_style',
				'nav_menu_divider_color',
				'nav_menu_divider',
				'layout',
				'background_color_dropdown_item',
				'dropdown_border_border',
				'dropdown_border_width',
				'dropdown_border_color',
				'dropdown_border_radius',
				'dropdown_box_shadow_box_shadow_type',
				'dropdown_box_shadow_box_shadow',
				'color_dropdown_item_hover',
				'dropdown_divider_border',
				'toggle_size',
				'padding_vertical_dropdown_item_mobile',
			],
			array_keys( $result['settings_patch'] )
		);
	}

	public function test_round_trip__serialized_css_maps_back_to_same_settings() {
		// Arrange.
		$written = $this->mapper()->apply( self::CSS_FOR_EVERY_TARGET, self::WIDGET_TYPE, [] )['settings_patch'];
		$css = ( new V3_Style_Serializer() )->serialize( $written, self::WIDGET_TYPE, [] );

		// Act.
		$result = $this->mapper()->apply( $css, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertEquals( $written, $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__writes_wrapper_requirements_at_the_written_breakpoint() {
		// Act.
		$result = $this->mapper()->apply( 'wrapper { inset-inline-end: 20px; z-index: 9; } @media(--mobile) { wrapper { width: 150px; } }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['warnings'] );
		$this->assertEquals(
			[
				'_offset_x_end' => [
					'unit' => 'px',
					'size' => 20,
				],
				'_offset_orientation_h' => 'end',
				'_z_index' => 9,
				'_element_custom_width_mobile' => [
					'unit' => 'px',
					'size' => 150,
				],
				'_element_width_mobile' => 'initial',
			],
			$result['settings_patch']
		);
	}

	public function test_round_trip__targets_states_and_breakpoint_requirements_read_back_as_written() {
		// Arrange.
		$written = $this->mapper()->apply( str_replace( '&:current', 'main-menu:current', self::ROUND_TRIP_EXAMPLE_CSS ), self::WIDGET_TYPE, [] );

		// Act.
		$readback = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertEqualsCanonicalizing(
			[
				'menu_typography_font_size' => [
					'unit' => 'px',
					'size' => 18,
				],
				'menu_typography_typography' => 'custom',
				'color_menu_item' => '#111111',
				'padding_horizontal_menu_item' => [
					'unit' => 'px',
					'size' => 12,
				],
				'color_menu_item_hover' => '#222222',
				'color_menu_item_active' => '#333333',
				'background_color_dropdown_item' => '#ffffff',
				'padding_vertical_dropdown_item_mobile' => [
					'unit' => 'px',
					'size' => 6,
				],
				'_position' => 'absolute',
				'_offset_x_end' => [
					'unit' => 'px',
					'size' => 20,
				],
				'_offset_orientation_h' => 'end',
				'_z_index' => 9,
				'_element_custom_width_mobile' => [
					'unit' => 'px',
					'size' => 150,
				],
				'_element_width_mobile' => 'initial',
			],
			$written['settings_patch']
		);
		$this->assertSame( self::ROUND_TRIP_EXAMPLE_CSS, $readback );
		$this->assertEquals( $written['settings_patch'], $this->mapper()->apply( $readback, self::WIDGET_TYPE, [] )['settings_patch'] );
	}

	public function test_apply__writes_wrapper_flex_parts_with_custom_size_requirement() {
		// Act.
		$result = $this->mapper()->apply( 'wrapper { flex-grow: 1; flex-shrink: 0; align-self: center; } @media(--mobile) { wrapper { flex-grow: 0; } }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['warnings'] );
		$this->assertEquals(
			[
				'_flex_grow' => 1,
				'_flex_size' => 'custom',
				'_flex_shrink' => 0,
				'_flex_align_self' => 'center',
				'_flex_grow_mobile' => 0,
				'_flex_size_mobile' => 'custom',
			],
			$result['settings_patch']
		);
	}

	public function test_round_trip__wrapper_states_map_back_to_same_settings() {
		// Arrange.
		$css = 'wrapper { margin: 10px; position: absolute; background-color: #eeeeee; border: 2px solid #000000; box-shadow: 0 2px 4px #00000033; flex-grow: 1; flex-shrink: 0; }'
			. ' wrapper:hover { background-color: #dddddd; border-style: solid; border-color: #ff0000; border-radius: 6px; }';
		$written = $this->mapper()->apply( $css, self::WIDGET_TYPE, [] )['settings_patch'];
		$readback = ( new V3_Style_Serializer() )->serialize( $written, self::WIDGET_TYPE, [] );

		// Act.
		$result = $this->mapper()->apply( $readback, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( 'classic', $written['_background_hover_background'] );
		$this->assertSame( '#ff0000', $written['_border_hover_color'] );
		$this->assertEquals( $written, $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_apply__fails_the_style_on_an_unknown_breakpoint() {
		// Act.
		$result = $this->mapper()->apply( 'color: red; @media(--watch) { color: blue; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( 'Unknown breakpoint alias: --watch. Valid breakpoints: desktop, tablet, mobile.', $result['error'] );
		$this->assertSame( [], $result['settings_patch'] );
	}

	public function test_apply__warns_about_unknown_targets_and_states() {
		// Act.
		$result = $this->mapper()->apply( 'header { color: red; } toggle:current { color: blue; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertCount( 2, $result['warnings'] );
		$this->assertStringContainsString( 'Style target header is not supported', $result['warnings'][0] );
		$this->assertStringContainsString( 'The state in toggle:current is not supported', $result['warnings'][1] );
	}

	public function test_apply__routes_unstorable_declarations_to_per_target_fallback_rules() {
		// Act.
		$result = $this->mapper()->apply( self::UNSTORABLE_CSS, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['warnings'] );
		$this->assertSame( [ 'color_menu_item' => '#111111' ], $result['settings_patch'] );
		$this->assertSame(
			[
				[
					'target' => 'toggle',
					'state' => null,
					'breakpoint' => 'mobile',
					'declarations' => [ 'letter-spacing' => '1px' ],
					'replaces' => [ 'letter-spacing' ],
				],
				[
					'target' => 'main-menu',
					'state' => null,
					'breakpoint' => 'desktop',
					'declarations' => [ 'font-weight' => '650' ],
					'replaces' => [ 'font-weight', 'color' ],
				],
				[
					'target' => 'dropdown',
					'state' => null,
					'breakpoint' => 'desktop',
					'declarations' => [ 'box-shadow' => '0 1rem 2rem #000000' ],
					'replaces' => [ 'box-shadow' ],
				],
			],
			$result['fallback_rules']
		);
		$this->assertSame(
			[
				'letter-spacing: 1px (toggle): CSS property letter-spacing is not supported by this Elementor widget.',
				'font-weight: 650 (main-menu): CSS property font-weight has a value this Elementor widget cannot store. Allowed values: 100, 200, 300, 400, 500, 600, 700, 800, 900, normal, bold.',
				'box-shadow: 0 1rem 2rem #000000 (dropdown): CSS property box-shadow has a value this Elementor widget cannot store. Box shadow lengths must be px.',
			],
			$result['fallback_notes']
		);
	}

	public function test_apply__warns_and_skips_unstorable_declarations_of_targets_without_a_selector() {
		// Act.
		$result = $this->mapper()->apply( 'divider { letter-spacing: 1px; }', self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertSame( [], $result['fallback_notes'] );
		$this->assertSame(
			[ 'CSS property letter-spacing is not supported by this Elementor widget. It was skipped because style target divider cannot hold custom CSS.' ],
			$result['warnings']
		);
	}

	public function test_round_trip__fallback_custom_css_reads_back_as_target_blocks() {
		// Arrange.
		$written = $this->mapper()->apply( self::UNSTORABLE_CSS, self::WIDGET_TYPE, [] );
		$fallback = new V3_Custom_Css_Fallback( V3_Custom_Css_Fallback::selectors_of( $this->registry->get_map( self::WIDGET_TYPE ) ), self::MEDIA_QUERIES );
		$settings = array_merge( $written['settings_patch'], [ 'custom_css' => $fallback->merge( '', $written['fallback_rules'] ) ] );
		$readback = ( new V3_Style_Serializer( null, null, null, self::MEDIA_QUERIES ) )->serialize( $settings, self::WIDGET_TYPE, [] );

		// Act.
		$result = $this->mapper()->apply( $readback, self::WIDGET_TYPE, [] );

		// Assert.
		$this->assertStringContainsString( 'selector .elementor-nav-menu--dropdown { box-shadow: 0 1rem 2rem #000000; }', $settings['custom_css'] );
		$this->assertEquals( $written['settings_patch'], $result['settings_patch'] );
		$this->assertEqualsCanonicalizing( $written['fallback_rules'], $result['fallback_rules'] );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function controls(): array {
		return require dirname( __DIR__, 4 ) . '/fixtures/nav-menu-controls.php';
	}

	private function map(): V3_Widget_Map {
		return require dirname( __DIR__, 9 ) . '/modules/mcp/abilities/appliers/v3/maps/nav-menu-map.php';
	}
}
