<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Reader;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Map_Settings_Writer;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Promotions\Widgets\Pro_Widget_Promotion;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registered widget maps compiled against the real widget controls.
 *
 * The compile test discovers every registered map whose widget is installed. Maps of widgets
 * that core does not ship (Elementor Pro, WooCommerce) are covered against control fixtures
 * in Test_V3_Addon_Widget_Maps.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Widget_Maps extends Elementor_Test_Base {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	// nav-menu ships in an earlier stack PR with its own dedicated test.
	const OWNED_ELSEWHERE = [ 'nav-menu' ];

	// The advanced wrapper binds the flex item controls, which widgets register only while it is active.
	const CONTAINER_EXPERIMENT_NAME = 'container';

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	private V3_Widget_Map_Registry $registry;

	public function setUp(): void {
		parent::setUp();
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( self::CONTAINER_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		Plugin::$instance->controls_manager->clear_stack_cache();

		$this->registry = V3_Widget_Map_Registry::create_default();
		V3_Widget_Map_Registry::set_instance( $this->registry );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		parent::tearDown();
	}

	public function registered_maps_provider(): array {
		$files = require V3_Widget_Map_Registry::REGISTERED_MAPS_FILE;
		$cases = [];

		foreach ( array_keys( $files ) as $widget_type ) {
			if ( ! in_array( $widget_type, self::OWNED_ELSEWHERE, true ) ) {
				$cases[ $widget_type ] = [ $widget_type ];
			}
		}

		return $cases;
	}

	/**
	 * A dropped binding silently loses a style, so every registered map must compile
	 * against the widget's real controls with no diagnostics.
	 *
	 * @dataProvider registered_maps_provider
	 */
	public function test_get_map__compiles_with_no_diagnostics( string $widget_type ) {
		if ( ! V3_Widget_Map_Registry::registered_widget( $widget_type ) ) {
			$this->markTestSkipped( "The {$widget_type} widget is not installed; its map is covered by the control fixtures." );
		}

		// Act.
		$map = $this->registry->get_map( $widget_type );

		// Assert.
		$this->assertNotNull( $map, "Map for {$widget_type} did not compile (widget not registered?)." );
		$this->assertSame( [], $this->registry->get_diagnostics( $widget_type ), wp_json_encode( $this->registry->get_diagnostics( $widget_type ) ) );
	}

	public function test_get_map__is_null_when_only_the_pro_promotion_placeholder_is_registered() {
		// Arrange.
		$widget_type = 'qa-promoted-widget';
		Plugin::$instance->widgets_manager->register( new Pro_Widget_Promotion( [], [
			'widget_name' => $widget_type,
			'widget_title' => 'Promoted',
		] ) );
		$counter_map = require V3_Widget_Map_Registry::MAPS_DIR . '/counter-map.php';
		$registry = V3_Widget_Map_Registry::create_default( [ $widget_type => $counter_map ] );

		// Act.
		$map = $registry->get_map( $widget_type );
		$is_supported = $registry->is_supported( $widget_type );
		$controls = $registry->get_registered_controls( $widget_type );
		Plugin::$instance->widgets_manager->unregister( $widget_type );

		// Assert.
		$this->assertNull( $map );
		$this->assertFalse( $is_supported );
		$this->assertSame( [], $controls );
		$this->assertSame( [], $registry->get_diagnostics( $widget_type ) );
	}

	public function round_trip_provider(): array {
		return [
			'counter targets and responsive typography' => [
				'counter',
				[ 'number', 'title', 'layout', 'wrapper' ],
				'color: #ff0000; font-size: 48px; font-weight: 700; text-align: start; title { color: #333333; font-size: 18px; }'
					. ' layout { gap: 12px; } @media(--mobile) { font-size: 32px; title { font-size: 14px; } }',
				[
					'ending_number' => 4.5,
					'thousand_separator' => true,
					'title' => 'Happy Clients',
					'title_tag' => 'h3',
				],
			],
			'progress per-target styles and custom switcher' => [
				'progress',
				[ 'bar', 'track', 'title', 'wrapper' ],
				'background: #00aa00; height: 20px; color: #ffffff; font-size: 12px;'
					. ' track { background: #eeeeee; border-radius: 10px; } title { color: #222222; font-weight: 600; }',
				[
					'percent' => [ 'size' => 75, 'unit' => '%' ],
					'display_percentage' => true,
				],
			],
			'social icons repeater and hover' => [
				'social-icons',
				[ 'icons', 'grid', 'wrapper' ],
				'icons { background: #3b5998; color: #ffffff; font-size: 20px; } icons:hover { background: #2d4373; } grid { column-gap: 14px; }',
				[
					'social_icon_list' => [
						[
							'social_icon' => [ 'value' => 'fab fa-facebook', 'library' => 'fa-brands' ],
							'link' => [ 'url' => 'https://facebook.com', 'is_external' => true, 'nofollow' => false ],
						],
					],
					'shape' => 'circle',
				],
			],
		];
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_get_map__exposes_the_expected_targets( string $widget_type, array $targets ) {
		// Act.
		$map = $this->registry->get_map( $widget_type );

		// Assert.
		$this->assertNotNull( $map );
		$this->assertSame( $targets, array_keys( $map->get_targets() ) );
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_round_trip__serialized_css_maps_back_to_same_settings( string $widget_type, array $targets, string $css ) {
		// Arrange.
		$written = $this->mapper()->apply( $css, $widget_type, [] );
		$readback = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], $widget_type, [] );

		// Act.
		$result = $this->mapper()->apply( $readback, $widget_type, [] );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertEquals( $written['settings_patch'], $result['settings_patch'], $readback );
		$this->assertSame( [], $result['warnings'] );
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_settings__read_back_as_written( string $widget_type, array $targets, string $css, array $plain ) {
		// Arrange.
		$map = $this->registry->get_map( $widget_type );
		$writer = new V3_Map_Settings_Writer( Atomic_Widgets_Module::instance()->get_settings_plain_values_resolver() );

		// Act.
		$written = $writer->write( $map, $plain );
		$read = V3_Map_Settings_Reader::read( $map, $written['settings'] );

		// Assert.
		$this->assertSame( [], $written['rejected'] );
		$this->assertEquals( $plain, $read );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
	}
}
