<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Loader;

use Elementor\Core\Editor\Editor;
use Elementor\Core\Editor\Loader\Editor_Loader_Factory;
use Elementor\Core\Editor\Loader\V1\Editor_V1_Loader;
use Elementor\Core\Editor\Loader\V2\Editor_V2_Loader;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Editor_Loader_Factory extends Elementor_Test_Base {
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
		$config_provider = Editor_Loader_Factory::create();

		// Assert
		$this->assertInstanceOf( $expected_class, $config_provider );
	}

	public function create_data_provider() {
		return [
			[ Experiments_Manager::STATE_INACTIVE, [], Editor_V1_Loader::class ],
			[ Experiments_Manager::STATE_ACTIVE, [], Editor_V2_Loader::class ],
			[ Experiments_Manager::STATE_INACTIVE, [ 'v' => '2' ], Editor_V2_Loader::class ],
			[ Experiments_Manager::STATE_ACTIVE, [ 'v' => '1' ], Editor_V1_Loader::class ],
		];
	}
}
