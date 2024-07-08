<?php
namespace Elementor\Testing\Modules\AppBar;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AppBar\Module;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Elementor_Test_Module extends Elementor_Test_Base {
	public function set_up(): void {
		parent::set_up();

		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/v2/styles' );
	}

	public function test__enqueues_packages_and_styles_when_experiment_on() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );

		// Act
		 new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$styles = apply_filters( 'elementor/editor/v2/styles', [] );
		$this->assertEquals( Module::PACKAGES, $packages );
		$this->assertEquals( Module::STYLES, $styles );
	}

	public function test_it__does_not_enqueue_packages_and_styles_when_experiment_off() {
		// Arrange
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$styles = apply_filters( 'elementor/editor/v2/styles', [] );
		$this->assertEmpty( $packages );
		$this->assertEmpty( $styles );
	}
}
