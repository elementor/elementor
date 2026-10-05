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

class Test_V3_Map_Round_Trip extends TestCase {

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

	public function map_css_provider(): array {
		return [
			'button' => [ 'button', 'color: #ffffff; background: #111111; padding: 12px 24px; font-size: 18px; font-weight: 700; &:hover { color: #eeeeee; } @media(--mobile) { font-size: 14px; padding: 8px; }' ],
			'heading' => [ 'heading', 'color: #222222; font-size: 32px; line-height: 1.4; font-weight: 600; &:hover { color: #333333; } @media(--tablet) { font-size: 24px; }' ],
			'text-editor' => [ 'text-editor', 'color: #444444; font-size: 16px; line-height: 1.6; @media(--mobile) { line-height: 1.3; }' ],
			'container' => [ 'container', 'background: #fafafa; padding: 40px 20px; margin: 10px; @media(--tablet) { padding: 20px; }' ],
		];
	}

	/**
	 * @dataProvider map_css_provider
	 */
	public function test_round_trip__readback_css_writes_back_the_same_settings( string $widget_type, string $css ) {
		if ( ! isset( V3_Widget_Map_Registry::instance()->get_style_routing( $widget_type )['default_target'] ) ) {
			$this->markTestSkipped( $widget_type . ' has no compiled style map on this branch.' );
		}

		// Arrange.
		$mapper = $this->make_mapper();
		$widget_config = Widget_Context_Helper::get_widget_config( $widget_type ) ?? [];

		// Act.
		$written = $mapper->apply( $css, $widget_type, $widget_config );
		$readback_css = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], $widget_type, $widget_config );
		$rewritten = $mapper->apply( $readback_css, $widget_type, $widget_config );

		// Assert.
		$this->assertSame( [], $written['warnings'] );
		$this->assertNotSame( '', $readback_css );
		$this->assertEquals( $written['settings_patch'], $rewritten['settings_patch'], $readback_css );
		$this->assertSame( [], $rewritten['warnings'] );
	}

	public function test_serialize__skips_typography_field_when_group_is_not_custom() {
		// Arrange.
		$widget_type = 'heading';

		if ( ! isset( V3_Widget_Map_Registry::instance()->get_style_routing( $widget_type )['default_target'] ) ) {
			$this->markTestSkipped( 'heading has no compiled style map on this branch.' );
		}

		$widget_config = Widget_Context_Helper::get_widget_config( $widget_type ) ?? [];
		$settings = [
			'title_color' => '#222222',
			'typography_font_size' => [
				'unit' => 'px',
				'size' => 32,
			],
		];

		// Act.
		$css = ( new V3_Style_Serializer() )->serialize( $settings, $widget_type, $widget_config );

		// Assert.
		$this->assertSame( 'color: #222222;', $css );
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
