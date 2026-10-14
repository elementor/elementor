<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Mcp\Abilities\Utils\Widget_Context_Helper;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use PHPUnit\Framework\TestCase;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_V3_Widget_Maps extends TestCase {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	private array $original_experiment_states = [];

	public function setUp(): void {
		parent::setUp();

		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();

		parent::tearDown();
	}

	public function core_map_provider(): array {
		return [
			'counter' => [ 'counter', 'color: #111111; font-size: 48px; font-weight: 700; & title { color: #555555; font-size: 16px; } @media(--mobile) { font-size: 32px; }' ],
			'progress' => [ 'progress', 'background: #4f46e5; height: 18px; color: #ffffff; & track { background: #e5e7eb; border-radius: 9px; } & title { color: #111827; font-weight: 600; }' ],
			'social-icons' => [ 'social-icons', 'background: #0f172a; color: #ffffff; font-size: 20px; border-radius: 50%; &:hover { background: #e11d48; } & row { column-gap: 14px; }' ],
			'image-gallery' => [ 'image-gallery', 'border-radius: 12px; & caption { color: #444444; text-align: center; }' ],
			'image-carousel' => [ 'image-carousel', 'border-radius: 16px; & arrows { color: #ffffff; font-size: 28px; } & dots { background: #111111; }' ],
		];
	}

	/**
	 * @dataProvider core_map_provider
	 */
	public function test_core_map__compiles_against_the_live_widget( string $widget_type ) {
		// Act.
		$contract = V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type );

		// Assert.
		$this->assertNotNull( $contract, "{$widget_type} map did not compile against the registered widget controls." );
		$this->assertTrue( V3_Widget_Map_Registry::instance()->is_supported( $widget_type ) );
	}

	/**
	 * @dataProvider core_map_provider
	 */
	public function test_core_map__css_round_trips_through_every_target( string $widget_type, string $css ) {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( $widget_type ) ?? [];

		// Act.
		$written = $mapper->apply( $css, $widget_type, $widget_config );
		$readback_css = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], $widget_type, $widget_config );
		$rewritten = $mapper->apply( $readback_css, $widget_type, $widget_config );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertNotSame( [], $written['settings_patch'] );
		$this->assertEquals( $written['settings_patch'], $rewritten['settings_patch'], $readback_css );
		$this->assertSame( [], $rewritten['warnings'] );
	}

	public function test_counter__routes_each_target_to_its_own_control() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'counter' ) ?? [];

		// Act.
		$result = $mapper->apply( 'color: #ff0000; & title { color: #00ff00; }', 'counter', $widget_config );

		// Assert.
		$this->assertSame( '#ff0000', $result['settings_patch']['number_color'] ?? null );
		$this->assertSame( '#00ff00', $result['settings_patch']['title_color'] ?? null );
		$this->assertSame( [], $result['warnings'] );
	}

	public function test_social_icons__hover_block_writes_hover_controls_of_the_default_target() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'social-icons' ) ?? [];

		// Act.
		$result = $mapper->apply( '&:hover { background: #e11d48; color: #ffffff; }', 'social-icons', $widget_config );

		// Assert.
		$this->assertSame( '#e11d48', $result['settings_patch']['hover_primary_color'] ?? null );
		$this->assertSame( '#ffffff', $result['settings_patch']['hover_secondary_color'] ?? null );
		$this->assertArrayNotHasKey( 'icon_primary_color', $result['settings_patch'] );
	}

	public function test_unknown_target__is_skipped_with_a_warning_listing_the_targets() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'counter' ) ?? [];

		// Act.
		$result = $mapper->apply( '& banner { color: #000000; }', 'counter', $widget_config );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( 'number, title', $result['warnings'][0] );
	}

	public function test_property_without_binding_on_target__is_skipped_with_a_warning() {
		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( 'progress' ) ?? [];

		// Act.
		$result = $mapper->apply( '& track { color: #000000; }', 'progress', $widget_config );

		// Assert.
		$this->assertSame( [], $result['settings_patch'] );
		$this->assertNotEmpty( $result['warnings'] );
	}

	public function pro_map_provider(): array {
		return [
			'nav-menu' => [ 'nav-menu' ],
			'mega-menu' => [ 'mega-menu' ],
		];
	}

	/**
	 * @dataProvider pro_map_provider
	 */
	public function test_pro_map__compiles_when_pro_registers_the_widget( string $widget_type ) {
		if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			// Assert.
			$this->assertNull( V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type ) );
			$this->markTestSkipped( "{$widget_type} is an Elementor Pro widget and Pro is not loaded." );
		}

		// Act.
		$contract = V3_Widget_Map_Registry::instance()->get_llm_contract( $widget_type );

		// Assert.
		$this->assertNotNull( $contract, "{$widget_type} map did not compile against the Pro widget controls." );
	}

	private function make_mapper(): V3_Style_Mapper {
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
		V3_Widget_Map_Registry::reset_instance();
	}
}
