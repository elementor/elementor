<?php

namespace Elementor\Tests\Phpunit\Elementor\Modules\Mcp;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\Mcp\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Mcp_V3_Standardized_Maps_Experiment extends Elementor_Test_Base {

	private $original_experiment_default_state;

	public function set_up() {
		parent::set_up();

		$features = Plugin::$instance->experiments->get_features( Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME );

		if ( empty( $features ) ) {
			Plugin::$instance->experiments->add_feature( Module::get_v3_standardized_maps_experimental_data() );
			$features = Plugin::$instance->experiments->get_features( Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME );
		}

		$this->original_experiment_default_state = $features['default'];
	}

	public function tear_down() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME,
			$this->original_experiment_default_state
		);

		delete_option( Experiments_Manager::OPTION_PREFIX . Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME );

		parent::tear_down();
	}

	public function test_get_v3_standardized_maps_experimental_data__is_hidden_and_inactive() {
		$data = Module::get_v3_standardized_maps_experimental_data();

		$this->assertSame( Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME, $data['name'] );
		$this->assertTrue( $data['hidden'] );
		$this->assertSame( Experiments_Manager::STATE_INACTIVE, $data['default'] );
		$this->assertSame( Experiments_Manager::RELEASE_STATUS_DEV, $data['release_status'] );
		$this->assertArrayNotHasKey( 'new_site', $data );
	}

	public function test_experiment_can_be_activated() {
		Plugin::$instance->experiments->set_feature_default_state(
			Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$is_active = Plugin::$instance->experiments->is_feature_active( Module::V3_STANDARDIZED_MAPS_EXPERIMENT_NAME );

		$this->assertTrue( $is_active );
	}

	public function test_get_experimental_data__does_not_gate_the_mcp_module() {
		$this->assertSame( [], Module::get_experimental_data() );
	}
}
