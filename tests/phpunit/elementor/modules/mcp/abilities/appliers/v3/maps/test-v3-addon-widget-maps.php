<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\Mcp\Abilities\Appliers\Style_Applier;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Compiler;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps of Elementor Pro and WooCommerce widgets, compiled against control fixtures exported from
 * the live widgets, so they are covered without those plugins installed (the maps themselves live
 * in core and stay inert until the widget is registered).
 *
 * A widget is covered as soon as its map is registered and a `<widget>-controls.php` fixture exists.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Addon_Widget_Maps extends Elementor_Test_Base {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const FIXTURES_DIR_LEVELS = 4;

	private ?V3_Widget_Map_Registry $registry = null;

	public function tearDown(): void {
		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function addon_widgets_provider(): array {
		$cases = [];

		foreach ( array_keys( self::registered_map_files() ) as $widget_type ) {
			if ( is_readable( self::fixture_path( $widget_type . '-controls.php' ) ) ) {
				$cases[ $widget_type ] = [ $widget_type ];
			}
		}

		return $cases;
	}

	/**
	 * A dropped binding silently loses a style, so every map must compile against its widget's
	 * controls with no diagnostics.
	 *
	 * @dataProvider addon_widgets_provider
	 */
	public function test_get_map__compiles_with_no_diagnostics( string $widget_type ) {
		// Arrange.
		$registry = $this->registry_for( $widget_type );

		// Act.
		$map = $registry->get_map( $widget_type );

		// Assert.
		$this->assertNotNull( $map, "Map for {$widget_type} did not compile." );
		$this->assertSame( [], $registry->get_diagnostics( $widget_type ), wp_json_encode( $registry->get_diagnostics( $widget_type ) ) );
	}

	public function round_trip_provider(): array {
		$rows = [
			'countdown targets and states' => [
				'countdown',
				[ 'boxes', 'digits', 'label', 'message', 'container', 'wrapper' ],
				'boxes { background: #222222; padding: 16px; } digits { color: #ffffff; font-size: 32px; } label { color: #cccccc; }',
			],
			'my-account active tab state' => [
				'woocommerce-my-account',
				[ 'tabs', 'sections', 'titles', 'text', 'links', 'labels', 'fields', 'buttons', 'table-items', 'table-buttons', 'wrapper' ],
				'color: #333333; &:hover { color: #0073aa; } tabs:active { color: #ffffff; background: #0073aa; }',
			],
		];

		$available = $this->addon_widgets_provider();

		return array_filter( $rows, fn( array $row ) => isset( $available[ $row[0] ] ) );
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_get_map__exposes_the_expected_targets( string $widget_type, array $targets ) {
		// Act.
		$map = $this->registry_for( $widget_type )->get_map( $widget_type );

		// Assert.
		$this->assertSame( $targets, array_keys( $map->get_targets() ) );
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_round_trip__serialized_css_maps_back_to_same_settings( string $widget_type, array $targets, string $css ) {
		// Arrange.
		$this->registry_for( $widget_type );
		$written = $this->mapper()->apply( $css, $widget_type, [] );
		$readback = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], $widget_type, [] );

		// Act.
		$result = $this->mapper()->apply( $readback, $widget_type, [] );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertEquals( $written['settings_patch'], $result['settings_patch'], $readback );
		$this->assertSame( [], $result['warnings'] );
	}

	public function expire_actions_provider(): array {
		return [
			'message and redirect' => [ [ 'message', 'redirect' ] ],
			'message only' => [ [ 'message' ] ],
			'hide only' => [ [ 'hide' ] ],
		];
	}

	/**
	 * The message controls are conditioned on `expire_actions` containing `message`. Deriving that
	 * requirement would overwrite the multi-select with a scalar and drop the other actions.
	 *
	 * @dataProvider expire_actions_provider
	 */
	public function test_apply__countdown_message_style_keeps_the_expire_actions_multi_select( array $expire_actions ) {
		if ( ! isset( $this->addon_widgets_provider()['countdown'] ) ) {
			$this->markTestSkipped( 'The countdown map is not registered.' );
		}

		// Arrange.
		$this->registry_for( 'countdown' );
		$node = [
			'id' => 'elem-1',
			'elType' => 'widget',
			'widgetType' => 'countdown',
			'settings' => [ 'expire_actions' => $expire_actions ],
			'styles' => [],
		];
		$index = [ 'cd' => &$node ];

		// Act.
		( new Style_Applier( $this->converter(), self::BREAKPOINTS ) )->apply( $index, [ 'cd' => 'message { color: #ff0000; font-size: 20px; }' ], 'patch', [ 'countdown' => [] ] );

		// Assert.
		$this->assertSame( $expire_actions, $node['settings']['expire_actions'] );
		$this->assertSame( '#ff0000', $node['settings']['text_color'] );
		$this->assertSame( 'custom', $node['settings']['typography_typography'] );
	}

	private function registry_for( string $widget_type ): V3_Widget_Map_Registry {
		$controls = $this->controls( $widget_type );
		$map = require self::registered_map_files()[ $widget_type ];

		$this->assertInstanceOf( V3_Widget_Map::class, $map );

		$this->registry = new V3_Widget_Map_Registry(
			new V3_Widget_Map_Compiler(),
			static fn() => true,
			static fn() => $controls,
			[ $widget_type => $map ],
			static fn() => true
		);

		V3_Widget_Map_Registry::set_instance( $this->registry );

		return $this->registry;
	}

	/**
	 * @return array<string, mixed> The widget's controls plus the shared Advanced-tab controls.
	 */
	private function controls( string $widget_type ): array {
		$widget_controls = require self::fixture_path( $widget_type . '-controls.php' );
		$advanced_controls = require self::fixture_path( 'advanced-tab-controls.php' );

		return $widget_controls + $advanced_controls;
	}

	/**
	 * @return array<string, string> Widget type => absolute map file path.
	 */
	private static function registered_map_files(): array {
		return require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE;
	}

	private static function fixture_path( string $file ): string {
		return dirname( __DIR__, self::FIXTURES_DIR_LEVELS ) . '/fixtures/' . $file;
	}

	private function mapper(): V3_Style_Mapper {
		return V3_Style_Mapper_Factory::create( $this->converter(), self::BREAKPOINTS );
	}

	private function converter(): Css_Converter {
		return new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );
	}
}
