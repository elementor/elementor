<?php

namespace Elementor\Testing\Modules\Mcp\Abilities\Appliers\V3\Maps;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Fragments\Advanced_Wrapper;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\Style_Target;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Control;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map;
use Elementor\Modules\Mcp\Abilities\Appliers\V3\Maps\V3_Widget_Map_Registry;
use Elementor\Modules\Mcp\Module as Mcp_Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * @group Elementor\Modules\Mcp
 */
class Test_V3_Widget_Map_Registry_Default extends Elementor_Test_Base {

	const WIDGET_TYPE = 'heading';

	/**
	 * @var array<string, string>
	 */
	private array $original_experiment_states = [];

	/**
	 * @var string[]
	 */
	private array $registered_experiments = [];

	public function setUp(): void {
		parent::setUp();
		$this->set_experiment_state( Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
		$this->set_experiment_state( Atomic_Widgets_Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
	}

	public function tearDown(): void {
		foreach ( $this->original_experiment_states as $experiment_name => $default_state ) {
			if ( in_array( $experiment_name, $this->registered_experiments, true ) ) {
				Plugin::$instance->experiments->remove_feature( $experiment_name );
			} else {
				Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $default_state );
			}

			delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
		}

		V3_Widget_Map_Registry::reset_instance();
		parent::tearDown();
	}

	public function test_get_map__appends_wrapper_target_bound_to_the_advanced_tab_of_a_registered_widget() {
		// Arrange.
		$registry = V3_Widget_Map_Registry::create_default( [ self::WIDGET_TYPE => $this->heading_map() ] );

		// Act.
		$targets = $registry->get_map( self::WIDGET_TYPE )->get_targets();

		// Assert.
		$this->assertArrayHasKey( Advanced_Wrapper::ALIAS, $targets );
		$this->assertContains( 'margin', $targets[ Advanced_Wrapper::ALIAS ]->get_props() );
		$this->assertContains( 'background', $targets[ Advanced_Wrapper::ALIAS ]->get_props() );
	}

	public function test_get_registered_controls__include_the_advanced_tab_of_a_registered_widget() {
		// Arrange.
		$registry = V3_Widget_Map_Registry::create_default( [ self::WIDGET_TYPE => $this->heading_map() ] );

		// Act.
		$controls = $registry->get_registered_controls( self::WIDGET_TYPE );

		// Assert.
		$this->assertArrayHasKey( 'title_color', $controls );
		$this->assertArrayHasKey( '_margin', $controls );
	}

	private function heading_map(): V3_Widget_Map {
		return V3_Widget_Map::make( self::WIDGET_TYPE )
			->description( 'Heading.' )
			->default_target(
				Style_Target::make( 'title' )->bind( 'color', V3_Control::bind_to( 'title_color' ) )
			);
	}

	private function set_experiment_state( string $experiment_name, string $state ): void {
		if ( ! array_key_exists( $experiment_name, $this->original_experiment_states ) ) {
			$features = Plugin::$instance->experiments->get_features( $experiment_name );

			if ( empty( $features ) && Mcp_Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME === $experiment_name ) {
				Plugin::$instance->experiments->add_feature( Mcp_Module::get_v3_standardized_maps_experimental_data() );
				$this->registered_experiments[] = $experiment_name;
				$features = Plugin::$instance->experiments->get_features( $experiment_name );
			}

			$this->original_experiment_states[ $experiment_name ] = $features['default'] ?? Experiments_Manager::STATE_DEFAULT;
		}

		Plugin::$instance->experiments->set_feature_default_state( $experiment_name, $state );
		delete_option( Experiments_Manager::OPTION_PREFIX . $experiment_name );
	}
}
