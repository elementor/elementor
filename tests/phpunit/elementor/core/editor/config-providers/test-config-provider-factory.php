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

	/**
	 * @dataProvider create_data_provider
	 */
	public function test_create( $state, $query_params, $expected_class ) {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Editor::EDITOR_V2_EXPERIMENT_NAME,
			$state
		);

		foreach ( $query_params as $key => $value ) {
			$_GET[ $key ] = $value;
		}

		// Act
		$config_provider = Config_Provider_Factory::create();

		// Assert
		$this->assertInstanceOf( $expected_class, $config_provider );
	}

	public function create_data_provider() {
		return [
			[ Experiments_Manager::STATE_INACTIVE, [], Editor_V1_Config_Provider::class ],
			[ Experiments_Manager::STATE_ACTIVE, [], Editor_V2_Config_Provider::class ],
			[ Experiments_Manager::STATE_INACTIVE, [ 'v' => '2' ], Editor_V2_Config_Provider::class ],
			[ Experiments_Manager::STATE_ACTIVE, [ 'v' => '1' ], Editor_V1_Config_Provider::class ],
		];
	}
}
