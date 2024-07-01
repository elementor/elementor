<?php
namespace Elementor\Tests\Phpunit\Elementor\Core\Editor\Loader;

use Elementor\Core\Editor\Editor;
use Elementor\Core\Editor\Editor_V2_Experiments;
use Elementor\Core\Editor\Loader\Editor_Loader_Factory;
use Elementor\Core\Editor\Loader\V1\Editor_V1_Loader;
use Elementor\Core\Editor\Loader\V2\Editor_V2_Loader;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Collection;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Test_Editor_Loader_Factory extends Elementor_Test_Base {
	private $original_experiments_states;

	public function setUp(): void {
		parent::setUp();

		$experiments = Plugin::$instance->experiments;

		$this->original_experiments_states = Collection::make( Editor_V2_Experiments::all() )
			->map_with_keys( fn ( $name ) => [ $name => $experiments->get_features( $name )['default'] ] )
			->each( fn ( $state, $name ) => $experiments->set_feature_default_state( $name, Experiments_Manager::STATE_INACTIVE ) );
	}

	public function tearDown(): void {
		parent::tearDown();

		$experiments = Plugin::$instance->experiments;

		$this->original_experiments_states
			->each( fn ( $state, $name ) => $experiments->set_feature_default_state( $name, $state ) );
	}

	/**
	 * @dataProvider create_data_provider
	 */
	public function test_create( $experiment, $state, $expected_class ) {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state( $experiment, $state );

		// Act
		$loader = Editor_Loader_Factory::create();

		// Assert
		$this->assertInstanceOf( $expected_class, $loader );
	}

	public function create_data_provider() {
		$cases = [];

		foreach ( Editor_V2_Experiments::all() as $experiment ) {
			$cases["{$experiment} inactive"] = [
				$experiment,
				Experiments_Manager::STATE_INACTIVE,
				Editor_V1_Loader::class,
			];

			$cases["{$experiment} active"] = [
				$experiment,
				Experiments_Manager::STATE_ACTIVE,
				Editor_V2_Loader::class,
			];
		}

		return $cases;
	}
}
