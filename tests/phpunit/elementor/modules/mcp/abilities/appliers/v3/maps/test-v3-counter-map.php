<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
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

class Test_V3_Counter_Map extends TestCase {

	const WIDGET_TYPE = 'counter';

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const CSS_FOR_EVERY_TARGET = 'font-size: 48px; color: #111111; title { font-size: 18px; color: #444444; }';

	public function setUp(): void {
		parent::setUp();

		$controls = $this->controls();

		$this->registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
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

	private V3_Widget_Map_Registry $registry;

	public function test_get_map__compiles_without_diagnostics() {
		$map = $this->registry->get_map( self::WIDGET_TYPE );

		$this->assertSame( [], $this->registry->get_diagnostics( self::WIDGET_TYPE ) );
		$this->assertSame( [ 'number', 'title', 'wrapper' ], array_keys( $map->get_targets() ) );
	}

	public function test_get_llm_contract__exposes_counter_settings() {
		$contract = $this->registry->get_llm_contract( self::WIDGET_TYPE );

		$this->assertEqualsCanonicalizing(
			[
				'starting_number',
				'ending_number',
				'prefix',
				'suffix',
				'duration',
				'thousand_separator',
				'thousand_separator_char',
				'title',
				'title_tag',
			],
			array_keys( $contract['properties'] )
		);
	}

	public function test_apply__writes_number_and_title_styles() {
		$result = $this->mapper()->apply( self::CSS_FOR_EVERY_TARGET, self::WIDGET_TYPE, [] );

		$this->assertSame( [], $result['warnings'] );
		$this->assertArrayHasKey( 'typography_number_font_size', $result['settings_patch'] );
		$this->assertArrayHasKey( 'number_color', $result['settings_patch'] );
		$this->assertArrayHasKey( 'typography_title_font_size', $result['settings_patch'] );
		$this->assertArrayHasKey( 'title_color', $result['settings_patch'] );
	}

	public function test_round_trip__serialized_css_maps_back_to_same_settings() {
		$written = $this->mapper()->apply( self::CSS_FOR_EVERY_TARGET, self::WIDGET_TYPE, [] )['settings_patch'];
		$css = ( new V3_Style_Serializer() )->serialize( $written, self::WIDGET_TYPE, [] );
		$result = $this->mapper()->apply( $css, self::WIDGET_TYPE, [] );

		$this->assertEquals( $written, $result['settings_patch'] );
		$this->assertSame( [], $result['warnings'] );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function controls(): array {
		return require dirname( __DIR__, 4 ) . '/fixtures/counter-controls.php';
	}

	private function map(): V3_Widget_Map {
		return require dirname( __DIR__, 9 ) . '/modules/mcp/abilities/appliers/v3/maps/counter-map.php';
	}
}
