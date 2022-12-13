<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Config_Providers;

use Elementor\Core\Editor\Config_Providers\Config_Provider_Factory;
use Elementor\Core\Editor\Config_Providers\Editor_V1_Config_Provider;
use Elementor\Core\Editor\Config_Providers\Editor_V2_Config_Provider;
use Elementor\Core\Editor\Editor;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Config_Provider_Factory extends Elementor_Test_Base {
	private $original_experiment_default_state;

	public function setUp() {
		parent::setUp();

		$this->original_experiment_default_state = Plugin::$instance->experiments
			->get_features( Editor::EDITOR_V2_EXPERIMENT_NAME )['default'];
	}

	public function tearDown() {
		parent::tearDown();

		Plugin::$instance->experiments
			->set_feature_default_state( Editor::EDITOR_V2_EXPERIMENT_NAME, $this->original_experiment_default_state );
	}


	public function test_create() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Editor::EDITOR_V2_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$config_provider = Config_Provider_Factory::create();

		// Assert
		$this->assertInstanceOf( Editor_V1_Config_Provider::class, $config_provider );
	}

	public function test_create__with_editor_v2_experiment_on() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Editor::EDITOR_V2_EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$config_provider = Config_Provider_Factory::create();

		// Assert
		$this->assertInstanceOf( Editor_V2_Config_Provider::class, $config_provider );
	}

	public function test_create__with_query_param() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Editor::EDITOR_V2_EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		$_GET['v'] = '2';

		// Act
		$config_provider = Config_Provider_Factory::create();

		// Assert
		$this->assertInstanceOf( Editor_V2_Config_Provider::class, $config_provider );
	}
}
