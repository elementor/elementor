<?php
namespace Elementor\Testing\Modules\AtomicWidgets;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module;
use Elementor\Modules\AtomicWidgets\PropTypes\Image_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Prop_Types_Registry;
use Elementor\Modules\AtomicWidgets\PropTypes\String_Type;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Test_Module extends Elementor_Test_Base {
	private $experiment_default_state;

	public function set_up(): void {
		parent::set_up();

		$this->experiment_default_state = Plugin::instance()->experiments->get_features( Module::EXPERIMENT_NAME )[ 'default' ];

		remove_all_filters( 'elementor/editor/v2/packages' );
		remove_all_filters( 'elementor/editor/v2/styles' );
	}

	public function tear_down() {
		parent::tear_down();

		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, $this->experiment_default_state );
	}

	public function test_it__enqueues_packages_when_experiment_on() {
		// Arrange
		$this->experiment_on();

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$this->assertEquals( Module::PACKAGES, $packages );
	}

	public function test_it__does_not_enqueue_packages_and_styles_when_experiment_off() {
		// Arrange
		$this->experiment_off();

		// Act
		new Module();

		// Assert
		$packages = apply_filters( 'elementor/editor/v2/packages', [] );
		$this->assertEmpty( $packages );
	}

	public function test_add_prop_types_config() {
		// Arrange.
		remove_all_filters( 'elementor/editor/localize_settings' );

		$this->experiment_on();

		$prop_types_registry = new Prop_Types_Registry();
		$prop_types_registry->register( new String_Type() );
		$prop_types_registry->register( new Image_Type() );

		$module = new Module();
		$module->prop_types = $prop_types_registry;

		// Act.
		$settings = apply_filters( 'elementor/editor/localize_settings', [
			'existing-setting' => 'original-value',
		] );

		// Assert.
		$this->assertEquals( [
			'existing-setting' => 'original-value',
			'atomicPropTypes' => [
				'string' => new String_Type(),
				'image' => new Image_Type(),
			]
		], $settings );
	}

	private function experiment_on() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_ACTIVE );
	}

	private function experiment_off() {
		Plugin::instance()->experiments->set_feature_default_state( Module::EXPERIMENT_NAME, Experiments_Manager::STATE_INACTIVE );
	}
}
