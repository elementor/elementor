<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\CssConverter\Converter_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Css_Converter;
use Elementor\Modules\AtomicWidgets\CssConverter\Expander_Registry_Factory;
use Elementor\Modules\AtomicWidgets\CssConverter\Metrics\Null_Failure_Reporter;
use Elementor\Modules\AtomicWidgets\CssConverter\Variable_Prop_Value_Transformer;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Settings_Patch;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Mapper_Factory;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\V3_Style_Serializer;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Modules\Variables\PropTypes\Color_Variable_Prop_Type;
use Elementor\Modules\Variables\Services\Batch_Operations\Batch_Processor;
use Elementor\Modules\Variables\Services\Variables_Service;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * V4 color variables written on V3 widget colors.
 *
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Color_Variables extends Elementor_Test_Base {

	const BREAKPOINTS = [ 'desktop', 'tablet', 'mobile' ];

	const SYNCED_LABEL = 'qa-synced-brand';
	const UNSYNCED_LABEL = 'qa-local-brand';
	const SYNCED_VALUE = '#123456';
	const UNSYNCED_VALUE = '#abcdef';

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	private Variables_Service $variables_service;

	public function setUp(): void {
		parent::setUp();
		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		V3_Widget_Map_Registry::set_instance( V3_Widget_Map_Registry::create_default() );

		Plugin::$instance->kits_manager->create_new_kit( 'V3 color variables', [], true );
		$kit = Plugin::$instance->kits_manager->get_active_kit();
		$this->variables_service = new Variables_Service( new Variables_Repository( $kit ), new Batch_Processor() );
		$this->given_color_variable( self::SYNCED_LABEL, self::SYNCED_VALUE, true );
		$this->given_color_variable( self::UNSYNCED_LABEL, self::UNSYNCED_VALUE, false );
		Variables::init( $this->variables_service );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		parent::tearDown();
	}

	public function test_apply__binds_a_synced_variable_through_the_v3_global_color() {
		// Act.
		$result = $this->mapper()->apply( 'color: var(--' . self::SYNCED_LABEL . ');', 'counter', [] );

		// Assert.
		$this->assertSame( [], $result['warnings'] );
		$this->assertSame( 'globals/colors?id=v4-' . self::SYNCED_LABEL, $result['settings_patch']['__globals__']['number_color'] ?? null );
		$this->assertStringNotContainsString( 'e-gv-', wp_json_encode( $result['settings_patch'] ) );
	}

	public function test_round_trip__a_synced_variable_reads_back_as_the_same_variable() {
		// Arrange.
		$written = $this->mapper()->apply( 'color: var(--' . self::SYNCED_LABEL . ');', 'counter', [] );

		// Act.
		$readback = ( new V3_Style_Serializer() )->serialize( $written['settings_patch'], 'counter', [] );
		$rewritten = $this->mapper()->apply( $readback, 'counter', [] );

		// Assert.
		$this->assertStringContainsString( self::SYNCED_LABEL, $readback );
		$this->assertEquals( $written['settings_patch'], $rewritten['settings_patch'], $readback );
		$this->assertSame( [], $rewritten['warnings'] );
	}

	public function test_apply__stores_the_value_of_an_unsynced_variable_and_warns() {
		// Act.
		$result = $this->mapper()->apply( 'color: var(--' . self::UNSYNCED_LABEL . ');', 'counter', [] );

		// Assert.
		$this->assertSame( self::UNSYNCED_VALUE, $result['settings_patch']['number_color'] ?? null );
		$this->assertArrayNotHasKey( '__globals__', $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
		$this->assertStringContainsString( self::UNSYNCED_LABEL, $result['warnings'][0] );
	}

	public function test_apply__never_stores_a_variable_id_as_a_background_color() {
		// Act.
		$result = $this->mapper()->apply( 'background: var(--' . self::UNSYNCED_LABEL . ');', 'progress', [] );

		// Assert.
		$this->assertStringNotContainsString( 'e-gv-', wp_json_encode( $result['settings_patch'] ) );
		$this->assertContains( self::UNSYNCED_VALUE, $result['settings_patch'] );
		$this->assertCount( 1, $result['warnings'] );
	}

	public function test_apply__never_stores_a_variable_id_as_a_box_shadow_color() {
		// Act.
		$result = $this->mapper()->apply( 'wrapper { box-shadow: 0px 2px 4px 0px var(--' . self::SYNCED_LABEL . '); }', 'counter', [] );

		// Assert.
		$this->assertStringNotContainsString( 'e-gv-', wp_json_encode( $result['settings_patch'] ) );
		$this->assertCount( 1, $result['fallback_rules'] );
		$this->assertCount( 1, $result['fallback_notes'] );
	}

	public function test_merge__keeps_other_global_links_and_clears_a_replaced_one() {
		// Arrange.
		$settings = [
			'number_color' => '',
			'title_color' => '',
			'__globals__' => [
				'number_color' => 'globals/colors?id=primary',
				'title_color' => 'globals/colors?id=secondary',
			],
		];

		// Act.
		$merged = V3_Settings_Patch::merge( $settings, [ 'number_color' => '#ff0000' ] );

		// Assert.
		$this->assertSame( '#ff0000', $merged['number_color'] );
		$this->assertSame( [ 'title_color' => 'globals/colors?id=secondary' ], $merged['__globals__'] );
	}

	private function given_color_variable( string $label, string $value, bool $sync_to_v3 ): void {
		$this->variables_service->create( [
			'type' => Color_Variable_Prop_Type::get_key(),
			'label' => $label,
			'value' => $value,
			'sync_to_v3' => $sync_to_v3,
		] );
	}

	private function mapper(): V3_Style_Mapper {
		$converter = new Css_Converter(
			Converter_Registry_Factory::create( $this->variables_service ),
			new Null_Failure_Reporter(),
			Expander_Registry_Factory::create( $this->variables_service ),
			new Variable_Prop_Value_Transformer( $this->variables_service )
		);

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
