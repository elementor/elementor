<?php

namespace Elementor\Tests\Phpunit\Elementor\App\ImportExportCustomization\Runners;

use Elementor\App\Modules\ImportExportCustomization\Runners\Export\Site_Settings;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\AtomicWidgets\Module as Atomic_Widgets_Module;
use Elementor\Modules\GlobalClasses\ImportExportCustomization\Runners\Export as Global_Classes_Export_Runner;
use Elementor\Plugin;
use ElementorEditorTesting\Elementor_Test_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Test_Site_Settings_Classes_Feature extends Elementor_Test_Base {
	private string $original_atomic_widgets_experiment_state;

	public function setUp(): void {
		parent::setUp();

		$this->original_atomic_widgets_experiment_state = Plugin::$instance->experiments
			->get_features( Atomic_Widgets_Module::EXPERIMENT_NAME )['default'];
	}

	public function tearDown(): void {
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			$this->original_atomic_widgets_experiment_state
		);

		parent::tearDown();
	}

	public function test_is_classes_feature_active__returns_false_when_atomic_widgets_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$is_active = ( new Site_Settings() )->is_classes_feature_active();

		// Assert
		$this->assertFalse( $is_active );
	}

	public function test_is_classes_feature_active__returns_true_when_atomic_widgets_active() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		// Act
		$is_active = ( new Site_Settings() )->is_classes_feature_active();

		// Assert
		$this->assertTrue( $is_active );
	}

	public function test_export__omits_classes_from_manifest_when_atomic_widgets_inactive() {
		// Arrange
		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$result = ( new Site_Settings() )->export( [ 'include' => [ 'settings' ] ] );

		// Assert
		$this->assertArrayNotHasKey( 'classes', $result['manifest'][0]['site-settings'] );
	}

	public function test_global_classes_export_runner__should_export_requires_atomic_widgets() {
		// Arrange
		$export_data = [ 'include' => [ 'settings' ] ];
		$runner = new Global_Classes_Export_Runner();

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_INACTIVE
		);

		// Act
		$should_export_when_inactive = $runner->should_export( $export_data );

		Plugin::$instance->experiments->set_feature_default_state(
			Atomic_Widgets_Module::EXPERIMENT_NAME,
			Experiments_Manager::STATE_ACTIVE
		);

		$should_export_when_active = $runner->should_export( $export_data );

		// Assert
		$this->assertFalse( $should_export_when_inactive );
		$this->assertTrue( $should_export_when_active );
	}
}
