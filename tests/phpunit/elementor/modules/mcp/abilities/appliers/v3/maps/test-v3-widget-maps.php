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
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Promotions\Widgets\Pro_Widget_Promotion;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registered widget maps compiled against the real widget controls.
 *
 * The compile test discovers every registered map, so later stack PRs that register
 * more widgets are covered without editing it; only the round-trip provider grows.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Widget_Maps extends Elementor_Test_Base {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	// nav-menu ships in an earlier stack PR with its own dedicated test.
	const OWNED_ELSEWHERE = [ 'nav-menu' ];

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	private V3_Widget_Map_Registry $registry;

	public function setUp(): void {
		parent::setUp();
		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

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
		$this->skip_unless_widget_controls_are_registered( $widget_type );

		// Act.
		$map = $this->registry->get_map( $widget_type );

		// Assert.
		$this->assertNotNull( $map, "Map for {$widget_type} did not compile (widget not registered?)." );
		$this->assertSame( [], $this->registry->get_diagnostics( $widget_type ), wp_json_encode( $this->registry->get_diagnostics( $widget_type ) ) );
	}

	public function round_trip_provider(): array {
		return [
			'counter targets and responsive typography' => [
				'counter',
				[ 'number', 'title', 'layout', 'wrapper' ],
				'color: #ff0000; font-size: 48px; font-weight: 700; title { color: #333333; font-size: 18px; }'
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
			'countdown multi-enum and switchers' => [
				'countdown',
				[ 'boxes', 'digits', 'label', 'message', 'container', 'wrapper' ],
				'boxes { background: #222222; padding: 16px; } digits { color: #ffffff; font-size: 32px; } label { color: #cccccc; }',
				[
					'countdown_type' => 'due_date',
					'show_days' => true,
					'show_labels' => true,
					'expire_actions' => [ 'message', 'redirect' ],
				],
			],
			'woo my-account active-state tabs' => [
				'woocommerce-my-account',
				[ 'tabs', 'sections', 'titles', 'text', 'links', 'labels', 'fields', 'buttons', 'table-items', 'table-buttons', 'wrapper' ],
				'color: #333333; &:hover { color: #0073aa; } tabs:active { color: #ffffff; background: #0073aa; }',
				[ 'tabs_layout' => 'horizontal' ],
			],
		];
	}

	/**
	 * @dataProvider round_trip_provider
	 */
	public function test_get_map__exposes_the_expected_targets( string $widget_type, array $targets ) {
		$this->skip_unless_widget_controls_are_registered( $widget_type );

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
		$this->skip_unless_widget_controls_are_registered( $widget_type );

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
		$this->skip_unless_widget_controls_are_registered( $widget_type );

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

	private function skip_unless_widget_controls_are_registered( string $widget_type ): void {
		$widget = Plugin::$instance->widgets_manager->get_widget_types( $widget_type )
			?? Plugin::$instance->elements_manager->get_element_types( $widget_type );

		if ( ! $widget || $widget instanceof Pro_Widget_Promotion ) {
			$this->markTestSkipped( sprintf( '%s is not registered in this run.', $widget_type ) );
		}
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter( Converter_Registry_Factory::create( null ), new Null_Failure_Reporter(), Expander_Registry_Factory::create( null ) );

		return V3_Style_Mapper_Factory::create( $converter, self::BREAKPOINTS );
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			if ( empty( $features ) && Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME === $experiment_name ) {
				Plugin::$instance->experiments->add_feature( Mcp_Module::get_v3_standardized_maps_experimental_data() );
				$features = Plugin::$instance->experiments->get_features( $experiment_name );
			}

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
	}
}
