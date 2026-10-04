<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Inactive_Condition_Warnings;
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

	const CSS_FOR_EVERY_TARGET = 'font-size: 18px; color: #111111; padding-inline: 12px; gap: 20px;'
		. ' &:hover { color: #222222; } &:selected { color: #333333; }'
		. ' pointer:hover { background-color: #444444; color: #fafafa; } pointer { border-width: 3px; }'
		. ' divider { border-style: dashed; border-color: #555555; }'
		. ' dropdown { background-color: #ffffff; border: 1px solid #dddddd; border-radius: 4px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }'
		. ' dropdown:hover { color: #666666; } dropdown-divider { border-style: solid; } toggle { font-size: 24px; }'
		. ' @media(--mobile) { dropdown { padding-block: 6px; } }';

	private array $controls;

	public function setUp(): void {
		parent::setUp();

		$this->controls = require dirname( __DIR__, 4 ) . '/fixtures/nav-menu-controls.php';
		$controls = $this->controls;

		V3_Widget_Map_Registry::set_instance( new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => true,
			static fn() => $controls,
			[ self::WIDGET_TYPE => $this->map() ]
		) );
	}

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function test_compile__accepts_the_nav_menu_controls() {
		// Act.
		$result = ( new V3_Widget_Map_Compiler() )->compile( $this->map(), $this->controls, self::WIDGET_TYPE );

		// Assert.
		$this->assertIsArray( $result );
		$this->assertSame( [ 'main-menu', 'pointer', 'divider', 'dropdown', 'dropdown-divider', 'toggle', 'wrapper' ], array_keys( $result['style_targets'] ) );
		$this->assertSame( [ 'horizontal', 'vertical', 'dropdown' ], $result['settings']['layout']['enum'] );
		$this->assertSame( [ 'true' => 'stretch', 'false' => '' ], $result['settings']['full_width']['convert'] );
		$this->assertSame( [ 'dropdown!' => 'none' ], $result['settings']['full_width']['condition'] );
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
				'color_menu_item_hover_pointer_bg',
				'pointer_width',
				'nav_menu_divider_style',
				'nav_menu_divider_color',
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

	public function test_apply__writes_wrapper_companions_at_the_written_breakpoint() {
		// Act.
		$result = $this->mapper()->apply( 'wrapper { right: 20px; z-index: 9; } @media(--mobile) { wrapper { width: 150px; } }', self::WIDGET_TYPE, [] );

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

	public function test_round_trip__wrapper_states_map_back_to_same_settings() {
		// Arrange.
		$css = 'wrapper { margin: 10px; position: absolute; background-color: #eeeeee; border: 2px solid #000000; box-shadow: 0 2px 4px #00000033; }'
			. ' wrapper:hover { background-color: #dddddd; border-color: #ff0000; border-radius: 6px; }';
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

	public function test_collect__warns_when_divider_is_styled_but_not_enabled() {
		// Arrange.
		$patch = $this->mapper()->apply( 'divider { border-color: #555555; }', self::WIDGET_TYPE, [] )['settings_patch'];

		// Act.
		$result = V3_Inactive_Condition_Warnings::collect( array_keys( $patch ), $patch, $this->controls );

		// Assert.
		$this->assertSame(
			[ "Setting nav_menu_divider_color was saved but only takes effect when layout is not 'dropdown' and nav_menu_divider is 'yes' and layout is 'horizontal'." ],
			$result
		);
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( new Converter_Registry(), new Null_Failure_Reporter() );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function map(): array {
		return require dirname( __DIR__, 9 ) . '/modules/mcp/abilities/appliers/v3/maps/nav-menu-map.php';
	}
}
